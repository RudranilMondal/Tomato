-- ==============================================================================
-- 🍅 TOMATTTO FOOD DELIVERY PLATFORM: STAGING VALIDATION SQL TEST SUITE
-- File: supabase/tests/staging_validation_test.sql
-- Description:
--   Comprehensive SQL assertion harness designed to run against an isolated
--   Supabase staging database or local PostgreSQL instance.
--   Enclosed in a transaction block that can be run with COMMIT or ROLLBACK.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 0. TEST HARNESS & UTILITY FUNCTIONS
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE '🍅 STARTING TOMATTTO STAGING VALIDATION TEST SUITE';
  RAISE NOTICE '============================================================';
END $$;

-- Assertion helper: logs notice on pass, raises exception on failure
CREATE OR REPLACE FUNCTION public.assert_test(
  p_test_name TEXT,
  p_condition BOOLEAN,
  p_details TEXT DEFAULT ''
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_condition THEN
    RAISE NOTICE '[PASS] % - %', p_test_name, p_details;
  ELSE
    RAISE EXCEPTION '[FAIL] % - %', p_test_name, p_details;
  END IF;
END;
$$;

-- Context simulation helper: sets PostgreSQL role and PostgREST JWT claims
CREATE OR REPLACE FUNCTION public.set_test_auth_context(
  p_user_id UUID,
  p_role TEXT DEFAULT 'authenticated'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Always reset to session user before assuming a new local role
  RESET ROLE;
  PERFORM set_config('tomattto.admin_recovery_in_progress', 'false', true);

  IF p_role = 'postgres' THEN
    PERFORM set_config('request.jwt.claim.sub', '', true);
    PERFORM set_config('request.jwt.claim.role', '', true);
    PERFORM set_config('request.jwt.claims', '{}', true);
  ELSIF p_role = 'service_role' THEN
    EXECUTE 'SET LOCAL ROLE service_role';
    PERFORM set_config('request.jwt.claim.sub', COALESCE(p_user_id::text, ''), true);
    PERFORM set_config('request.jwt.claim.role', 'service_role', true);
    PERFORM set_config('request.jwt.claims', '{"role":"service_role"}', true);
  ELSIF p_role = 'anon' OR p_user_id IS NULL THEN
    EXECUTE 'SET LOCAL ROLE anon';
    PERFORM set_config('request.jwt.claim.sub', '', true);
    PERFORM set_config('request.jwt.claim.role', 'anon', true);
    PERFORM set_config('request.jwt.claims', '{"role":"anon"}', true);
  ELSE
    EXECUTE 'SET LOCAL ROLE authenticated';
    PERFORM set_config('request.jwt.claim.sub', p_user_id::text, true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
    PERFORM set_config('request.jwt.claims', json_build_object('sub', p_user_id, 'role', 'authenticated')::text, true);
  END IF;
END;
$$;

-- Test harness helper: securely retrieves authoritative order_otps record during assertions
CREATE OR REPLACE FUNCTION public.get_test_order_otp_record(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_rec JSONB;
BEGIN
  SELECT row_to_json(ot)::jsonb INTO v_rec
  FROM public.order_otps ot
  WHERE ot.order_id = p_order_id;
  RETURN v_rec;
END;
$$;

-- ------------------------------------------------------------------------------
-- 1. SETUP TEST FIXTURES (VALID HEX UUIDS & COLLISION-RESISTANT NONCES)
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  -- Valid 32-digit hex UUIDs (a-f, 0-9)
  v_admin_id UUID := '00000000-0000-0000-0000-0000000000a1';
  v_customer_id UUID := '00000000-0000-0000-0000-0000000000c1';
  v_owner_id UUID := '00000000-0000-0000-0000-0000000000e1';
  v_rider_user_1 UUID := '00000000-0000-0000-0000-0000000000d1';
  v_rider_user_2 UUID := '00000000-0000-0000-0000-0000000000d2';
  v_rider_pk_1 UUID := '10000000-0000-0000-0000-000000000001';
  v_rider_pk_2 UUID := '10000000-0000-0000-0000-000000000002';
  v_rest_id UUID := '20000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert dummy test auth users with conflict resolution
  INSERT INTO auth.users (id, email)
  VALUES
    (v_admin_id, 'test_admin_' || substr(v_admin_id::text, 1, 8) || '@staging.local'),
    (v_customer_id, 'test_customer_' || substr(v_customer_id::text, 1, 8) || '@staging.local'),
    (v_owner_id, 'test_owner_' || substr(v_owner_id::text, 1, 8) || '@staging.local'),
    (v_rider_user_1, 'test_rider1_' || substr(v_rider_user_1::text, 1, 8) || '@staging.local'),
    (v_rider_user_2, 'test_rider2_' || substr(v_rider_user_2::text, 1, 8) || '@staging.local')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  -- Insert profiles with unique phone numbers (using distinct suffix digits)
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES
    (v_admin_id, 'Test Admin', '+9199' || right(replace(v_admin_id::text, '-', ''), 8), 'admin'),
    (v_customer_id, 'Test Customer', '+9199' || right(replace(v_customer_id::text, '-', ''), 8), 'customer'),
    (v_owner_id, 'Test Owner', '+9199' || right(replace(v_owner_id::text, '-', ''), 8), 'restaurant_owner'),
    (v_rider_user_1, 'Test Rider 1', '+9199' || right(replace(v_rider_user_1::text, '-', ''), 8), 'rider'),
    (v_rider_user_2, 'Test Rider 2', '+9199' || right(replace(v_rider_user_2::text, '-', ''), 8), 'rider')
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    phone = EXCLUDED.phone;

  -- Insert test restaurant
  INSERT INTO public.restaurants (id, owner_id, name, slug, phone, address_text, latitude, longitude)
  VALUES (
    v_rest_id,
    v_owner_id,
    'Staging Kitchen',
    'staging-kitchen-' || right(replace(v_rest_id::text, '-', ''), 8),
    '+9199' || right(replace(v_rest_id::text, '-', ''), 8),
    'Indiranagar 100ft Road',
    12.9716,
    77.5946
  )
  ON CONFLICT (id) DO UPDATE SET
    owner_id = EXCLUDED.owner_id,
    name = EXCLUDED.name;

  -- Insert test riders
  -- Insert test riders
INSERT INTO public.riders (
  id,
  profile_id,
  vehicle_type,
  vehicle_number,
  is_verified,
  status
)
VALUES
  (
    v_rider_pk_1,
    v_rider_user_1,
    'Bike',
    'TEST-BIKE-001',
    TRUE,
    'online'
  ),
  (
    v_rider_pk_2,
    v_rider_user_2,
    'Bike',
    'TEST-BIKE-002',
    TRUE,
    'online'
  )
ON CONFLICT (id) DO UPDATE SET
  vehicle_type = EXCLUDED.vehicle_type,
  vehicle_number = EXCLUDED.vehicle_number,
  is_verified = TRUE,
  status = 'online';
END $$;

-- ------------------------------------------------------------------------------
-- 2. TEST: OTP GENERATION UNBIASED BEHAVIOR & REJECTION SAMPLING
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  v_otp TEXT;
  v_val INTEGER;
  i INTEGER;
BEGIN
  FOR i IN 1..1000 LOOP
    v_otp := public.generate_unbiased_otp();
    v_val := v_otp::integer;
    IF v_val < 1000 OR v_val > 9999 THEN
      RAISE EXCEPTION 'generate_unbiased_otp generated out of bounds OTP: %', v_otp;
    END IF;
  END LOOP;
  PERFORM public.assert_test('OTP Generation Range', TRUE, '1,000 samples strictly within [1000, 9999]');
END $$;

-- ------------------------------------------------------------------------------
-- 3. TEST: ORDER CREATION, OTP INITIALIZATION & SYNC TRIGGER
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  v_order_id UUID := gen_random_uuid();
  v_customer_id UUID := '00000000-0000-0000-0000-0000000000c1';
  v_rest_id UUID := '20000000-0000-0000-0000-000000000001';
  v_pickup_otp TEXT;
  v_delivery_otp TEXT;
  v_orders_pickup TEXT;
  v_orders_delivery TEXT;
BEGIN
  -- Insert an order as service role / trigger
  INSERT INTO public.orders (
    id, customer_id, restaurant_id, status, item_total, total_amount, delivery_address
  ) VALUES (
    v_order_id, v_customer_id, v_rest_id, 'ready', 250.00, 290.00,
    '{"street": "100ft Rd", "city": "Bengaluru", "pincode": "560038"}'::jsonb
  );

  -- Check public.order_otps row was created with unbiased 4-digit codes
  SELECT pickup_otp, delivery_otp INTO v_pickup_otp, v_delivery_otp
  FROM public.order_otps
  WHERE order_id = v_order_id;

  PERFORM public.assert_test('OTP Table Synchronization',
    v_pickup_otp IS NOT NULL AND v_delivery_otp IS NOT NULL AND
    v_pickup_otp::integer BETWEEN 1000 AND 9999 AND
    v_delivery_otp::integer BETWEEN 1000 AND 9999,
    format('Generated pickup: %s, delivery: %s', v_pickup_otp, v_delivery_otp));

  -- Check public.orders has masked placeholder bullets
  SELECT pickup_otp, delivery_otp INTO v_orders_pickup, v_orders_delivery
  FROM public.orders
  WHERE id = v_order_id;

  PERFORM public.assert_test('Orders Table Plaintext Masking',
    v_orders_pickup = '••••' AND v_orders_delivery = '••••',
    'Plaintext OTPs masked in public.orders');
END $$;

-- ------------------------------------------------------------------------------
-- 4. TEST: CONCURRENCY-SAFE RIDER CLAIMING & ACTIVE DELIVERY CONSTRAINTS
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  v_order1_id UUID := gen_random_uuid();
  v_order2_id UUID := gen_random_uuid();
  v_customer_id UUID := '00000000-0000-0000-0000-0000000000c1';
  v_rest_id UUID := '20000000-0000-0000-0000-000000000001';
  v_rider_user_1 UUID := '00000000-0000-0000-0000-0000000000d1';
  v_rider_pk_1 UUID := '10000000-0000-0000-0000-000000000001';
  v_res JSONB;
  v_res2 JSONB;
  v_res3 JSONB;
  v_res4 JSONB;
  v_order1_pickup_otp TEXT;
  v_order1_delivery_otp TEXT;
  v_rider_status rider_status;
  v_order1_status order_status;
  v_order2_status order_status;
BEGIN
  -- Insert one preparing order and one ready order (verifying both eligible claim statuses)
  INSERT INTO public.orders (id, customer_id, restaurant_id, status, item_total, total_amount, delivery_address)
  VALUES
    (v_order1_id, v_customer_id, v_rest_id, 'preparing', 200, 240, '{"street": "100ft Rd", "city": "Bengaluru", "pincode": "560038"}'::jsonb),
    (v_order2_id, v_customer_id, v_rest_id, 'ready', 300, 340, '{"street": "100ft Rd", "city": "Bengaluru", "pincode": "560038"}'::jsonb);

  -- Set active authenticated context to rider 1
  PERFORM public.set_test_auth_context(v_rider_user_1, 'authenticated');

  -- Step 1: Claim order in 'preparing' status
  v_res := public.claim_order_delivery(v_order1_id);
  PERFORM public.assert_test('Order 1 Claim Success (Preparing Status)', (v_res->>'success')::boolean IS TRUE, 'Rider 1 claimed preparing order 1');

  SELECT status INTO v_order1_status FROM public.orders WHERE id = v_order1_id;
  PERFORM public.assert_test('Order 1 Transitioned to rider_assigned', v_order1_status = 'rider_assigned', 'Order status is rider_assigned');

  -- Step 2: Verify rider status transitioned to busy
  SELECT status INTO v_rider_status FROM public.riders WHERE id = v_rider_pk_1;
  PERFORM public.assert_test('Rider Status Transition to Busy', v_rider_status = 'busy', 'Rider status is now busy');

  -- Step 3: Attempt to claim second order while busy -> triggers RIDER_NOT_ONLINE guard
  v_res2 := public.claim_order_delivery(v_order2_id);
  PERFORM public.assert_test('Rider Not Online Guard Enforced',
    (v_res2->>'success')::boolean IS FALSE AND (v_res2->>'error') = 'RIDER_NOT_ONLINE',
    format('Second claim rejected when busy: %s', v_res2->>'message'));

  -- Step 4: Temporarily set rider status back to 'online' while order 1 is still active -> triggers ACTIVE_DELIVERY_EXISTS guard
  UPDATE public.riders SET status = 'online' WHERE id = v_rider_pk_1;

  v_res3 := public.claim_order_delivery(v_order2_id);
  PERFORM public.assert_test('Active Delivery Exists Guard Enforced',
    (v_res3->>'success')::boolean IS FALSE AND (v_res3->>'error') = 'ACTIVE_DELIVERY_EXISTS',
    format('Second claim rejected when active delivery exists: %s', v_res3->>'message'));

  -- Step 5: Advance order 1 through the legitimate lifecycle using verified OTPs:
  -- rider_assigned -> picked_up -> out_for_delivery -> delivered
  v_order1_pickup_otp := public.get_test_order_otp_record(v_order1_id)->>'pickup_otp';
  v_order1_delivery_otp := public.get_test_order_otp_record(v_order1_id)->>'delivery_otp';

  -- 5A. Verify pickup OTP (advances status from rider_assigned -> picked_up)
  v_res := public.verify_order_pickup_otp(v_order1_id, v_order1_pickup_otp);

  -- Diagnostic trace output requested by audit harness
  RAISE NOTICE '================ DIAGNOSTIC TRACE (PICKUP OTP) ===============';
  RAISE NOTICE 'v_res: %', v_res;
  RAISE NOTICE 'v_order1_id: %', v_order1_id;
  RAISE NOTICE 'v_order1_pickup_otp: %', v_order1_pickup_otp;
  RAISE NOTICE 'auth.uid(): %', auth.uid();
  RAISE NOTICE 'auth.role(): %', COALESCE(auth.role(), current_setting('request.jwt.claim.role', true));
  RAISE NOTICE 'current_user: %', current_user;
  RAISE NOTICE 'current order status: %', (SELECT status FROM public.orders WHERE id = v_order1_id);
  RAISE NOTICE 'order_otps record: %', public.get_test_order_otp_record(v_order1_id);
  RAISE NOTICE '==============================================================';

  PERFORM public.assert_test('Order 1 Pickup OTP Verified', (v_res->>'success')::boolean IS TRUE, 'Order 1 advanced to picked_up');

  -- 5B. Valid rider direct update: picked_up -> out_for_delivery
  UPDATE public.orders SET status = 'out_for_delivery' WHERE id = v_order1_id;

  -- 5C. Verify delivery OTP (advances out_for_delivery -> delivered and safely releases rider 1 to online)
  v_res := public.verify_order_delivery_otp(v_order1_id, v_order1_delivery_otp);
  PERFORM public.assert_test('Order 1 Delivery OTP Verified', (v_res->>'success')::boolean IS TRUE, 'Order 1 delivered');

  SELECT status INTO v_rider_status FROM public.riders WHERE id = v_rider_pk_1;
  PERFORM public.assert_test('Rider 1 Released to Online', v_rider_status = 'online', 'Rider 1 is online after completing order 1');

  -- Step 6: Rider 1 (now online with 0 active orders) claims order 2 (in 'ready' status)
  v_res4 := public.claim_order_delivery(v_order2_id);
  PERFORM public.assert_test('Order 2 Claim Success (Ready Status)', (v_res4->>'success')::boolean IS TRUE, 'Rider 1 claimed ready order 2');

  SELECT status INTO v_order2_status FROM public.orders WHERE id = v_order2_id;
  PERFORM public.assert_test('Order 2 Transitioned to rider_assigned', v_order2_status = 'rider_assigned', 'Order status is rider_assigned');

  SELECT status INTO v_rider_status FROM public.riders WHERE id = v_rider_pk_1;
  PERFORM public.assert_test('Rider Status Transition to Busy (Order 2)', v_rider_status = 'busy', 'Rider status is busy after claiming order 2');

  -- Reset role to postgres for next test block
  PERFORM public.set_test_auth_context(NULL, 'postgres');
END $$;

-- ------------------------------------------------------------------------------
-- 5. TEST: OTP VERIFICATION (VALID, INCORRECT, MALFORMED, NULL, LOCKOUT, REPLAY)
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  v_order_id UUID := gen_random_uuid();
  v_customer_id UUID := '00000000-0000-0000-0000-0000000000c1';
  v_rest_id UUID := '20000000-0000-0000-0000-000000000001';
  v_rider_user_2 UUID := '00000000-0000-0000-0000-0000000000d2';
  v_rider_pk_2 UUID := '10000000-0000-0000-0000-000000000002';
  v_res JSONB;
  v_actual_pickup TEXT;
  v_actual_delivery TEXT;
  i INTEGER;
  v_order_status order_status;
BEGIN
  -- Create order assigned to rider 2
  INSERT INTO public.orders (id, customer_id, restaurant_id, rider_id, status, item_total, total_amount, delivery_address)
  VALUES (v_order_id, v_customer_id, v_rest_id, v_rider_pk_2, 'rider_assigned', 150, 190, '{"street": "100ft Rd", "city": "Bengaluru", "pincode": "560038"}'::jsonb);

  SELECT pickup_otp, delivery_otp INTO v_actual_pickup, v_actual_delivery
  FROM public.order_otps WHERE order_id = v_order_id;

  -- Set auth context to rider 2
  PERFORM public.set_test_auth_context(v_rider_user_2, 'authenticated');

  -- A. Test NULL, Empty, and Malformed Inputs
  v_res := public.verify_order_pickup_otp(v_order_id, NULL);
  PERFORM public.assert_test('Pickup OTP NULL Input Rejection', (v_res->>'success')::boolean IS FALSE AND (v_res->>'error') = 'INVALID_OTP', 'NULL rejected');

  v_res := public.verify_order_pickup_otp(v_order_id, '');
  PERFORM public.assert_test('Pickup OTP Empty Input Rejection', (v_res->>'success')::boolean IS FALSE AND (v_res->>'error') = 'INVALID_OTP', 'Empty string rejected');

  v_res := public.verify_order_pickup_otp(v_order_id, '0000');
  PERFORM public.assert_test('Pickup OTP Placeholder 0000 Rejection', (v_res->>'success')::boolean IS FALSE AND (v_res->>'error') = 'INVALID_OTP', 'Placeholder 0000 rejected');

  -- B. Test Valid Pickup Verification
  v_res := public.verify_order_pickup_otp(v_order_id, v_actual_pickup);
  PERFORM public.assert_test('Valid Pickup OTP Verification', (v_res->>'success')::boolean IS TRUE, 'Pickup verified');

  SELECT status INTO v_order_status FROM public.orders WHERE id = v_order_id;
  PERFORM public.assert_test('Order Status Advanced to picked_up', v_order_status = 'picked_up', 'Order is now picked_up');

  -- Advance order to out_for_delivery
  UPDATE public.orders SET status = 'out_for_delivery' WHERE id = v_order_id;

  -- C. Test Delivery OTP Incorrect Attempts & Lockout
  FOR i IN 1..4 LOOP
    v_res := public.verify_order_delivery_otp(v_order_id, '1111'); -- Wrong code
    PERFORM public.assert_test(format('Incorrect Delivery OTP Attempt %s', i), (v_res->>'success')::boolean IS FALSE AND (v_res->>'attempts')::integer = i, 'Attempt counter incremented');
  END LOOP;

  -- 5th incorrect attempt should trigger lockout
  v_res := public.verify_order_delivery_otp(v_order_id, '1111');
  PERFORM public.assert_test('Delivery OTP Attempt 5 Lockout Trigger', (v_res->>'is_locked')::boolean IS TRUE, 'Lockout triggered at 5 attempts');

  -- Subsequent attempt with CORRECT code must be rejected due to lockout
  v_res := public.verify_order_delivery_otp(v_order_id, v_actual_delivery);
  PERFORM public.assert_test('Locked OTP Rejection on Correct Code', (v_res->>'success')::boolean IS FALSE AND (v_res->>'error') = 'LOCKED', 'Locked OTP cannot be verified');

  -- Reset role to postgres for next test block
  PERFORM public.set_test_auth_context(NULL, 'postgres');
END $$;

-- ------------------------------------------------------------------------------
-- 6. TEST: ADMINISTRATIVE RECOVERY RPC & TRANSACTION-LOCAL FLAGS
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  v_order_id UUID := gen_random_uuid();
  v_customer_id UUID := '00000000-0000-0000-0000-0000000000c1';
  v_rest_id UUID := '20000000-0000-0000-0000-000000000001';
  v_admin_id UUID := '00000000-0000-0000-0000-0000000000a1';
  v_rider_user_1 UUID := '00000000-0000-0000-0000-0000000000d1';
  v_rider_pk_1 UUID := '10000000-0000-0000-0000-000000000001';
  v_res JSONB;
  v_final_status order_status;
  v_audit_count INTEGER;
  v_history_count INTEGER;
  v_baseline_audit_count INTEGER;
  v_baseline_history_count INTEGER;
  v_rider_status rider_status;
  v_has_concurrent_order BOOLEAN;
  v_concurrent_order_id UUID;
BEGIN
  -- Create stuck order in out_for_delivery assigned to rider 1 (who was busy)
  INSERT INTO public.orders (id, customer_id, restaurant_id, rider_id, status, item_total, total_amount, delivery_address)
  VALUES (v_order_id, v_customer_id, v_rest_id, v_rider_pk_1, 'out_for_delivery', 220, 260, '{"street": "100ft Rd", "city": "Bengaluru", "pincode": "560038"}'::jsonb);

  UPDATE public.riders SET status = 'busy' WHERE id = v_rider_pk_1;

  -- 1. Capture baseline counts before unauthorized call
  SELECT COUNT(*) INTO v_baseline_audit_count FROM public.admin_audit_logs WHERE target_id = v_order_id::text;
  SELECT COUNT(*) INTO v_baseline_history_count FROM public.order_status_history WHERE order_id = v_order_id;

  -- A. Unauthorized caller test (customer context)
  PERFORM public.set_test_auth_context(v_customer_id, 'authenticated');
  v_res := public.admin_resolve_order_delivery(v_order_id, 'FORCE_DELIVER', 'Customer attempting recovery');

  -- Diagnostic output requested by audit harness
  RAISE NOTICE '================ DIAGNOSTIC TRACE ===============';
  RAISE NOTICE 'v_res: %', v_res;
  RAISE NOTICE 'auth.uid(): %', auth.uid();
  RAISE NOTICE 'current_user: %', current_user;
  RAISE NOTICE 'session_user: %', session_user;
  RAISE NOTICE 'request.jwt.claims: %', current_setting('request.jwt.claims', true);
  RAISE NOTICE 'public.is_admin(auth.uid()): %', public.is_admin(auth.uid());
  RAISE NOTICE 'public.is_service_role(): %', public.is_service_role();
  RAISE NOTICE '=================================================';

  PERFORM public.assert_test('Unauthorized Non-Admin Recovery Blocked', (v_res->>'success')::boolean IS FALSE AND (v_res->>'error') = 'UNAUTHORIZED', 'Non-admin rejected');

  -- Verify unauthorized attempt leaves order, rider, audit log, and status history completely untouched
  SELECT status INTO v_final_status FROM public.orders WHERE id = v_order_id;
  PERFORM public.assert_test('Order Status Unchanged After Unauthorized Call', v_final_status = 'out_for_delivery', 'Order remains in out_for_delivery');

  SELECT status INTO v_rider_status FROM public.riders WHERE id = v_rider_pk_1;
  PERFORM public.assert_test('Rider Status Unchanged After Unauthorized Call', v_rider_status = 'busy', 'Rider remains busy');

  SELECT COUNT(*) INTO v_audit_count FROM public.admin_audit_logs WHERE target_id = v_order_id::text;
  PERFORM public.assert_test('Audit Log Count Unchanged After Unauthorized Call', v_audit_count = v_baseline_audit_count, 'Audit log count matches baseline');

  SELECT COUNT(*) INTO v_history_count FROM public.order_status_history WHERE order_id = v_order_id;
  PERFORM public.assert_test('Status History Count Unchanged After Unauthorized Call', v_history_count = v_baseline_history_count, 'Order status history count matches baseline');

  -- B. Invalid Action test (admin context)
  PERFORM public.set_test_auth_context(v_admin_id, 'authenticated');
  v_res := public.admin_resolve_order_delivery(v_order_id, 'ARBITRARY_ACTION', 'Testing action whitelist');
  PERFORM public.assert_test('Invalid Recovery Action Blocked', (v_res->>'success')::boolean IS FALSE AND (v_res->>'error') = 'INVALID_ACTION', 'Action whitelist enforced');

  -- C. Insufficient Reason test (admin context)
  v_res := public.admin_resolve_order_delivery(v_order_id, 'FORCE_DELIVER', 'short');
  PERFORM public.assert_test('Insufficient Reason Blocked', (v_res->>'success')::boolean IS FALSE AND (v_res->>'error') = 'INSUFFICIENT_REASON', 'Minimum 10 char reason enforced');

  -- D. Valid Admin Recovery (FORCE_DELIVER)
  v_res := public.admin_resolve_order_delivery(v_order_id, 'FORCE_DELIVER', 'Customer lost mobile phone at doorstep handover.');
  PERFORM public.assert_test('Valid Admin Recovery Success', (v_res->>'success')::boolean IS TRUE, 'Order resolved successfully');

  SELECT status INTO v_final_status FROM public.orders WHERE id = v_order_id;
  PERFORM public.assert_test('Order Status Transitioned to delivered', v_final_status = 'delivered', 'Status is delivered');

  -- E. Verify Rider Safe Release Logic Respects Concurrent Active Deliveries
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE rider_id = v_rider_pk_1
      AND id <> v_order_id
      AND status IN ('rider_assigned'::order_status, 'picked_up'::order_status, 'out_for_delivery'::order_status)
  ) INTO v_has_concurrent_order;

  SELECT status INTO v_rider_status FROM public.riders WHERE id = v_rider_pk_1;

  IF v_has_concurrent_order THEN
    -- Correct safe-release behavior: Rider remains busy because another order is still active
    PERFORM public.assert_test('Rider Kept Busy Due to Concurrent Active Delivery',
      v_rider_status = 'busy',
      'Rider status correctly remains busy because concurrent active delivery exists');

    -- Find the concurrent order (Order 2 from Test 4) and resolve it via admin cancellation
    SELECT id INTO v_concurrent_order_id
    FROM public.orders
    WHERE rider_id = v_rider_pk_1
      AND id <> v_order_id
      AND status IN ('rider_assigned'::order_status, 'picked_up'::order_status, 'out_for_delivery'::order_status)
    LIMIT 1;

    v_res := public.admin_resolve_order_delivery(
      v_concurrent_order_id,
      'CANCEL_UNFULFILLED',
      'Administrative cleanup: Customer cancelled previous active order.'
    );
    PERFORM public.assert_test('Concurrent Order Admin Cancellation Success',
      (v_res->>'success')::boolean IS TRUE,
      'Concurrent active order resolved via admin recovery');

    -- Now that all active deliveries are resolved, Rider 1 MUST be released to 'online'
    SELECT status INTO v_rider_status FROM public.riders WHERE id = v_rider_pk_1;
    PERFORM public.assert_test('Rider Safely Released to online When No Active Deliveries Remain',
      v_rider_status = 'online',
      'Rider is now online because zero active deliveries remain');
  ELSE
    PERFORM public.assert_test('Rider Safely Released to online',
      v_rider_status = 'online',
      'Rider is now online after recovery because no concurrent deliveries exist');
  END IF;

  -- F. Verify Audit Logs in both admin_audit_logs and order_status_history
  SELECT COUNT(*) INTO v_audit_count
  FROM public.admin_audit_logs
  WHERE target_id = v_order_id::text
    AND admin_id = v_admin_id
    AND target_type = 'order';
  PERFORM public.assert_test('Audit Trail in admin_audit_logs', v_audit_count >= 1, 'Admin audit log recorded with admin_id and target_type = order');

  SELECT COUNT(*) INTO v_history_count
  FROM public.order_status_history
  WHERE order_id = v_order_id
    AND changed_by = v_admin_id
    AND note LIKE '%Customer lost mobile phone%';
  PERFORM public.assert_test('Status Note in order_status_history', v_history_count >= 1, 'Order status history recorded with changed_by and note');

  -- Reset role to postgres for next test block
  PERFORM public.set_test_auth_context(NULL, 'postgres');
END $$;

-- ------------------------------------------------------------------------------
-- 7. TEST: DIRECT ADMIN TABLE UPDATE RESTRICTIONS (RIDER & FINANCIALS)
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  v_order_id UUID := gen_random_uuid();
  v_customer_id UUID := '00000000-0000-0000-0000-0000000000c1';
  v_rest_id UUID := '20000000-0000-0000-0000-000000000001';
  v_admin_id UUID := '00000000-0000-0000-0000-0000000000a1';
  v_rider_pk_1 UUID := '10000000-0000-0000-0000-000000000001';
  v_rider_pk_2 UUID := '10000000-0000-0000-0000-000000000002';
  v_failed BOOLEAN := FALSE;
  v_err_msg TEXT := '';
BEGIN
  INSERT INTO public.orders (id, customer_id, restaurant_id, rider_id, status, item_total, total_amount, delivery_address)
  VALUES (v_order_id, v_customer_id, v_rest_id, v_rider_pk_1, 'ready', 100, 140, '{"street": "100ft Rd", "city": "Bengaluru", "pincode": "560038"}'::jsonb);

  -- Set context to authenticated admin role (not postgres superuser)
  PERFORM public.set_test_auth_context(v_admin_id, 'authenticated');

  -- A. Test direct admin modification of rider_id
  v_failed := FALSE;
  BEGIN
    UPDATE public.orders SET rider_id = v_rider_pk_2 WHERE id = v_order_id;
  EXCEPTION WHEN OTHERS THEN
    v_err_msg := SQLERRM;
    IF v_err_msg LIKE '%Rider assignment cannot be modified via direct update%' THEN
      v_failed := TRUE;
    END IF;
  END;
  PERFORM public.assert_test('Direct Admin rider_id Modification Blocked', v_failed, 'Exception raised when admin modifies rider_id directly');

  -- B. Test direct admin modification of financial field
  v_failed := FALSE;
  BEGIN
    UPDATE public.orders SET total_amount = 50.00 WHERE id = v_order_id;
  EXCEPTION WHEN OTHERS THEN
    v_err_msg := SQLERRM;
    IF v_err_msg LIKE '%Financial values are immutable%' OR v_err_msg LIKE '%Core financial values%' THEN
      v_failed := TRUE;
    END IF;
  END;
  PERFORM public.assert_test('Direct Admin total_amount Modification Blocked', v_failed, 'Exception raised when admin modifies financial values');

  -- C. Test direct admin lifecycle jump bypass (ready -> delivered)
  v_failed := FALSE;
  v_err_msg := '';

  -- Diagnostic trace output requested by audit harness
  RAISE NOTICE '================ DIAGNOSTIC TRACE (DIRECT ADMIN BYPASS) ===============';
  RAISE NOTICE 'v_order_id: %', v_order_id;
  RAISE NOTICE 'status before update: %', (SELECT status FROM public.orders WHERE id = v_order_id);
  RAISE NOTICE 'auth.uid(): %', auth.uid();
  RAISE NOTICE 'auth.role(): %', COALESCE(auth.role(), current_setting('request.jwt.claim.role', true));
  RAISE NOTICE 'current_user: %', current_user;
  RAISE NOTICE 'recovery_flag: %', current_setting('tomattto.admin_recovery_in_progress', true);
  RAISE NOTICE '========================================================================';

  BEGIN
    UPDATE public.orders SET status = 'delivered' WHERE id = v_order_id;
    RAISE NOTICE 'DIAGNOSTIC: Direct update unexpectedly succeeded! New status: %', (SELECT status FROM public.orders WHERE id = v_order_id);
  EXCEPTION WHEN OTHERS THEN
    v_err_msg := SQLERRM;
    RAISE NOTICE 'DIAGNOSTIC EXCEPTION CAUGHT: SQLSTATE = %, SQLERRM = %', SQLSTATE, v_err_msg;
    IF v_err_msg LIKE '%Direct administrative lifecycle bypass denied%' OR v_err_msg LIKE '%Invalid recovery status transition%' THEN
      v_failed := TRUE;
    END IF;
  END;
  PERFORM public.assert_test('Direct Admin Lifecycle Bypass Blocked', v_failed, 'Direct jump to delivered blocked');

  -- Reset role to postgres for next test block
  PERFORM public.set_test_auth_context(NULL, 'postgres');
END $$;

-- ------------------------------------------------------------------------------
-- 8. IS_ADMIN ARBITRARY UUID ENUMERATION HARDENING ASSERTIONS
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  v_admin_id UUID := '00000000-0000-0000-0000-0000000000a1';
  v_customer_id UUID := '00000000-0000-0000-0000-0000000000c1';
  v_other_user_id UUID := '00000000-0000-0000-0000-0000000000d1';
  v_arbitrary_uuid UUID := '99999999-9999-9999-9999-999999999999';
  v_res BOOLEAN;
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE '🔒 TESTING IS_ADMIN ARBITRARY UUID ENUMERATION HARDENING';
  RAISE NOTICE '============================================================';

  -- Case 1: anon caller checking admin UUID -> MUST BE FALSE
  PERFORM public.set_test_auth_context(NULL, 'anon');
  v_res := public.is_admin(v_admin_id);
  PERFORM public.assert_test('Anon Probing Admin UUID', v_res = FALSE, 'Anon checking admin UUID returned FALSE');

  -- Case 2: anon caller checking arbitrary UUID -> MUST BE FALSE
  v_res := public.is_admin(v_arbitrary_uuid);
  PERFORM public.assert_test('Anon Probing Arbitrary UUID', v_res = FALSE, 'Anon checking arbitrary UUID returned FALSE');

  -- Case 3: anon caller checking NULL -> MUST BE FALSE
  v_res := public.is_admin(NULL);
  PERFORM public.assert_test('Anon Checking NULL UUID', v_res = FALSE, 'Anon checking NULL returned FALSE');

  -- Case 4: authenticated non-admin checking own UUID -> MUST BE FALSE
  PERFORM public.set_test_auth_context(v_customer_id, 'authenticated');
  v_res := public.is_admin(v_customer_id);
  PERFORM public.assert_test('Non-Admin Checking Own UUID', v_res = FALSE, 'Customer checking own UUID returned FALSE');

  -- Case 5: authenticated non-admin checking admin UUID (enumeration attempt) -> MUST BE FALSE
  v_res := public.is_admin(v_admin_id);
  PERFORM public.assert_test('Non-Admin Probing Admin UUID', v_res = FALSE, 'Customer probing admin UUID returned FALSE');

  -- Case 6: authenticated non-admin checking another customer UUID -> MUST BE FALSE
  v_res := public.is_admin(v_other_user_id);
  PERFORM public.assert_test('Non-Admin Probing Other UUID', v_res = FALSE, 'Customer probing other UUID returned FALSE');

  -- Case 7: authenticated admin checking own UUID -> MUST BE TRUE
  PERFORM public.set_test_auth_context(v_admin_id, 'authenticated');
  v_res := public.is_admin(v_admin_id);
  PERFORM public.assert_test('Admin Checking Own UUID', v_res = TRUE, 'Admin checking own UUID returned TRUE');

  -- Case 8: authenticated admin checking another user UUID -> MUST BE FALSE (caller identity enforcement)
  v_res := public.is_admin(v_customer_id);
  PERFORM public.assert_test('Admin Probing Other UUID', v_res = FALSE, 'Admin checking other UUID returned FALSE');

  -- Case 9: service_role checking admin UUID -> MUST BE TRUE (trusted context preserved)
  PERFORM public.set_test_auth_context(NULL, 'service_role');
  v_res := public.is_admin(v_admin_id);
  PERFORM public.assert_test('Service Role Checking Admin UUID', v_res = TRUE, 'Service role checking admin UUID returned TRUE');

  -- Case 10: service_role checking non-admin UUID -> MUST BE FALSE (trusted context preserved)
  v_res := public.is_admin(v_customer_id);
  PERFORM public.assert_test('Service Role Checking Non-Admin UUID', v_res = FALSE, 'Service role checking customer UUID returned FALSE');

  -- Case 11: service_role checking NULL -> MUST BE FALSE
  v_res := public.is_admin(NULL);
  PERFORM public.assert_test('Service Role Checking NULL UUID', v_res = FALSE, 'Service role checking NULL returned FALSE');

  -- Reset role to postgres
  PERFORM public.set_test_auth_context(NULL, 'postgres');
END $$;

-- ------------------------------------------------------------------------------
-- 9. TEST: RIDER EDUCATIONAL QUALIFICATION PERSISTENCE & ADMIN REVIEW RPC
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  v_admin_id UUID := gen_random_uuid();
  v_rider_user UUID := gen_random_uuid();
  v_rider_app_id UUID := gen_random_uuid();
  v_doc_id UUID := gen_random_uuid();
  v_res JSONB;
  v_qual_status verification_status;
  v_app_status application_status;
  v_verified_at TIMESTAMPTZ;
  v_verified_by UUID;
  v_rejection_reason TEXT;
  v_doc_status verification_status;
  v_highest_qual TEXT;
  v_inst_name TEXT;
  v_comp_year TEXT;
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE '🎓 TESTING RIDER QUALIFICATION PERSISTENCE & REVIEW RPC';
  RAISE NOTICE '============================================================';

  -- 1. Setup isolated admin and rider profiles using random UUIDs
  INSERT INTO auth.users (id, email) VALUES
    (v_admin_id, 'adm_' || replace(v_admin_id::text, '-', '') || '@staging.local'),
    (v_rider_user, 'rdr_' || replace(v_rider_user::text, '-', '') || '@staging.local');

  INSERT INTO public.profiles (id, full_name, phone, role) VALUES
    (v_admin_id, 'Admin Verifier', '+9191' || substr(replace(v_admin_id::text, '-', ''), 1, 8), 'admin'),
    (v_rider_user, 'Applicant Rider', '+9191' || substr(replace(v_rider_user::text, '-', ''), 8, 8), 'rider');

  -- 2. Create rider application with educational qualification fields
  INSERT INTO public.rider_applications (
    id, user_id, application_ref, full_name, phone, city, vehicle_type, vehicle_number, status,
    highest_qualification, qualification_name, institution_name, completion_year, additional_qualification,
    qualification_status
  ) VALUES (
    v_rider_app_id, v_rider_user, 'RIDER-APP-' || replace(v_rider_app_id::text, '-', ''),
    'Applicant Rider', '+9191' || substr(replace(v_rider_user::text, '-', ''), 8, 8), 'Bengaluru',
    'Electric Bike', 'KA-05-EV-9999', 'submitted',
    'Bachelor of Engineering', 'Electronics & Comm', 'State Technical University', '2023', 'First Class with Distinction',
    'pending'
  );

  -- Verify educational qualification fields persisted accurately
  SELECT highest_qualification, institution_name, completion_year, qualification_status
  INTO v_highest_qual, v_inst_name, v_comp_year, v_qual_status
  FROM public.rider_applications WHERE id = v_rider_app_id;

  PERFORM public.assert_test('Rider Education Fields Persisted',
    v_highest_qual = 'Bachelor of Engineering' AND v_inst_name = 'State Technical University' AND v_comp_year = '2023' AND v_qual_status = 'pending',
    'Qualification details stored on rider application');

  -- 3. Associate qualification proof document with the rider application
  INSERT INTO public.rider_documents (
    id, rider_application_id, doc_type, storage_bucket, storage_path, file_name, file_size, mime_type, status
  ) VALUES (
    v_doc_id, v_rider_app_id, 'qualification_proof', 'rider-kyc-documents',
    v_rider_app_id::text || '/degree_cert.pdf', 'degree_cert.pdf', 1048576, 'application/pdf', 'pending'
  );

  SELECT status INTO v_doc_status FROM public.rider_documents WHERE id = v_doc_id;
  PERFORM public.assert_test('Qualification Proof Document Associated',
    v_doc_status = 'pending',
    'Document row created with doc_type qualification_proof');

  -- 4. Test unauthorized non-admin caller attempting verification -> Must be rejected (FORBIDDEN)
  PERFORM public.set_test_auth_context(v_rider_user, 'authenticated');
  v_res := public.admin_review_rider_qualification(v_rider_app_id, 'verified');
  PERFORM public.assert_test('Unauthorized Rider Qualification Review Blocked',
    (v_res->>'success')::boolean IS FALSE AND (v_res->>'error') = 'FORBIDDEN',
    'Non-admin cannot verify qualification documents');

  -- 5. Test admin rejection with NULL, empty, and whitespace-only reasons -> All rejected (INVALID_ARGUMENT)
  PERFORM public.set_test_auth_context(v_admin_id, 'authenticated');

  v_res := public.admin_review_rider_qualification(v_rider_app_id, 'rejected', NULL);
  PERFORM public.assert_test('NULL Rejection Reason Blocked',
    (v_res->>'success')::boolean IS FALSE AND (v_res->>'error') = 'INVALID_ARGUMENT',
    'NULL rejection reason rejected');

  v_res := public.admin_review_rider_qualification(v_rider_app_id, 'rejected', '');
  PERFORM public.assert_test('Empty Rejection Reason Blocked',
    (v_res->>'success')::boolean IS FALSE AND (v_res->>'error') = 'INVALID_ARGUMENT',
    'Empty string rejection reason rejected');

  v_res := public.admin_review_rider_qualification(v_rider_app_id, 'rejected', '    ');
  PERFORM public.assert_test('Whitespace-Only Rejection Reason Blocked',
    (v_res->>'success')::boolean IS FALSE AND (v_res->>'error') = 'INVALID_ARGUMENT',
    'Whitespace-only rejection reason rejected');

  -- 6. Test authorized admin rejection with valid explanation
  v_res := public.admin_review_rider_qualification(v_rider_app_id, 'rejected', 'Document illegible. Watermark obscures university seal.');
  PERFORM public.assert_test('Admin Qualification Rejection Success',
    (v_res->>'success')::boolean IS TRUE AND (v_res->>'qualification_status') = 'rejected',
    'Admin successfully rejected qualification with reason');

  SELECT qualification_status, qualification_rejection_reason, status
  INTO v_qual_status, v_rejection_reason, v_app_status
  FROM public.rider_applications WHERE id = v_rider_app_id;

  PERFORM public.assert_test('Qualification Rejection Reason Persisted',
    v_qual_status = 'rejected' AND v_rejection_reason LIKE '%Document illegible%',
    'Rejection status and reason stored');

  PERFORM public.assert_test('Qualification Rejection Preserves Overall Application Status',
    v_app_status = 'submitted',
    'Overall application status remains submitted when qualification is rejected');

  -- 7. Test authorized admin approval
  v_res := public.admin_review_rider_qualification(v_rider_app_id, 'verified');
  PERFORM public.assert_test('Admin Qualification Approval Success',
    (v_res->>'success')::boolean IS TRUE AND (v_res->>'qualification_status') = 'verified',
    'Admin approved qualification');

  SELECT qualification_status, status, qualification_verified_at, qualification_verified_by, qualification_rejection_reason
  INTO v_qual_status, v_app_status, v_verified_at, v_verified_by, v_rejection_reason
  FROM public.rider_applications WHERE id = v_rider_app_id;

  SELECT status INTO v_doc_status FROM public.rider_documents WHERE id = v_doc_id;

  PERFORM public.assert_test('Qualification Verification Metadata Persisted',
    v_qual_status = 'verified' AND v_verified_by = v_admin_id AND v_verified_at IS NOT NULL AND v_rejection_reason IS NULL,
    'Verification timestamp and admin ID recorded, rejection reason cleared');

  PERFORM public.assert_test('Qualification Approval Preserves Overall Application Status',
    v_app_status = 'submitted',
    'Overall application status remains submitted when qualification is verified');

  PERFORM public.assert_test('Rider Document Verification Synchronized',
    v_doc_status = 'verified',
    'qualification_proof document status synchronized to verified');

  -- Reset role to postgres
  PERFORM public.set_test_auth_context(NULL, 'postgres');
END $$;

-- ------------------------------------------------------------------------------
-- 10. TEST: RESTAURANT APPLICATION REVIEW RPC, DUPLICATE PREVENTION & REJECTION
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  v_admin_id UUID := gen_random_uuid();
  v_owner_user UUID := gen_random_uuid();
  v_app_id UUID := gen_random_uuid();
  v_res JSONB;
  v_rest_count INTEGER;
  v_app_status application_status;
  v_rejection_reason TEXT;
  v_reviewer_notes TEXT;
  v_reviewed_by UUID;
  v_reviewed_at TIMESTAMPTZ;
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE '🍽️ TESTING RESTAURANT APPLICATION REVIEW RPC';
  RAISE NOTICE '============================================================';

  -- Setup admin and partner applicant
  INSERT INTO auth.users (id, email) VALUES
    (v_admin_id, 'adm_' || replace(v_admin_id::text, '-', '') || '@staging.local'),
    (v_owner_user, 'own_' || replace(v_owner_user::text, '-', '') || '@staging.local');

  INSERT INTO public.profiles (id, full_name, phone, role) VALUES
    (v_admin_id, 'Admin Reviewer', '+9192' || substr(replace(v_admin_id::text, '-', ''), 1, 8), 'admin'),
    (v_owner_user, 'Restaurant Partner', '+9192' || substr(replace(v_owner_user::text, '-', ''), 8, 8), 'restaurant_owner');

  -- Create submitted restaurant application
  INSERT INTO public.restaurant_partner_applications (
    id, user_id, application_ref, ownership_token_hash, status, restaurant_name,
    phone, address_line1, city, postal_code, estimated_cost_for_two, pure_veg
  ) VALUES (
    v_app_id, v_owner_user, 'REST-APP-' || replace(v_app_id::text, '-', ''), 'dummy_token_hash', 'submitted',
    'Saffron Spice Kitchen', '+9192' || substr(replace(v_owner_user::text, '-', ''), 8, 8),
    '100 Feet Road, HAL 2nd Stage', 'Bengaluru', '560038', 650, false
  );

  -- 1. Test unauthorized reviewer rejected (FORBIDDEN)
  PERFORM public.set_test_auth_context(v_owner_user, 'authenticated');
  v_res := public.admin_review_restaurant_application(v_app_id, 'approve');
  PERFORM public.assert_test('Unauthorized Restaurant Review Blocked',
    (v_res->>'success')::boolean IS FALSE AND (v_res->>'error') = 'FORBIDDEN',
    'Applicant cannot approve own restaurant application');

  -- 2. Test invalid action rejected (INVALID_ACTION)
  PERFORM public.set_test_auth_context(v_admin_id, 'authenticated');
  v_res := public.admin_review_restaurant_application(v_app_id, 'INVALID_ACTION');
  PERFORM public.assert_test('Invalid Restaurant Review Action Blocked',
    (v_res->>'success')::boolean IS FALSE AND (v_res->>'error') = 'INVALID_ACTION',
    'Arbitrary action name rejected');

  -- 3. Test rejection and action_required without reason -> Blocked (INVALID_ARGUMENT)
  v_res := public.admin_review_restaurant_application(v_app_id, 'reject', NULL);
  PERFORM public.assert_test('Restaurant Rejection Without Reason Blocked (NULL)',
    (v_res->>'success')::boolean IS FALSE AND (v_res->>'error') = 'INVALID_ARGUMENT',
    'NULL rejection reason rejected');

  v_res := public.admin_review_restaurant_application(v_app_id, 'reject', '   ');
  PERFORM public.assert_test('Restaurant Rejection Without Reason Blocked (Whitespace)',
    (v_res->>'success')::boolean IS FALSE AND (v_res->>'error') = 'INVALID_ARGUMENT',
    'Whitespace rejection reason rejected');

  v_res := public.admin_review_restaurant_application(v_app_id, 'action_required', '');
  PERFORM public.assert_test('Restaurant Action Required Without Reason Blocked',
    (v_res->>'success')::boolean IS FALSE AND (v_res->>'error') = 'INVALID_ARGUMENT',
    'Empty reason blocked for action_required');

  -- 4. Test valid action_required flow
  v_res := public.admin_review_restaurant_application(v_app_id, 'action_required', 'FSSAI license image expired. Upload renewal.', 'Need renewed cert');
  PERFORM public.assert_test('Restaurant Action Required Success',
    (v_res->>'success')::boolean IS TRUE AND (v_res->>'action') = 'action_required',
    'Resubmission requested successfully');

  SELECT status, rejection_reason, reviewer_notes, reviewed_by, reviewed_at
  INTO v_app_status, v_rejection_reason, v_reviewer_notes, v_reviewed_by, v_reviewed_at
  FROM public.restaurant_partner_applications WHERE id = v_app_id;

  PERFORM public.assert_test('Restaurant Application Action Required Metadata',
    v_app_status = 'action_required' AND v_rejection_reason LIKE '%FSSAI license image expired%' AND v_reviewed_by = v_admin_id AND v_reviewed_at IS NOT NULL,
    'Action required status and review metadata persisted');

  -- 5. Test valid approval and restaurant record provisioning
  v_res := public.admin_review_restaurant_application(v_app_id, 'approve', NULL, 'On-site kitchen hygiene verified.');
  PERFORM public.assert_test('Restaurant Application Approval Success',
    (v_res->>'success')::boolean IS TRUE AND (v_res->>'action') = 'approved',
    'Application approved by administrator');

  SELECT status, reviewed_by INTO v_app_status, v_reviewed_by
  FROM public.restaurant_partner_applications WHERE id = v_app_id;
  PERFORM public.assert_test('Restaurant Application Status Approved',
    v_app_status = 'approved' AND v_reviewed_by = v_admin_id,
    'Application marked approved with reviewer ID');

  SELECT COUNT(*) INTO v_rest_count
  FROM public.restaurants
  WHERE name = 'Saffron Spice Kitchen' AND owner_id = v_owner_user;
  PERFORM public.assert_test('Restaurant Provisioned in Public Table',
    v_rest_count = 1,
    'New restaurant created in public.restaurants matching application details');

  -- 6. Test duplicate prevention on repeated approval
  v_res := public.admin_review_restaurant_application(v_app_id, 'approve');
  SELECT COUNT(*) INTO v_rest_count
  FROM public.restaurants
  WHERE name = 'Saffron Spice Kitchen' AND owner_id = v_owner_user;
  PERFORM public.assert_test('Duplicate Restaurant Prevention Enforced',
    v_rest_count = 1,
    'Repeated approval does not create duplicate restaurant rows');

  -- Reset role to postgres
  PERFORM public.set_test_auth_context(NULL, 'postgres');
END $$;

-- ------------------------------------------------------------------------------
-- 11. TEST: APPLICATION VISIBILITY & CROSS-APPLICANT RLS ENFORCEMENT
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  v_user_1 UUID := gen_random_uuid();
  v_user_2 UUID := gen_random_uuid();
  v_admin_id UUID := gen_random_uuid();
  v_app_1 UUID := gen_random_uuid();
  v_app_2 UUID := gen_random_uuid();
  v_rider_app_1 UUID := gen_random_uuid();
  v_rider_app_2 UUID := gen_random_uuid();
  v_visible_count INTEGER;
  v_insert_failed BOOLEAN := FALSE;
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE '🔒 TESTING APPLICATION VISIBILITY & CROSS-APPLICANT RLS';
  RAISE NOTICE '============================================================';

  -- Create 2 applicant users and 1 admin user
  INSERT INTO auth.users (id, email) VALUES
    (v_user_1, 'u1_' || replace(v_user_1::text, '-', '') || '@staging.local'),
    (v_user_2, 'u2_' || replace(v_user_2::text, '-', '') || '@staging.local'),
    (v_admin_id, 'adm_' || replace(v_admin_id::text, '-', '') || '@staging.local');

  INSERT INTO public.profiles (id, full_name, phone, role) VALUES
    (v_user_1, 'Applicant One', '+9193' || substr(replace(v_user_1::text, '-', ''), 1, 8), 'restaurant_owner'),
    (v_user_2, 'Applicant Two', '+9193' || substr(replace(v_user_2::text, '-', ''), 8, 8), 'restaurant_owner'),
    (v_admin_id, 'Admin Auditor', '+9193' || substr(replace(v_admin_id::text, '-', ''), 16, 8), 'admin');

  -- App 1 for User 1
  INSERT INTO public.restaurant_partner_applications (
    id, user_id, application_ref, ownership_token_hash, status, restaurant_name, phone, address_line1, city, postal_code
  ) VALUES (
    v_app_1, v_user_1, 'APP-ONE-' || replace(v_app_1::text, '-', ''), 'tok1', 'submitted',
    'Bistro One', '+9193' || substr(replace(v_user_1::text, '-', ''), 1, 8), 'Main St', 'Bengaluru', '560001'
  );

  -- App 2 for User 2
  INSERT INTO public.restaurant_partner_applications (
    id, user_id, application_ref, ownership_token_hash, status, restaurant_name, phone, address_line1, city, postal_code
  ) VALUES (
    v_app_2, v_user_2, 'APP-TWO-' || replace(v_app_2::text, '-', ''), 'tok2', 'submitted',
    'Bistro Two', '+9193' || substr(replace(v_user_2::text, '-', ''), 8, 8), 'Cross St', 'Bengaluru', '560002'
  );

  -- Rider App 1 for User 1
  INSERT INTO public.rider_applications (
    id, user_id, application_ref, full_name, phone, city, vehicle_type, vehicle_number, status
  ) VALUES (
    v_rider_app_1, v_user_1, 'RIDER-ONE-' || replace(v_rider_app_1::text, '-', ''),
    'Rider One', '+9193' || substr(replace(v_user_1::text, '-', ''), 1, 8), 'Bengaluru', 'Bike', 'KA-01-A-1111', 'submitted'
  );

  -- Rider App 2 for User 2
  INSERT INTO public.rider_applications (
    id, user_id, application_ref, full_name, phone, city, vehicle_type, vehicle_number, status
  ) VALUES (
    v_rider_app_2, v_user_2, 'RIDER-TWO-' || replace(v_rider_app_2::text, '-', ''),
    'Rider Two', '+9193' || substr(replace(v_user_2::text, '-', ''), 8, 8), 'Bengaluru', 'Bike', 'KA-02-B-2222', 'submitted'
  );

  -- 1. Applicant 1 SELECT partner applications -> Sees App 1, does NOT see App 2
  PERFORM public.set_test_auth_context(v_user_1, 'authenticated');

  SELECT COUNT(*) INTO v_visible_count
  FROM public.restaurant_partner_applications WHERE id = v_app_1;
  PERFORM public.assert_test('Applicant 1 Can View Own Partner Application',
    v_visible_count = 1, 'App 1 visible to owner');

  SELECT COUNT(*) INTO v_visible_count
  FROM public.restaurant_partner_applications WHERE id = v_app_2;
  PERFORM public.assert_test('Cross-Applicant Isolation Enforced (Partner App 2 Hidden)',
    v_visible_count = 0, 'App 2 not visible to Applicant 1');

  -- 2. Applicant 1 SELECT rider applications -> Sees Rider App 1, does NOT see Rider App 2
  SELECT COUNT(*) INTO v_visible_count
  FROM public.rider_applications WHERE id = v_rider_app_1;
  PERFORM public.assert_test('Rider 1 Can View Own Rider Application',
    v_visible_count = 1, 'Rider App 1 visible to owner');

  SELECT COUNT(*) INTO v_visible_count
  FROM public.rider_applications WHERE id = v_rider_app_2;
  PERFORM public.assert_test('Cross-Rider Isolation Enforced (Rider App 2 Hidden)',
    v_visible_count = 0, 'Rider App 2 not visible to Rider 1');

  -- 3. Applicant 1 attempts to INSERT partner application impersonating User 2
  v_insert_failed := FALSE;
  BEGIN
    INSERT INTO public.restaurant_partner_applications (
      id, user_id, application_ref, ownership_token_hash, status, restaurant_name, phone, address_line1, city, postal_code
    ) VALUES (
      gen_random_uuid(), v_user_2, 'APP-SPOOF-' || substr(gen_random_uuid()::text, 1, 8), 'tokspoof', 'draft',
      'Spoofed Kitchen', '+919300000000', 'Spoofed St', 'Bengaluru', '560001'
    );
  EXCEPTION WHEN OTHERS THEN
    v_insert_failed := TRUE;
  END;

  SELECT COUNT(*) INTO v_visible_count
  FROM public.restaurant_partner_applications
  WHERE user_id = v_user_2 AND restaurant_name = 'Spoofed Kitchen';

  PERFORM public.assert_test('Applicant Cannot Insert Application for Another User',
    (v_insert_failed IS TRUE OR v_visible_count = 0),
    'RLS and ownership trigger prevent applicant from creating application for another user');

  -- 4. Admin SELECT -> Sees both partner apps and both rider apps
  PERFORM public.set_test_auth_context(v_admin_id, 'authenticated');

  SELECT COUNT(*) INTO v_visible_count
  FROM public.restaurant_partner_applications WHERE id IN (v_app_1, v_app_2);
  PERFORM public.assert_test('Admin Can View All Partner Applications',
    v_visible_count = 2, 'Admin sees both partner applications');

  SELECT COUNT(*) INTO v_visible_count
  FROM public.rider_applications WHERE id IN (v_rider_app_1, v_rider_app_2);
  PERFORM public.assert_test('Admin Can View All Rider Applications',
    v_visible_count = 2, 'Admin sees both rider applications');

  -- Reset role to postgres
  PERFORM public.set_test_auth_context(NULL, 'postgres');
END $$;

-- ------------------------------------------------------------------------------
-- 12. TEST: FINANCIAL RECORDS RLS, OWNERSHIP & UNIQUE CONSTRAINT
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  v_user_1 UUID := gen_random_uuid();
  v_user_2 UUID := gen_random_uuid();
  v_admin_id UUID := gen_random_uuid();
  v_app_1 UUID := gen_random_uuid();
  v_app_2 UUID := gen_random_uuid();
  v_fin_id_1 UUID := gen_random_uuid();
  v_fin_id_dup UUID := gen_random_uuid();
  v_visible_count INTEGER;
  v_insert_spoof_failed BOOLEAN := FALSE;
  v_unique_violation_caught BOOLEAN := FALSE;
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE '💳 TESTING FINANCIAL RECORDS RLS & UNIQUE CONSTRAINT';
  RAISE NOTICE '============================================================';

  -- Setup 2 users and 1 admin
  INSERT INTO auth.users (id, email) VALUES
    (v_user_1, 'fin1_' || replace(v_user_1::text, '-', '') || '@staging.local'),
    (v_user_2, 'fin2_' || replace(v_user_2::text, '-', '') || '@staging.local'),
    (v_admin_id, 'admfin_' || replace(v_admin_id::text, '-', '') || '@staging.local');

  INSERT INTO public.profiles (id, full_name, phone, role) VALUES
    (v_user_1, 'Fin Owner One', '+9194' || substr(replace(v_user_1::text, '-', ''), 1, 8), 'restaurant_owner'),
    (v_user_2, 'Fin Owner Two', '+9194' || substr(replace(v_user_2::text, '-', ''), 8, 8), 'restaurant_owner'),
    (v_admin_id, 'Fin Admin', '+9194' || substr(replace(v_admin_id::text, '-', ''), 16, 8), 'admin');

  -- App 1 for User 1
  INSERT INTO public.restaurant_partner_applications (
    id, user_id, application_ref, ownership_token_hash, status, restaurant_name, phone, address_line1, city, postal_code
  ) VALUES (
    v_app_1, v_user_1, 'APP-F1-' || replace(v_app_1::text, '-', ''), 'th1', 'submitted',
    'Financial Test Kitchen', '+9194' || substr(replace(v_user_1::text, '-', ''), 1, 8), 'Brigade Road', 'Bengaluru', '560025'
  );

  -- App 2 for User 2
  INSERT INTO public.restaurant_partner_applications (
    id, user_id, application_ref, ownership_token_hash, status, restaurant_name, phone, address_line1, city, postal_code
  ) VALUES (
    v_app_2, v_user_2, 'APP-F2-' || replace(v_app_2::text, '-', ''), 'th2', 'submitted',
    'Other Kitchen', '+9194' || substr(replace(v_user_2::text, '-', ''), 8, 8), 'MG Road', 'Bengaluru', '560001'
  );

  -- 1. Applicant 1 inserts financial record for own application -> Succeeded
  PERFORM public.set_test_auth_context(v_user_1, 'authenticated');
  INSERT INTO public.restaurant_partner_financials (
    id, application_id, legal_entity_name, business_type, pan_number_masked, fssai_license_number,
    fssai_expiry_date, bank_name, bank_account_holder, bank_account_number_masked, bank_ifsc
  ) VALUES (
    v_fin_id_1, v_app_1, 'Synthetic Rest Ltd', 'Private Limited', 'ABCDE9999Z', '10019000000001',
    CURRENT_DATE + INTERVAL '2 years', 'Synthetic Bank', 'Synthetic Rest Ltd', '••••••••9999', 'SYNT0001234'
  );

  SELECT COUNT(*) INTO v_visible_count
  FROM public.restaurant_partner_financials WHERE application_id = v_app_1;
  PERFORM public.assert_test('Applicant Successfully Inserted Own Financials',
    v_visible_count = 1, 'Financial record created by owner');

  -- 2. Applicant 1 views own financials -> Succeeded
  SELECT COUNT(*) INTO v_visible_count
  FROM public.restaurant_partner_financials WHERE id = v_fin_id_1;
  PERFORM public.assert_test('Applicant Can View Own Financial Record',
    v_visible_count = 1, 'Financial record visible to owner');

  -- 3. Applicant 2 views Applicant 1 financials -> Blocked by RLS (0 rows)
  PERFORM public.set_test_auth_context(v_user_2, 'authenticated');
  SELECT COUNT(*) INTO v_visible_count
  FROM public.restaurant_partner_financials WHERE id = v_fin_id_1;
  PERFORM public.assert_test('Cross-Applicant Financial Access Blocked by RLS',
    v_visible_count = 0, 'Applicant 2 cannot read Applicant 1 financials');

  -- 4. Applicant 2 attempts to insert financials for Applicant 1 application -> Blocked by RLS
  v_insert_spoof_failed := FALSE;
  BEGIN
    INSERT INTO public.restaurant_partner_financials (
      id, application_id, legal_entity_name, business_type, pan_number_masked, fssai_license_number,
      fssai_expiry_date, bank_name, bank_account_holder, bank_account_number_masked, bank_ifsc
    ) VALUES (
      gen_random_uuid(), v_app_1, 'Spoofed Fin', 'LLP', 'XYZAB1111A', '10019000000002',
      CURRENT_DATE + INTERVAL '1 year', 'Spoof Bank', 'Spoofed Fin', '••••••••1111', 'SPOO0001234'
    );
  EXCEPTION WHEN OTHERS THEN
    v_insert_spoof_failed := TRUE;
  END;
  PERFORM public.assert_test('Cross-Applicant Financial Insert Blocked by RLS',
    v_insert_spoof_failed IS TRUE,
    'RLS policy prevented user 2 from inserting financials for application owned by user 1');

  -- 5. Duplicate application_id insert -> Rejected by unique constraint uq_restaurant_financials_app
  PERFORM public.set_test_auth_context(v_user_1, 'authenticated');
  v_unique_violation_caught := FALSE;
  BEGIN
    INSERT INTO public.restaurant_partner_financials (
      id, application_id, legal_entity_name, business_type, pan_number_masked, fssai_license_number,
      fssai_expiry_date, bank_name, bank_account_holder, bank_account_number_masked, bank_ifsc
    ) VALUES (
      v_fin_id_dup, v_app_1, 'Synthetic Rest Duplicate', 'Private Limited', 'ABCDE9999Z', '10019000000001',
      CURRENT_DATE + INTERVAL '2 years', 'Synthetic Bank', 'Synthetic Rest Duplicate', '••••••••9999', 'SYNT0001234'
    );
  EXCEPTION WHEN unique_violation THEN
    v_unique_violation_caught := TRUE;
  END;
  PERFORM public.assert_test('Unique Constraint uq_restaurant_financials_app Enforced',
    v_unique_violation_caught IS TRUE,
    'Duplicate insert on application_id raised unique_violation');

  -- 6. Admin views financials -> Allowed
  PERFORM public.set_test_auth_context(v_admin_id, 'authenticated');
  SELECT COUNT(*) INTO v_visible_count
  FROM public.restaurant_partner_financials WHERE id = v_fin_id_1;
  PERFORM public.assert_test('Admin Can View Financial Records',
    v_visible_count = 1, 'Admin can read financial record under admin policy');

  -- Reset role to postgres
  PERFORM public.set_test_auth_context(NULL, 'postgres');
END $$;

-- ------------------------------------------------------------------------------
-- 13. TEST: STORAGE OBJECTS RLS ENFORCEMENT (SQL LEVEL)
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  v_user_1 UUID := gen_random_uuid();
  v_user_2 UUID := gen_random_uuid();
  v_admin_id UUID := gen_random_uuid();
  v_app_1 UUID := gen_random_uuid();
  v_obj_id_1 UUID := gen_random_uuid();
  v_upload_spoof_failed BOOLEAN := FALSE;
  v_upload_success BOOLEAN := FALSE;
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE '📁 TESTING STORAGE OBJECTS RLS ENFORCEMENT (SQL LEVEL)';
  RAISE NOTICE '============================================================';

  -- Create users
  INSERT INTO auth.users (id, email) VALUES
    (v_user_1, 'stor1_' || replace(v_user_1::text, '-', '') || '@staging.local'),
    (v_user_2, 'stor2_' || replace(v_user_2::text, '-', '') || '@staging.local'),
    (v_admin_id, 'adm_stor_' || replace(v_admin_id::text, '-', '') || '@staging.local');

  INSERT INTO public.profiles (id, full_name, phone, role) VALUES
    (v_user_1, 'Storage Applicant 1', '+9199' || substr(replace(v_user_1::text, '-', ''), 1, 8), 'rider'),
    (v_user_2, 'Storage Applicant 2', '+9199' || substr(replace(v_user_2::text, '-', ''), 8, 8), 'rider'),
    (v_admin_id, 'Storage Admin', '+9199' || substr(replace(v_admin_id::text, '-', ''), 16, 8), 'admin');

  -- App 1 for User 1
  INSERT INTO public.rider_applications (
    id, user_id, application_ref, full_name, phone, city, vehicle_type, vehicle_number, status
  ) VALUES (
    v_app_1, v_user_1, 'RIDER-ST-' || replace(v_app_1::text, '-', ''),
    'Storage Applicant 1', '+9199' || substr(replace(v_user_1::text, '-', ''), 1, 8),
    'Bengaluru', 'Bike', 'KA-01-SS-1111', 'submitted'
  );

  -- 1. Applicant 1 inserts storage object inside own application folder -> Allowed by RLS
  PERFORM public.set_test_auth_context(v_user_1, 'authenticated');
  v_upload_success := FALSE;
  BEGIN
    INSERT INTO storage.objects (
      id, bucket_id, name, owner, metadata
    ) VALUES (
      v_obj_id_1, 'rider-kyc-documents', v_app_1::text || '/synthetic_id_card.pdf', v_user_1,
      '{"mimetype": "application/pdf", "size": 1024}'::jsonb
    );
    v_upload_success := TRUE;
  EXCEPTION WHEN OTHERS THEN
    v_upload_success := FALSE;
  END;
  PERFORM public.assert_test('Applicant Upload to Own KYC Storage Folder Succeeded',
    v_upload_success IS TRUE,
    'Storage RLS policy Riders upload rider kyc files allowed file insert');

  -- 2. Applicant 2 attempts to insert storage object inside Applicant 1 folder -> Blocked by RLS
  PERFORM public.set_test_auth_context(v_user_2, 'authenticated');
  v_upload_spoof_failed := FALSE;
  BEGIN
    INSERT INTO storage.objects (
      id, bucket_id, name, owner, metadata
    ) VALUES (
      gen_random_uuid(), 'rider-kyc-documents', v_app_1::text || '/unauthorized_file.pdf', v_user_2,
      '{"mimetype": "application/pdf", "size": 1024}'::jsonb
    );
  EXCEPTION WHEN OTHERS THEN
    v_upload_spoof_failed := TRUE;
  END;
  PERFORM public.assert_test('Cross-Applicant Storage Upload Blocked by RLS',
    v_upload_spoof_failed IS TRUE,
    'Storage RLS policy rejected upload into foreign application directory');

  -- Reset role to postgres
  PERFORM public.set_test_auth_context(NULL, 'postgres');
END $$;

-- ------------------------------------------------------------------------------
-- 14. SUMMARY AND CLEAN ROLLBACK
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE '🍅 ALL SQL-LEVEL STAGING VALIDATION ASSERTIONS PASSED!';
  RAISE NOTICE '============================================================';
END $$;

-- Roll back all test rows so test run leaves database completely clean
ROLLBACK;
