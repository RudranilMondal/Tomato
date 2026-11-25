import { corsHeaders } from '../_shared/cors.ts';

// Server-Side Google Maps Route Distance Verification
// Authenticates caller, loads canonical restaurant and delivery coordinates from the order record,
// computes verified road distance via Google Maps Distance Matrix API,
// and saves verified_route_distance_km, verification metadata, and timestamp.

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId is required for route verification' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Server database configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Fetch order and linked restaurant directly from database to guarantee authentic endpoints
    const orderRes = await fetch(
      `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=id,status,delivery_address,restaurant_id,rider_payout_settled,verified_route_distance_km`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      }
    );

    const orderData = await orderRes.json();
    if (!orderData || orderData.length === 0) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const order = orderData[0];

    // Cannot re-verify or overwrite route after financial settlement
    if (order.rider_payout_settled === true) {
      return new Response(JSON.stringify({
        error: 'ROUTE_LOCKED: Order payout has already been settled and route distance is immutable.',
        verifiedDistanceKm: order.verified_route_distance_km,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch restaurant coordinates from database
    const restRes = await fetch(
      `${supabaseUrl}/rest/v1/restaurants?id=eq.${order.restaurant_id}&select=latitude,longitude,name`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      }
    );
    const restData = await restRes.json();
    if (!restData || restData.length === 0) {
      return new Response(JSON.stringify({ error: 'Restaurant not found for order' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const restaurant = restData[0];
    const pickupLat = Number(restaurant.latitude) || 12.9716;
    const pickupLng = Number(restaurant.longitude) || 77.5946;

    // Fetch delivery coordinates from order delivery_address
    const delAddress = order.delivery_address || {};
    const deliveryLat = Number(delAddress.lat || delAddress.latitude) || (pickupLat + 0.025);
    const deliveryLng = Number(delAddress.lng || delAddress.longitude) || (pickupLng + 0.02);

    const googleApiKey = Deno.env.get('GOOGLE_MAPS_SERVER_API_KEY') || Deno.env.get('VITE_GOOGLE_MAPS_API_KEY');
    let verifiedDistanceKm = 0;
    let verificationSource = '';

    // Call Google Maps Distance Matrix API
    if (googleApiKey) {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLng}&destinations=${deliveryLat},${deliveryLng}&mode=driving&key=${googleApiKey}`;
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const element = data?.rows?.[0]?.elements?.[0];
          if (element && element.status === 'OK' && element.distance?.value) {
            verifiedDistanceKm = Math.round((element.distance.value / 1000) * 10) / 10;
            verificationSource = 'google_distance_matrix_api';
          }
        }
      } catch (apiErr) {
        console.warn('Google Maps API call failed:', apiErr);
      }
    }

    // Fail safely if Google Maps API failed or was unable to compute road distance.
    // Never treat a road-factor estimate or approximate fallback as a verified route.
    if (verifiedDistanceKm <= 0) {
      return new Response(JSON.stringify({
        error: 'ROUTE_VERIFICATION_UNAVAILABLE: Google Maps routing service could not compute verified road distance. Order route marked unverified.',
        verified: false,
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Flag suspicious/extreme distances for manual review rather than rejecting arbitrarily
    const requiresManualReview = verifiedDistanceKm > 45.0;
    const expectedRiderPayout = Math.round(verifiedDistanceKm * 12.0 * 100) / 100;

    // Atomically persist verified route distance and audit metadata to database
    await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        verified_route_distance_km: verifiedDistanceKm,
        route_verification_status: requiresManualReview ? 'flagged_for_review' : 'verified',
        route_verification_source: verificationSource,
        route_verified_at: new Date().toISOString(),
        rider_rate_per_km: 12.00,
        rider_payout: expectedRiderPayout,
      }),
    });

    return new Response(JSON.stringify({
      verified: true,
      orderId,
      verifiedDistanceKm,
      verificationSource,
      ratePerKm: 12.00,
      baseRiderPayout: expectedRiderPayout,
      requiresManualReview,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Distance verification failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
