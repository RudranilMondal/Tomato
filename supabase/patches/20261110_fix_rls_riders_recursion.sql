-- ==============================================================================
-- 🍅 TOMATTTO FOOD DELIVERY PLATFORM: HOTFIX PATCH
-- File: supabase/patches/20261110_fix_rls_riders_recursion.sql
-- Description:
--   Resolves "infinite recursion detected in policy for relation riders" while
--   strictly preventing SECURITY DEFINER argument spoofing:
--     1. can_view_rider(p_rider_id UUID): Single argument. Looks up actual rider
--        profile_id internally from public.riders and derives caller from auth.uid().
--     2. is_rider_user(p_rider_id UUID): Single argument. Checks caller auth.uid()
--        against rider profile_id internally, preventing spoofed user_id inputs.
--     3. Preserves EXECUTE on public.is_admin() for anon so anonymous restaurant
--        browsing is never broken.
--     4. Drops deprecated two-argument signatures and updates all policies.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. SECURITY DEFINER HELPER: IS_ADMIN (Hardened search_path & preserved anon grant)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id AND role = 'admin'
  );
END;
$$;

ALTER FUNCTION public.is_admin(UUID) OWNER TO postgres;
-- Preserve execute for anon so public restaurant browsing policies evaluate safely
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 2. SECURITY DEFINER HELPER: CAN_VIEW_RIDER (Single argument - Anti-spoofing)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_view_rider(p_rider_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
DECLARE
  v_caller_id UUID;
  v_rider_profile_id UUID;
BEGIN
  -- 1. Missing argument check
  IF p_rider_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 2. Service role bypass
  IF public.is_service_role() THEN
    RETURN TRUE;
  END IF;

  -- 3. Caller authentication check
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 4. Retrieve actual profile_id internally (prevents caller argument spoofing)
  -- Bypasses public.riders RLS because function runs as postgres (SECURITY DEFINER)
  SELECT profile_id INTO v_rider_profile_id
  FROM public.riders
  WHERE id = p_rider_id;

  IF NOT FOUND OR v_rider_profile_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 5. Rider self-access (rider viewing own record)
  IF v_caller_id = v_rider_profile_id THEN
    RETURN TRUE;
  END IF;

  -- 6. Platform administrator access
  IF public.is_admin(v_caller_id) THEN
    RETURN TRUE;
  END IF;

  -- 7. Assigned customer or restaurant owner during active delivery
  -- SECURITY DEFINER execution bypasses public.orders RLS, breaking the recursion cycle.
  RETURN EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.rider_id = p_rider_id
      AND (
        o.customer_id = v_caller_id
        OR EXISTS (
          SELECT 1 FROM public.restaurants r
          WHERE r.id = o.restaurant_id
            AND r.owner_id = v_caller_id
        )
      )
      AND o.status IN ('rider_assigned'::order_status, 'picked_up'::order_status, 'out_for_delivery'::order_status)
  );
END;
$$;

ALTER FUNCTION public.can_view_rider(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.can_view_rider(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_view_rider(UUID) TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 3. SECURITY DEFINER HELPER: IS_RIDER_USER (Single argument - Anti-spoofing)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_rider_user(p_rider_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
DECLARE
  v_caller_id UUID;
BEGIN
  -- 1. Validate input
  IF p_rider_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 2. Service role bypass
  IF public.is_service_role() THEN
    RETURN TRUE;
  END IF;

  -- 3. Caller authentication check
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 4. Verify caller matches the actual rider profile_id internally (no spoofable user arg)
  -- Bypasses public.riders RLS because function runs as postgres (SECURITY DEFINER)
  RETURN EXISTS (
    SELECT 1 FROM public.riders
    WHERE id = p_rider_id AND profile_id = v_caller_id
  );
END;
$$;

ALTER FUNCTION public.is_rider_user(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_rider_user(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_rider_user(UUID) TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 4. UPDATE PUBLIC.RIDERS SELECT POLICY
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authorized users view riders" ON public.riders;
CREATE POLICY "Authorized users view riders"
  ON public.riders FOR SELECT
  USING (
    public.can_view_rider(id)
  );

-- ------------------------------------------------------------------------------
-- 5. UPDATE PUBLIC.ORDERS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authorized users view orders" ON public.orders;
CREATE POLICY "Authorized users view orders"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = customer_id
    OR EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid())
    OR public.is_rider_user(rider_id)
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Authorized parties can update order status" ON public.orders;
CREATE POLICY "Authorized parties can update order status"
  ON public.orders FOR UPDATE
  USING (
    auth.uid() = customer_id
    OR EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid())
    OR public.is_rider_user(rider_id)
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 6. UPDATE RELATED POLICIES (ORDER_ITEMS & RIDER_EARNINGS)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authorized users view order items" ON public.order_items;
CREATE POLICY "Authorized users view order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (
          o.customer_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = o.restaurant_id AND r.owner_id = auth.uid())
          OR public.is_rider_user(o.rider_id)
          OR public.is_admin(auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "Riders view their earnings" ON public.rider_earnings;
CREATE POLICY "Riders view their earnings"
  ON public.rider_earnings FOR SELECT
  USING (
    public.is_rider_user(rider_id)
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 7. CLEAN UP DEPRECATED TWO-ARGUMENT HELPER FUNCTIONS
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.can_view_rider(UUID, UUID);
DROP FUNCTION IF EXISTS public.is_rider_user(UUID, UUID);

COMMIT;
