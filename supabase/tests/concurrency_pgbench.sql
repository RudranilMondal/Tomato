-- ==============================================================================
-- TOMATTTO: PGBENCH MULTI-CONNECTION CONCURRENCY SCRIPT
-- File: supabase/tests/concurrency_pgbench.sql
-- Usage:
--   pgbench -h localhost -p 54322 -U postgres -d postgres -c 10 -j 4 -T 30 -f supabase/tests/concurrency_pgbench.sql
-- ==============================================================================

\set payment_num random(1, 100)
\set amount_paise 35000

BEGIN;

-- 1. Attempt concurrent registration for payment IDs
-- Tests racing INSERT ... ON CONFLICT / EXCEPTION unique_violation across 10 connections
SELECT public.register_verified_razorpay_payment(
  p_payment_id => 'pay_bench_' || :payment_num,
  p_razorpay_order_id => 'ord_bench_' || :payment_num,
  p_payment_intent => 'customer_order',
  p_entity_id => 'ent_bench_' || :payment_num,
  p_user_id => '00000000-0000-0000-0000-000000000001'::uuid,
  p_amount_paise => :amount_paise,
  p_currency => 'INR',
  p_metadata => '{"source": "pgbench"}'::jsonb
);

-- 2. Test concurrent refund state machine reservation
SELECT public.process_atomic_refund(
  p_refund_id => 'rfnd_bench_' || :payment_num || '_' || random(1, 10),
  p_payment_id => 'pay_bench_' || :payment_num,
  p_order_id => NULL,
  p_event_id => 'evt_bench_' || random(1, 100000),
  p_amount_paise => 5000,
  p_currency => 'INR',
  p_action => 'reserve'
);

COMMIT;
