-- ==============================================================================
-- FORWARD MIGRATION: 20261125161500_secure_restaurant_registration_payment_enforcement.sql
-- CRITICAL REGISTRATION PAYMENT SECURITY REMEDIATION
--
-- 1. Eliminates insecure payment ID string fallback in admin_review_restaurant_application:
--    Approval strictly requires:
--    - Condition A (Verified Payment):
--      * registration_fee_paid IS TRUE on application
--      * Matching record in public.platform_financial_transactions:
--        transaction_type = 'partner_registration', reference_id = p_application_id::TEXT,
--        status = 'completed', amount = 499.00, currency = 'INR'
--      * Application payment_id matches ledger transaction payment_id
--      * No refund or reversal records exist
--      * Payment has not been reused across another restaurant or rider application
--    - Condition B (Authorized Legacy Grandfathering):
--      * is_legacy_grandfathered IS TRUE established exclusively by administrator
-- 2. Hardens public.protect_partner_application_fields trigger:
--    - Strictly blocks applicant draft manipulation of:
--      * registration_fee_paid
--      * registration_payment_id
--      * registration_paid_at
--      * is_legacy_grandfathered
--    - Forces safe defaults on INSERT for non-admin applicants
-- 3. Hardens public.protect_rider_application_fields trigger:
--    - Identical draft update protection for rider registration payment fields
-- 4. Creates unique partial indexes on registration_payment_id to enforce uniqueness
--    at the database constraint level.
-- 5. Updates public.record_verified_registration_payment to populate payment_id column
--    in platform_financial_transactions.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. UNIQUE PARTIAL INDEXES TO PREVENT PAYMENT REUSE AT THE DATABASE CONSTRAINT LEVEL
-- ------------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurant_app_reg_payment_id_uniq
  ON public.restaurant_partner_applications (registration_payment_id)
  WHERE registration_payment_id IS NOT NULL AND length(trim(registration_payment_id)) > 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_rider_app_reg_payment_id_uniq
  ON public.rider_applications (registration_payment_id)
  WHERE registration_payment_id IS NOT NULL AND length(trim(registration_payment_id)) > 0;

CREATE INDEX IF NOT EXISTS idx_platform_tx_partner_reg_lookup
  ON public.platform_financial_transactions (reference_id, transaction_type, status, amount, currency);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_platform_tx_idempotency_key'
  ) THEN
    ALTER TABLE public.platform_financial_transactions 
      ADD CONSTRAINT uq_platform_tx_idempotency_key UNIQUE (idempotency_key);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 2. HARDEN TRIGGER: protect_partner_application_fields
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_partner_application_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service role (e.g. backend webhooks / server RPCs) bypasses trigger
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  IF (TG_OP = 'INSERT') THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
      NEW.user_id := auth.uid();
      IF NEW.status NOT IN ('draft', 'submitted') THEN
        NEW.status := 'draft';
      END IF;
      -- Zero out admin reviewer fields
      NEW.reviewed_by := NULL;
      NEW.reviewed_at := NULL;
      NEW.rejection_reason := NULL;
      NEW.reviewer_notes := NULL;

      -- Strictly zero out payment and grandfathering fields for non-admin applicants
      NEW.registration_fee_paid := FALSE;
      NEW.registration_payment_id := NULL;
      NEW.registration_paid_at := NULL;
      NEW.is_legacy_grandfathered := FALSE;
    END IF;
    RETURN NEW;
  END IF;

  IF (TG_OP = 'UPDATE') THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
      IF OLD.user_id IS NOT NULL AND OLD.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Access denied: You can only update your own application.'
          USING ERRCODE = '42501';
      END IF;

      IF (OLD.id IS DISTINCT FROM NEW.id) OR (OLD.application_ref IS DISTINCT FROM NEW.application_ref) THEN
        RAISE EXCEPTION 'Access denied: Application identifiers are immutable.'
          USING ERRCODE = '42501';
      END IF;

      IF (OLD.reviewed_by IS DISTINCT FROM NEW.reviewed_by) OR 
         (OLD.reviewed_at IS DISTINCT FROM NEW.reviewed_at) OR 
         (OLD.rejection_reason IS DISTINCT FROM NEW.rejection_reason) OR
         (OLD.reviewer_notes IS DISTINCT FROM NEW.reviewer_notes) THEN
        RAISE EXCEPTION 'Access denied: Reviewer fields can only be modified by administrators.'
          USING ERRCODE = '42501';
      END IF;

      -- Prevent applicant manipulation of payment fields
      IF (OLD.registration_fee_paid IS DISTINCT FROM NEW.registration_fee_paid) OR
         (OLD.registration_payment_id IS DISTINCT FROM NEW.registration_payment_id) OR
         (OLD.registration_paid_at IS DISTINCT FROM NEW.registration_paid_at) THEN
        RAISE EXCEPTION 'Access denied: Registration payment fields can only be updated through verified payment processing.'
          USING ERRCODE = '42501';
      END IF;

      -- Prevent applicant manipulation of grandfathering status
      IF (OLD.is_legacy_grandfathered IS DISTINCT FROM NEW.is_legacy_grandfathered) THEN
        RAISE EXCEPTION 'Access denied: Legacy grandfathering status can only be modified by administrators.'
          USING ERRCODE = '42501';
      END IF;

      IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        IF NOT (OLD.status = 'draft' AND NEW.status = 'submitted') THEN
          RAISE EXCEPTION 'Applicants can only submit draft applications for review.'
            USING ERRCODE = '42501';
        END IF;
      END IF;
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_partner_application_fields ON public.restaurant_partner_applications;
CREATE TRIGGER trg_protect_partner_application_fields
BEFORE INSERT OR UPDATE ON public.restaurant_partner_applications
FOR EACH ROW
EXECUTE FUNCTION public.protect_partner_application_fields();

-- ------------------------------------------------------------------------------
-- 3. HARDEN TRIGGER: protect_rider_application_fields
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_rider_application_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  IF (TG_OP = 'INSERT') THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
      NEW.user_id := auth.uid();
      IF NEW.status NOT IN ('draft', 'submitted') THEN
        NEW.status := 'draft';
      END IF;
      NEW.reviewed_by := NULL;
      NEW.reviewed_at := NULL;
      NEW.rejection_reason := NULL;
      NEW.reviewer_notes := NULL;

      NEW.registration_fee_paid := FALSE;
      NEW.registration_payment_id := NULL;
      NEW.registration_paid_at := NULL;
      NEW.is_legacy_grandfathered := FALSE;
    END IF;
    RETURN NEW;
  END IF;

  IF (TG_OP = 'UPDATE') THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
      IF OLD.user_id IS NOT NULL AND OLD.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Access denied: You can only update your own application.'
          USING ERRCODE = '42501';
      END IF;

      IF (OLD.id IS DISTINCT FROM NEW.id) OR (OLD.application_ref IS DISTINCT FROM NEW.application_ref) THEN
        RAISE EXCEPTION 'Access denied: Application identifiers are immutable.'
          USING ERRCODE = '42501';
      END IF;

      IF (OLD.reviewed_by IS DISTINCT FROM NEW.reviewed_by) OR 
         (OLD.reviewed_at IS DISTINCT FROM NEW.reviewed_at) OR 
         (OLD.rejection_reason IS DISTINCT FROM NEW.rejection_reason) OR
         (OLD.reviewer_notes IS DISTINCT FROM NEW.reviewer_notes) THEN
        RAISE EXCEPTION 'Access denied: Reviewer fields can only be modified by administrators.'
          USING ERRCODE = '42501';
      END IF;

      IF (OLD.registration_fee_paid IS DISTINCT FROM NEW.registration_fee_paid) OR
         (OLD.registration_payment_id IS DISTINCT FROM NEW.registration_payment_id) OR
         (OLD.registration_paid_at IS DISTINCT FROM NEW.registration_paid_at) THEN
        RAISE EXCEPTION 'Access denied: Registration payment fields can only be updated through verified payment processing.'
          USING ERRCODE = '42501';
      END IF;

      IF (OLD.is_legacy_grandfathered IS DISTINCT FROM NEW.is_legacy_grandfathered) THEN
        RAISE EXCEPTION 'Access denied: Legacy grandfathering status can only be modified by administrators.'
          USING ERRCODE = '42501';
      END IF;

      IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        IF NOT (OLD.status = 'draft' AND NEW.status = 'submitted') THEN
          RAISE EXCEPTION 'Applicants can only submit draft applications for review.'
            USING ERRCODE = '42501';
        END IF;
      END IF;
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_rider_application_fields ON public.rider_applications;
CREATE TRIGGER trg_protect_rider_application_fields
BEFORE INSERT OR UPDATE ON public.rider_applications
FOR EACH ROW
EXECUTE FUNCTION public.protect_rider_application_fields();

-- ------------------------------------------------------------------------------
-- 4. UPDATE ATOMIC RPC: record_verified_registration_payment
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_verified_registration_payment(
  p_applicant_type TEXT,
  p_application_id UUID,
  p_razorpay_payment_id TEXT,
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
BEGIN
  -- Authorization: Only service_role or admin may record verified registration payments
  IF v_caller_id IS NOT NULL THEN
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_caller_id;
    IF COALESCE(v_caller_role, '') <> 'admin' THEN
      RAISE EXCEPTION 'UNAUTHORIZED: Registration payment verification must be performed by trusted backend service'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF p_applicant_type NOT IN ('restaurant', 'rider') THEN
    RAISE EXCEPTION 'INVALID_APPLICANT_TYPE: Must be restaurant or rider' USING ERRCODE = '22023';
  END IF;

  IF p_razorpay_payment_id IS NULL OR TRIM(p_razorpay_payment_id) = '' THEN
    RAISE EXCEPTION 'INVALID_PAYMENT_ID: Verified Razorpay payment ID is required' USING ERRCODE = '22023';
  END IF;

  IF p_applicant_type = 'restaurant' THEN
    IF EXISTS (
      SELECT 1 FROM public.restaurant_partner_applications
      WHERE id = p_application_id AND registration_fee_paid IS TRUE
    ) THEN
      RETURN jsonb_build_object('status', 'already_paid', 'message', 'Registration fee has already been paid.');
    END IF;

    -- Check if payment ID has already been recorded for any other application
    IF EXISTS (
      SELECT 1 FROM public.restaurant_partner_applications
      WHERE id <> p_application_id AND registration_payment_id = p_razorpay_payment_id
    ) OR EXISTS (
      SELECT 1 FROM public.rider_applications
      WHERE registration_payment_id = p_razorpay_payment_id
    ) THEN
      RAISE EXCEPTION 'PAYMENT_ALREADY_USED: Payment ID % is already bound to another application', p_razorpay_payment_id
        USING ERRCODE = '23505';
    END IF;

    UPDATE public.restaurant_partner_applications
    SET
      registration_fee_paid = TRUE,
      registration_payment_id = p_razorpay_payment_id,
      registration_paid_at = v_now,
      starter_kit_status = 'allocated',
      starter_kit_tshirt_size = p_tshirt_size
    WHERE id = p_application_id;

    INSERT INTO public.platform_financial_transactions (
      transaction_type,
      reference_id,
      payment_id,
      entity_type,
      entity_id,
      amount,
      currency,
      direction,
      status,
      idempotency_key,
      metadata
    ) VALUES (
      'partner_registration',
      p_application_id::TEXT,
      p_razorpay_payment_id,
      'restaurant',
      p_application_id,
      v_fee,
      'INR',
      'credit',
      'completed',
      'reg_ptr_' || p_razorpay_payment_id,
      jsonb_build_object(
        'payment_id', p_razorpay_payment_id,
        'tshirt_size', p_tshirt_size,
        'bag_type', p_bag_type
      )
    ) ON CONFLICT (idempotency_key) DO NOTHING;

  ELSIF p_applicant_type = 'rider' THEN
    IF EXISTS (
      SELECT 1 FROM public.rider_applications
      WHERE id = p_application_id AND registration_fee_paid IS TRUE
    ) THEN
      RETURN jsonb_build_object('status', 'already_paid', 'message', 'Registration fee has already been paid.');
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.rider_applications
      WHERE id <> p_application_id AND registration_payment_id = p_razorpay_payment_id
    ) OR EXISTS (
      SELECT 1 FROM public.restaurant_partner_applications
      WHERE registration_payment_id = p_razorpay_payment_id
    ) THEN
      RAISE EXCEPTION 'PAYMENT_ALREADY_USED: Payment ID % is already bound to another application', p_razorpay_payment_id
        USING ERRCODE = '23505';
    END IF;

    UPDATE public.rider_applications
    SET
      registration_fee_paid = TRUE,
      registration_payment_id = p_razorpay_payment_id,
      registration_paid_at = v_now,
      starter_kit_status = 'allocated',
      starter_kit_tshirt_size = p_tshirt_size
    WHERE id = p_application_id;

    INSERT INTO public.platform_financial_transactions (
      transaction_type,
      reference_id,
      payment_id,
      entity_type,
      entity_id,
      amount,
      currency,
      direction,
      status,
      idempotency_key,
      metadata
    ) VALUES (
      'rider_registration',
      p_application_id::TEXT,
      p_razorpay_payment_id,
      'rider',
      p_application_id,
      v_fee,
      'INR',
      'credit',
      'completed',
      'reg_rdr_' || p_razorpay_payment_id,
      jsonb_build_object(
        'payment_id', p_razorpay_payment_id,
        'tshirt_size', p_tshirt_size,
        'bag_type', p_bag_type
      )
    ) ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'status', 'success',
    'application_id', p_application_id,
    'payment_id', p_razorpay_payment_id,
    'amount', v_fee,
    'starter_kit_status', 'allocated'
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. HARDEN APPROVAL RPC: admin_review_restaurant_application
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_review_restaurant_application(
  p_application_id UUID,
  p_action TEXT, -- 'approve', 'reject', 'action_required'
  p_rejection_reason TEXT DEFAULT NULL,
  p_reviewer_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_caller_id UUID;
  v_app RECORD;
  v_tx RECORD;
  v_tx_payment_id TEXT;
  v_slug TEXT;
  v_existing_rest UUID;
  v_missing_docs TEXT[] := ARRAY[]::TEXT[];
  v_unverified_docs TEXT[] := ARRAY[]::TEXT[];
  v_req_type TEXT;
  v_doc_status TEXT;
  v_mandatory_types TEXT[] := ARRAY[
    'aadhaar_front',
    'aadhaar_back',
    'pan_front',
    'pan_back',
    'pan_card',
    'fssai_cert'
  ];
BEGIN
  -- 1. Strict administrator authorization
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL OR NOT public.is_admin(v_caller_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'FORBIDDEN',
      'message', 'Access denied: Only platform administrators can review restaurant applications.'
    );
  END IF;

  -- 2. Lock application row for safe concurrency
  SELECT * INTO v_app
  FROM public.restaurant_partner_applications
  WHERE id = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NOT_FOUND',
      'message', 'Restaurant application not found.'
    );
  END IF;

  -- Verify current status allows review
  IF v_app.status::TEXT NOT IN ('submitted', 'in_review', 'action_required') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_STATUS_TRANSITION',
      'message', format('Cannot review application in "%s" status.', v_app.status)
    );
  END IF;

  -- 3. Rejection and resubmission require an explicit reason
  IF p_action IN ('reject', 'action_required') AND (p_rejection_reason IS NULL OR length(trim(p_rejection_reason)) = 0) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_ARGUMENT',
      'message', 'A valid reason is required for rejection or resubmission request.'
    );
  END IF;

  -- 4. Handle Rejection flow
  IF p_action = 'reject' THEN
    UPDATE public.restaurant_partner_applications
    SET
      status = 'rejected',
      rejection_reason = p_rejection_reason,
      reviewer_notes = p_reviewer_notes,
      reviewed_by = v_caller_id,
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = p_application_id;

    RETURN jsonb_build_object(
      'success', true,
      'action', 'rejected',
      'application_id', p_application_id,
      'rejection_reason', p_rejection_reason
    );
  END IF;

  -- 5. Handle Resubmission flow (action_required)
  IF p_action = 'action_required' THEN
    UPDATE public.restaurant_partner_applications
    SET
      status = 'action_required',
      rejection_reason = p_rejection_reason,
      reviewer_notes = p_reviewer_notes,
      reviewed_by = v_caller_id,
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = p_application_id;

    RETURN jsonb_build_object(
      'success', true,
      'action', 'action_required',
      'application_id', p_application_id,
      'action_required_reason', p_rejection_reason
    );
  END IF;

  -- 6. Handle Approval flow (with zero-trust Registration Fee & KYC validation)
  IF p_action = 'approve' THEN
    -- 6A. Verify Registration Payment: Must satisfy Condition B (Authorized Legacy Grandfathering)
    --     OR Condition A (Strictly Verified Financial Ledger Record)
    IF COALESCE(v_app.is_legacy_grandfathered, FALSE) IS TRUE THEN
      -- Condition B: Legitimately grandfathered by authorized administrator
      NULL;
    ELSE
      -- Condition A: Verified payment requirement
      -- Check 1: registration_fee_paid must be TRUE on application row
      IF v_app.registration_fee_paid IS NOT TRUE THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'REGISTRATION_FEE_NOT_PAID',
          'message', 'Cannot approve restaurant application: The mandatory ₹499 registration fee has not been paid.'
        );
      END IF;

      -- Check 2: Authoritative ledger record in public.platform_financial_transactions
      -- Must be transaction_type = 'partner_registration', reference_id = p_application_id,
      -- status = 'completed', amount = 499.00, currency = 'INR'
      SELECT * INTO v_tx
      FROM public.platform_financial_transactions
      WHERE transaction_type = 'partner_registration'
        AND reference_id = p_application_id::TEXT
        AND status = 'completed'
        AND amount = 499.00
        AND currency = 'INR'
      ORDER BY created_at DESC
      LIMIT 1;

      IF NOT FOUND THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'REGISTRATION_FEE_NOT_PAID',
          'message', 'Cannot approve restaurant application: Verified ₹499 INR registration payment record not found in financial ledger.'
        );
      END IF;

      -- Check 3: Check that payment was not refunded or reversed
      IF EXISTS (
        SELECT 1 FROM public.platform_financial_transactions
        WHERE reference_id = p_application_id::TEXT
          AND (
            status IN ('refunded', 'reversed')
            OR transaction_type = 'refund'
          )
      ) THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'REGISTRATION_FEE_REFUNDED',
          'message', 'Cannot approve restaurant application: Registration payment has been refunded or reversed.'
        );
      END IF;

      -- Check 4: Match application payment ID with ledger record
      v_tx_payment_id := COALESCE(v_tx.payment_id, v_tx.metadata->>'payment_id');
      IF v_app.registration_payment_id IS NOT NULL AND v_tx_payment_id IS NOT NULL THEN
        IF TRIM(v_app.registration_payment_id) <> TRIM(v_tx_payment_id) THEN
          RETURN jsonb_build_object(
            'success', false,
            'error', 'REGISTRATION_PAYMENT_MISMATCH',
            'message', 'Cannot approve restaurant application: Payment ID on application does not match verified financial ledger record.'
          );
        END IF;
      END IF;

      -- Check 5: Anti-Reuse / Anti-Replay across other applications and ledger entries
      IF v_tx_payment_id IS NOT NULL AND length(trim(v_tx_payment_id)) > 0 THEN
        IF EXISTS (
          SELECT 1 FROM public.restaurant_partner_applications
          WHERE id <> p_application_id
            AND registration_payment_id = v_tx_payment_id
        ) THEN
          RETURN jsonb_build_object(
            'success', false,
            'error', 'REGISTRATION_PAYMENT_REUSED',
            'message', 'Cannot approve restaurant application: Payment ID is already bound to another restaurant application.'
          );
        END IF;

        IF EXISTS (
          SELECT 1 FROM public.rider_applications
          WHERE registration_payment_id = v_tx_payment_id
        ) THEN
          RETURN jsonb_build_object(
            'success', false,
            'error', 'REGISTRATION_PAYMENT_REUSED',
            'message', 'Cannot approve restaurant application: Payment ID is already bound to a rider application.'
          );
        END IF;

        IF EXISTS (
          SELECT 1 FROM public.platform_financial_transactions
          WHERE transaction_type IN ('partner_registration', 'rider_registration')
            AND reference_id <> p_application_id::TEXT
            AND (
              payment_id = v_tx_payment_id
              OR metadata->>'payment_id' = v_tx_payment_id
              OR idempotency_key = 'reg_ptr_' || v_tx_payment_id
              OR idempotency_key = 'reg_rdr_' || v_tx_payment_id
            )
        ) THEN
          RETURN jsonb_build_object(
            'success', false,
            'error', 'REGISTRATION_PAYMENT_REUSED',
            'message', 'Cannot approve restaurant application: Payment has already been allocated to a different partner in the financial ledger.'
          );
        END IF;
      END IF;
    END IF;

    -- 6B. Verify each mandatory KYC document exists and has status = 'verified'
    FOREACH v_req_type IN ARRAY v_mandatory_types
    LOOP
      SELECT status::text INTO v_doc_status
      FROM public.restaurant_partner_documents
      WHERE application_id = p_application_id
        AND doc_type::text = v_req_type
      ORDER BY created_at DESC
      LIMIT 1;

      IF NOT FOUND THEN
        v_missing_docs := array_append(v_missing_docs, v_req_type);
      ELSIF v_doc_status != 'verified' THEN
        v_unverified_docs := array_append(v_unverified_docs, v_req_type || ' (' || v_doc_status || ')');
      END IF;
    END LOOP;

    -- Block approval if any mandatory personal or business document is missing or not verified
    IF cardinality(v_missing_docs) > 0 OR cardinality(v_unverified_docs) > 0 THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'DOCUMENTS_NOT_VERIFIED',
        'message', 'Cannot approve restaurant application: All mandatory personal KYC (Aadhaar Front/Back, Personal PAN Front/Back) and business documents (Business PAN, FSSAI) must be uploaded and verified first.',
        'missing_documents', to_jsonb(v_missing_docs),
        'unverified_documents', to_jsonb(v_unverified_docs)
      );
    END IF;

    -- 6C. Approve Application and Provision Restaurant Row
    UPDATE public.restaurant_partner_applications
    SET
      status = 'approved',
      rejection_reason = NULL,
      reviewer_notes = p_reviewer_notes,
      reviewed_by = v_caller_id,
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = p_application_id;

    -- Generate unique slug
    v_slug := lower(regexp_replace(v_app.restaurant_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 6);

    -- Check if restaurant row already exists for this applicant or restaurant name
    SELECT id INTO v_existing_rest
    FROM public.restaurants
    WHERE name = v_app.restaurant_name 
      AND (owner_id = v_app.user_id OR (v_app.user_id IS NULL AND phone = v_app.phone))
    LIMIT 1;

    IF v_existing_rest IS NULL THEN
      INSERT INTO public.restaurants (
        owner_id,
        name,
        slug,
        description,
        phone,
        email,
        address_text,
        latitude,
        longitude,
        cost_for_two,
        is_pure_veg,
        is_open,
        commission_percentage,
        rating,
        rating_count,
        avg_prep_time_minutes
      ) VALUES (
        v_app.user_id,
        v_app.restaurant_name,
        v_slug,
        COALESCE(v_app.description, 'Freshly partnered restaurant on Tomattto.'),
        v_app.phone,
        v_app.email,
        v_app.address_line1 || COALESCE(', ' || v_app.address_line2, '') || ', ' || v_app.city,
        COALESCE(v_app.latitude, 12.9716),
        COALESCE(v_app.longitude, 77.5946),
        COALESCE(v_app.estimated_cost_for_two, 400),
        COALESCE(v_app.pure_veg, false),
        true,
        18.00,
        4.5,
        1,
        25
      ) RETURNING id INTO v_existing_rest;
    END IF;

    RETURN jsonb_build_object(
      'success', true,
      'action', 'approved',
      'application_id', p_application_id,
      'restaurant_id', v_existing_rest,
      'restaurant_name', v_app.restaurant_name
    );
  END IF;

  RETURN jsonb_build_object(
    'success', false,
    'error', 'INVALID_ACTION',
    'message', format('Unsupported review action: %s. Supported: approve, reject, action_required.', p_action)
  );
END;
$$;

ALTER FUNCTION public.admin_review_restaurant_application(UUID, TEXT, TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_review_restaurant_application(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_restaurant_application(UUID, TEXT, TEXT, TEXT) TO authenticated, service_role;

COMMIT;
