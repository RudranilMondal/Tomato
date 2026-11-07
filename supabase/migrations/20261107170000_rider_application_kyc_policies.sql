-- ==============================================================================
-- 🍅 TOMATTTO DELIVERY PARTNER SYSTEM — PHASE 2 HARDENING
-- Migration: 20261107170000_rider_application_kyc_policies.sql
-- Description: Provision rider application metadata, isolated payout details table,
--              applicant RLS policies for document metadata, resubmission lifecycle trigger,
--              and storage read policy.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. RIDER APPLICATION METADATA COLUMN
-- ------------------------------------------------------------------------------
-- Store non-sensitive applicant details (address, blood group, gender, DOB, storage path)
ALTER TABLE public.rider_applications 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- ------------------------------------------------------------------------------
-- 2. ISOLATED RIDER PAYOUT DETAILS TABLE
-- ------------------------------------------------------------------------------
-- Sensitive financial details stored in a dedicated, RLS-protected table
CREATE TABLE IF NOT EXISTS public.rider_payout_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_application_id UUID NOT NULL REFERENCES public.rider_applications(id) ON DELETE CASCADE,
  account_holder_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number_masked TEXT NOT NULL,
  account_number_encrypted TEXT,
  ifsc_code TEXT NOT NULL,
  upi_id TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_rider_payout_app UNIQUE (rider_application_id)
);

-- Ensure unique constraint exists if table already existed without it
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_rider_payout_app'
  ) THEN
    ALTER TABLE public.rider_payout_details 
    ADD CONSTRAINT uq_rider_payout_app UNIQUE (rider_application_id);
  END IF;
END $$;

-- Index for rapid foreign key lookup
CREATE INDEX IF NOT EXISTS idx_rider_payout_app 
ON public.rider_payout_details(rider_application_id);

-- Explicit table permissions
GRANT ALL ON TABLE public.rider_payout_details TO authenticated, service_role;

-- Enable RLS
ALTER TABLE public.rider_payout_details ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. RIDER PAYOUT DETAILS RLS POLICIES
-- ------------------------------------------------------------------------------
-- Applicants can insert payout details for their own draft/action-required applications
DROP POLICY IF EXISTS "Applicants insert own payout details" ON public.rider_payout_details;
CREATE POLICY "Applicants insert own payout details"
  ON public.rider_payout_details FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rider_applications ra
      WHERE ra.id = rider_application_id
        AND ra.user_id = auth.uid()
        AND ra.status IN ('draft', 'action_required')
    )
  );

-- Applicants can update their own payout details for draft/action-required applications
DROP POLICY IF EXISTS "Applicants update own payout details" ON public.rider_payout_details;
CREATE POLICY "Applicants update own payout details"
  ON public.rider_payout_details FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.rider_applications ra
      WHERE ra.id = rider_application_id
        AND ra.user_id = auth.uid()
        AND ra.status IN ('draft', 'action_required')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rider_applications ra
      WHERE ra.id = rider_application_id
        AND ra.user_id = auth.uid()
        AND ra.status IN ('draft', 'action_required')
    )
  );

-- Applicants can view their own payout details
DROP POLICY IF EXISTS "Applicants view own payout details" ON public.rider_payout_details;
CREATE POLICY "Applicants view own payout details"
  ON public.rider_payout_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rider_applications ra
      WHERE ra.id = rider_application_id
        AND ra.user_id = auth.uid()
    )
    OR public.is_admin(auth.uid())
  );

-- Admins manage all payout details
DROP POLICY IF EXISTS "Admins manage rider payout details" ON public.rider_payout_details;
CREATE POLICY "Admins manage rider payout details"
  ON public.rider_payout_details FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 4. RIDER DOCUMENTS RLS POLICIES (METADATA TABLE SECURITY & REPLACEMENT)
-- ------------------------------------------------------------------------------
-- Applicants can only insert documents for their own draft/action-required application
-- Status must strictly be 'pending', storage_bucket must be 'rider-kyc-documents',
-- and storage_path must start with the application's unique ID folder.
DROP POLICY IF EXISTS "Applicants insert own documents" ON public.rider_documents;
CREATE POLICY "Applicants insert own documents"
  ON public.rider_documents FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND storage_bucket = 'rider-kyc-documents'
    AND storage_path LIKE (rider_application_id::text || '/%')
    AND rider_id IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rider_applications ra
      WHERE ra.id = rider_application_id
        AND ra.user_id = auth.uid()
        AND ra.status IN ('draft', 'action_required')
    )
  );

-- Applicants can update their own pending documents during draft/action-required status
-- for document replacement without duplicate row creation. Cannot modify verified documents.
DROP POLICY IF EXISTS "Applicants update own documents" ON public.rider_documents;
CREATE POLICY "Applicants update own documents"
  ON public.rider_documents FOR UPDATE
  USING (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.rider_applications ra
      WHERE ra.id = rider_application_id
        AND ra.user_id = auth.uid()
        AND ra.status IN ('draft', 'action_required')
    )
  )
  WITH CHECK (
    status = 'pending'
    AND storage_bucket = 'rider-kyc-documents'
    AND storage_path LIKE (rider_application_id::text || '/%')
    AND rider_id IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rider_applications ra
      WHERE ra.id = rider_application_id
        AND ra.user_id = auth.uid()
        AND ra.status IN ('draft', 'action_required')
    )
  );

-- Permit applicants to view their own document metadata
DROP POLICY IF EXISTS "Applicants view own documents" ON public.rider_documents;
CREATE POLICY "Applicants view own documents"
  ON public.rider_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rider_applications ra
      WHERE ra.id = rider_application_id
        AND ra.user_id = auth.uid()
    )
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 5. RIDER APPLICATION UPDATE POLICY & RESUBMISSION LIFECYCLE
-- ------------------------------------------------------------------------------
-- Permit applicants to update application in both 'draft' AND 'action_required' status,
-- transitioning to 'submitted' upon completion.
DROP POLICY IF EXISTS "Riders update draft application" ON public.rider_applications;
CREATE POLICY "Riders update draft application"
  ON public.rider_applications FOR UPDATE
  USING (
    (auth.uid() = user_id AND status IN ('draft', 'action_required'))
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    (auth.uid() = user_id AND status IN ('draft', 'submitted'))
    OR public.is_admin(auth.uid())
  );

-- Correct trigger function to allow resubmission from 'action_required' -> 'submitted'
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
      -- Force initial status to draft or submitted only
      IF NEW.status NOT IN ('draft', 'submitted') THEN
        NEW.status := 'draft';
      END IF;
      -- Zero out admin reviewer fields
      NEW.reviewed_by := NULL;
      NEW.reviewed_at := NULL;
      NEW.rejection_reason := NULL;
    END IF;
    RETURN NEW;
  END IF;

  IF (TG_OP = 'UPDATE') THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
      IF OLD.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Access denied: You can only update your own application.';
      END IF;
      IF (OLD.id IS DISTINCT FROM NEW.id) OR (OLD.application_ref IS DISTINCT FROM NEW.application_ref) OR (OLD.user_id IS DISTINCT FROM NEW.user_id) THEN
        RAISE EXCEPTION 'Access denied: Application identifiers are immutable.';
      END IF;
      IF (OLD.reviewed_by IS DISTINCT FROM NEW.reviewed_by) OR 
         (OLD.reviewed_at IS DISTINCT FROM NEW.reviewed_at) OR 
         (OLD.rejection_reason IS DISTINCT FROM NEW.rejection_reason) THEN
        RAISE EXCEPTION 'Access denied: Reviewer fields can only be modified by administrators.';
      END IF;
      IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        -- Allow applicants to transition from draft OR action_required to submitted
        IF NOT (OLD.status IN ('draft', 'action_required') AND NEW.status = 'submitted') THEN
          RAISE EXCEPTION 'Applicants can only submit draft or action-required applications for review.';
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
-- 6. STORAGE READ POLICY FOR KYC OBJECTS
-- ------------------------------------------------------------------------------
-- Permit applicants to view objects in their own application folder
DROP POLICY IF EXISTS "Applicants view own kyc files" ON storage.objects;
CREATE POLICY "Applicants view own kyc files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'rider-kyc-documents'
    AND (
      public.is_service_role()
      OR public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.rider_applications ra
        WHERE ra.id::text = (storage.foldername(name))[1]
          AND ra.user_id = auth.uid()
      )
    )
  );
