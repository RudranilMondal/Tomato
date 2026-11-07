-- ==============================================================================
-- 🍅 TOMATTTO STORAGE BUCKETS & KYC ACCESS CONTROL
-- Migration: 20261106201500_storage_kyc_buckets.sql
-- Description: Provision public asset bucket and private partner/rider KYC buckets
--              with strict Row Level Security (RLS) policies on storage.objects.
-- ==============================================================================

-- 1. PROVISION STORAGE BUCKETS
-- Public bucket for catalog imagery (logos, banners, dish photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'restaurant-public',
  'restaurant-public',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Private bucket for restaurant partner compliance (FSSAI, PAN, GST, bank statements)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partner-kyc-documents',
  'partner-kyc-documents',
  false, -- Strictly private
  10485760, -- 10 MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

-- Private bucket for delivery rider verification (Driver's License, Vehicle RC, Aadhaar)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rider-kyc-documents',
  'rider-kyc-documents',
  false, -- Strictly private
  10485760, -- 10 MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

-- ==============================================================================
-- 2. STORAGE OBJECTS ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- A. restaurant-public Policies (Catalog imagery: <restaurant_id>/...)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view public restaurant assets" ON storage.objects;
CREATE POLICY "Public can view public restaurant assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'restaurant-public');

-- Only verified owners of the restaurant ID folder can upload or overwrite assets
DROP POLICY IF EXISTS "Authenticated users upload public restaurant assets" ON storage.objects;
DROP POLICY IF EXISTS "Restaurant owners upload public restaurant assets" ON storage.objects;
CREATE POLICY "Restaurant owners upload public restaurant assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'restaurant-public'
    AND (
      public.is_service_role()
      OR public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id::text = (storage.foldername(name))[1]
          AND r.owner_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Restaurant owners update public restaurant assets" ON storage.objects;
CREATE POLICY "Restaurant owners update public restaurant assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'restaurant-public'
    AND (
      public.is_service_role()
      OR public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id::text = (storage.foldername(name))[1]
          AND r.owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    bucket_id = 'restaurant-public'
    AND (
      public.is_service_role()
      OR public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id::text = (storage.foldername(name))[1]
          AND r.owner_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Owners and admins delete public restaurant assets" ON storage.objects;
DROP POLICY IF EXISTS "Restaurant owners delete public restaurant assets" ON storage.objects;
CREATE POLICY "Restaurant owners delete public restaurant assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'restaurant-public'
    AND (
      public.is_service_role()
      OR public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id::text = (storage.foldername(name))[1]
          AND r.owner_id = auth.uid()
      )
    )
  );

-- ------------------------------------------------------------------------------
-- B. partner-kyc-documents Policies (Strictly Private: <application_id>/...)
-- ------------------------------------------------------------------------------
-- Public/anonymous queries are denied. Only admins or service role can select directly.
-- Authenticated applicants access files via signed URLs generated by Edge Functions.
DROP POLICY IF EXISTS "Only admins view partner kyc files" ON storage.objects;
CREATE POLICY "Only admins view partner kyc files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'partner-kyc-documents'
    AND (
      public.is_service_role()
      OR public.is_admin(auth.uid())
    )
  );

-- Authenticated applicants can upload KYC documents only into their own application folder in draft status
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
          AND a.status IN ('draft', 'action_required')
      )
    )
  );

-- Prevent cross-user overwriting: applicants can only update files within their draft application
DROP POLICY IF EXISTS "Applicants update partner kyc files" ON storage.objects;
CREATE POLICY "Applicants update partner kyc files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'partner-kyc-documents'
    AND (
      public.is_service_role()
      OR public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.restaurant_partner_applications a
        WHERE a.id::text = (storage.foldername(name))[1]
          AND a.user_id = auth.uid()
          AND a.status IN ('draft', 'action_required')
      )
    )
  )
  WITH CHECK (
    bucket_id = 'partner-kyc-documents'
    AND (
      public.is_service_role()
      OR public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.restaurant_partner_applications a
        WHERE a.id::text = (storage.foldername(name))[1]
          AND a.user_id = auth.uid()
          AND a.status IN ('draft', 'action_required')
      )
    )
  );

DROP POLICY IF EXISTS "Only admins delete partner kyc files" ON storage.objects;
CREATE POLICY "Only admins delete partner kyc files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'partner-kyc-documents'
    AND (
      public.is_service_role()
      OR public.is_admin(auth.uid())
    )
  );

-- ------------------------------------------------------------------------------
-- C. rider-kyc-documents Policies (Strictly Private: <rider_application_id>/...)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Only admins view rider kyc files" ON storage.objects;
CREATE POLICY "Only admins view rider kyc files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'rider-kyc-documents'
    AND (
      public.is_service_role()
      OR public.is_admin(auth.uid())
    )
  );

-- Authenticated riders can upload verification documents only into their own application folder in draft status
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
          AND ra.status IN ('draft', 'action_required')
      )
    )
  );

-- Prevent cross-user overwriting: riders can only update files within their draft application
DROP POLICY IF EXISTS "Riders update rider kyc files" ON storage.objects;
CREATE POLICY "Riders update rider kyc files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'rider-kyc-documents'
    AND (
      public.is_service_role()
      OR public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.rider_applications ra
        WHERE ra.id::text = (storage.foldername(name))[1]
          AND ra.user_id = auth.uid()
          AND ra.status IN ('draft', 'action_required')
      )
    )
  )
  WITH CHECK (
    bucket_id = 'rider-kyc-documents'
    AND (
      public.is_service_role()
      OR public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.rider_applications ra
        WHERE ra.id::text = (storage.foldername(name))[1]
          AND ra.user_id = auth.uid()
          AND ra.status IN ('draft', 'action_required')
      )
    )
  );

DROP POLICY IF EXISTS "Only admins delete rider kyc files" ON storage.objects;
CREATE POLICY "Only admins delete rider kyc files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'rider-kyc-documents'
    AND (
      public.is_service_role()
      OR public.is_admin(auth.uid())
    )
  );
