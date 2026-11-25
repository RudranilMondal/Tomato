import { corsHeaders } from '../_shared/cors.ts';

// Standard Razorpay Order Creation Edge Function
// Supports:
// 1. 'customer_order': Computes exact verified server-side total from DB or validates existing placed order.
// 2. 'partner_registration': Enforces strictly INR 499.00 (49900 paise) for restaurant partner application.
// 3. 'rider_registration': Enforces strictly INR 499.00 (49900 paise) for rider application.

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

    const { intent, referenceId, notes } = await req.json();

    if (!intent || !['customer_order', 'partner_registration', 'rider_registration'].includes(intent)) {
      return new Response(JSON.stringify({ error: 'Invalid or missing payment intent' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') || Deno.env.get('VITE_RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(JSON.stringify({ error: 'Razorpay server credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let payablePaise = 0;
    let receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // 1. Authenticate caller identity via Supabase Auth
    let callerUserId: string | null = null;
    if (supabaseUrl && authHeader) {
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          'apikey': supabaseServiceKey || '',
          'Authorization': authHeader,
        },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        callerUserId = userData?.id || null;
      }
    }

    if (!callerUserId) {
      return new Response(JSON.stringify({ error: 'UNAUTHORIZED: Valid user session required to initiate payment' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (intent === 'partner_registration' || intent === 'rider_registration') {
      // Strictly enforced server-side: INR 499 = 49900 paise
      payablePaise = 49900;
      receipt = `${intent === 'partner_registration' ? 'ptr' : 'rdr'}_${referenceId || callerUserId.slice(0, 8)}`;

      // Verify that the registration application belongs to the caller
      if (referenceId && supabaseUrl && supabaseServiceKey) {
        const appTable = intent === 'partner_registration' 
          ? 'restaurant_partner_applications' 
          : 'rider_applications';
        const appRes = await fetch(`${supabaseUrl}/rest/v1/${appTable}?id=eq.${referenceId}&select=user_id,registration_fee_paid`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
        });
        const appData = await appRes.json();
        if (appData && appData.length > 0) {
          if (appData[0].user_id && appData[0].user_id !== callerUserId) {
            return new Response(JSON.stringify({ error: 'FORBIDDEN: You do not own this registration application' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          if (appData[0].registration_fee_paid === true) {
            return new Response(JSON.stringify({ error: 'ALREADY_PAID: Registration fee has already been paid for this application' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      }
    } else if (intent === 'customer_order') {
      // Connect to Supabase to verify true payable and customer ownership
      if (!referenceId) {
        return new Response(JSON.stringify({ error: 'Order referenceId is required for customer_order' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (supabaseUrl && supabaseServiceKey) {
        const orderRes = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${referenceId}&select=customer_id,total_amount,status,payment_status`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
        });
        const orderData = await orderRes.json();
        if (!orderData || orderData.length === 0) {
          return new Response(JSON.stringify({ error: 'Order not found in database' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const order = orderData[0];

        // Caller Ownership Check: Ensure customer owns the order
        if (order.customer_id && order.customer_id !== callerUserId) {
          return new Response(JSON.stringify({ error: 'FORBIDDEN: You do not have permission to pay for this order' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (order.payment_status === 'paid') {
          return new Response(JSON.stringify({ error: 'Order has already been paid' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        payablePaise = Math.round(Number(order.total_amount) * 100);
      } else {
        return new Response(JSON.stringify({ error: 'Database service configuration missing' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      receipt = `ord_${referenceId.slice(0, 8)}`;
    }

    if (payablePaise <= 0) {
      return new Response(JSON.stringify({ error: 'Calculated payable amount must be greater than zero' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Server-to-server call to Razorpay Orders API
    const credentials = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const rzpOrderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: payablePaise,
        currency: 'INR',
        receipt: receipt,
        notes: {
          intent,
          referenceId: referenceId || '',
          ...notes,
        },
      }),
    });

    if (!rzpOrderResponse.ok) {
      const errBody = await rzpOrderResponse.text();
      return new Response(JSON.stringify({ error: 'Razorpay order creation failed', details: errBody }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rzpOrder = await rzpOrderResponse.json();

    return new Response(JSON.stringify({
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: razorpayKeyId,
      receipt: rzpOrder.receipt,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
