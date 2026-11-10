-- ==============================================================================
-- 🍅 TOMATTTO FOOD DELIVERY PLATFORM: HOTFIX PATCH
-- File: supabase/patches/20261110_fix_protect_rider_fields.sql
-- Description:
--   Removes invalid references to non-existent 'updated_at' and 'created_at'
--   columns on public.riders in public.protect_rider_fields().
--   Preserves service-role bypass, authentication, non-admin immutability checks,
--   SECURITY DEFINER, and search_path = public.
--   Leaves the existing trg_protect_rider_fields trigger intact.
-- ==============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.protect_rider_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Trusted backend service role bypass (no updated_at column on riders)
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  -- 2. Authentication check: unauthenticated callers cannot modify rider details
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Unauthenticated users cannot modify rider details.';
  END IF;

  -- 3. Non-admin users cannot alter protected structural and financial fields
  IF NOT public.is_admin(auth.uid()) THEN
    IF (OLD.id IS DISTINCT FROM NEW.id) THEN
      RAISE EXCEPTION 'Access denied: Rider ID is immutable.';
    END IF;
    IF (OLD.profile_id IS DISTINCT FROM NEW.profile_id) THEN
      RAISE EXCEPTION 'Access denied: Rider profile link cannot be changed.';
    END IF;
    IF (OLD.is_verified IS DISTINCT FROM NEW.is_verified) THEN
      RAISE EXCEPTION 'Access denied: Rider verification can only be modified by administrators.';
    END IF;
    IF (OLD.rating IS DISTINCT FROM NEW.rating) THEN
      RAISE EXCEPTION 'Access denied: Rider rating cannot be directly edited.';
    END IF;
    IF (OLD.total_deliveries IS DISTINCT FROM NEW.total_deliveries) THEN
      RAISE EXCEPTION 'Access denied: Rider delivery count is updated automatically.';
    END IF;
    IF (OLD.earnings_today IS DISTINCT FROM NEW.earnings_today) THEN
      RAISE EXCEPTION 'Access denied: Rider earnings cannot be modified directly.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.protect_rider_fields() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.protect_rider_fields() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.protect_rider_fields() TO authenticated, service_role;

COMMIT;
