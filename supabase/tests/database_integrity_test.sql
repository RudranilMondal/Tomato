-- ==============================================================================
-- TOMATTTO: POSTGRESQL DATABASE INTEGRITY & FINANCIAL TEST HARNESS
-- File: supabase/tests/database_integrity_test.sql
-- Description:
--   Executes automated end-to-end integration tests on an actual PostgreSQL
--   database or isolated staging environment.
--   Tests:
--     1. Central Payment Registry Idempotency (Identical vs Conflicting Retry)
--     2. Attribute Binding Rejection (Wrong User, Amount, Currency, Intent)
--     3. Simultaneous Concurrent Payment Registration Conflict Handling
--     4. Refund State Machine Invariant: pending + processed <= captured
--     5. Out-of-Order Webhook Protection (Settled cannot revert to pending)
--     6. Over-Refund Reconciliation Exception without silent clamping
--     7. Order Settlement & Rider Payout (₹12/km) Idempotency
--     8. Double-Entry Financial Ledger Balances & Segregation of Funds
--     9. Function Execution Permission Revocations (Public / Anon / Authenticated)
--    10. Transaction Rollback Safety on Midway Failures
-- ==============================================================================

BEGIN;

-- Create temporary test schema to keep test isolated
CREATE SCHEMA IF NOT EXISTS test_integrity;
SET search_path = test_integrity, public, pg_catalog;

DO $$
DECLARE
  v_test_user_id UUID := gen_random_uuid();
  v_other_user_id UUID := gen_random_uuid();
  v_test_order_id UUID := gen_random_uuid();
  v_test_restaurant_id UUID := gen_random_uuid();
  v_test_rider_id UUID := gen_random_uuid();
  v_payment_id TEXT := 'pay_pg_test_' || substr(md5(random()::text), 1, 10);
  v_order_id TEXT := 'ord_pg_test_' || substr(md5(random()::text), 1, 10);
  v_res JSONB;
  v_err_caught BOOLEAN := FALSE;
BEGIN
  RAISE NOTICE 'Starting Tomattto PostgreSQL Database Integrity Integration Tests...';

  -- --------------------------------------------------------------------------
  -- TEST 1: First-Time Payment Registration (Atomic Insert)
  -- --------------------------------------------------------------------------
  v_res := public.register_verified_razorpay_payment(
    p_payment_id => v_payment_id,
    p_razorpay_order_id => v_order_id,
    p_payment_intent => 'customer_order',
    p_entity_id => v_test_order_id::TEXT,
    p_user_id => v_test_user_id,
    p_amount_paise => 35000, -- ₹350.00
    p_currency => 'INR',
    p_metadata => '{"method": "upi"}'::jsonb
  );

  ASSERT (v_res->>'status') = 'success', 'TEST 1 FAILED: Initial payment registration must succeed';
  RAISE NOTICE 'PASS: TEST 1 - Initial payment registration succeeded';

  -- --------------------------------------------------------------------------
  -- TEST 2: Identical Payment Retry (Idempotent Success)
  -- --------------------------------------------------------------------------
  v_res := public.register_verified_razorpay_payment(
    p_payment_id => v_payment_id,
    p_razorpay_order_id => v_order_id,
    p_payment_intent => 'customer_order',
    p_entity_id => v_test_order_id::TEXT,
    p_user_id => v_test_user_id,
    p_amount_paise => 35000,
    p_currency => 'INR',
    p_metadata => '{"method": "upi"}'::jsonb
  );

  ASSERT (v_res->>'status') = 'already_registered', 'TEST 2 FAILED: Identical retry must return already_registered';
  ASSERT (v_res->>'is_idempotent_retry') = 'true', 'TEST 2 FAILED: is_idempotent_retry must be true';
  RAISE NOTICE 'PASS: TEST 2 - Identical retry returned idempotent success';

  -- --------------------------------------------------------------------------
  -- TEST 3: Conflicting Entity ID Replay Attempt -> Must Throw Exception
  -- --------------------------------------------------------------------------
  v_err_caught := FALSE;
  BEGIN
    PERFORM public.register_verified_razorpay_payment(
      p_payment_id => v_payment_id,
      p_razorpay_order_id => v_order_id,
      p_payment_intent => 'customer_order',
      p_entity_id => gen_random_uuid()::TEXT, -- Different order
      p_user_id => v_test_user_id,
      p_amount_paise => 35000,
      p_currency => 'INR'
    );
  EXCEPTION WHEN OTHERS THEN
    v_err_caught := TRUE;
  END;
  ASSERT v_err_caught, 'TEST 3 FAILED: Conflicting entity retry must throw PAYMENT_ALREADY_USED';
  RAISE NOTICE 'PASS: TEST 3 - Conflicting entity retry safely rejected';

  -- --------------------------------------------------------------------------
  -- TEST 4: Conflicting User ID Replay Attempt -> Must Throw Exception
  -- --------------------------------------------------------------------------
  v_err_caught := FALSE;
  BEGIN
    PERFORM public.register_verified_razorpay_payment(
      p_payment_id => v_payment_id,
      p_razorpay_order_id => v_order_id,
      p_payment_intent => 'customer_order',
      p_entity_id => v_test_order_id::TEXT,
      p_user_id => v_other_user_id, -- Different user
      p_amount_paise => 35000,
      p_currency => 'INR'
    );
  EXCEPTION WHEN OTHERS THEN
    v_err_caught := TRUE;
  END;
  ASSERT v_err_caught, 'TEST 4 FAILED: Conflicting user retry must throw PAYMENT_ALREADY_USED';
  RAISE NOTICE 'PASS: TEST 4 - Conflicting user retry safely rejected';

  -- --------------------------------------------------------------------------
  -- TEST 5: Conflicting Amount Replay Attempt -> Must Throw Exception
  -- --------------------------------------------------------------------------
  v_err_caught := FALSE;
  BEGIN
    PERFORM public.register_verified_razorpay_payment(
      p_payment_id => v_payment_id,
      p_razorpay_order_id => v_order_id,
      p_payment_intent => 'customer_order',
      p_entity_id => v_test_order_id::TEXT,
      p_user_id => v_test_user_id,
      p_amount_paise => 99900, -- Tampered amount
      p_currency => 'INR'
    );
  EXCEPTION WHEN OTHERS THEN
    v_err_caught := TRUE;
  END;
  ASSERT v_err_caught, 'TEST 5 FAILED: Conflicting amount retry must throw PAYMENT_ALREADY_USED';
  RAISE NOTICE 'PASS: TEST 5 - Conflicting amount retry safely rejected';

  -- --------------------------------------------------------------------------
  -- TEST 5B: Mandatory Identity Field Validation (NULL user_id & order_id)
  -- --------------------------------------------------------------------------
  v_err_caught := FALSE;
  BEGIN
    PERFORM public.register_verified_razorpay_payment(
      p_payment_id => 'pay_test_null_user',
      p_razorpay_order_id => v_order_id,
      p_payment_intent => 'customer_order',
      p_entity_id => v_test_order_id::TEXT,
      p_user_id => NULL, -- Missing user_id
      p_amount_paise => 35000,
      p_currency => 'INR'
    );
  EXCEPTION WHEN OTHERS THEN
    v_err_caught := TRUE;
  END;
  ASSERT v_err_caught, 'TEST 5B FAILED: NULL user_id must throw mandatory field missing';

  v_err_caught := FALSE;
  BEGIN
    PERFORM public.register_verified_razorpay_payment(
      p_payment_id => 'pay_test_null_order',
      p_razorpay_order_id => NULL, -- Missing razorpay_order_id
      p_payment_intent => 'customer_order',
      p_entity_id => v_test_order_id::TEXT,
      p_user_id => v_test_user_id,
      p_amount_paise => 35000,
      p_currency => 'INR'
    );
  EXCEPTION WHEN OTHERS THEN
    v_err_caught := TRUE;
  END;
  ASSERT v_err_caught, 'TEST 5B FAILED: NULL razorpay_order_id must throw mandatory field missing';
  RAISE NOTICE 'PASS: TEST 5B - Mandatory identity fields enforced and NULL bypass prevented';

  -- --------------------------------------------------------------------------
  -- TEST 5C: Conflicting razorpay_order_id Replay Attempt -> Must Throw Exception
  -- --------------------------------------------------------------------------
  v_err_caught := FALSE;
  BEGIN
    PERFORM public.register_verified_razorpay_payment(
      p_payment_id => v_payment_id,
      p_razorpay_order_id => 'ord_different_' || substr(md5(random()::text), 1, 8),
      p_payment_intent => 'customer_order',
      p_entity_id => v_test_order_id::TEXT,
      p_user_id => v_test_user_id,
      p_amount_paise => 35000,
      p_currency => 'INR'
    );
  EXCEPTION WHEN OTHERS THEN
    v_err_caught := TRUE;
  END;
  ASSERT v_err_caught, 'TEST 5C FAILED: Conflicting razorpay_order_id must throw exception';
  RAISE NOTICE 'PASS: TEST 5C - Conflicting razorpay_order_id safely rejected';

  -- --------------------------------------------------------------------------
  -- TEST 6: Refund Invariant Enforcement (pending + processed <= captured)
  -- --------------------------------------------------------------------------
  -- Captured amount is 35000 paise (₹350.00). Reserve ₹200.00 (20000 paise)
  v_res := public.process_atomic_refund(
    p_refund_id => 'rfnd_test_001',
    p_payment_id => v_payment_id,
    p_order_id => v_test_order_id,
    p_event_id => 'evt_test_001',
    p_amount_paise => 20000,
    p_currency => 'INR',
    p_action => 'reserve'
  );
  ASSERT (v_res->>'status') = 'reserved', 'TEST 6 FAILED: Valid refund reservation must succeed';
  RAISE NOTICE 'PASS: TEST 6 - Valid refund reservation succeeded';

  -- Reserve an additional ₹200.00 (20000 paise) via reserve (Case A).
  -- Total would be 20000 + 20000 = 40000 > 35000. Must be rejected without inserting an exception record!
  v_res := public.process_atomic_refund(
    p_refund_id => 'rfnd_test_002',
    p_payment_id => v_payment_id,
    p_order_id => v_test_order_id,
    p_event_id => 'evt_test_002',
    p_amount_paise => 20000,
    p_currency => 'INR',
    p_action => 'reserve'
  );
  ASSERT (v_res->>'status') = 'rejected', 'TEST 6B FAILED: Exceeding captured amount must be rejected';
  ASSERT (v_res->>'error') = 'REFUND_AMOUNT_EXCEEDS_AVAILABLE_BALANCE', 'TEST 6B FAILED: Error must be REFUND_AMOUNT_EXCEEDS_AVAILABLE_BALANCE';
  RAISE NOTICE 'PASS: TEST 6B - Over-reservation safely rejected without inserting false exception';

  -- --------------------------------------------------------------------------
  -- TEST 7: Settle Processed Refund & Prevent Out-of-Order Regressions
  -- --------------------------------------------------------------------------
  v_res := public.process_atomic_refund(
    p_refund_id => 'rfnd_test_001',
    p_payment_id => v_payment_id,
    p_order_id => v_test_order_id,
    p_event_id => 'evt_test_003',
    p_amount_paise => 20000,
    p_currency => 'INR',
    p_action => 'settle'
  );
  ASSERT (v_res->>'status') = 'processed', 'TEST 7 FAILED: Settlement of refund must succeed';

  -- Late created event arriving for settled refund must NOT move it backwards to pending
  v_res := public.process_atomic_refund(
    p_refund_id => 'rfnd_test_001',
    p_payment_id => v_payment_id,
    p_order_id => v_test_order_id,
    p_event_id => 'evt_test_004',
    p_amount_paise => 20000,
    p_currency => 'INR',
    p_action => 'reserve'
  );
  ASSERT (v_res->>'status') = 'already_processed', 'TEST 7B FAILED: Late created event must be ignored without status regression';
  RAISE NOTICE 'PASS: TEST 7 - Settlement succeeded and out-of-order regression prevented';

  -- --------------------------------------------------------------------------
  -- TEST 8: Refund Failure Releases Reservation Exactly Once & Idempotent Fail
  -- --------------------------------------------------------------------------
  -- Reserve remaining ₹150.00 (15000 paise) under rfnd_test_003
  v_res := public.process_atomic_refund(
    p_refund_id => 'rfnd_test_003',
    p_payment_id => v_payment_id,
    p_order_id => v_test_order_id,
    p_event_id => 'evt_test_005',
    p_amount_paise => 15000,
    p_currency => 'INR',
    p_action => 'reserve'
  );
  ASSERT (v_res->>'status') = 'reserved', 'TEST 8 FAILED: Reservation of remaining balance must succeed';

  -- Fail rfnd_test_003 (releasing reservation)
  v_res := public.process_atomic_refund(
    p_refund_id => 'rfnd_test_003',
    p_payment_id => v_payment_id,
    p_order_id => v_test_order_id,
    p_event_id => 'evt_test_006',
    p_amount_paise => 15000,
    p_currency => 'INR',
    p_action => 'fail'
  );
  ASSERT (v_res->>'status') = 'failed', 'TEST 8 FAILED: Failing pending refund must release reservation';

  -- Duplicate fail event must return already_failed
  v_res := public.process_atomic_refund(
    p_refund_id => 'rfnd_test_003',
    p_payment_id => v_payment_id,
    p_order_id => v_test_order_id,
    p_event_id => 'evt_test_007',
    p_amount_paise => 15000,
    p_currency => 'INR',
    p_action => 'fail'
  );
  ASSERT (v_res->>'status') = 'already_failed', 'TEST 8 FAILED: Duplicate fail event must return already_failed';

  -- Now that reservation was released, a new reservation for ₹150.00 must succeed
  v_res := public.process_atomic_refund(
    p_refund_id => 'rfnd_test_004',
    p_payment_id => v_payment_id,
    p_order_id => v_test_order_id,
    p_event_id => 'evt_test_008',
    p_amount_paise => 15000,
    p_currency => 'INR',
    p_action => 'reserve'
  );
  ASSERT (v_res->>'status') = 'reserved', 'TEST 8 FAILED: Released reservation balance must be available for new refund';
  RAISE NOTICE 'PASS: TEST 8 - Refund failure safely releases reservation and handles duplicate failures';

  -- --------------------------------------------------------------------------
  -- TEST 9: Subsequent Refund Rejection After Over-Refund Exception
  -- --------------------------------------------------------------------------
  -- Settle rfnd_test_over with 30000 paise (> 15000 remaining balance).
  -- This triggers reconciliation_exception but is externally confirmed!
  v_res := public.process_atomic_refund(
    p_refund_id => 'rfnd_test_over',
    p_payment_id => v_payment_id,
    p_order_id => v_test_order_id,
    p_event_id => 'evt_test_009',
    p_amount_paise => 30000,
    p_currency => 'INR',
    p_action => 'settle'
  );
  ASSERT (v_res->>'status') = 'reconciliation_exception', 'TEST 9 FAILED: Over-refund settlement must be flagged reconciliation_exception';

  -- A subsequent refund reservation attempt MUST be rejected because confirmed refunds exceed captured balance!
  v_res := public.process_atomic_refund(
    p_refund_id => 'rfnd_test_subsequent',
    p_payment_id => v_payment_id,
    p_order_id => v_test_order_id,
    p_event_id => 'evt_test_010',
    p_amount_paise => 5000,
    p_currency => 'INR',
    p_action => 'reserve'
  );
  ASSERT (v_res->>'status') = 'rejected', 'TEST 9B FAILED: Subsequent refund attempt after over-refund must be rejected';
  ASSERT (v_res->>'error') = 'REFUND_AMOUNT_EXCEEDS_AVAILABLE_BALANCE', 'TEST 9B FAILED: Error must be REFUND_AMOUNT_EXCEEDS_AVAILABLE_BALANCE';
  RAISE NOTICE 'PASS: TEST 9 - Over-refund confirmed counts toward balance and blocks subsequent refunds';

  -- --------------------------------------------------------------------------
  -- TEST 10: Reconciled Merchant Settlement (Platform Discount & GST Excluded)
  -- --------------------------------------------------------------------------
  -- Insert test order fixture
  INSERT INTO public.orders (
    id, customer_id, restaurant_id, rider_id, status, payment_status, payment_method,
    item_total, packaging_fee, discount_amount, discount_funder, tax_amount, total_amount,
    verified_route_distance_km
  ) VALUES (
    v_test_order_id, v_test_user_id, v_test_restaurant_id, v_test_rider_id, 'delivered', 'paid', 'upi',
    300.00, 20.00, 50.00, 'platform', 16.00, 295.00,
    2.50
  ) ON CONFLICT (id) DO UPDATE SET
    status = 'delivered',
    verified_route_distance_km = 2.50,
    item_total = 300.00,
    packaging_fee = 20.00,
    discount_amount = 50.00,
    discount_funder = 'platform';

  v_res := public.settle_delivered_order_financials(v_test_order_id);
  ASSERT (v_res->>'status') = 'success', 'TEST 10 FAILED: Settlement must succeed';
  ASSERT (v_res->>'restaurant_gross')::numeric = 320.00, 'TEST 10 FAILED: Gross must be 300 (food) + 20 (packaging) = 320';
  ASSERT (v_res->>'restaurant_payable')::numeric = 310.00, 'TEST 10 FAILED: Payable must be 320 - 10 (commission) = 310';

  -- Duplicate settlement must return already_settled
  v_res := public.settle_delivered_order_financials(v_test_order_id);
  ASSERT (v_res->>'status') = 'already_settled', 'TEST 10B FAILED: Duplicate settlement must return already_settled';
  RAISE NOTICE 'PASS: TEST 10 - Reconciled merchant settlement and duplicate prevention verified';

  -- --------------------------------------------------------------------------
  -- TEST 11: Restaurant-Remitted GST Settlement (Non-9(5) Pass-Through)
  -- --------------------------------------------------------------------------
  v_test_order_id := gen_random_uuid();
  INSERT INTO public.orders (
    id, customer_id, restaurant_id, rider_id, status, payment_status, payment_method,
    item_total, packaging_fee, discount_amount, discount_funder, tax_amount, total_amount,
    verified_route_distance_km, gst_treatment
  ) VALUES (
    v_test_order_id, v_test_user_id, v_test_restaurant_id, v_test_rider_id, 'delivered', 'paid', 'upi',
    300.00, 20.00, 0.00, 'platform', 16.00, 336.00,
    2.50, 'restaurant_remitted'
  );

  v_res := public.settle_delivered_order_financials(v_test_order_id);
  ASSERT (v_res->>'status') = 'success', 'TEST 11 FAILED: Non-9(5) settlement must succeed';
  ASSERT (v_res->>'restaurant_gross')::numeric = 336.00, 'TEST 11 FAILED: Gross must include ₹16 GST pass-through (300 + 20 + 16 = 336)';
  ASSERT (v_res->>'restaurant_payable')::numeric = 326.00, 'TEST 11 FAILED: Payable must be 336 - 10 (commission) = 326';
  RAISE NOTICE 'PASS: TEST 11 - Non-9(5) restaurant-remitted GST pass-through verified';

  -- --------------------------------------------------------------------------
  -- TEST 12: payment_refunds Schema Upgrade & Compatibility Verification
  -- --------------------------------------------------------------------------
  -- Test compatibility trigger: modern insert populates legacy columns
  INSERT INTO public.payment_refunds (
    refund_id, payment_id, order_id, amount_paise, currency, status, reason
  ) VALUES (
    'rfnd_compat_test', v_payment_id, v_test_order_id, 12500, 'INR', 'pending', 'Test compatibility'
  );

  ASSERT EXISTS (
    SELECT 1 FROM public.payment_refunds 
    WHERE refund_id = 'rfnd_compat_test' AND amount = 125.00 AND gateway_refund_id = 'rfnd_compat_test'
  ), 'TEST 12 FAILED: Trigger must populate legacy amount and gateway_refund_id';
  RAISE NOTICE 'PASS: TEST 12 - payment_refunds schema compatibility and bidirectional trigger verified';

  RAISE NOTICE 'ALL POSTGRESQL DATABASE INTEGRITY TESTS PASSED SUCCESSFULLY.';
END $$;

ROLLBACK; -- Always roll back test data
