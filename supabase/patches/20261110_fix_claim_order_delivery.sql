-- ==============================================================================
-- 🍅 TOMATTTO FOOD DELIVERY PLATFORM: HOTFIX PATCH (MINIMAL)
-- File: supabase/patches/20261110_fix_claim_order_delivery.sql
-- Description:
--   Minimal, local-only patch that removes 'updated_at = NOW()' assignment
--   on public.riders in claim_order_delivery().
--   Preserves 'updated_at = NOW()' on public.orders and all authorization,
--   locking, verification, and status validation logic.
-- ==============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.claim_order_delivery(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_caller_id UUID;
  v_rider RECORD;
  v_order RECORD;
BEGIN
  -- 1. Authentication check
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'You must be logged in to claim deliveries.'
    );
  END IF;

  -- 2. Exclusively lock candidate order row FIRST (orders -> riders lock ordering)
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ORDER_NOT_FOUND',
      'message', 'The requested order does not exist.'
    );
  END IF;

  -- 3. Validate order eligibility for delivery claim
  IF v_order.rider_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ALREADY_ASSIGNED',
      'message', 'This order has already been claimed by another delivery partner.'
    );
  END IF;

  IF v_order.status NOT IN ('ready', 'preparing') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ORDER_NOT_CLAIMABLE',
      'message', format('Order status is "%s" and is not eligible for delivery assignment.', v_order.status)
    );
  END IF;

  -- 4. Exclusively lock the caller's rider row SECOND
  SELECT * INTO v_rider
  FROM public.riders
  WHERE profile_id = v_caller_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NOT_A_RIDER',
      'message', 'No registered delivery partner profile found for this account.'
    );
  END IF;

  IF v_rider.is_verified IS NOT TRUE THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'RIDER_UNVERIFIED',
      'message', 'Your delivery partner account is pending admin verification.'
    );
  END IF;

  IF v_rider.status <> 'online' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'RIDER_NOT_ONLINE',
      'message', 'You must be online to claim delivery orders. Switch your status to online first.'
    );
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.orders
    WHERE rider_id = v_rider.id
      AND status IN ('rider_assigned', 'picked_up', 'out_for_delivery')
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ACTIVE_DELIVERY_EXISTS',
      'message', 'You already have an active order in progress. Complete it first.'
    );
  END IF;

  -- 5. Atomically bind order to rider and advance status (preserves orders.updated_at)
  UPDATE public.orders
  SET
    rider_id = v_rider.id,
    status = 'rider_assigned',
    updated_at = NOW()
  WHERE id = p_order_id;

  -- 6. Transition rider status to 'busy' (NO updated_at column on riders table)
  UPDATE public.riders
  SET
    status = 'busy'
  WHERE id = v_rider.id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order.id,
    'rider_id', v_rider.id,
    'status', 'rider_assigned',
    'message', 'Order claimed successfully. Head to the restaurant for pickup.'
  );
END;
$$;

ALTER FUNCTION public.claim_order_delivery(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.claim_order_delivery(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_order_delivery(UUID) TO authenticated, service_role;

COMMIT;
