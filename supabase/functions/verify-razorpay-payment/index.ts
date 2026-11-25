import { corsHeaders } from '../_shared/cors.ts';

// Standard Razorpay Payment Verification Edge Function
// Verifies HMAC SHA-256 signature, validates payment with Razorpay API, enforces
// caller ownership, registers payment atomically in public.payment_registry,
// updates order/application status and records financial transactions in the ledger.

async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
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

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      intent,
      referenceId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !intent) {
      return new Response(JSON.stringify({ error: 'Missing required verification fields' }), {
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

    // 1. Verify HMAC SHA-256 signature
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = await hmacSha256Hex(razorpayKeySecret, payload);

    if (expectedSignature !== razorpay_signature) {
      return new Response(JSON.stringify({
        error: 'INVALID_SIGNATURE: Cryptographic payment signature verification failed.',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Fetch payment details directly from Razorpay API to verify status and amount
    const credentials = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const rzpPayResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    });

    if (!rzpPayResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to retrieve payment from Razorpay API' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paymentData = await rzpPayResponse.json();

    // Verify order ID match, currency, and captured status
    if (paymentData.order_id !== razorpay_order_id) {
      return new Response(JSON.stringify({ error: 'ORDER_MISMATCH: Payment does not match the generated order' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (paymentData.currency !== 'INR') {
      return new Response(JSON.stringify({ error: 'CURRENCY_MISMATCH: Only INR payments are accepted' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (paymentData.status !== 'captured') {
      return new Response(JSON.stringify({
        error: `PAYMENT_NOT_CAPTURED: Current status is ${paymentData.status}. Only captured payments can be verified.`,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Connect to Supabase via service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Database service configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3a. Authenticate caller identity
    let callerUserId: string | null = null;
    if (authHeader) {
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': authHeader,
        },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        callerUserId = userData?.id || null;
      }
    }

    if (!callerUserId) {
      return new Response(JSON.stringify({ error: 'UNAUTHORIZED: Valid user session required to verify payment' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3b. Global Payment Registry Check: Atomically reserve or bind payment_id to intent & entity
    const targetEntityId = referenceId || callerUserId;
    if (targetEntityId) {
      const regRes = await fetch(`${supabaseUrl}/rest/v1/rpc/register_verified_razorpay_payment`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_payment_id: razorpay_payment_id,
          p_razorpay_order_id: razorpay_order_id,
          p_payment_intent: intent,
          p_entity_id: targetEntityId,
          p_user_id: callerUserId,
          p_amount_paise: paymentData.amount,
          p_currency: paymentData.currency,
          p_metadata: { method: paymentData.method },
        }),
      });

      if (!regRes.ok) {
        const errText = await regRes.text();
        if (errText.includes('PAYMENT_ALREADY_USED') || regRes.status === 409) {
          return new Response(JSON.stringify({
            error: 'PAYMENT_REPLAY_DETECTED: This Razorpay payment ID has already been credited to another entity or order.',
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // 3c. Ledger Replay Check: Check if this razorpay_payment_id has already been processed for another order/intent
    const checkTx = await fetch(
      `${supabaseUrl}/rest/v1/platform_financial_transactions?payment_id=eq.${razorpay_payment_id}&select=reference_id,transaction_type`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      }
    );
    const existingTxData = await checkTx.json();
    if (existingTxData && existingTxData.length > 0) {
      const existing = existingTxData[0];
      if (existing.reference_id !== referenceId) {
        return new Response(JSON.stringify({
          error: 'PAYMENT_REPLAY_DETECTED: This Razorpay payment ID has already been credited to another entity or order.',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const now = new Date().toISOString();

    if (intent === 'partner_registration') {
      // Enforce 499 INR amount (49900 paise)
      if (paymentData.amount !== 49900) {
        return new Response(JSON.stringify({ error: 'AMOUNT_MISMATCH: Registration fee must be exactly INR 499.00' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Caller Ownership Check
      if (referenceId) {
        const appRes = await fetch(`${supabaseUrl}/rest/v1/restaurant_partner_applications?id=eq.${referenceId}&select=user_id`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
        });
        const appData = await appRes.json();
        if (appData && appData.length > 0 && appData[0].user_id && appData[0].user_id !== callerUserId) {
          return new Response(JSON.stringify({ error: 'FORBIDDEN: You do not own this application' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Atomically claim global ownership, update application, and record financial ledger transaction
        const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/process_verified_registration_payment`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            p_applicant_type: 'restaurant',
            p_application_id: referenceId,
            p_razorpay_payment_id: razorpay_payment_id,
            p_razorpay_order_id: razorpay_order_id,
            p_tshirt_size: 'L',
            p_bag_type: 'standard_insulated',
          }),
        });

        if (!rpcRes.ok) {
          const rpcErr = await rpcRes.text();
          console.error('[verify-razorpay-payment] Restaurant registration RPC error:', rpcErr);
          return new Response(JSON.stringify({ error: `REGISTRATION_PROCESSING_FAILED: ${rpcErr}` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

    } else if (intent === 'rider_registration') {
      // Enforce 499 INR amount (49900 paise)
      if (paymentData.amount !== 49900) {
        return new Response(JSON.stringify({ error: 'AMOUNT_MISMATCH: Registration fee must be exactly INR 499.00' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (referenceId) {
        const appRes = await fetch(`${supabaseUrl}/rest/v1/rider_applications?id=eq.${referenceId}&select=user_id`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
        });
        const appData = await appRes.json();
        if (appData && appData.length > 0 && appData[0].user_id && appData[0].user_id !== callerUserId) {
          return new Response(JSON.stringify({ error: 'FORBIDDEN: You do not own this application' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Atomically claim global ownership, update application, and record financial ledger transaction
        const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/process_verified_registration_payment`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            p_applicant_type: 'rider',
            p_application_id: referenceId,
            p_razorpay_payment_id: razorpay_payment_id,
            p_razorpay_order_id: razorpay_order_id,
            p_tshirt_size: 'L',
            p_bag_type: 'standard_insulated',
          }),
        });

        if (!rpcRes.ok) {
          const rpcErr = await rpcRes.text();
          console.error('[verify-razorpay-payment] Rider registration RPC error:', rpcErr);
          return new Response(JSON.stringify({ error: `REGISTRATION_PROCESSING_FAILED: ${rpcErr}` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

    } else if (intent === 'customer_order' && referenceId) {
      // Fetch order to verify amount and ownership
      const orderRes = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${referenceId}&select=customer_id,total_amount,payment_status`, {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      });
      const orderData = await orderRes.json();
      if (orderData && orderData.length > 0) {
        const order = orderData[0];
        if (order.customer_id && order.customer_id !== callerUserId) {
          return new Response(JSON.stringify({ error: 'FORBIDDEN: You do not own this order' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const expectedPaise = Math.round(Number(order.total_amount) * 100);
        if (paymentData.amount !== expectedPaise) {
          return new Response(JSON.stringify({ error: `AMOUNT_MISMATCH: Expected ${expectedPaise} paise but received ${paymentData.amount}` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Mark order paid and write payment_id
        await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${referenceId}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_id: razorpay_payment_id,
            payment_status: 'paid',
            status: 'confirmed',
          }),
        });
      }
    }

    return new Response(JSON.stringify({
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: paymentData.amount / 100,
      currency: paymentData.currency,
      status: paymentData.status,
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
