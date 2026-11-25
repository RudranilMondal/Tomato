import { corsHeaders } from '../_shared/cors.ts';

// Standard Razorpay Webhook Edge Function
// Verifies raw request body signature using RAZORPAY_WEBHOOK_SECRET,
// handles payment.captured, payment.failed, refund.created, refund.processed, and refund.failed.
// Enforces distinct event ID vs refund ID tracking, strict idempotency, and explicit anomaly flagging (no silent clamping).

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
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
    if (!webhookSecret) {
      return new Response(JSON.stringify({ error: 'RAZORPAY_WEBHOOK_SECRET not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rzpSignature = req.headers.get('x-razorpay-signature');
    if (!rzpSignature) {
      return new Response(JSON.stringify({ error: 'Missing x-razorpay-signature header' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rawBody = await req.text();
    const expectedSignature = await hmacSha256Hex(webhookSecret, rawBody);

    if (expectedSignature !== rzpSignature) {
      return new Response(JSON.stringify({ error: 'INVALID_SIGNATURE: Webhook signature verification failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event = JSON.parse(rawBody);
    const eventId = event?.event_id || event?.id || `evt_${Date.now()}`;
    const eventType = event?.event;
    const paymentEntity = event?.payload?.payment?.entity;
    const refundEntity = event?.payload?.refund?.entity;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Database service configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Webhook Event Deduplication via Idempotency Key (Separate from Refund Entity ID)
    const eventCheck = await fetch(
      `${supabaseUrl}/rest/v1/platform_financial_transactions?idempotency_key=eq.webhook_event_${eventId}&select=id`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      }
    );
    const eventExisting = await eventCheck.json();
    if (eventExisting && eventExisting.length > 0) {
      return new Response(JSON.stringify({ status: 'ignored_duplicate_event', eventId }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Handle payment.captured
    if (eventType === 'payment.captured' && paymentEntity) {
      const notes = paymentEntity.notes || {};
      const intent = notes.intent;
      const referenceId = notes.referenceId;

      let resolvedUserId = notes.userId || notes.user_id || null;
      if (!resolvedUserId && referenceId) {
        try {
          if (intent === 'customer_order') {
            const ordRes = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${referenceId}&select=customer_id`, {
              headers: { 'apikey': supabaseServiceKey, 'Authorization': `Bearer ${supabaseServiceKey}` },
            });
            const ordRows = await ordRes.json();
            resolvedUserId = ordRows?.[0]?.customer_id || null;
          } else if (intent === 'partner_registration') {
            const appRes = await fetch(`${supabaseUrl}/rest/v1/restaurant_partner_applications?id=eq.${referenceId}&select=user_id`, {
              headers: { 'apikey': supabaseServiceKey, 'Authorization': `Bearer ${supabaseServiceKey}` },
            });
            const appRows = await appRes.json();
            resolvedUserId = appRows?.[0]?.user_id || null;
          } else if (intent === 'rider_registration') {
            const rAppRes = await fetch(`${supabaseUrl}/rest/v1/rider_applications?id=eq.${referenceId}&select=user_id`, {
              headers: { 'apikey': supabaseServiceKey, 'Authorization': `Bearer ${supabaseServiceKey}` },
            });
            const rAppRows = await rAppRes.json();
            resolvedUserId = rAppRows?.[0]?.user_id || null;
          }
        } catch (fetchErr) {
          console.warn('[Razorpay Webhook] Failed to resolve user_id for registration:', fetchErr);
        }
      }

      // Register payment atomically in central payment registry if referenceId & user_id exist
      if (referenceId && intent && resolvedUserId) {
        await fetch(`${supabaseUrl}/rest/v1/rpc/register_verified_razorpay_payment`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            p_payment_id: paymentEntity.id,
            p_razorpay_order_id: paymentEntity.order_id,
            p_payment_intent: intent,
            p_entity_id: referenceId,
            p_user_id: resolvedUserId,
            p_amount_paise: paymentEntity.amount,
            p_currency: paymentEntity.currency,
            p_metadata: { method: paymentEntity.method, source: 'webhook' },
          }),
        });
      }

      if ((intent === 'partner_registration' || intent === 'rider_registration') && referenceId) {
        // Atomically claim global ownership, update application, and record financial ledger transaction
        await fetch(`${supabaseUrl}/rest/v1/rpc/process_verified_registration_payment`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            p_applicant_type: intent === 'partner_registration' ? 'restaurant' : 'rider',
            p_application_id: referenceId,
            p_razorpay_payment_id: paymentEntity.id,
            p_razorpay_order_id: paymentEntity.order_id,
            p_tshirt_size: 'L',
            p_bag_type: 'standard_insulated',
          }),
        });
      } else if (intent === 'customer_order' && referenceId) {
        await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${referenceId}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_id: paymentEntity.id,
            payment_status: 'paid',
            status: 'confirmed',
          }),
        });

        await fetch(`${supabaseUrl}/rest/v1/platform_financial_transactions`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transaction_type: 'customer_order',
            reference_id: referenceId,
            payment_id: paymentEntity.id,
            entity_type: 'customer',
            amount: paymentEntity.amount / 100,
            currency: paymentEntity.currency,
            direction: 'credit',
            status: 'completed',
            idempotency_key: `webhook_event_${eventId}`,
            metadata: {
              event_type: eventType,
              razorpay_payment_id: paymentEntity.id,
              razorpay_order_id: paymentEntity.order_id,
            },
          }),
        });
      }

    // 3. Handle payment.failed
    } else if (eventType === 'payment.failed' && paymentEntity) {
      const notes = paymentEntity.notes || {};
      const intent = notes.intent;
      const referenceId = notes.referenceId;

      if (intent === 'customer_order' && referenceId) {
        const orderCheck = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${referenceId}&select=payment_status`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
        });
        const orderData = await orderCheck.json();
        if (orderData && orderData[0]?.payment_status !== 'paid') {
          await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${referenceId}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              payment_status: 'failed',
            }),
          });
        }
      }

      await fetch(`${supabaseUrl}/rest/v1/platform_financial_transactions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_type: intent || 'payment_failed',
          reference_id: referenceId || paymentEntity.id,
          payment_id: paymentEntity.id,
          entity_type: 'customer',
          amount: paymentEntity.amount / 100,
          currency: paymentEntity.currency || 'INR',
          direction: 'credit',
          status: 'failed',
          idempotency_key: `webhook_event_${eventId}`,
          metadata: {
            event_type: eventType,
            error_code: paymentEntity.error_code,
            error_description: paymentEntity.error_description,
          },
        }),
      });

    // 4. Handle Refund State Machine: refund.created, refund.processed, and refund.failed
    } else if ((eventType === 'refund.created' || eventType === 'refund.processed' || eventType === 'refund.failed') && (refundEntity || paymentEntity)) {
      const refundTarget = refundEntity || paymentEntity;
      const refundAmount = (refundTarget.amount || refundTarget.amount_refunded || 0) / 100;
      const paymentId = refundTarget.payment_id || refundTarget.id;
      const refundId = refundTarget.id || `rfnd_${Date.now()}`;

      // Search order by payment_id
      const orderSearch = await fetch(`${supabaseUrl}/rest/v1/orders?payment_id=eq.${paymentId}&select=id,total_amount,refund_amount,refund_status`, {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      });
      const orderMatch = await orderSearch.json();
      const orderId = (orderMatch && orderMatch.length > 0) ? orderMatch[0].id : null;

      // Invoke atomic PostgreSQL refund state machine RPC
      let rpcResult: any = null;
      try {
        const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/process_atomic_refund`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            p_refund_id: refundId,
            p_payment_id: paymentId,
            p_order_id: orderId,
            p_event_id: eventId,
            p_amount_paise: Math.round(refundAmount * 100),
            p_currency: refundTarget.currency || 'INR',
            p_action: eventType === 'refund.created' ? 'reserve' : eventType === 'refund.processed' ? 'settle' : 'fail',
            p_metadata: {
              event_type: eventType,
              refund_id: refundId,
              payment_id: paymentId,
              event_id: eventId,
              error_code: refundTarget.error_code,
              error_description: refundTarget.error_description,
            },
          }),
        });
        rpcResult = await rpcResponse.json();
      } catch (rpcErr) {
        console.warn('[Razorpay Webhook] process_atomic_refund RPC warning:', rpcErr);
      }

      if (orderMatch && orderMatch.length > 0) {
        const order = orderMatch[0];
        const currentRefunded = Number(order.refund_amount) || 0.00;
        const maxRefundable = Number(order.total_amount) || 0.00;

        if (eventType === 'refund.created') {
          // If RPC rejected reservation (exceeds balance), do not update order or ledger
          if (rpcResult?.status === 'rejected') {
            return new Response(JSON.stringify({
              status: 'rejected',
              error: 'REFUND_AMOUNT_EXCEEDS_AVAILABLE_BALANCE',
              refundId,
              details: rpcResult,
            }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Transition: created -> refund_initiated
          await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order.id}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refund_status: 'refund_initiated',
            }),
          });

          // Ledger: record pending refund state with distinct refund ID idempotency key
          await fetch(`${supabaseUrl}/rest/v1/platform_financial_transactions`, {
            method: 'POST',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transaction_type: 'refund',
              reference_id: paymentId,
              payment_id: paymentId,
              entity_type: 'platform',
              amount: refundAmount,
              currency: refundTarget.currency || 'INR',
              direction: 'debit',
              status: 'pending',
              idempotency_key: `refund_created_${refundId}`,
              metadata: {
                event_type: eventType,
                refund_id: refundId,
                payment_id: paymentId,
                event_id: eventId,
              },
            }),
          });

        } else if (eventType === 'refund.processed') {
          // Check if this refund entity has already been processed to avoid duplicate reversals
          const refundTxCheck = await fetch(
            `${supabaseUrl}/rest/v1/platform_financial_transactions?idempotency_key=eq.refund_processed_${refundId}&select=id`,
            {
              headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
            }
          );
          const refundTxData = await refundTxCheck.json();
          if (refundTxData && refundTxData.length > 0) {
            return new Response(JSON.stringify({ status: 'ignored_duplicate_refund', refundId }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // NO SILENT CLAMPING: calculate true cumulative refund from Razorpay
          const newCumulativeRefund = Math.round((currentRefunded + refundAmount) * 100) / 100;

          if (newCumulativeRefund > maxRefundable) {
            // Anomaly detected: True refund exceeds original order amount. Flag explicitly!
            await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order.id}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                refund_status: 'reconciliation_exception',
                refund_amount: newCumulativeRefund,
              }),
            });

            // Record transaction with anomaly metadata
            await fetch(`${supabaseUrl}/rest/v1/platform_financial_transactions`, {
              method: 'POST',
              headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                transaction_type: 'refund',
                reference_id: paymentId,
                payment_id: paymentId,
                entity_type: 'platform',
                amount: refundAmount,
                currency: refundTarget.currency || 'INR',
                direction: 'debit',
                status: 'completed',
                idempotency_key: `refund_processed_${refundId}`,
                metadata: {
                  event_type: eventType,
                  refund_id: refundId,
                  payment_id: paymentId,
                  anomaly: 'OVER_REFUND_EXCEEDS_ORDER_TOTAL',
                  original_order_total: maxRefundable,
                  cumulative_refunded: newCumulativeRefund,
                },
              }),
            });
          } else {
            const isFullRefund = newCumulativeRefund >= maxRefundable;
            await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order.id}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                refund_status: isFullRefund ? 'full_refund_processed' : 'partial_refund_processed',
                refund_amount: newCumulativeRefund,
              }),
            });

            await fetch(`${supabaseUrl}/rest/v1/platform_financial_transactions`, {
              method: 'POST',
              headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                transaction_type: 'refund',
                reference_id: paymentId,
                payment_id: paymentId,
                entity_type: 'platform',
                amount: refundAmount,
                currency: refundTarget.currency || 'INR',
                direction: 'debit',
                status: 'completed',
                idempotency_key: `refund_processed_${refundId}`,
                metadata: {
                  event_type: eventType,
                  refund_id: refundId,
                  payment_id: paymentId,
                  cumulative_refunded: newCumulativeRefund,
                },
              }),
            });
          }

        } else if (eventType === 'refund.failed') {
          // Transition to refund_failed
          await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order.id}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refund_status: 'refund_failed',
            }),
          });

          await fetch(`${supabaseUrl}/rest/v1/platform_financial_transactions`, {
            method: 'POST',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transaction_type: 'refund_failed',
              reference_id: paymentId,
              payment_id: paymentId,
              entity_type: 'platform',
              amount: refundAmount,
              currency: refundTarget.currency || 'INR',
              direction: 'debit',
              status: 'failed',
              idempotency_key: `refund_failed_${refundId}`,
              metadata: {
                event_type: eventType,
                refund_id: refundId,
                payment_id: paymentId,
                error_code: refundTarget.error_code,
                error_description: refundTarget.error_description,
              },
            }),
          });
        }
      }
    }

    return new Response(JSON.stringify({ status: 'success', eventId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Webhook processing failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
