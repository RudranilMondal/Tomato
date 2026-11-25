-- ==============================================================================
-- FORWARD MIGRATION: 20261125183000_hardened_registration_security_and_ownership.sql
-- TOMATTTO: ZERO-TRUST REGISTRATION SECURITY & GLOBAL PAYMENT OWNERSHIP
--
-- 1. TASK 1: Trigger Authorization Boundary Hardening
--    - Explicitly blocks unauthenticated callers (auth.uid() IS NULL) from modifying applications.
--    - Preserves service-role execution (public.is_service_role()) for trusted backend Edge Functions.
--    - Preserves platform administrator execution (public.is_admin(auth.uid())).
--    - Symmetrically hardens both protect_partner_application_fields and protect_rider_application_fields.
--
-- 2. TASK 2: Global Registration Payment Ownership
--    - Provisions public.partner_registration_payments table with payment_id TEXT PRIMARY KEY.
--    - Declaratively guarantees that ONE payment ID can NEVER be claimed by more than one
--      application globally (spanning both restaurant and rider applications).
--    - Prevents cross-entity theft and concurrent race conditions.
--
-- 3. TASK 3: Safe Legacy Grandfathering Procedure & Audit Log
--    - Provisions public.partner_grandfathering_audit_log for immutable compliance tracking.
--    - Creates public.admin_grant_legacy_grandfathering RPC with strict validation:
--      * Admin caller required
--      * Verified historical registration date before cutoff (2026-11-24)
--      * Non-empty evidence reference (e.g. contract ID) and detailed justification
--      * Locks application row FOR UPDATE
--
-- 4. TASK 4: Atomic Registration Payment Processing RPC
--    - Provisions public.process_verified_registration_payment RPC:
--      Atomically executes payment claim in partner_registration_payments, application status update,
--      and financial ledger record insertion inside a single PostgreSQL transaction.
--    - Updates record_verified_registration_payment for 100% backward compatibility.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. GLOBAL REGISTRATION PAYMENT OWNERSHIP TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partner_registration_payments (
  payment_id TEXT PRIMARY KEY,
  application_type TEXT NOT NULL CHECK (application_type IN ('restaurant', 'rider')),
  application_id UUID NOT NULL,
  user_id UUID,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 499.00 CHECK (amount = 499.00),
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'reversed')),
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reg_payments_app_uniq
  ON public.partner_registration_payments (application_type, application_id);

CREATE INDEX IF NOT EXISTS idx_reg_payments_status
  ON public.partner_registration_payments (status);

ALTER TABLE public.partner_registration_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view registration payments" ON public.partner_registration_payments;
CREATE POLICY "Admins view registration payments"
  ON public.partner_registration_payments
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 2. IMMUTABLE GRANDFATHERING AUDIT LOG TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partner_grandfathering_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_type TEXT NOT NULL CHECK (application_type IN ('restaurant', 'rider')),
  application_id UUID NOT NULL,
  granted_by UUID NOT NULL,
  historical_registration_date TIMESTAMPTZ NOT NULL,
  evidence_reference TEXT NOT NULL,
  justification TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.partner_grandfathering_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view grandfathering audit log" ON public.partner_grandfathering_audit_log;
CREATE POLICY "Admins view grandfathering audit log"
  ON public.partner_grandfathering_audit_log
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 3. HARDENED TRIGGER: protect_partner_application_fields
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_partner_application_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- 1. Service role (trusted server backend, webhooks, edge functions) bypasses trigger
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  -- 2. Strict rejection of unauthenticated callers attempting writes
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required to create or modify applications.'
      USING ERRCODE = '42501';
  END IF;

  -- 3. Non-admin applicant restrictions
  IF NOT public.is_admin(auth.uid()) THEN
    IF (TG_OP = 'INSERT') THEN
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
      RETURN NEW;
    END IF;

    IF (TG_OP = 'UPDATE') THEN
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
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_partner_application_fields ON public.restaurant_partner_applications;
CREATE TRIGGER trg_protect_partner_application_fields
BEFORE INSERT OR UPDATE ON public.restaurant_partner_applications
FOR EACH ROW
EXECUTE FUNCTION public.protect_partner_application_fields();

-- ------------------------------------------------------------------------------
-- 4. HARDENED TRIGGER: protect_rider_application_fields
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_rider_application_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required to create or modify applications.'
      USING ERRCODE = '42501';
  END IF;

  IF NOT public.is_admin(auth.uid()) THEN
    IF (TG_OP = 'INSERT') THEN
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
      RETURN NEW;
    END IF;

    IF (TG_OP = 'UPDATE') THEN
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
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_rider_application_fields ON public.rider_applications;
CREATE TRIGGER trg_protect_rider_application_fields
BEFORE INSERT OR UPDATE ON public.rider_applications
FOR EACH ROW
EXECUTE FUNCTION public.protect_rider_application_fields();

-- ------------------------------------------------------------------------------
-- 5. ATOMIC RPC: process_verified_registration_payment
-- ------------------------------------------------------------------------------
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
  v_user_id UUID;
BEGIN
  -- Authorization: Only service_role or admin may execute verified payment processing
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

  -- 2. Check if application itself is already paid
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

    -- Update application row
    UPDATE public.restaurant_partner_applications
    SET
      registration_fee_paid = TRUE,
      registration_payment_id = p_razorpay_payment_id,
      registration_paid_at = v_now,
      starter_kit_status = 'allocated',
      starter_kit_tshirt_size = p_tshirt_size
    WHERE id = p_application_id;

    -- Insert into financial ledger
    INSERT INTO public.platform_financial_transactions (
      transaction_type, reference_id, payment_id, entity_type, entity_id, amount, currency, direction,
      status, idempotency_key, metadata
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
        'order_id', p_razorpay_order_id,
        'tshirt_size', p_tshirt_size,
        'bag_type', p_bag_type
      )
    ) ON CONFLICT (idempotency_key) DO NOTHING;

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

    -- Atomically insert into global payment ownership table
    INSERT INTO public.partner_registration_payments (
      payment_id, application_type, application_id, user_id, amount, currency, status, claimed_at
    ) VALUES (
      p_razorpay_payment_id, 'rider', p_application_id, v_user_id, v_fee, 'INR', 'completed', v_now
    );

    UPDATE public.rider_applications
    SET
      registration_fee_paid = TRUE,
      registration_payment_id = p_razorpay_payment_id,
      registration_paid_at = v_now,
      starter_kit_status = 'allocated',
      starter_kit_tshirt_size = p_tshirt_size
    WHERE id = p_application_id;

    INSERT INTO public.platform_financial_transactions (
      transaction_type, reference_id, payment_id, entity_type, entity_id, amount, currency, direction,
      status, idempotency_key, metadata
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
        'order_id', p_razorpay_order_id,
        'tshirt_size', p_tshirt_size,
        'bag_type', p_bag_type
      )
    ) ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'status', 'success',
    'application_type', p_applicant_type,
    'application_id', p_application_id,
    'payment_id', p_razorpay_payment_id,
    'amount', v_fee,
    'starter_kit_status', 'allocated'
  );
END;
$$;

-- Alias record_verified_registration_payment to the atomic process
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
BEGIN
  RETURN public.process_verified_registration_payment(
    p_applicant_type, p_application_id, p_razorpay_payment_id, NULL, p_tshirt_size, p_bag_type
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. TASK 3: SAFE ADMINISTRATIVE LEGACY GRANDFATHERING PROCEDURE
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_grant_legacy_grandfathering(
  p_application_id UUID,
  p_application_type TEXT,
  p_historical_registration_date TIMESTAMPTZ,
  p_evidence_reference TEXT,
  p_justification TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
  v_cutoff_date TIMESTAMPTZ := '2026-11-24 00:00:00+00'::TIMESTAMPTZ;
  v_app_created_at TIMESTAMPTZ;
  v_status TEXT;
  v_is_already_exempt BOOLEAN;
BEGIN
  -- 1. Authorization: Platform administrator only
  IF v_admin_id IS NULL OR NOT public.is_admin(v_admin_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'FORBIDDEN',
      'message', 'Access denied: Only platform administrators can grant legacy exemptions.'
    );
  END IF;

  -- 2. Validate input parameters
  IF p_application_type NOT IN ('restaurant', 'rider') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_ARGUMENT',
      'message', 'Application type must be restaurant or rider.'
    );
  END IF;

  IF p_historical_registration_date IS NULL OR p_historical_registration_date > v_cutoff_date THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_HISTORICAL_DATE',
      'message', format('Historical registration date must be on or before the cutoff date (%s).', v_cutoff_date)
    );
  END IF;

  IF p_evidence_reference IS NULL OR length(trim(p_evidence_reference)) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'MISSING_EVIDENCE',
      'message', 'A valid non-empty evidence reference (contract ID, onboarding ticket, etc.) is mandatory.'
    );
  END IF;

  IF p_justification IS NULL OR length(trim(p_justification)) < 10 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INSUFFICIENT_JUSTIFICATION',
      'message', 'A detailed justification (minimum 10 characters) is required for compliance audit.'
    );
  END IF;

  -- 3. Lock and validate application
  IF p_application_type = 'restaurant' THEN
    SELECT created_at, status::TEXT, COALESCE(is_legacy_grandfathered, FALSE)
    INTO v_app_created_at, v_status, v_is_already_exempt
    FROM public.restaurant_partner_applications
    WHERE id = p_application_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND', 'message', 'Restaurant application not found.');
    END IF;

    IF v_is_already_exempt THEN
      RETURN jsonb_build_object('success', false, 'error', 'ALREADY_EXEMPT', 'message', 'Application is already grandfathered.');
    END IF;

    -- Update application row
    UPDATE public.restaurant_partner_applications
    SET
      is_legacy_grandfathered = TRUE,
      updated_at = NOW()
    WHERE id = p_application_id;

  ELSIF p_application_type = 'rider' THEN
    SELECT created_at, status::TEXT, COALESCE(is_legacy_grandfathered, FALSE)
    INTO v_app_created_at, v_status, v_is_already_exempt
    FROM public.rider_applications
    WHERE id = p_application_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND', 'message', 'Rider application not found.');
    END IF;

    IF v_is_already_exempt THEN
      RETURN jsonb_build_object('success', false, 'error', 'ALREADY_EXEMPT', 'message', 'Application is already grandfathered.');
    END IF;

    UPDATE public.rider_applications
    SET
      is_legacy_grandfathered = TRUE,
      updated_at = NOW()
    WHERE id = p_application_id;
  END IF;

  -- 4. Record in Immutable Compliance Audit Log
  INSERT INTO public.partner_grandfathering_audit_log (
    application_type, application_id, granted_by, historical_registration_date, evidence_reference, justification
  ) VALUES (
    p_application_type, p_application_id, v_admin_id, p_historical_registration_date, p_evidence_reference, p_justification
  );

  RETURN jsonb_build_object(
    'success', true,
    'action', 'grandfathered',
    'application_type', p_application_type,
    'application_id', p_application_id,
    'granted_by', v_admin_id,
    'evidence_reference', p_evidence_reference
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 7. REINFORCE APPROVAL RPC: admin_review_restaurant_application
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
  v_reg_payment RECORD;
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
    --     OR Condition A (Strictly Verified Financial Ledger Record & Global Payment Ownership)
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

      -- Check 5: Global Payment Ownership Validation
      IF v_tx_payment_id IS NOT NULL AND length(trim(v_tx_payment_id)) > 0 THEN
        SELECT * INTO v_reg_payment
        FROM public.partner_registration_payments
        WHERE payment_id = v_tx_payment_id;

        IF FOUND THEN
          IF v_reg_payment.application_type <> 'restaurant' OR v_reg_payment.application_id <> p_application_id THEN
            RETURN jsonb_build_object(
              'success', false,
              'error', 'REGISTRATION_PAYMENT_REUSED',
              'message', format('Cannot approve restaurant application: Payment ID is bound to %s application %s.', v_reg_payment.application_type, v_reg_payment.application_id)
            );
          END IF;
        END IF;

        -- Cross-Application check in restaurant applications
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

        -- Cross-Application check in rider applications
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

        -- Cross-Application check in platform financial transactions
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

-- Permissions Management
REVOKE ALL ON FUNCTION public.process_verified_registration_payment(TEXT, UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_verified_registration_payment(TEXT, UUID, TEXT, TEXT, TEXT, TEXT) TO service_role;

REVOKE ALL ON FUNCTION public.admin_grant_legacy_grandfathering(UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_grant_legacy_grandfathering(UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT) TO authenticated, service_role;

COMMIT;
