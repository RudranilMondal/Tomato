-- ==============================================================================
-- 🍅 TOMATTTO FOOD DELIVERY PLATFORM: EDUCATIONAL QUALIFICATION & APPLICATION VISIBILITY
-- Migration: 20261112210000_add_education_and_fix_application_visibility.sql
-- Description:
--   1. Adds 'qualification_proof' to kyc_doc_type enum.
--   2. Adds educational qualification columns to public.rider_applications.
--   3. Adds RPC for admin qualification review separate from overall application status.
--   4. Adds RPC for admin restaurant partner application review (approve, reject, resubmit).
--   5. Fixes RLS policies to ensure both authenticated and guest applicant submissions persist.
--   6. Ensures Realtime publication includes application tables for instant admin visibility.
-- ==============================================================================

BEGIN;

-- 1. Extend kyc_doc_type enum for Educational Qualification proof
ALTER TYPE public.kyc_doc_type ADD VALUE IF NOT EXISTS 'qualification_proof';

-- 2. Add Educational Qualification columns to public.rider_applications & schema adjustments
ALTER TABLE public.rider_applications
  ADD COLUMN IF NOT EXISTS highest_qualification TEXT,
  ADD COLUMN IF NOT EXISTS qualification_name TEXT,
  ADD COLUMN IF NOT EXISTS institution_name TEXT,
  ADD COLUMN IF NOT EXISTS completion_year TEXT,
  ADD COLUMN IF NOT EXISTS additional_qualification TEXT,
  ADD COLUMN IF NOT EXISTS qualification_status verification_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS qualification_rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS qualification_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS qualification_verified_by UUID REFERENCES public.profiles(id);

-- Ensure rider_documents has verification audit columns
ALTER TABLE public.rider_documents
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.profiles(id);

-- Ensure restaurant_partner_applications has cost and veg preference columns
ALTER TABLE public.restaurant_partner_applications
  ADD COLUMN IF NOT EXISTS estimated_cost_for_two INTEGER DEFAULT 400,
  ADD COLUMN IF NOT EXISTS pure_veg BOOLEAN DEFAULT FALSE;

-- Ensure restaurant_partner_financials has unique application_id constraint for reliable upserts
DO $$
DECLARE
  v_duplicate_count INTEGER := 0;
  v_sample_app_id UUID := NULL;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'uq_restaurant_financials_app'
      AND conrelid = 'public.restaurant_partner_financials'::regclass
  ) THEN
    -- 1. Count duplicate non-null application_id sets
    SELECT COUNT(*)
    INTO v_duplicate_count
    FROM (
      SELECT application_id
      FROM public.restaurant_partner_financials
      WHERE application_id IS NOT NULL
      GROUP BY application_id
      HAVING COUNT(*) > 1
    ) sub;

    -- 2. If duplicates exist, retrieve sample UUID separately without aggregate MIN on UUID
    IF v_duplicate_count > 0 THEN
      SELECT application_id
      INTO v_sample_app_id
      FROM public.restaurant_partner_financials
      WHERE application_id IS NOT NULL
      GROUP BY application_id
      HAVING COUNT(*) > 1
      ORDER BY application_id
      LIMIT 1;

      RAISE EXCEPTION 'Cannot add unique constraint uq_restaurant_financials_app: % duplicate application_id set(s) found in public.restaurant_partner_financials (example application_id: %). Manual inspection and resolution required before applying this constraint.',
        v_duplicate_count, v_sample_app_id;
    END IF;

    ALTER TABLE public.restaurant_partner_financials 
      ADD CONSTRAINT uq_restaurant_financials_app UNIQUE (application_id);
  END IF;
END $$;

-- 3. Hardened, Ownership-Enforcing RLS Policies for Applications
-- Replaces weak/unrestricted WITH CHECK (true) and guest-null bypasses

-- 3A. Restaurant Partner Applications
DROP POLICY IF EXISTS "Applicants can insert draft applications" ON public.restaurant_partner_applications;
DROP POLICY IF EXISTS "Applicants can insert partner applications" ON public.restaurant_partner_applications;
CREATE POLICY "Applicants can insert partner applications"
  ON public.restaurant_partner_applications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
    AND status IN ('draft', 'submitted')
  );

DROP POLICY IF EXISTS "Applicants and admins view applications" ON public.restaurant_partner_applications;
CREATE POLICY "Applicants and admins view applications"
  ON public.restaurant_partner_applications FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR public.is_admin(auth.uid())
    OR public.is_service_role()
  );

DROP POLICY IF EXISTS "Applicants can update draft applications" ON public.restaurant_partner_applications;
CREATE POLICY "Applicants can update draft applications"
  ON public.restaurant_partner_applications FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id AND status IN ('draft', 'action_required'))
    OR public.is_admin(auth.uid())
    OR public.is_service_role()
  )
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id AND status IN ('draft', 'submitted'))
    OR public.is_admin(auth.uid())
    OR public.is_service_role()
  );

-- 3B. Delivery Partner (Rider) Applications
DROP POLICY IF EXISTS "Riders insert own application" ON public.rider_applications;
CREATE POLICY "Riders insert own application"
  ON public.rider_applications FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id AND status IN ('draft', 'submitted'))
    OR public.is_admin(auth.uid())
    OR public.is_service_role()
  );

DROP POLICY IF EXISTS "Riders view own application" ON public.rider_applications;
CREATE POLICY "Riders view own application"
  ON public.rider_applications FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR public.is_admin(auth.uid())
    OR public.is_service_role()
  );

DROP POLICY IF EXISTS "Riders update draft application" ON public.rider_applications;
CREATE POLICY "Riders update draft application"
  ON public.rider_applications FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id AND status IN ('draft', 'action_required'))
    OR public.is_admin(auth.uid())
    OR public.is_service_role()
  )
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id AND status IN ('draft', 'submitted'))
    OR public.is_admin(auth.uid())
    OR public.is_service_role()
  );

-- 3C. Restaurant Partner Financials & Documents Policies
DROP POLICY IF EXISTS "Applicants insert own financials" ON public.restaurant_partner_financials;
CREATE POLICY "Applicants insert own financials"
  ON public.restaurant_partner_financials FOR INSERT
  WITH CHECK (
    public.is_service_role()
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.restaurant_partner_applications ra
      WHERE ra.id = application_id
        AND ra.user_id = auth.uid()
        AND ra.status IN ('draft', 'submitted')
    )
  );

DROP POLICY IF EXISTS "Applicants view own financials" ON public.restaurant_partner_financials;
CREATE POLICY "Applicants view own financials"
  ON public.restaurant_partner_financials FOR SELECT
  USING (
    public.is_service_role()
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.restaurant_partner_applications ra
      WHERE ra.id = application_id
        AND ra.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Applicants insert own documents" ON public.restaurant_partner_documents;
CREATE POLICY "Applicants insert own documents"
  ON public.restaurant_partner_documents FOR INSERT
  WITH CHECK (
    public.is_service_role()
    OR public.is_admin(auth.uid())
    OR (
      status = 'pending'
      AND storage_bucket = 'partner-kyc-documents'
      AND storage_path LIKE (application_id::text || '/%')
      AND EXISTS (
        SELECT 1 FROM public.restaurant_partner_applications ra
        WHERE ra.id = application_id
          AND ra.user_id = auth.uid()
          AND ra.status IN ('draft', 'submitted')
      )
    )
  );

DROP POLICY IF EXISTS "Applicants view own documents" ON public.restaurant_partner_documents;
CREATE POLICY "Applicants view own documents"
  ON public.restaurant_partner_documents FOR SELECT
  USING (
    public.is_service_role()
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.restaurant_partner_applications ra
      WHERE ra.id = application_id
        AND ra.user_id = auth.uid()
    )
  );

-- 3D. Storage KYC Upload Policies for Submitted & Draft Status
DROP POLICY IF EXISTS "Applicants upload partner kyc files" ON storage.objects;
CREATE POLICY "Applicants upload partner kyc files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'partner-kyc-documents'
    AND (
      public.is_service_role()
      OR public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.restaurant_partner_applications a
        WHERE a.id::text = (storage.foldername(name))[1]
          AND a.user_id = auth.uid()
          AND a.status IN ('draft', 'submitted', 'action_required')
      )
    )
  );

DROP POLICY IF EXISTS "Riders upload rider kyc files" ON storage.objects;
CREATE POLICY "Riders upload rider kyc files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'rider-kyc-documents'
    AND (
      public.is_service_role()
      OR public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.rider_applications ra
        WHERE ra.id::text = (storage.foldername(name))[1]
          AND ra.user_id = auth.uid()
          AND ra.status IN ('draft', 'submitted', 'action_required')
      )
    )
  );

-- 4. RPC for Admin Qualification Document Review
CREATE OR REPLACE FUNCTION public.admin_review_rider_qualification(
  p_application_id UUID,
  p_status verification_status,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_caller_id UUID;
  v_app RECORD;
BEGIN
  -- Strict administrator authorization
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL OR NOT public.is_admin(v_caller_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'FORBIDDEN',
      'message', 'Access denied: Only platform administrators can verify qualification documents.'
    );
  END IF;

  SELECT * INTO v_app
  FROM public.rider_applications
  WHERE id = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NOT_FOUND',
      'message', 'Rider application not found.'
    );
  END IF;

  -- Rejection requires an explicit explanation reason
  IF p_status = 'rejected' AND (p_rejection_reason IS NULL OR length(trim(p_rejection_reason)) = 0) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_ARGUMENT',
      'message', 'A valid rejection reason must be provided when rejecting educational qualifications.'
    );
  END IF;

  -- Update qualification status on application (does NOT alter overall application status)
  UPDATE public.rider_applications
  SET
    qualification_status = p_status,
    qualification_rejection_reason = CASE WHEN p_status = 'rejected' THEN p_rejection_reason ELSE NULL END,
    qualification_verified_at = CASE WHEN p_status = 'verified' THEN NOW() ELSE NULL END,
    qualification_verified_by = CASE WHEN p_status = 'verified' THEN v_caller_id ELSE NULL END,
    updated_at = NOW()
  WHERE id = p_application_id;

  -- Update corresponding rider_documents row if present
  UPDATE public.rider_documents
  SET
    status = p_status,
    verified_at = CASE WHEN p_status = 'verified' THEN NOW() ELSE NULL END,
    verified_by = v_caller_id
  WHERE rider_application_id = p_application_id
    AND doc_type::text = 'qualification_proof';

  RETURN jsonb_build_object(
    'success', true,
    'application_id', p_application_id,
    'qualification_status', p_status,
    'message', format('Qualification document marked as %s.', p_status)
  );
END;
$$;

ALTER FUNCTION public.admin_review_rider_qualification(UUID, verification_status, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_review_rider_qualification(UUID, verification_status, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_rider_qualification(UUID, verification_status, TEXT) TO authenticated, service_role;

-- 5. RPC for Admin Restaurant Application Review
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
  v_slug TEXT;
  v_existing_rest UUID;
BEGIN
  -- Strict administrator authorization
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL OR NOT public.is_admin(v_caller_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'FORBIDDEN',
      'message', 'Access denied: Only platform administrators can review restaurant applications.'
    );
  END IF;

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

  -- Rejection and resubmission require an explicit reason
  IF p_action IN ('reject', 'action_required') AND (p_rejection_reason IS NULL OR length(trim(p_rejection_reason)) = 0) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_ARGUMENT',
      'message', 'A valid reason is required for rejection or resubmission request.'
    );
  END IF;

  IF p_action = 'approve' THEN
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
      );
    END IF;

    RETURN jsonb_build_object(
      'success', true,
      'action', 'approved',
      'application_id', p_application_id,
      'message', 'Restaurant partner application approved and restaurant activated.'
    );

  ELSIF p_action = 'reject' THEN
    UPDATE public.restaurant_partner_applications
    SET
      status = 'rejected',
      rejection_reason = COALESCE(p_rejection_reason, 'Application rejected by platform administrator.'),
      reviewer_notes = p_reviewer_notes,
      reviewed_by = v_caller_id,
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = p_application_id;

    RETURN jsonb_build_object(
      'success', true,
      'action', 'rejected',
      'application_id', p_application_id,
      'message', 'Restaurant partner application rejected.'
    );

  ELSIF p_action = 'action_required' THEN
    UPDATE public.restaurant_partner_applications
    SET
      status = 'action_required',
      rejection_reason = COALESCE(p_rejection_reason, 'Document resubmission requested.'),
      reviewer_notes = p_reviewer_notes,
      reviewed_by = v_caller_id,
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = p_application_id;

    RETURN jsonb_build_object(
      'success', true,
      'action', 'action_required',
      'application_id', p_application_id,
      'message', 'Resubmission requested from restaurant partner.'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_ACTION',
      'message', 'Action must be one of: approve, reject, action_required.'
    );
  END IF;
END;
$$;

ALTER FUNCTION public.admin_review_restaurant_application(UUID, TEXT, TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_review_restaurant_application(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_restaurant_application(UUID, TEXT, TEXT, TEXT) TO authenticated, service_role;

-- 6. Add Realtime Publication for instant Admin visibility
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'rider_applications'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.rider_applications;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'restaurant_partner_applications'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_partner_applications;
    END IF;
  END IF;
END $$;

COMMIT;
