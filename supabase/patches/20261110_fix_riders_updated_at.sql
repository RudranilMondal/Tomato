-- ==============================================================================
-- 🍅 TOMATTTO FOOD DELIVERY PLATFORM: HOTFIX PATCH
-- File: supabase/patches/20261110_fix_riders_updated_at.sql
-- Description:
--   Removes invalid 'updated_at = NOW()' assignments on public.riders from
--   claim_order_delivery(), validate_order_update(), verify_order_delivery_otp(),
--   admin_resolve_order_delivery(), set_rider_availability(), and activate_approved_rider().
--   Preserves 'updated_at = NOW()' on public.orders and maintains all row-locking,
--   authorization, verification, and audit rules.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 0. HARDENED IS_SERVICE_ROLE (RESPECTS POSTGREST JWT CLAIMS)
-- ------------------------------------------------------------------------------
-- Prevents critical defect where checking current_user IN ('postgres') inside a
-- SECURITY DEFINER function causes is_service_role() to always return TRUE,
-- inadvertently bypassing authorization checks for authenticated users.
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
DECLARE
  v_jwt_role TEXT;
BEGIN
  -- 1. Check explicit PostgREST JWT claim first
  BEGIN
    v_jwt_role := COALESCE(
      NULLIF(current_setting('request.jwt.claim.role', true), ''),
      NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
    );
  EXCEPTION WHEN OTHERS THEN
    v_jwt_role := NULL;
  END;

  IF v_jwt_role IS NOT NULL THEN
    RETURN (v_jwt_role = 'service_role');
  END IF;

  -- 2. Supabase auth.role() fallback
  BEGIN
    IF auth.role() = 'service_role' THEN
      RETURN TRUE;
    ELSIF auth.role() IS NOT NULL AND auth.role() <> '' THEN
      RETURN FALSE;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- 3. In the absence of any JWT claims (direct superuser psql session only):
  -- Must check session_user (connection user), NOT current_user (which is postgres inside SECURITY DEFINER)
  IF session_user IN ('postgres', 'supabase_admin', 'service_role') THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

ALTER FUNCTION public.is_service_role() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_service_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_service_role() TO anon, authenticated, service_role, postgres;

-- ------------------------------------------------------------------------------
-- 1. CLAIM_ORDER_DELIVERY (REMOVES RIDERS.UPDATED_AT)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 2. VERIFY_ORDER_DELIVERY_OTP (REMOVES RIDERS.UPDATED_AT)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_order_delivery_otp(p_order_id UUID, p_otp TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_rider_id UUID;
  v_rider_profile_id UUID;
  v_order_status order_status;
  v_actual_otp TEXT;
  v_delivery_verified BOOLEAN;
  v_attempts INTEGER;
  v_is_locked BOOLEAN;
  v_caller_id UUID;
  v_sanitized_otp TEXT;
  v_rider_rec RECORD;
  v_has_concurrent_order BOOLEAN;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED', 'message', 'You must be logged in to verify delivery.');
  END IF;

  v_sanitized_otp := NULLIF(TRIM(REPLACE(COALESCE(p_otp, ''), ' ', '')), '');
  IF v_sanitized_otp IS NULL OR v_sanitized_otp = '0000' OR v_sanitized_otp LIKE '%•%' THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_OTP', 'message', 'Invalid delivery OTP format.');
  END IF;

  -- 1. Exclusively lock order row FIRST
  SELECT rider_id, status INTO v_rider_id, v_order_status
  FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'ORDER_NOT_FOUND', 'message', 'The specified order does not exist.');
  END IF;

  IF v_order_status <> 'out_for_delivery'::order_status THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_STATUS', 'message', format('Order must be in out_for_delivery status (current: %s).', v_order_status));
  END IF;

  -- 2. Exclusively lock order_otps row SECOND
  SELECT delivery_otp, delivery_verified, delivery_attempts, is_delivery_locked
  INTO v_actual_otp, v_delivery_verified, v_attempts, v_is_locked
  FROM public.order_otps WHERE order_id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'OTP_NOT_FOUND', 'message', 'No OTP records found for this order.');
  END IF;

  IF v_is_locked THEN
    RETURN jsonb_build_object('success', false, 'error', 'LOCKED', 'message', 'Delivery OTP verification is locked due to too many failed attempts.');
  END IF;

  IF v_delivery_verified THEN
    RETURN jsonb_build_object('success', false, 'error', 'ALREADY_VERIFIED', 'message', 'Delivery OTP has already been verified.');
  END IF;

  -- 3. Authorization check
  SELECT profile_id INTO v_rider_profile_id FROM public.riders WHERE id = v_rider_id;
  IF v_rider_profile_id IS DISTINCT FROM v_caller_id AND NOT public.is_admin(v_caller_id) AND NOT public.is_service_role() THEN
    RETURN jsonb_build_object('success', false, 'error', 'FORBIDDEN', 'message', 'You are not assigned to this delivery.');
  END IF;

  -- 4. Verify code
  IF v_sanitized_otp IS DISTINCT FROM v_actual_otp THEN
    v_attempts := COALESCE(v_attempts, 0) + 1;
    v_is_locked := (v_attempts >= 5);
    UPDATE public.order_otps
    SET delivery_attempts = v_attempts, is_delivery_locked = v_is_locked, updated_at = NOW()
    WHERE order_id = p_order_id;

    RETURN jsonb_build_object('success', false, 'error', 'INCORRECT_CODE', 'attempts', v_attempts, 'is_locked', v_is_locked, 'message', CASE WHEN v_is_locked THEN 'Max attempts exceeded. Verification locked.' ELSE format('Incorrect delivery OTP. Attempt %s of 5.', v_attempts) END);
  END IF;

  -- 5. Mark verified
  UPDATE public.order_otps
  SET delivery_verified = TRUE, updated_at = NOW()
  WHERE order_id = p_order_id;

  UPDATE public.orders
  SET status = 'delivered'::order_status, updated_at = NOW()
  WHERE id = p_order_id;

  -- 6. Safely release rider (NO updated_at on riders)
  IF v_rider_id IS NOT NULL THEN
    SELECT * INTO v_rider_rec FROM public.riders WHERE id = v_rider_id FOR UPDATE;
    IF FOUND THEN
      SELECT EXISTS (
        SELECT 1 FROM public.orders
        WHERE rider_id = v_rider_id
          AND id <> p_order_id
          AND status IN ('rider_assigned'::order_status, 'picked_up'::order_status, 'out_for_delivery'::order_status)
      ) INTO v_has_concurrent_order;

      IF NOT v_has_concurrent_order THEN
        IF v_rider_rec.status IN ('busy'::rider_status, 'delivering'::rider_status) AND v_rider_rec.is_verified IS TRUE THEN
          UPDATE public.riders
          SET status = 'online'::rider_status
          WHERE id = v_rider_id;
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Delivery verified successfully. Order status updated to delivered.');
END;
$$;

ALTER FUNCTION public.verify_order_delivery_otp(UUID, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.verify_order_delivery_otp(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_order_delivery_otp(UUID, TEXT) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 3. ADMIN_RESOLVE_ORDER_DELIVERY (REMOVES RIDERS.UPDATED_AT)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_resolve_order_delivery(
  p_order_id UUID,
  p_resolution_action TEXT,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_caller_id UUID;
  v_order RECORD;
  v_rider_rec RECORD;
  v_has_concurrent_order BOOLEAN;
  v_target_status order_status;
  v_status_note TEXT;
BEGIN
  v_caller_id := auth.uid();
  IF (v_caller_id IS NULL OR NOT public.is_admin(v_caller_id)) AND NOT public.is_service_role() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'Access denied: Only platform administrators can execute emergency order resolution.'
    );
  END IF;

  IF p_resolution_action NOT IN ('FORCE_DELIVER', 'CANCEL_UNFULFILLED') THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_ACTION', 'message', 'Permitted actions are FORCE_DELIVER or CANCEL_UNFULFILLED.');
  END IF;

  IF p_reason IS NULL OR length(trim(p_reason)) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'INSUFFICIENT_REASON', 'message', 'A comprehensive reason (minimum 10 characters) is strictly required.');
  END IF;

  -- 1. Exclusively lock candidate order FIRST
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'ORDER_NOT_FOUND', 'message', 'The requested order does not exist.');
  END IF;

  IF p_resolution_action = 'FORCE_DELIVER' THEN
    IF v_order.status NOT IN ('picked_up', 'out_for_delivery') THEN
      RETURN jsonb_build_object('success', false, 'error', 'INVALID_STATUS', 'message', format('FORCE_DELIVER requires order to be in picked_up or out_for_delivery (current: %s).', v_order.status));
    END IF;
    v_target_status := 'delivered'::order_status;
    v_status_note := 'Administrative recovery: Force-marked delivered. Reason: ' || trim(p_reason);
  ELSIF p_resolution_action = 'CANCEL_UNFULFILLED' THEN
    IF v_order.status IN ('delivered', 'cancelled') THEN
      RETURN jsonb_build_object('success', false, 'error', 'ORDER_ALREADY_FINALIZED', 'message', format('Cannot cancel an order in finalized status: %s.', v_order.status));
    END IF;
    v_target_status := 'cancelled'::order_status;
    v_status_note := 'Administrative recovery: Unfulfilled cancellation. Reason: ' || trim(p_reason);
  END IF;

  -- 2. Set transaction-scoped flag for trigger bypass
  PERFORM set_config('tomattto.admin_recovery_in_progress', 'true', true);

  -- 3. Execute order status transition
  UPDATE public.orders
  SET status = v_target_status, updated_at = NOW()
  WHERE id = p_order_id;

  -- Reset recovery session flag immediately after the authorized order update
  PERFORM set_config('tomattto.admin_recovery_in_progress', 'false', true);

  -- 4. Safe rider release (NO updated_at on riders)
  IF v_order.rider_id IS NOT NULL THEN
    SELECT * INTO v_rider_rec
    FROM public.riders
    WHERE id = v_order.rider_id
    FOR UPDATE;

    IF FOUND THEN
      SELECT EXISTS (
        SELECT 1 FROM public.orders
        WHERE rider_id = v_order.rider_id
          AND id <> p_order_id
          AND status IN ('rider_assigned'::order_status, 'picked_up'::order_status, 'out_for_delivery'::order_status)
      ) INTO v_has_concurrent_order;

      IF NOT v_has_concurrent_order THEN
        IF v_rider_rec.status IN ('busy'::rider_status, 'delivering'::rider_status) AND v_rider_rec.is_verified IS TRUE THEN
          UPDATE public.riders
          SET status = 'online'::rider_status
          WHERE id = v_order.rider_id;
        END IF;
      END IF;
    END IF;
  END IF;

  -- 5. Audit logging
  INSERT INTO public.admin_audit_logs (
    admin_id, action, target_type, target_id, details
  ) VALUES (
    v_caller_id,
    'DELIVERY_RECOVERY_' || p_resolution_action,
    'order',
    p_order_id::text,
    jsonb_build_object('previous_status', v_order.status, 'new_status', v_target_status, 'reason', trim(p_reason), 'action', p_resolution_action)
  );

  INSERT INTO public.order_status_history (
    order_id, status, note, changed_by
  ) VALUES (
    p_order_id, v_target_status, v_status_note, v_caller_id
  );

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'previous_status', v_order.status, 'new_status', v_target_status, 'action', p_resolution_action, 'message', 'Administrative delivery recovery executed successfully.');
END;
$$;

ALTER FUNCTION public.admin_resolve_order_delivery(UUID, TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_resolve_order_delivery(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_resolve_order_delivery(UUID, TEXT, TEXT) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 4. VALIDATE_ORDER_UPDATE (REMOVES RIDERS.UPDATED_AT & ENFORCES STATE MACHINE)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_order_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_is_admin BOOLEAN := FALSE;
  v_is_owner BOOLEAN := FALSE;
  v_is_rider BOOLEAN := FALSE;
  v_is_customer BOOLEAN := FALSE;
  v_is_recovery_session BOOLEAN := FALSE;
  v_rider_rec RECORD;
BEGIN
  -- 1. Trusted backend service role check
  IF public.is_service_role() THEN
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  -- 2. Reject unauthenticated/anonymous callers immediately
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Unauthenticated users cannot update orders.';
  END IF;

  -- 3. Administrator audit & boundary check
  v_is_admin := public.is_admin(auth.uid());
  IF v_is_admin THEN
    -- Universal structural immutability (even administrators cannot alter core keys)
    IF (OLD.id IS DISTINCT FROM NEW.id) OR
       (OLD.customer_id IS DISTINCT FROM NEW.customer_id) OR
       (OLD.restaurant_id IS DISTINCT FROM NEW.restaurant_id) OR
       (OLD.created_at IS DISTINCT FROM NEW.created_at) THEN
      RAISE EXCEPTION 'Access denied: Core structural identifiers (id, customer_id, restaurant_id, created_at) are immutable.';
    END IF;

    -- Financial, payment, and OTP immutability on direct administrative updates
    IF (OLD.item_total IS DISTINCT FROM NEW.item_total) OR
       (OLD.delivery_fee IS DISTINCT FROM NEW.delivery_fee) OR
       (OLD.platform_fee IS DISTINCT FROM NEW.platform_fee) OR
       (OLD.tax_amount IS DISTINCT FROM NEW.tax_amount) OR
       (OLD.discount_amount IS DISTINCT FROM NEW.discount_amount) OR
       (OLD.tip_amount IS DISTINCT FROM NEW.tip_amount) OR
       (OLD.total_amount IS DISTINCT FROM NEW.total_amount) OR
       (OLD.applied_coupon IS DISTINCT FROM NEW.applied_coupon) OR
       (OLD.payment_method IS DISTINCT FROM NEW.payment_method) OR
       (OLD.payment_status IS DISTINCT FROM NEW.payment_status) OR
       (OLD.refund_status IS DISTINCT FROM NEW.refund_status) OR
       (OLD.pickup_otp IS DISTINCT FROM NEW.pickup_otp) OR
       (OLD.delivery_otp IS DISTINCT FROM NEW.delivery_otp) THEN
      RAISE EXCEPTION 'Access denied: Core financial values, payment state, and OTP placeholders are immutable.';
    END IF;

    -- Rider assignment immutability on direct administrative updates
    IF (OLD.rider_id IS DISTINCT FROM NEW.rider_id) THEN
      RAISE EXCEPTION 'Access denied: Rider assignment cannot be modified via direct update. Delivery partners claim orders via public.claim_order_delivery().';
    END IF;

    -- Check if this update is authorized through the emergency recovery RPC
    v_is_recovery_session := COALESCE(current_setting('tomattto.admin_recovery_in_progress', true), 'false') = 'true';

    -- Lifecycle transitions for administrators:
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
      IF v_is_recovery_session THEN
        -- Strictly constrain recovery transitions even within recovery session
        IF NOT (
          (OLD.status IN ('picked_up', 'out_for_delivery') AND NEW.status = 'delivered') OR
          (OLD.status NOT IN ('delivered', 'cancelled') AND NEW.status = 'cancelled')
        ) THEN
          RAISE EXCEPTION 'Invalid recovery status transition: % -> %', OLD.status, NEW.status;
        END IF;
      ELSE
        -- Allow only standard operational status interventions via direct update
        IF NOT (
          (OLD.status = 'placed' AND NEW.status IN ('accepted', 'rejected', 'cancelled')) OR
          (OLD.status = 'accepted' AND NEW.status IN ('preparing', 'cancelled')) OR
          (OLD.status = 'preparing' AND NEW.status IN ('ready', 'cancelled')) OR
          (OLD.status = 'rider_assigned' AND NEW.status = 'ready')
        ) THEN
          RAISE EXCEPTION 'Direct administrative lifecycle bypass denied: Transition % -> % requires authorized recovery via public.admin_resolve_order_delivery() with mandatory audit reason.', OLD.status, NEW.status;
        END IF;

        -- Log standard operational administrator status update
        INSERT INTO public.admin_audit_logs (
          admin_id, action, target_type, target_id, details
        ) VALUES (
          auth.uid(),
          'ORDER_STATUS_ADMIN_INTERVENTION',
          'order',
          OLD.id::text,
          jsonb_build_object(
            'old_status', OLD.status,
            'new_status', NEW.status,
            'updated_at', NOW()
          )
        );
      END IF;
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  -- 4. Check if this update is an authorized delivery partner claiming an unassigned order
  IF OLD.rider_id IS NULL AND NEW.rider_id IS NOT NULL THEN
    -- Exclusively lock the rider row to prevent concurrent claims for the same rider
    SELECT * INTO v_rider_rec
    FROM public.riders rd
    WHERE rd.id = NEW.rider_id
      AND rd.profile_id = auth.uid()
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Access denied: Only registered delivery partners can claim orders.';
    END IF;

    IF v_rider_rec.is_verified IS NOT TRUE THEN
      RAISE EXCEPTION 'Access denied: Delivery partner account is pending admin verification.';
    END IF;

    IF v_rider_rec.status NOT IN ('online'::rider_status, 'busy'::rider_status) THEN
      RAISE EXCEPTION 'Access denied: Delivery partner must be online to claim orders.';
    END IF;

    -- Ensure rider does not already have another active incomplete delivery
    IF EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.rider_id = NEW.rider_id
        AND o.id <> OLD.id
        AND o.status IN ('rider_assigned'::order_status, 'picked_up'::order_status, 'out_for_delivery'::order_status)
    ) THEN
      RAISE EXCEPTION 'Active delivery in progress: Delivery partner already has an active order in progress. Complete it first.';
    END IF;

    -- Only allowed from 'ready' or 'preparing' -> 'rider_assigned'
    IF NOT (OLD.status IN ('ready', 'preparing') AND NEW.status = 'rider_assigned') THEN
      RAISE EXCEPTION 'Invalid status transition for claiming order: % -> %. Only preparing or ready orders can transition to rider_assigned.', OLD.status, NEW.status;
    END IF;

    -- Universal immutable fields and customer/address/instruction protections during claim
    IF (OLD.id IS DISTINCT FROM NEW.id) OR
       (OLD.customer_id IS DISTINCT FROM NEW.customer_id) OR
       (OLD.restaurant_id IS DISTINCT FROM NEW.restaurant_id) OR
       (OLD.delivery_address IS DISTINCT FROM NEW.delivery_address) OR
       (OLD.delivery_instructions IS DISTINCT FROM NEW.delivery_instructions) OR
       (OLD.special_cooking_instructions IS DISTINCT FROM NEW.special_cooking_instructions) OR
       (OLD.estimated_prep_minutes IS DISTINCT FROM NEW.estimated_prep_minutes) OR
       (OLD.estimated_delivery_time IS DISTINCT FROM NEW.estimated_delivery_time) OR
       (OLD.item_total IS DISTINCT FROM NEW.item_total) OR
       (OLD.delivery_fee IS DISTINCT FROM NEW.delivery_fee) OR
       (OLD.platform_fee IS DISTINCT FROM NEW.platform_fee) OR
       (OLD.tax_amount IS DISTINCT FROM NEW.tax_amount) OR
       (OLD.discount_amount IS DISTINCT FROM NEW.discount_amount) OR
       (OLD.tip_amount IS DISTINCT FROM NEW.tip_amount) OR
       (OLD.total_amount IS DISTINCT FROM NEW.total_amount) OR
       (OLD.applied_coupon IS DISTINCT FROM NEW.applied_coupon) OR
       (OLD.payment_method IS DISTINCT FROM NEW.payment_method) OR
       (OLD.payment_status IS DISTINCT FROM NEW.payment_status) OR
       (OLD.refund_status IS DISTINCT FROM NEW.refund_status) OR
       (OLD.pickup_otp IS DISTINCT FROM NEW.pickup_otp) OR
       (OLD.delivery_otp IS DISTINCT FROM NEW.delivery_otp) OR
       (OLD.created_at IS DISTINCT FROM NEW.created_at) THEN
      RAISE EXCEPTION 'Access denied: Core order identifiers, delivery address, instructions, OTPs, financial values, and payment status are immutable during order assignment.';
    END IF;

    -- Update rider status to 'busy' if still online (NO updated_at on riders)
    IF v_rider_rec.status = 'online'::rider_status THEN
      UPDATE public.riders
      SET status = 'busy'::rider_status
      WHERE id = NEW.rider_id;
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  v_is_customer := (auth.uid() = OLD.customer_id);
  v_is_owner := EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = OLD.restaurant_id AND r.owner_id = auth.uid()
  );
  v_is_rider := EXISTS (
    SELECT 1 FROM public.riders rd
    WHERE rd.id = OLD.rider_id AND rd.profile_id = auth.uid()
  );

  -- 5. Universal immutable fields for all non-admin roles:
  IF (OLD.id IS DISTINCT FROM NEW.id) OR
     (OLD.customer_id IS DISTINCT FROM NEW.customer_id) OR
     (OLD.restaurant_id IS DISTINCT FROM NEW.restaurant_id) OR
     (OLD.item_total IS DISTINCT FROM NEW.item_total) OR
     (OLD.delivery_fee IS DISTINCT FROM NEW.delivery_fee) OR
     (OLD.platform_fee IS DISTINCT FROM NEW.platform_fee) OR
     (OLD.tax_amount IS DISTINCT FROM NEW.tax_amount) OR
     (OLD.discount_amount IS DISTINCT FROM NEW.discount_amount) OR
     (OLD.tip_amount IS DISTINCT FROM NEW.tip_amount) OR
     (OLD.total_amount IS DISTINCT FROM NEW.total_amount) OR
     (OLD.applied_coupon IS DISTINCT FROM NEW.applied_coupon) OR
     (OLD.payment_method IS DISTINCT FROM NEW.payment_method) OR
     (OLD.payment_status IS DISTINCT FROM NEW.payment_status) OR
     (OLD.refund_status IS DISTINCT FROM NEW.refund_status) OR
     (OLD.pickup_otp IS DISTINCT FROM NEW.pickup_otp) OR
     (OLD.delivery_otp IS DISTINCT FROM NEW.delivery_otp) OR
     (OLD.created_at IS DISTINCT FROM NEW.created_at) THEN
    RAISE EXCEPTION 'Access denied: Core order identifiers, OTPs, financial values, and payment status are immutable.';
  END IF;

  -- 6. Validate customer permissions
  IF v_is_customer THEN
    IF (OLD.rider_id IS DISTINCT FROM NEW.rider_id) OR
       (OLD.delivery_address IS DISTINCT FROM NEW.delivery_address) OR
       (OLD.special_cooking_instructions IS DISTINCT FROM NEW.special_cooking_instructions) OR
       (OLD.estimated_prep_minutes IS DISTINCT FROM NEW.estimated_prep_minutes) OR
       (OLD.estimated_delivery_time IS DISTINCT FROM NEW.estimated_delivery_time) THEN
      RAISE EXCEPTION 'Access denied: Customers cannot alter rider assignment, delivery address, cooking instructions, or preparation estimates.';
    END IF;

    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
      IF NOT (OLD.status IN ('placed', 'accepted') AND NEW.status = 'cancelled') THEN
        RAISE EXCEPTION 'Customers can only cancel orders before food preparation starts.';
      END IF;
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  -- 7. Validate restaurant owner permissions
  IF v_is_owner THEN
    IF (OLD.rider_id IS DISTINCT FROM NEW.rider_id) OR
       (OLD.delivery_address IS DISTINCT FROM NEW.delivery_address) OR
       (OLD.delivery_instructions IS DISTINCT FROM NEW.delivery_instructions) OR
       (OLD.special_cooking_instructions IS DISTINCT FROM NEW.special_cooking_instructions) THEN
      RAISE EXCEPTION 'Access denied: Restaurant owners cannot modify rider assignment, delivery address, or customer instructions.';
    END IF;

    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
      IF NOT (
        (OLD.status = 'placed' AND NEW.status IN ('accepted', 'rejected')) OR
        (OLD.status = 'accepted' AND NEW.status = 'preparing') OR
        (OLD.status = 'preparing' AND NEW.status = 'ready') OR
        (OLD.status = 'rider_assigned' AND NEW.status = 'ready')
      ) THEN
        RAISE EXCEPTION 'Invalid status transition for restaurant owner: % -> %', OLD.status, NEW.status;
      END IF;
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  -- 8. Validate rider permissions
  IF v_is_rider THEN
    IF (OLD.rider_id IS DISTINCT FROM NEW.rider_id) OR
       (OLD.delivery_address IS DISTINCT FROM NEW.delivery_address) OR
       (OLD.delivery_instructions IS DISTINCT FROM NEW.delivery_instructions) OR
       (OLD.special_cooking_instructions IS DISTINCT FROM NEW.special_cooking_instructions) OR
       (OLD.estimated_prep_minutes IS DISTINCT FROM NEW.estimated_prep_minutes) OR
       (OLD.estimated_delivery_time IS DISTINCT FROM NEW.estimated_delivery_time) THEN
      RAISE EXCEPTION 'Access denied: Riders can only update order delivery status.';
    END IF;

    -- Strict sequence: ready/rider_assigned -> picked_up -> out_for_delivery -> delivered
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
      IF (OLD.status IN ('ready', 'rider_assigned') AND NEW.status = 'picked_up') THEN
        IF NOT EXISTS (
          SELECT 1 FROM public.order_otps
          WHERE order_id = OLD.id AND pickup_verified = TRUE
        ) THEN
          RAISE EXCEPTION 'Direct update denied: Order pickup requires verified pickup OTP via verify_order_pickup_otp().';
        END IF;
      ELSIF (OLD.status = 'picked_up' AND NEW.status = 'out_for_delivery') THEN
        NULL;
      ELSIF (OLD.status = 'out_for_delivery' AND NEW.status = 'delivered') THEN
        IF NOT EXISTS (
          SELECT 1 FROM public.order_otps
          WHERE order_id = OLD.id AND delivery_verified = TRUE
        ) THEN
          RAISE EXCEPTION 'Direct update denied: Order delivery requires verified delivery OTP via verify_order_delivery_otp().';
        END IF;
      ELSE
        RAISE EXCEPTION 'Invalid status transition for rider: % -> %. Riders must follow sequence: ready/rider_assigned -> picked_up -> out_for_delivery -> delivered.', OLD.status, NEW.status;
      END IF;
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Access denied: You are not authorized to update this order.';
END;
$$;

ALTER FUNCTION public.validate_order_update() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.validate_order_update() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validate_order_update() TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 5. SET_RIDER_AVAILABILITY (REMOVES RIDERS.UPDATED_AT)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_rider_availability(p_status rider_status)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_caller_id UUID;
  v_rider RECORD;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED', 'message', 'Must be authenticated.');
  END IF;

  SELECT * INTO v_rider
  FROM public.riders
  WHERE profile_id = v_caller_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_A_RIDER', 'message', 'No rider profile found.');
  END IF;

  IF v_rider.is_verified IS NOT TRUE THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNVERIFIED', 'message', 'Account is pending verification.');
  END IF;

  -- If rider has an active order, prevent manually setting to offline
  IF p_status = 'offline' AND EXISTS (
    SELECT 1 FROM public.orders
    WHERE rider_id = v_rider.id AND status IN ('rider_assigned'::order_status, 'picked_up'::order_status, 'out_for_delivery'::order_status)
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ACTIVE_ORDER',
      'message', 'Cannot go offline while an active delivery is in progress.'
    );
  END IF;

  UPDATE public.riders
  SET status = p_status
  WHERE id = v_rider.id;

  RETURN jsonb_build_object('success', true, 'status', p_status, 'message', 'Availability updated successfully.');
END;
$$;

ALTER FUNCTION public.set_rider_availability(rider_status) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.set_rider_availability(rider_status) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_rider_availability(rider_status) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 6. ACTIVATE_APPROVED_RIDER (REMOVES RIDERS.UPDATED_AT & CREATED_AT)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.activate_approved_rider(
  p_application_id UUID,
  p_action TEXT, -- 'approve' or 'reject'
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_caller_id UUID;
  v_app RECORD;
  v_existing_rider UUID;
BEGIN
  -- 1. Authorization: strictly platform administrator
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL OR NOT public.is_admin(v_caller_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'FORBIDDEN',
      'message', 'Access denied: Only platform administrators can activate delivery partners.'
    );
  END IF;

  -- 2. Fetch and lock application
  SELECT * INTO v_app
  FROM public.rider_applications
  WHERE id = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'APPLICATION_NOT_FOUND',
      'message', 'Rider application not found.'
    );
  END IF;

  -- Validate application is in a reviewable state
  IF v_app.status NOT IN ('submitted', 'in_review') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_APPLICATION_STATUS',
      'message', format('Application is currently in status "%s" and cannot be reviewed.', v_app.status)
    );
  END IF;

  -- 3. Handle Rejection
  IF p_action = 'reject' THEN
    UPDATE public.rider_applications
    SET
      status = 'rejected',
      rejection_reason = COALESCE(p_rejection_reason, 'Application rejected by platform administrator.'),
      reviewed_by = v_caller_id,
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = p_application_id;

    RETURN jsonb_build_object(
      'success', true,
      'action', 'rejected',
      'application_id', p_application_id,
      'message', 'Rider application has been rejected.'
    );
  END IF;

  -- 4. Handle Approval & Activation
  IF p_action = 'approve' THEN
    UPDATE public.rider_applications
    SET
      status = 'approved',
      rejection_reason = NULL,
      reviewed_by = v_caller_id,
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = p_application_id;

    -- If application is linked to a user profile, safely update profile role
    IF v_app.user_id IS NOT NULL THEN
      -- Only update profile role to 'rider' if current role is 'customer'
      -- to avoid demoting administrators or restaurant owners
      UPDATE public.profiles
      SET
        role = 'rider',
        updated_at = NOW()
      WHERE id = v_app.user_id AND role = 'customer';

      -- Check if public.riders row already exists for this profile
      SELECT id INTO v_existing_rider
      FROM public.riders
      WHERE profile_id = v_app.user_id;

      IF v_existing_rider IS NOT NULL THEN
        UPDATE public.riders
        SET
          is_verified = TRUE,
          vehicle_type = v_app.vehicle_type,
          vehicle_number = v_app.vehicle_number,
          driving_license_number = v_app.driving_license_number,
          emergency_contact_phone = v_app.emergency_contact_phone
        WHERE id = v_existing_rider;
      ELSE
        INSERT INTO public.riders (
          profile_id,
          vehicle_type,
          vehicle_number,
          driving_license_number,
          status,
          is_verified,
          emergency_contact_phone
        ) VALUES (
          v_app.user_id,
          v_app.vehicle_type,
          v_app.vehicle_number,
          v_app.driving_license_number,
          'offline',
          TRUE,
          v_app.emergency_contact_phone
        );
      END IF;
    END IF;

    RETURN jsonb_build_object(
      'success', true,
      'action', 'approved',
      'application_id', p_application_id,
      'message', 'Rider application approved and delivery partner profile activated successfully.'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', false,
    'error', 'INVALID_ACTION',
    'message', format('Unsupported action "%s". Allowed actions are "approve" or "reject".', p_action)
  );
END;
$$;

ALTER FUNCTION public.activate_approved_rider(UUID, TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.activate_approved_rider(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.activate_approved_rider(UUID, TEXT, TEXT) TO authenticated, service_role;

COMMIT;
