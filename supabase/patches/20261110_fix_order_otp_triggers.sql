-- ==============================================================================
-- 🍅 TOMATTTO FOOD DELIVERY PLATFORM: HOTFIX PATCH
-- File: supabase/patches/20261110_fix_order_otp_triggers.sql
-- Description:
--   Narrowly scoped, transactional patch to resolve order_otps_order_id_fkey
--   foreign key violation in running local Supabase database.
--   Replaces the legacy single BEFORE INSERT trigger with:
--     1. trg_mask_order_otps: BEFORE INSERT ON orders (masks and stages OTPs)
--     2. trg_sync_order_otps: AFTER INSERT ON orders (persists to order_otps)
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. BEFORE INSERT TRIGGER FUNCTION: MASK & STAGE OTPS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mask_order_otps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions
AS $$
DECLARE
  v_pickup_otp TEXT;
  v_delivery_otp TEXT;
BEGIN
  -- Ensure NEW.id is established for transaction-local correlation
  IF NEW.id IS NULL THEN
    NEW.id := gen_random_uuid();
  END IF;

  -- Generate unbiased 4-digit OTPs in range [1000, 9999] via rejection sampling.
  -- Trusted backend service role and platform administrators may supply custom initial OTPs.
  IF public.is_service_role() OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())) THEN
    v_pickup_otp := COALESCE(
      NULLIF(REPLACE(NEW.pickup_otp, '•', ''), ''),
      public.generate_unbiased_otp()
    );
    v_delivery_otp := COALESCE(
      NULLIF(REPLACE(NEW.delivery_otp, '•', ''), ''),
      public.generate_unbiased_otp()
    );
  ELSE
    v_pickup_otp := public.generate_unbiased_otp();
    v_delivery_otp := public.generate_unbiased_otp();
  END IF;

  -- Stage pending OTPs in a transaction-local setting keyed by sanitized order ID
  PERFORM set_config(
    'app.pending_order_otp_' || replace(NEW.id::text, '-', '_'),
    json_build_object('pickup_otp', v_pickup_otp, 'delivery_otp', v_delivery_otp)::text,
    true
  );

  -- Mask plaintext OTPs in public.orders so ordinary queries and Realtime do not expose them
  NEW.pickup_otp := '••••';
  NEW.delivery_otp := '••••';

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.mask_order_otps() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.mask_order_otps() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mask_order_otps() TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 2. AFTER INSERT TRIGGER FUNCTION: CREATE ORDER_OTPS CHILD RECORD
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_order_otps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions
AS $$
DECLARE
  v_setting TEXT;
  v_otp_data JSONB;
  v_pickup_otp TEXT;
  v_delivery_otp TEXT;
BEGIN
  -- Retrieve staged OTPs from transaction-local storage
  v_setting := NULLIF(current_setting('app.pending_order_otp_' || replace(NEW.id::text, '-', '_'), true), '');
  IF v_setting IS NOT NULL THEN
    v_otp_data := v_setting::jsonb;
    v_pickup_otp := v_otp_data->>'pickup_otp';
    v_delivery_otp := v_otp_data->>'delivery_otp';
    -- Clean up transaction-local configuration
    PERFORM set_config('app.pending_order_otp_' || replace(NEW.id::text, '-', '_'), '', true);
  END IF;

  -- Fallback if staged configuration was absent (e.g. direct backend bypass)
  IF v_pickup_otp IS NULL OR v_delivery_otp IS NULL THEN
    v_pickup_otp := public.generate_unbiased_otp();
    v_delivery_otp := public.generate_unbiased_otp();
  END IF;

  -- Parent order row now exists in public.orders, satisfying order_otps_order_id_fkey
  INSERT INTO public.order_otps (
    order_id,
    pickup_otp,
    delivery_otp,
    pickup_attempts,
    delivery_attempts,
    max_attempts,
    is_pickup_locked,
    is_delivery_locked
  ) VALUES (
    NEW.id,
    v_pickup_otp,
    v_delivery_otp,
    0,
    0,
    5,
    FALSE,
    FALSE
  )
  ON CONFLICT (order_id) DO UPDATE SET
    pickup_otp = EXCLUDED.pickup_otp,
    delivery_otp = EXCLUDED.delivery_otp;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.sync_order_otps() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.sync_order_otps() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_order_otps() TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 3. REPLACE TRIGGERS ON PUBLIC.ORDERS
-- ------------------------------------------------------------------------------

-- Drop legacy BEFORE INSERT trigger on sync_order_otps
DROP TRIGGER IF EXISTS trg_sync_order_otps ON public.orders;

-- Install BEFORE INSERT trigger for masking
DROP TRIGGER IF EXISTS trg_mask_order_otps ON public.orders;
CREATE TRIGGER trg_mask_order_otps
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.mask_order_otps();

-- Install AFTER INSERT trigger for synchronization
CREATE TRIGGER trg_sync_order_otps
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_order_otps();

COMMIT;
