-- ==============================================================================
-- TOMATTTO FOOD DELIVERY PLATFORM:
-- AUTHENTICATION, MANDATORY 4-DOC KYC & DELIVERY RIDER TIER SYSTEM
-- Migration: 20261113200000_auth_kyc_and_rider_tier_system.sql
--
-- Features Included:
--   1. Extend kyc_doc_type enum for Aadhaar Front/Back, PAN Front/Back and Selfie.
--   2. Add Rider Tier, working hours, and duty scheduling columns to public.riders
--      and public.rider_applications.
--   3. Create public.rider_selfie_verifications table with RLS and audit tracking.
--   4. Create public.tier_configurations table with configurable thresholds & payouts.
--   5. Create private rider-selfie-evidence storage bucket with granular RLS policies.
--   6. Create public.rider_order_payouts table for immutable earnings snapshots.
--   7. Provision duty scheduling (start/end/check) and selfie submission RPCs.
--   8. Provision authoritative order payout snapshot RPC (record_rider_order_payout).
--   9. Realtime publication integration for tier configs, payouts & selfie alerts.
-- ==============================================================================

BEGIN;

-- 1. Extend kyc_doc_type enum for granular front/back documents and selfie verification
ALTER TYPE public.kyc_doc_type ADD VALUE IF NOT EXISTS 'aadhaar_front';
ALTER TYPE public.kyc_doc_type ADD VALUE IF NOT EXISTS 'aadhaar_back';
ALTER TYPE public.kyc_doc_type ADD VALUE IF NOT EXISTS 'pan_front';
ALTER TYPE public.kyc_doc_type ADD VALUE IF NOT EXISTS 'pan_back';
ALTER TYPE public.kyc_doc_type ADD VALUE IF NOT EXISTS 'selfie_verification';

-- 2. Extend public.riders with tier, working hours, and duty tracking
ALTER TABLE public.riders
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold')),
  ADD COLUMN IF NOT EXISTS total_working_hours NUMERIC(10,2) DEFAULT 0.00 CHECK (total_working_hours >= 0),
  ADD COLUMN IF NOT EXISTS completed_orders_count INTEGER DEFAULT 0 CHECK (completed_orders_count >= 0),
  ADD COLUMN IF NOT EXISTS duty_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_selfie_prompted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_selfie_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_selfie_scheduled_at TIMESTAMPTZ;

-- Extend public.rider_applications with tier and metrics for applicant tracking
ALTER TABLE public.rider_applications
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold')),
  ADD COLUMN IF NOT EXISTS total_working_hours NUMERIC(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS completed_orders_count INTEGER DEFAULT 0;

-- 3. Create public.tier_configurations table for admin-configurable thresholds & payouts
CREATE TABLE IF NOT EXISTS public.tier_configurations (
  tier TEXT PRIMARY KEY CHECK (tier IN ('bronze', 'silver', 'gold')),
  min_rating NUMERIC(2,1) NOT NULL CHECK (min_rating >= 0 AND min_rating <= 5.0),
  min_working_hours NUMERIC(10,2) NOT NULL CHECK (min_working_hours >= 0),
  min_completed_orders INTEGER NOT NULL CHECK (min_completed_orders >= 0),
  base_payout NUMERIC(10,2) NOT NULL CHECK (base_payout >= 0),
  per_km_rate NUMERIC(10,2) NOT NULL CHECK (per_km_rate >= 0),
  surge_bonus NUMERIC(10,2) NOT NULL CHECK (surge_bonus >= 0),
  tier_incentive NUMERIC(10,2) NOT NULL CHECK (tier_incentive >= 0),
  order_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00 CHECK (order_multiplier >= 1.00),
  selfie_interval_minutes INTEGER NOT NULL CHECK (selfie_interval_minutes >= 0),
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Seed default tier configuration values (audited defaults)
INSERT INTO public.tier_configurations (
  tier, min_rating, min_working_hours, min_completed_orders,
  base_payout, per_km_rate, surge_bonus, tier_incentive, order_multiplier,
  selfie_interval_minutes, description
) VALUES
  ('bronze', 0.0, 0.00, 0, 40.00, 12.00, 10.00, 0.00, 1.00, 90, 'Starting tier for new riders. Random selfie prompt every 1-2 hours on duty.'),
  ('silver', 4.6, 50.00, 100, 45.00, 14.00, 15.00, 15.00, 1.05, 240, 'Mid-tier. Requires 4.6+ rating, 50h, 100 deliveries. Selfie prompt every 4 hours.'),
  ('gold', 4.8, 150.00, 300, 55.00, 16.00, 20.00, 30.00, 1.10, 0, 'Premier tier. Requires 4.8+ rating, 150h, 300 deliveries. Selfie prompt at duty start and end.')
ON CONFLICT (tier) DO UPDATE SET
  base_payout = EXCLUDED.base_payout,
  per_km_rate = EXCLUDED.per_km_rate,
  surge_bonus = EXCLUDED.surge_bonus,
  tier_incentive = EXCLUDED.tier_incentive,
  order_multiplier = EXCLUDED.order_multiplier,
  updated_at = NOW();

-- 4. Create public.rider_selfie_verifications table
CREATE TABLE IF NOT EXISTS public.rider_selfie_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID REFERENCES public.riders(id) ON DELETE CASCADE,
  rider_application_id UUID REFERENCES public.rider_applications(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold')),
  verification_type TEXT NOT NULL CHECK (verification_type IN ('random_duty', 'duty_start', 'duty_end', 'order_linked')),
  storage_bucket TEXT NOT NULL DEFAULT 'rider-selfie-evidence',
  storage_path TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('pending', 'verified', 'flagged', 'missed', 'rejected')),
  prompted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  missed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rider_selfie_rider_id ON public.rider_selfie_verifications(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_selfie_order_id ON public.rider_selfie_verifications(order_id);
CREATE INDEX IF NOT EXISTS idx_rider_selfie_status ON public.rider_selfie_verifications(status);

-- 5. Create public.rider_order_payouts table for immutable order-level earnings snapshots
CREATE TABLE IF NOT EXISTS public.rider_order_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rider_id UUID NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold')),
  base_payout NUMERIC(10,2) NOT NULL CHECK (base_payout >= 0),
  distance_km NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (distance_km >= 0),
  per_km_rate NUMERIC(10,2) NOT NULL CHECK (per_km_rate >= 0),
  distance_payout NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (distance_payout >= 0),
  surge_bonus NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (surge_bonus >= 0),
  tier_incentive NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (tier_incentive >= 0),
  order_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00 CHECK (order_multiplier >= 1.00),
  tip_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (tip_amount >= 0),
  total_payout NUMERIC(10,2) NOT NULL CHECK (total_payout >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_rider_order_payout UNIQUE (order_id)
);

CREATE INDEX IF NOT EXISTS idx_rider_payouts_rider_id ON public.rider_order_payouts(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_payouts_order_id ON public.rider_order_payouts(order_id);

-- 6. Setup private rider-selfie-evidence storage bucket
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('rider-selfie-evidence', 'rider-selfie-evidence', false, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false;

-- 7. RLS Policies
ALTER TABLE public.tier_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_selfie_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_order_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view tier configurations" ON public.tier_configurations;
CREATE POLICY "Anyone can view tier configurations"
  ON public.tier_configurations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update tier configurations" ON public.tier_configurations;
CREATE POLICY "Admins can update tier configurations"
  ON public.tier_configurations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Riders and admins view selfie records" ON public.rider_selfie_verifications;
CREATE POLICY "Riders and admins view selfie records"
  ON public.rider_selfie_verifications FOR SELECT
  USING (
    (rider_id IN (SELECT id FROM public.riders WHERE profile_id = auth.uid()))
    OR
    (rider_application_id IN (SELECT id FROM public.rider_applications WHERE user_id = auth.uid()))
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Riders can insert selfie records" ON public.rider_selfie_verifications;
CREATE POLICY "Riders can insert selfie records"
  ON public.rider_selfie_verifications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      (rider_id IN (SELECT id FROM public.riders WHERE profile_id = auth.uid()))
      OR
      (rider_application_id IN (SELECT id FROM public.rider_applications WHERE user_id = auth.uid()))
      OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    )
  );

DROP POLICY IF EXISTS "Riders can update own selfie records" ON public.rider_selfie_verifications;
CREATE POLICY "Riders can update own selfie records"
  ON public.rider_selfie_verifications FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (
      (rider_id IN (SELECT id FROM public.riders WHERE profile_id = auth.uid()))
      OR
      (rider_application_id IN (SELECT id FROM public.rider_applications WHERE user_id = auth.uid()))
      OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    )
  );

DROP POLICY IF EXISTS "Riders and admins can view payouts" ON public.rider_order_payouts;
CREATE POLICY "Riders and admins can view payouts"
  ON public.rider_order_payouts FOR SELECT
  USING (
    (rider_id IN (SELECT id FROM public.riders WHERE profile_id = auth.uid()))
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Storage object policies for rider-selfie-evidence
DROP POLICY IF EXISTS "Riders can upload own selfie evidence" ON storage.objects;
CREATE POLICY "Riders can upload own selfie evidence"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'rider-selfie-evidence'
    AND auth.uid() IS NOT NULL
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.riders r
        WHERE r.profile_id = auth.uid() AND (storage.foldername(name))[1] = r.id::text
      )
      OR EXISTS (
        SELECT 1 FROM public.rider_selfie_verifications v
        JOIN public.riders r ON r.id = v.rider_id
        WHERE v.id::text = (storage.foldername(name))[1] AND r.profile_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    )
  );

DROP POLICY IF EXISTS "Riders and admins can view selfie evidence" ON storage.objects;
CREATE POLICY "Riders and admins can view selfie evidence"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'rider-selfie-evidence'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.riders r
        WHERE r.profile_id = auth.uid() AND (storage.foldername(name))[1] = r.id::text
      )
      OR EXISTS (
        SELECT 1 FROM public.rider_selfie_verifications v
        JOIN public.riders r ON r.id = v.rider_id
        WHERE v.id::text = (storage.foldername(name))[1] AND r.profile_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    )
  );

-- 8. RPC: Calculate & update rider tier
CREATE OR REPLACE FUNCTION public.calculate_rider_tier(p_rider_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rider RECORD;
  v_new_tier TEXT := 'bronze';
  v_gold_cfg RECORD;
  v_silver_cfg RECORD;
BEGIN
  SELECT * INTO v_rider FROM public.riders WHERE id = p_rider_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'RIDER_NOT_FOUND');
  END IF;

  SELECT * INTO v_gold_cfg FROM public.tier_configurations WHERE tier = 'gold';
  SELECT * INTO v_silver_cfg FROM public.tier_configurations WHERE tier = 'silver';

  -- Check Gold Qualification:
  IF v_rider.rating >= v_gold_cfg.min_rating
     AND v_rider.total_working_hours >= v_gold_cfg.min_working_hours
     AND v_rider.completed_orders_count >= v_gold_cfg.min_completed_orders THEN
    v_new_tier := 'gold';
  -- Check Silver Qualification:
  ELSIF v_rider.rating >= v_silver_cfg.min_rating
     AND v_rider.total_working_hours >= v_silver_cfg.min_working_hours
     AND v_rider.completed_orders_count >= v_silver_cfg.min_completed_orders THEN
    v_new_tier := 'silver';
  ELSE
    v_new_tier := 'bronze';
  END IF;

  UPDATE public.riders
  SET tier = v_new_tier
  WHERE id = p_rider_id;

  RETURN jsonb_build_object(
    'success', true,
    'rider_id', p_rider_id,
    'tier', v_new_tier,
    'rating', v_rider.rating,
    'total_working_hours', v_rider.total_working_hours,
    'completed_orders_count', v_rider.completed_orders_count
  );
END;
$$;

-- 9. RPC: Duty Start
CREATE OR REPLACE FUNCTION public.rider_start_duty(p_rider_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_rider RECORD;
  v_next_scheduled TIMESTAMPTZ := NULL;
  v_interval_mins INTEGER;
  v_selfie_required BOOLEAN := false;
  v_verification_id UUID := NULL;
BEGIN
  SELECT * INTO v_rider FROM public.riders WHERE id = p_rider_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'RIDER_NOT_FOUND');
  END IF;

  IF v_caller_id IS NOT NULL AND v_rider.profile_id != v_caller_id AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v_caller_id AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'FORBIDDEN');
  END IF;

  -- Schedule next selfie based on tier
  IF v_rider.tier = 'gold' THEN
    -- Gold requires mandatory selfie at duty start
    v_selfie_required := true;
    INSERT INTO public.rider_selfie_verifications (
      rider_id, tier, verification_type, storage_bucket, storage_path, status, prompted_at, missed_at
    ) VALUES (
      p_rider_id, 'gold', 'duty_start', 'rider-selfie-evidence', '', 'pending', NOW(), NOW() + INTERVAL '10 minutes'
    ) RETURNING id INTO v_verification_id;
  ELSIF v_rider.tier = 'silver' THEN
    -- Fixed 4 hours
    v_interval_mins := 240;
    v_next_scheduled := NOW() + INTERVAL '4 hours';
  ELSE
    -- Bronze: random 1-2 hours (60 to 120 minutes)
    v_interval_mins := 60 + FLOOR(RANDOM() * 60)::INTEGER;
    v_next_scheduled := NOW() + (v_interval_mins || ' minutes')::INTERVAL;
  END IF;

  UPDATE public.riders
  SET
    duty_started_at = NOW(),
    next_selfie_scheduled_at = v_next_scheduled
  WHERE id = p_rider_id;

  RETURN jsonb_build_object(
    'success', true,
    'rider_id', p_rider_id,
    'tier', v_rider.tier,
    'duty_started_at', NOW(),
    'next_scheduled_at', v_next_scheduled,
    'selfie_required', v_selfie_required,
    'verification_id', v_verification_id
  );
END;
$$;

-- 10. RPC: Duty End
CREATE OR REPLACE FUNCTION public.rider_end_duty(p_rider_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_rider RECORD;
  v_duration_hours NUMERIC(10,2) := 0.00;
  v_selfie_required BOOLEAN := false;
  v_verification_id UUID := NULL;
BEGIN
  SELECT * INTO v_rider FROM public.riders WHERE id = p_rider_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'RIDER_NOT_FOUND');
  END IF;

  IF v_caller_id IS NOT NULL AND v_rider.profile_id != v_caller_id AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v_caller_id AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'FORBIDDEN');
  END IF;

  IF v_rider.duty_started_at IS NOT NULL THEN
    v_duration_hours := ROUND((EXTRACT(EPOCH FROM (NOW() - v_rider.duty_started_at)) / 3600.0)::numeric, 2);
  END IF;

  IF v_rider.tier = 'gold' AND v_rider.duty_started_at IS NOT NULL THEN
    v_selfie_required := true;
    INSERT INTO public.rider_selfie_verifications (
      rider_id, tier, verification_type, storage_bucket, storage_path, status, prompted_at, missed_at
    ) VALUES (
      p_rider_id, 'gold', 'duty_end', 'rider-selfie-evidence', '', 'pending', NOW(), NOW() + INTERVAL '10 minutes'
    ) RETURNING id INTO v_verification_id;
  END IF;

  UPDATE public.riders
  SET
    duty_started_at = NULL,
    next_selfie_scheduled_at = NULL,
    total_working_hours = COALESCE(total_working_hours, 0) + v_duration_hours
  WHERE id = p_rider_id;

  -- Re-evaluate tier with updated working hours
  PERFORM public.calculate_rider_tier(p_rider_id);

  RETURN jsonb_build_object(
    'success', true,
    'rider_id', p_rider_id,
    'hours_added', v_duration_hours,
    'total_working_hours', COALESCE(v_rider.total_working_hours, 0) + v_duration_hours,
    'selfie_required', v_selfie_required,
    'verification_id', v_verification_id
  );
END;
$$;

-- 11. RPC: Check Rider Selfie Due
CREATE OR REPLACE FUNCTION public.check_rider_selfie_due(p_rider_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_rider RECORD;
  v_pending RECORD;
  v_verification_id UUID;
BEGIN
  SELECT * INTO v_rider FROM public.riders WHERE id = p_rider_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'RIDER_NOT_FOUND');
  END IF;

  -- Check if rider is offline
  IF v_rider.duty_started_at IS NULL THEN
    RETURN jsonb_build_object('success', true, 'is_due', false, 'reason', 'OFFLINE');
  END IF;

  -- Expire pending verifications that exceeded 10-minute grace period
  UPDATE public.rider_selfie_verifications
  SET status = 'missed'
  WHERE rider_id = p_rider_id AND status = 'pending' AND missed_at IS NOT NULL AND NOW() > missed_at;

  -- Check for active pending verification within grace period
  SELECT * INTO v_pending
  FROM public.rider_selfie_verifications
  WHERE rider_id = p_rider_id AND status = 'pending' AND (missed_at IS NULL OR NOW() <= missed_at)
  ORDER BY prompted_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'is_due', true,
      'verification_id', v_pending.id,
      'verification_type', v_pending.verification_type,
      'prompted_at', v_pending.prompted_at,
      'expires_at', v_pending.missed_at,
      'tier', v_rider.tier
    );
  END IF;

  -- Check if next scheduled selfie time has arrived
  IF v_rider.next_selfie_scheduled_at IS NOT NULL AND NOW() >= v_rider.next_selfie_scheduled_at THEN
    INSERT INTO public.rider_selfie_verifications (
      rider_id, tier, verification_type, storage_bucket, storage_path, status, prompted_at, missed_at
    ) VALUES (
      p_rider_id, v_rider.tier, 'random_duty', 'rider-selfie-evidence', '', 'pending', NOW(), NOW() + INTERVAL '10 minutes'
    ) RETURNING id INTO v_verification_id;

    UPDATE public.riders
    SET last_selfie_prompted_at = NOW()
    WHERE id = p_rider_id;

    RETURN jsonb_build_object(
      'success', true,
      'is_due', true,
      'verification_id', v_verification_id,
      'verification_type', 'random_duty',
      'prompted_at', NOW(),
      'expires_at', NOW() + INTERVAL '10 minutes',
      'tier', v_rider.tier
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'is_due', false,
    'tier', v_rider.tier,
    'next_scheduled_at', v_rider.next_selfie_scheduled_at
  );
END;
$$;

-- 12. RPC: Submit Rider Selfie Verification
CREATE OR REPLACE FUNCTION public.submit_rider_selfie(
  p_rider_id UUID,
  p_order_id UUID DEFAULT NULL,
  p_verification_type TEXT DEFAULT 'random_duty',
  p_storage_path TEXT DEFAULT '',
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_rider RECORD;
  v_selfie_id UUID;
  v_next_scheduled TIMESTAMPTZ := NULL;
  v_interval_mins INTEGER := 90;
  v_pending_id UUID;
BEGIN
  SELECT * INTO v_rider FROM public.riders WHERE id = p_rider_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'RIDER_NOT_FOUND');
  END IF;

  -- Caller must be rider owner or admin
  IF v_caller_id IS NOT NULL AND v_rider.profile_id != v_caller_id AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v_caller_id AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'FORBIDDEN');
  END IF;

  -- Look for an existing pending verification for this rider
  SELECT id INTO v_pending_id
  FROM public.rider_selfie_verifications
  WHERE rider_id = p_rider_id AND status = 'pending'
  ORDER BY prompted_at DESC
  LIMIT 1;

  IF v_pending_id IS NOT NULL THEN
    UPDATE public.rider_selfie_verifications
    SET
      order_id = COALESCE(p_order_id, order_id),
      storage_bucket = 'rider-selfie-evidence',
      storage_path = p_storage_path,
      status = 'verified',
      submitted_at = NOW(),
      notes = p_notes
    WHERE id = v_pending_id
    RETURNING id INTO v_selfie_id;
  ELSE
    INSERT INTO public.rider_selfie_verifications (
      rider_id, order_id, tier, verification_type, storage_bucket, storage_path, status, submitted_at, notes
    ) VALUES (
      p_rider_id, p_order_id, v_rider.tier, p_verification_type, 'rider-selfie-evidence', p_storage_path, 'verified', NOW(), p_notes
    ) RETURNING id INTO v_selfie_id;
  END IF;

  -- Calculate next scheduled selfie based on tier
  IF v_rider.tier = 'bronze' THEN
    v_interval_mins := 60 + FLOOR(RANDOM() * 60)::INTEGER;
    v_next_scheduled := NOW() + (v_interval_mins || ' minutes')::INTERVAL;
  ELSIF v_rider.tier = 'silver' THEN
    v_next_scheduled := NOW() + INTERVAL '4 hours';
  ELSE
    -- Gold: scheduled at duty start/end only
    v_next_scheduled := NULL;
  END IF;

  UPDATE public.riders
  SET
    last_selfie_verified_at = NOW(),
    next_selfie_scheduled_at = v_next_scheduled
  WHERE id = p_rider_id;

  RETURN jsonb_build_object(
    'success', true,
    'selfie_id', v_selfie_id,
    'tier', v_rider.tier,
    'verified_at', NOW(),
    'next_scheduled_at', v_next_scheduled
  );
END;
$$;

-- 13. RPC: Record Authoritative Rider Order Payout (Immutable snapshot)
CREATE OR REPLACE FUNCTION public.record_rider_order_payout(
  p_order_id UUID,
  p_rider_id UUID,
  p_distance_km NUMERIC DEFAULT 0.00,
  p_surge_amount NUMERIC DEFAULT 0.00,
  p_tip_amount NUMERIC DEFAULT 0.00
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_rider RECORD;
  v_cfg RECORD;
  v_base NUMERIC(10,2);
  v_per_km NUMERIC(10,2);
  v_dist_pay NUMERIC(10,2);
  v_surge NUMERIC(10,2);
  v_incentive NUMERIC(10,2);
  v_multiplier NUMERIC(3,2);
  v_core_subtotal NUMERIC(10,2);
  v_multiplied_subtotal NUMERIC(10,2);
  v_total_payout NUMERIC(10,2);
  v_payout_id UUID;
BEGIN
  -- Verify rider exists
  SELECT * INTO v_rider FROM public.riders WHERE id = p_rider_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'RIDER_NOT_FOUND');
  END IF;

  -- Caller check: rider owner or admin
  IF v_caller_id IS NOT NULL AND v_rider.profile_id != v_caller_id AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v_caller_id AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'FORBIDDEN');
  END IF;

  -- Verify order is not cancelled
  IF EXISTS (
    SELECT 1 FROM public.orders WHERE id = p_order_id AND status = 'cancelled'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ORDER_CANCELLED',
      'message', 'Payout cannot be recorded for a cancelled order.'
    );
  END IF;

  -- Check if order payout already exists (idempotency / duplicate prevention)
  SELECT id, total_payout INTO v_payout_id, v_total_payout
  FROM public.rider_order_payouts
  WHERE order_id = p_order_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_recorded', true,
      'payout_id', v_payout_id,
      'total_payout', v_total_payout
    );
  END IF;

  -- Fetch tier configuration
  SELECT * INTO v_cfg FROM public.tier_configurations WHERE tier = v_rider.tier;
  IF NOT FOUND THEN
    SELECT * INTO v_cfg FROM public.tier_configurations WHERE tier = 'bronze';
  END IF;

  v_base := v_cfg.base_payout;
  v_per_km := v_cfg.per_km_rate;
  v_dist_pay := ROUND((p_distance_km * v_per_km)::numeric, 2);
  v_surge := COALESCE(p_surge_amount, v_cfg.surge_bonus);
  v_incentive := v_cfg.tier_incentive;
  v_multiplier := v_cfg.order_multiplier;

  v_core_subtotal := v_base + v_dist_pay + v_surge;
  v_multiplied_subtotal := ROUND((v_core_subtotal * v_multiplier)::numeric, 2);
  v_total_payout := ROUND((v_multiplied_subtotal + COALESCE(p_tip_amount, 0) + v_incentive)::numeric, 2);

  -- Insert immutable snapshot
  INSERT INTO public.rider_order_payouts (
    order_id, rider_id, tier, base_payout, distance_km, per_km_rate,
    distance_payout, surge_bonus, tier_incentive, order_multiplier,
    tip_amount, total_payout
  ) VALUES (
    p_order_id, p_rider_id, v_rider.tier, v_base, p_distance_km, v_per_km,
    v_dist_pay, v_surge, v_incentive, v_multiplier,
    COALESCE(p_tip_amount, 0), v_total_payout
  ) RETURNING id INTO v_payout_id;

  -- Update rider total deliveries & completed count
  UPDATE public.riders
  SET
    completed_orders_count = COALESCE(completed_orders_count, 0) + 1,
    total_deliveries = COALESCE(total_deliveries, 0) + 1,
    earnings_today = COALESCE(earnings_today, 0) + v_total_payout
  WHERE id = p_rider_id;

  -- Also record in rider_earnings if table exists
  INSERT INTO public.rider_earnings (
    rider_id, order_id, delivery_fee, tip_amount, surge_amount, total_earned, status, settled_at
  ) VALUES (
    p_rider_id, p_order_id, v_dist_pay + v_base, COALESCE(p_tip_amount, 0), v_surge, v_total_payout, 'completed', NOW()
  ) ON CONFLICT DO NOTHING;

  -- Re-calculate rider tier based on updated orders count
  PERFORM public.calculate_rider_tier(p_rider_id);

  RETURN jsonb_build_object(
    'success', true,
    'payout_id', v_payout_id,
    'rider_id', p_rider_id,
    'order_id', p_order_id,
    'tier', v_rider.tier,
    'base_payout', v_base,
    'distance_km', p_distance_km,
    'distance_payout', v_dist_pay,
    'surge_bonus', v_surge,
    'tier_incentive', v_incentive,
    'order_multiplier', v_multiplier,
    'tip_amount', COALESCE(p_tip_amount, 0),
    'total_payout', v_total_payout
  );
END;
$$;

-- 14. RPC: Admin update tier configuration
CREATE OR REPLACE FUNCTION public.admin_update_tier_config(
  p_tier TEXT,
  p_min_rating NUMERIC,
  p_min_working_hours NUMERIC,
  p_min_completed_orders INTEGER,
  p_base_payout NUMERIC,
  p_per_km_rate NUMERIC,
  p_surge_bonus NUMERIC,
  p_tier_incentive NUMERIC,
  p_order_multiplier NUMERIC,
  p_selfie_interval_minutes INTEGER,
  p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
BEGIN
  IF v_caller_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v_caller_id AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'FORBIDDEN');
  END IF;

  IF p_tier NOT IN ('bronze', 'silver', 'gold') THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_TIER');
  END IF;

  UPDATE public.tier_configurations
  SET
    min_rating = p_min_rating,
    min_working_hours = p_min_working_hours,
    min_completed_orders = p_min_completed_orders,
    base_payout = p_base_payout,
    per_km_rate = p_per_km_rate,
    surge_bonus = p_surge_bonus,
    tier_incentive = p_tier_incentive,
    order_multiplier = p_order_multiplier,
    selfie_interval_minutes = p_selfie_interval_minutes,
    description = COALESCE(p_description, description),
    updated_at = NOW(),
    updated_by = v_caller_id
  WHERE tier = p_tier;

  RETURN jsonb_build_object('success', true, 'tier', p_tier);
END;
$$;

-- 14b. RPC: Sweep active rider selfie verifications (callable by scheduler / cron worker)
CREATE OR REPLACE FUNCTION public.sweep_active_rider_selfie_verifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rider RECORD;
  v_count INTEGER := 0;
BEGIN
  -- 1. Expire all overdue pending selfies across all riders (exceeded 10-minute grace period)
  UPDATE public.rider_selfie_verifications
  SET status = 'missed'
  WHERE status = 'pending' AND missed_at IS NOT NULL AND NOW() > missed_at;

  -- 2. Sweep all online riders who have reached their scheduled selfie time
  FOR v_rider IN
    SELECT id FROM public.riders
    WHERE duty_started_at IS NOT NULL
      AND next_selfie_scheduled_at IS NOT NULL
      AND NOW() >= next_selfie_scheduled_at
  LOOP
    PERFORM public.check_rider_selfie_due(v_rider.id);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- 15. Realtime publication additions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'rider_selfie_verifications'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.rider_selfie_verifications;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tier_configurations'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.tier_configurations;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'rider_order_payouts'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.rider_order_payouts;
    END IF;
  END IF;
END $$;

COMMIT;
