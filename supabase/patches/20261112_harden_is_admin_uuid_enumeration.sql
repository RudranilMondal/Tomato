-- ==============================================================================
-- 🍅 TOMATTTO FOOD DELIVERY PLATFORM: HARDEN IS_ADMIN AGAINST ARBITRARY ENUMERATION
-- Patch: 20261112_harden_is_admin_uuid_enumeration.sql
-- Description:
--   Hardens public.is_admin(p_user_id UUID) to prevent arbitrary UUID probing
--   and administrator enumeration by anonymous or unauthorized authenticated callers.
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

ALTER FUNCTION public.is_admin(UUID) OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon, authenticated, service_role;

COMMIT;
