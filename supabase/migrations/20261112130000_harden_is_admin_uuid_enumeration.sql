-- ==============================================================================
-- 🍅 TOMATTTO FOOD DELIVERY PLATFORM: HARDEN IS_ADMIN AGAINST ARBITRARY ENUMERATION
-- Migration: 20261112130000_harden_is_admin_uuid_enumeration.sql
-- Description:
--   Hardens public.is_admin(p_user_id UUID) to prevent arbitrary UUID probing
--   and administrator enumeration by anonymous or unauthorized authenticated callers.
--
-- Security Rules Enforced:
--   1. If p_user_id IS NULL, immediately returns FALSE.
--   2. If executing in trusted service-role / superuser context, allows checking the supplied UUID.
--   3. For anonymous callers (auth.uid() IS NULL), immediately returns FALSE.
--   4. For authenticated callers, returns FALSE if p_user_id IS DISTINCT FROM auth.uid()
--      (preventing callers from probing whether other UUIDs are administrators).
--   5. Only after caller identity checks pass, queries public.profiles for role = 'admin'.
--   6. Preserves SECURITY DEFINER, STABLE, and search_path = pg_catalog, public.
--   7. Preserves EXECUTE grant for anon, authenticated, and service_role so public
--      browsing RLS policies continue to evaluate cleanly without permission errors.
-- ==============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
BEGIN
  -- 1. Return FALSE immediately if input is NULL
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 2. Trusted service_role / superuser context is allowed to check any supplied UUID
  IF public.is_service_role() THEN
    RETURN EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = p_user_id AND role = 'admin'
    );
  END IF;

  -- 3. Anonymous callers (auth.uid() IS NULL) cannot be administrators and cannot probe UUIDs
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 4. Authenticated callers may strictly only check their own UUID (anti-enumeration)
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RETURN FALSE;
  END IF;

  -- 5. Caller identity verified: check if caller has 'admin' role in public.profiles
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id AND role = 'admin'
  );
END;
$$;

-- Ensure function ownership remains postgres
ALTER FUNCTION public.is_admin(UUID) OWNER TO postgres;

-- Preserve execute grants: required by public restaurant-browsing and general RLS policies
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.is_admin(UUID) IS
'Evaluates whether a user is an administrator with caller-identity validation to prevent arbitrary UUID enumeration.';

COMMIT;
