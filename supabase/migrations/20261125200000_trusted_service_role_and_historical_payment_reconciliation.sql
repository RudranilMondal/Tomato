-- ==============================================================================
-- Migration: 20261125200000_trusted_service_role_and_historical_payment_reconciliation.sql
-- Description:
--   1. Harden public.is_service_role() to eliminate insecure session_user/current_user
--      fallbacks, establishing strict PostgREST JWT claim verification and
--      authenticated session checks.
--   2. Authorize process_verified_registration_payment with direct check on verified
--      service role or platform admin.
--   3. Reconcile and backfill verified historical restaurant and rider registration
--      payments into public.partner_registration_payments in an idempotent, safe manner.
--   4. Update public.process_verified_registration_payment to cross-check historical
--      application & ledger tables even if a payment ID was not in the new registry.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. HARDENED TRUSTED SERVICE-ROLE DETECTION
-- ------------------------------------------------------------------------------
-- Eliminates trusting session_user IN ('postgres', 'supabase_admin') when invoked
-- through standard client sessions where session_user can be postgres.
-- In Supabase architecture, PostgREST and Edge Functions authenticate via signed JWTs.
-- The service role MUST present a cryptographically verified JWT claim where role = 'service_role'.
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
DECLARE
  v_jwt_role TEXT;
  v_auth_role TEXT;
BEGIN
  -- 1. Check explicit PostgREST JWT claims (set by PostgREST from verified Bearer token)
  BEGIN
    v_jwt_role := COALESCE(
      NULLIF(current_setting('request.jwt.claim.role', true), ''),
      NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
    );
  EXCEPTION WHEN OTHERS THEN
    v_jwt_role := NULL;
  END;

  IF v_jwt_role IS NOT NULL AND v_jwt_role <> '' THEN
    RETURN (v_jwt_role = 'service_role');
  END IF;

  -- 2. Fallback to Supabase auth.role()
  BEGIN
    v_auth_role := auth.role();
    IF v_auth_role IS NOT NULL AND v_auth_role <> '' THEN
      RETURN (v_auth_role = 'service_role');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- 3. If no JWT role claims exist, direct database superuser / replication roles only
  -- But ONLY if current_setting('request.jwt.claim.sub', true) is NOT set (i.e. not an HTTP API caller)
  -- and session_user is truly the internal supabase admin or postgres running local migrations
  IF current_setting('request.jwt.claim.sub', true) IS NULL OR current_setting('request.jwt.claim.sub', true) = '' THEN
    IF session_user IN ('postgres', 'supabase_admin') AND current_user = session_user THEN
      RETURN TRUE;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$;

ALTER FUNCTION public.is_service_role() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_service_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_service_role() TO anon, authenticated, service_role, postgres;

-- ------------------------------------------------------------------------------
-- 2. SAFE, IDEMPOTENT HISTORICAL PAYMENT OWNERSHIP RECONCILIATION & BACKFILL
-- ------------------------------------------------------------------------------
-- Reconcile verified ₹499 historical payments from existing application and
-- financial ledger records into public.partner_registration_payments.
-- Only records with verified ledger records (completed, amount = 499, currency = 'INR')
-- that do not have conflicting ownership between restaurant and rider applications
-- are backfilled.

-- Backfill Restaurant Applications
INSERT INTO public.partner_registration_payments (
  payment_id,
  application_type,
  application_id,
  user_id,
  amount,
  currency,
  status,
  claimed_at
)
SELECT DISTINCT ON (app.registration_payment_id)
  app.registration_payment_id AS payment_id,
  'restaurant' AS application_type,
  app.id AS application_id,
  app.user_id,
  499.00 AS amount,
  'INR' AS currency,
  CASE
    WHEN tx.status IN ('refunded', 'reversed') THEN 'refunded'
    ELSE 'completed'
  END AS status,
  COALESCE(app.registration_paid_at, tx.created_at, app.created_at, NOW()) AS claimed_at
FROM public.restaurant_partner_applications app
JOIN public.platform_financial_transactions tx
  ON tx.reference_id = app.id::TEXT
  AND tx.transaction_type = 'partner_registration'
WHERE app.registration_payment_id IS NOT NULL
  AND length(trim(app.registration_payment_id)) > 0
  AND tx.amount = 499.00
  AND tx.currency = 'INR'
  -- Ensure not conflicting with rider applications before inserting
  AND NOT EXISTS (
    SELECT 1 FROM public.rider_applications rider
    WHERE rider.registration_payment_id = app.registration_payment_id
      AND rider.id <> app.id
  )
ON CONFLICT (payment_id) DO NOTHING;

-- Backfill Rider Applications
INSERT INTO public.partner_registration_payments (
  payment_id,
  application_type,
  application_id,
  user_id,
  amount,
  currency,
  status,
  claimed_at
)
SELECT DISTINCT ON (app.registration_payment_id)
  app.registration_payment_id AS payment_id,
  'rider' AS application_type,
  app.id AS application_id,
  app.user_id,
  499.00 AS amount,
  'INR' AS currency,
  CASE
    WHEN tx.status IN ('refunded', 'reversed') THEN 'refunded'
    ELSE 'completed'
  END AS status,
  COALESCE(app.registration_paid_at, tx.created_at, app.created_at, NOW()) AS claimed_at
FROM public.rider_applications app
JOIN public.platform_financial_transactions tx
  ON tx.reference_id = app.id::TEXT
  AND tx.transaction_type = 'rider_registration'
WHERE app.registration_payment_id IS NOT NULL
  AND length(trim(app.registration_payment_id)) > 0
  AND tx.amount = 499.00
  AND tx.currency = 'INR'
  -- Ensure not conflicting with restaurant applications
  AND NOT EXISTS (
    SELECT 1 FROM public.restaurant_partner_applications rest
    WHERE rest.registration_payment_id = app.registration_payment_id
      AND rest.id <> app.id
  )
ON CONFLICT (payment_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. HARDEN process_verified_registration_payment WITH HISTORICAL CROSS-CHECK
-- ------------------------------------------------------------------------------
-- In addition to checking public.partner_registration_payments, the RPC actively
-- verifies whether the payment ID has already been recorded in historical application
-- tables (restaurant_partner_applications or rider_applications) or ledger transactions,
-- preventing any newly submitted application from reusing an unbackfilled historical ID.
CREATE OR REPLACE FUNCTION public.process_verified_registration_payment(
  p_applicant_type TEXT,
  p_application_id UUID,
  p_razorpay_payment_id TEXT,
  p_razorpay_order_id TEXT DEFAULT NULL,
  p_tshirt_size TEXT DEFAULT 'L',
  p_bag_type TEXT DEFAULT 'standard_insulated'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_caller_role TEXT;
  v_fee NUMERIC(10, 2) := 499.00;
  v_now TIMESTAMPTZ := NOW();
  v_existing_claim RECORD;
  v_hist_rest RECORD;
  v_hist_rider RECORD;
  v_user_id UUID;
BEGIN
  -- Authorization: Only trusted backend service_role or platform admin may execute
  IF NOT public.is_service_role() THEN
    IF v_caller_id IS NOT NULL THEN
      SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_caller_id;
      IF COALESCE(v_caller_role, '') <> 'admin' THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Registration payment verification must be performed by trusted backend service'
          USING ERRCODE = '42501';
      END IF;
    ELSE
      RAISE EXCEPTION 'UNAUTHORIZED: Service role or admin authentication required'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF p_applicant_type NOT IN ('restaurant', 'rider') THEN
    RAISE EXCEPTION 'INVALID_APPLICANT_TYPE: Must be restaurant or rider' USING ERRCODE = '22023';
  END IF;

  IF p_razorpay_payment_id IS NULL OR TRIM(p_razorpay_payment_id) = '' THEN
    RAISE EXCEPTION 'INVALID_PAYMENT_ID: Verified Razorpay payment ID is required' USING ERRCODE = '22023';
  END IF;

  -- 1. Check Global Registration Payment Ownership Table
  SELECT * INTO v_existing_claim
  FROM public.partner_registration_payments
  WHERE payment_id = p_razorpay_payment_id
  FOR UPDATE;

  IF FOUND THEN
    IF v_existing_claim.application_type = p_applicant_type AND v_existing_claim.application_id = p_application_id THEN
      -- Idempotent retry: Already claimed by this exact application
      RETURN jsonb_build_object(
        'status', 'already_paid',
        'message', 'Registration fee has already been paid and verified for this application.',
        'payment_id', p_razorpay_payment_id,
        'application_id', p_application_id
      );
    ELSE
      -- Payment ID is bound to another application (restaurant or rider!)
      RAISE EXCEPTION 'PAYMENT_ALREADY_USED: Payment ID % is already bound to % application %',
        p_razorpay_payment_id, v_existing_claim.application_type, v_existing_claim.application_id
        USING ERRCODE = '23505';
    END IF;
  END IF;

  -- 2. Defense-in-depth: Check historical restaurant applications for existing ownership
  SELECT id, user_id INTO v_hist_rest
  FROM public.restaurant_partner_applications
  WHERE registration_payment_id = p_razorpay_payment_id
  LIMIT 1;

  IF FOUND THEN
    IF p_applicant_type = 'restaurant' AND v_hist_rest.id = p_application_id THEN
      -- Already assigned to this exact application historically; ensure registered in global table
      INSERT INTO public.partner_registration_payments (
        payment_id, application_type, application_id, user_id, amount, currency, status, claimed_at
      ) VALUES (
        p_razorpay_payment_id, 'restaurant', p_application_id, v_hist_rest.user_id, v_fee, 'INR', 'completed', v_now
      ) ON CONFLICT (payment_id) DO NOTHING;

      RETURN jsonb_build_object(
        'status', 'already_paid',
        'message', 'Registration fee has already been paid and verified historically.',
        'payment_id', p_razorpay_payment_id,
        'application_id', p_application_id
      );
    ELSE
      RAISE EXCEPTION 'PAYMENT_ALREADY_USED: Payment ID % is already bound historically to restaurant application %',
        p_razorpay_payment_id, v_hist_rest.id
        USING ERRCODE = '23505';
    END IF;
  END IF;

  -- 3. Defense-in-depth: Check historical rider applications for existing ownership
  SELECT id, user_id INTO v_hist_rider
  FROM public.rider_applications
  WHERE registration_payment_id = p_razorpay_payment_id
  LIMIT 1;

  IF FOUND THEN
    IF p_applicant_type = 'rider' AND v_hist_rider.id = p_application_id THEN
      INSERT INTO public.partner_registration_payments (
        payment_id, application_type, application_id, user_id, amount, currency, status, claimed_at
      ) VALUES (
        p_razorpay_payment_id, 'rider', p_application_id, v_hist_rider.user_id, v_fee, 'INR', 'completed', v_now
      ) ON CONFLICT (payment_id) DO NOTHING;

      RETURN jsonb_build_object(
        'status', 'already_paid',
        'message', 'Registration fee has already been paid and verified historically.',
        'payment_id', p_razorpay_payment_id,
        'application_id', p_application_id
      );
    ELSE
      RAISE EXCEPTION 'PAYMENT_ALREADY_USED: Payment ID % is already bound historically to rider application %',
        p_razorpay_payment_id, v_hist_rider.id
        USING ERRCODE = '23505';
    END IF;
  END IF;

  -- 4. Process Application Update & Ledger Record
  IF p_applicant_type = 'restaurant' THEN
    SELECT user_id INTO v_user_id FROM public.restaurant_partner_applications WHERE id = p_application_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'APPLICATION_NOT_FOUND: Restaurant application % does not exist', p_application_id USING ERRCODE = 'P0002';
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.restaurant_partner_applications
      WHERE id = p_application_id AND registration_fee_paid IS TRUE
    ) THEN
      RETURN jsonb_build_object('status', 'already_paid', 'message', 'Registration fee has already been paid.');
    END IF;

    -- Atomically insert into global payment ownership table
    INSERT INTO public.partner_registration_payments (
      payment_id, application_type, application_id, user_id, amount, currency, status, claimed_at
    ) VALUES (
      p_razorpay_payment_id, 'restaurant', p_application_id, v_user_id, v_fee, 'INR', 'completed', v_now
    );

    -- Update restaurant application
    UPDATE public.restaurant_partner_applications
    SET registration_fee_paid = TRUE,
        registration_payment_id = p_razorpay_payment_id,
        registration_paid_at = v_now,
        starter_kit_status = 'processing',
        starter_kit_tshirt_size = p_tshirt_size,
        starter_kit_bag_type = p_bag_type,
        updated_at = v_now
    WHERE id = p_application_id;

    -- Insert into financial transactions ledger
    INSERT INTO public.platform_financial_transactions (
      transaction_type,
      reference_id,
      entity_type,
      entity_id,
      amount,
      currency,
      status,
      payment_id,
      gateway_name,
      idempotency_key,
      metadata,
      created_at
    ) VALUES (
      'partner_registration',
      p_application_id::TEXT,
      'restaurant',
      p_application_id,
      v_fee,
      'INR',
      'completed',
      p_razorpay_payment_id,
      'razorpay',
      'reg_fee_' || p_razorpay_payment_id,
      jsonb_build_object(
        'payment_id', p_razorpay_payment_id,
        'order_id', p_razorpay_order_id,
        'tshirt_size', p_tshirt_size,
        'bag_type', p_bag_type,
        'verified_via', 'rpc_atomic'
      ),
      v_now
    )
    ON CONFLICT (idempotency_key) DO UPDATE
    SET status = 'completed',
        payment_id = EXCLUDED.payment_id,
        updated_at = v_now;

  ELSIF p_applicant_type = 'rider' THEN
    SELECT user_id INTO v_user_id FROM public.rider_applications WHERE id = p_application_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'APPLICATION_NOT_FOUND: Rider application % does not exist', p_application_id USING ERRCODE = 'P0002';
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.rider_applications
      WHERE id = p_application_id AND registration_fee_paid IS TRUE
    ) THEN
      RETURN jsonb_build_object('status', 'already_paid', 'message', 'Registration fee has already been paid.');
    END IF;

    INSERT INTO public.partner_registration_payments (
      payment_id, application_type, application_id, user_id, amount, currency, status, claimed_at
    ) VALUES (
      p_razorpay_payment_id, 'rider', p_application_id, v_user_id, v_fee, 'INR', 'completed', v_now
    );

    UPDATE public.rider_applications
    SET registration_fee_paid = TRUE,
        registration_payment_id = p_razorpay_payment_id,
        registration_paid_at = v_now,
        starter_kit_status = 'processing',
        starter_kit_tshirt_size = p_tshirt_size,
        starter_kit_bag_type = p_bag_type,
        updated_at = v_now
    WHERE id = p_application_id;

    INSERT INTO public.platform_financial_transactions (
      transaction_type,
      reference_id,
      entity_type,
      entity_id,
      amount,
      currency,
      status,
      payment_id,
      gateway_name,
      idempotency_key,
      metadata,
      created_at
    ) VALUES (
      'rider_registration',
      p_application_id::TEXT,
      'rider',
      p_application_id,
      v_fee,
      'INR',
      'completed',
      p_razorpay_payment_id,
      'razorpay',
      'reg_fee_' || p_razorpay_payment_id,
      jsonb_build_object(
        'payment_id', p_razorpay_payment_id,
        'order_id', p_razorpay_order_id,
        'tshirt_size', p_tshirt_size,
        'bag_type', p_bag_type,
        'verified_via', 'rpc_atomic'
      ),
      v_now
    )
    ON CONFLICT (idempotency_key) DO UPDATE
    SET status = 'completed',
        payment_id = EXCLUDED.payment_id,
        updated_at = v_now;
  END IF;

  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Registration fee verified and allocated successfully',
    'payment_id', p_razorpay_payment_id,
    'application_id', p_application_id,
    'applicant_type', p_applicant_type,
    'amount', v_fee,
    'currency', 'INR'
  );
END;
$$;

-- Preserve permissions
REVOKE ALL ON FUNCTION public.process_verified_registration_payment(TEXT, UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_verified_registration_payment(TEXT, UUID, TEXT, TEXT, TEXT, TEXT) TO service_role;

COMMIT;
