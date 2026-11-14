-- ==============================================================================
-- FORWARD MIGRATION: 20261114141000_enforce_restaurant_mandatory_kyc.sql
-- Enforce Database-Level Mandatory KYC Document Verification for Restaurant Approvals
--
-- 1. Preserves historical migration 20261112210000 in its original unmodified form.
-- 2. Requires all six mandatory documents to be uploaded and verified before approval:
--    - aadhaar_front (Personal Aadhaar Front photo)
--    - aadhaar_back (Personal Aadhaar Back photo)
--    - pan_front (Personal PAN Card Front photo)
--    - pan_back (Personal PAN Card Back photo)
--    - pan_card (Business PAN card document)
--    - fssai_cert (FSSAI food license certificate)
-- 3. Rejects approval server-side with error 'DOCUMENTS_NOT_VERIFIED' if any document
--    is missing, pending, or rejected.
-- 4. Preserves restaurant onboarding, rejection, resubmission, and auto-provisioning.
-- ==============================================================================

BEGIN;

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

  -- 6. Handle Approval flow (with database-level KYC validation)
  IF p_action = 'approve' THEN
    -- Verify each mandatory document exists and has status = 'verified'
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
