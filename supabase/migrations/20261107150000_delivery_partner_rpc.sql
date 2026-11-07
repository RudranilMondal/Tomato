-- ==============================================================================
-- 🍅 TOMATTTO DELIVERY PARTNER SYSTEM: RPC LAYER & ATOMIC DISPATCH
-- Migration: 20261107150000_delivery_partner_rpc.sql
-- Description:
--   1. Schema alignment: Ensure driving_license_number exists on public.riders.
--   2. Order validation trigger update: Resolves claim_order_delivery conflict,
--      authorizing verified online riders to claim unassigned orders (ready/preparing -> rider_assigned)
--      while preserving strict immutability of financial, OTP, customer, and address fields.
--   3. Synchronized verify_order_pickup_otp: Permits pickup validation from both 'ready' and 'rider_assigned' states.
--   4. Atomic order claiming RPC with row-level locks (claim_order_delivery).
--   5. Verified rider availability toggle RPC (set_rider_availability).
--   6. Privacy-preserving delivery query RPC (get_available_delivery_orders) masking sensitive customer PII.
--   7. Administrator partner application activation RPC (activate_approved_rider) with role protection.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. SCHEMA ALIGNMENT
-- ------------------------------------------------------------------------------
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS driving_license_number TEXT;

-- ------------------------------------------------------------------------------
-- 1. ORDER VALIDATION TRIGGER UPDATE (RESOLVE CLAIM CONFLICT)
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
  v_is_claiming_rider BOOLEAN := FALSE;
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

  -- 3. Administrator check
  v_is_admin := public.is_admin(auth.uid());
  IF v_is_admin THEN
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  -- 4. Check if this update is an authorized delivery partner claiming an unassigned order
  IF OLD.rider_id IS NULL AND NEW.rider_id IS NOT NULL THEN
    v_is_claiming_rider := EXISTS (
      SELECT 1 FROM public.riders rd
      WHERE rd.id = NEW.rider_id
        AND rd.profile_id = auth.uid()
        AND rd.is_verified IS TRUE
        AND rd.status = 'online'
    );

    IF v_is_claiming_rider THEN
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

      NEW.updated_at := NOW();
      RETURN NEW;
    ELSE
      RAISE EXCEPTION 'Access denied: Only verified, online delivery partners can claim orders.';
    END IF;
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
    -- Customer CANNOT change delivery assignment, restaurant estimates, addresses once placed, or cooking instructions
    IF (OLD.rider_id IS DISTINCT FROM NEW.rider_id) OR
       (OLD.delivery_address IS DISTINCT FROM NEW.delivery_address) OR
       (OLD.special_cooking_instructions IS DISTINCT FROM NEW.special_cooking_instructions) OR
       (OLD.estimated_prep_minutes IS DISTINCT FROM NEW.estimated_prep_minutes) OR
       (OLD.estimated_delivery_time IS DISTINCT FROM NEW.estimated_delivery_time) THEN
      RAISE EXCEPTION 'Access denied: Customers cannot alter rider assignment, delivery address, cooking instructions, or preparation estimates.';
    END IF;

    -- Customer may only cancel an unfulfilled order or update delivery instructions
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
    -- Restaurant owner CANNOT change rider assignment, delivery address, or customer instructions
    IF (OLD.rider_id IS DISTINCT FROM NEW.rider_id) OR
       (OLD.delivery_address IS DISTINCT FROM NEW.delivery_address) OR
       (OLD.delivery_instructions IS DISTINCT FROM NEW.delivery_instructions) OR
       (OLD.special_cooking_instructions IS DISTINCT FROM NEW.special_cooking_instructions) THEN
      RAISE EXCEPTION 'Access denied: Restaurant owners cannot modify rider assignment, delivery address, or customer instructions.';
    END IF;

    -- Restaurant owner can transition: placed -> accepted, accepted -> preparing, preparing -> ready, placed -> rejected
    -- Also allow transition to ready if order was already claimed while preparing (rider_assigned -> ready)
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
    -- Rider CANNOT reassign order, change delivery address, instructions, or preparation estimates
    IF (OLD.rider_id IS DISTINCT FROM NEW.rider_id) OR
       (OLD.delivery_address IS DISTINCT FROM NEW.delivery_address) OR
       (OLD.delivery_instructions IS DISTINCT FROM NEW.delivery_instructions) OR
       (OLD.special_cooking_instructions IS DISTINCT FROM NEW.special_cooking_instructions) OR
       (OLD.estimated_prep_minutes IS DISTINCT FROM NEW.estimated_prep_minutes) OR
       (OLD.estimated_delivery_time IS DISTINCT FROM NEW.estimated_delivery_time) THEN
      RAISE EXCEPTION 'Access denied: Riders can only update order delivery status.';
    END IF;

    -- Strict intended sequence: ready/rider_assigned -> picked_up -> out_for_delivery -> delivered
    -- Direct updates cannot bypass atomic OTP verification
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
      IF (OLD.status IN ('ready', 'rider_assigned') AND NEW.status = 'picked_up') THEN
        IF NOT EXISTS (
          SELECT 1 FROM public.order_otps 
          WHERE order_id = OLD.id AND pickup_verified = TRUE
        ) THEN
          RAISE EXCEPTION 'Direct update denied: Order pickup requires verified pickup OTP via verify_order_pickup_otp().';
        END IF;
      ELSIF (OLD.status = 'picked_up' AND NEW.status = 'out_for_delivery') THEN
        -- Out for delivery allowed once picked up
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

DROP TRIGGER IF EXISTS trg_validate_order_update ON public.orders;
CREATE TRIGGER trg_validate_order_update
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_update();

-- ------------------------------------------------------------------------------
-- 2. SYNCHRONIZED PICKUP OTP VERIFICATION RPC
-- ------------------------------------------------------------------------------
-- Supports pickup verification when order is either 'ready' or 'rider_assigned'
CREATE OR REPLACE FUNCTION public.verify_order_pickup_otp(p_order_id UUID, p_otp TEXT)
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
  v_pickup_verified BOOLEAN;
  v_attempts INTEGER;
  v_max INTEGER;
  v_is_locked BOOLEAN;
BEGIN
  -- 1. Exclusively lock the parent orders row first to establish consistent locking hierarchy and prevent deadlocks
  SELECT 
    o.rider_id, 
    o.status, 
    rd.profile_id
  INTO 
    v_rider_id, 
    v_order_status, 
    v_rider_profile_id
  FROM public.orders o
  LEFT JOIN public.riders rd ON rd.id = o.rider_id
  WHERE o.id = p_order_id
  FOR UPDATE OF o;

  IF v_rider_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'ORDER_NOT_FOUND', 'message', 'Order or assigned rider not found.');
  END IF;

  -- 2. Authorization check (early rejection before locking child rows)
  IF auth.uid() IS NULL OR (auth.uid() <> v_rider_profile_id AND NOT public.is_admin(auth.uid())) THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED', 'message', 'Access denied: Only the assigned delivery rider can verify pickup.');
  END IF;

  -- 3. Exclusively lock the child order_otps row second (orders -> order_otps)
  SELECT 
    ot.pickup_otp, 
    ot.pickup_verified, 
    ot.pickup_attempts, 
    ot.max_attempts, 
    ot.is_pickup_locked
  INTO 
    v_actual_otp, 
    v_pickup_verified, 
    v_attempts, 
    v_max, 
    v_is_locked
  FROM public.order_otps ot
  WHERE ot.order_id = p_order_id
  FOR UPDATE;

  IF v_actual_otp IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'ORDER_NOT_FOUND', 'message', 'OTP record not found for this order.');
  END IF;

  -- 4. Idempotent success check (if already verified and picked up)
  IF v_pickup_verified AND v_order_status = 'picked_up' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Order pickup has already been verified.');
  END IF;

  -- 5. Check if pickup verification is locked due to too many failed attempts
  IF v_is_locked OR v_attempts >= v_max THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'LOCKED', 
      'message', format('Pickup verification locked: Maximum attempts (%s of %s) exceeded. Please contact platform support.', v_attempts, v_max),
      'attempts', v_attempts,
      'max_attempts', v_max,
      'is_locked', true
    );
  END IF;

  -- 6. Enforce that order status is ready or rider_assigned
  IF v_order_status NOT IN ('ready', 'rider_assigned') THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_STATUS', 'message', format('Order is not ready for pickup (current status: %s).', v_order_status));
  END IF;

  -- 7. Validate OTP with row lock held
  IF TRIM(p_otp) <> TRIM(v_actual_otp) THEN
    UPDATE public.order_otps
    SET pickup_attempts = pickup_attempts + 1,
        is_pickup_locked = (pickup_attempts + 1 >= max_attempts),
        updated_at = NOW()
    WHERE order_id = p_order_id;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_OTP',
      'message', format('Invalid pickup OTP. Attempt %s of %s.', v_attempts + 1, v_max),
      'attempts', v_attempts + 1,
      'max_attempts', v_max,
      'is_locked', (v_attempts + 1 >= v_max)
    );
  END IF;

  -- 8. Valid OTP: mark verified and atomically advance order status
  UPDATE public.order_otps
  SET pickup_verified = TRUE, updated_at = NOW()
  WHERE order_id = p_order_id;

  UPDATE public.orders
  SET status = 'picked_up', updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true, 'message', 'Pickup verified successfully. Order status updated to picked_up.');
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. ATOMIC ORDER CLAIMING RPC
-- ------------------------------------------------------------------------------
-- Concurrency-safe: locks the orders row with FOR UPDATE to prevent race conditions
-- Enforces:
--   - Rider must be authenticated, verified, and currently ONLINE.
--   - Rider cannot claim an order if they already have an active/concurrent delivery.
--   - Order must be unassigned and in 'ready' or 'preparing' state.
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

  -- 2. Verify caller is an active, verified delivery partner
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

  -- Enforce rider online status
  IF v_rider.status <> 'online' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'RIDER_NOT_ONLINE',
      'message', 'You must be online to claim delivery orders. Switch your status to online first.'
    );
  END IF;

  -- Ensure rider does not already have an active incomplete delivery
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

  -- 3. Exclusively lock the candidate order row to prevent concurrent claims
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

  -- 4. Validate order eligibility for delivery claim
  IF v_order.rider_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ALREADY_ASSIGNED',
      'message', 'This order has already been claimed by another delivery partner.'
    );
  END IF;

  -- Order must be in a claimable state ('ready' or 'preparing')
  IF v_order.status NOT IN ('ready', 'preparing') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ORDER_NOT_CLAIMABLE',
      'message', format('Order status is "%s" and is not eligible for delivery assignment.', v_order.status)
    );
  END IF;

  -- 5. Atomically bind order to rider and advance status to 'rider_assigned'
  UPDATE public.orders
  SET 
    rider_id = v_rider.id,
    status = 'rider_assigned',
    updated_at = NOW()
  WHERE id = p_order_id;

  -- 6. Transition rider status to 'busy'
  UPDATE public.riders
  SET 
    status = 'busy',
    updated_at = NOW()
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

-- ------------------------------------------------------------------------------
-- 4. PRIVACY-PRESERVING AVAILABLE ORDERS QUERY RPC
-- ------------------------------------------------------------------------------
-- Masks customer PII (flat, house number, full street address, customer phone/name)
-- and core order financials (item_total, total_amount) prior to acceptance.
-- Returns only generalized dropoff locality, restaurant pickup details, and delivery compensation.
CREATE OR REPLACE FUNCTION public.get_available_delivery_orders()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_caller_id UUID;
  v_rider RECORD;
  v_orders JSONB;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RETURN '[]'::JSONB;
  END IF;

  -- Verify caller is a verified rider or admin
  SELECT * INTO v_rider
  FROM public.riders
  WHERE profile_id = v_caller_id;

  IF NOT FOUND AND NOT public.is_admin(v_caller_id) THEN
    RETURN '[]'::JSONB;
  END IF;

  IF v_rider.is_verified IS NOT TRUE AND NOT public.is_admin(v_caller_id) THEN
    RETURN '[]'::JSONB;
  END IF;

  -- Return unassigned orders currently preparing or ready with privacy masking
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', o.id,
        'order_number', o.order_number,
        'status', o.status,
        'restaurant_id', o.restaurant_id,
        'restaurant_name', r.name,
        'restaurant_address', r.address_text,
        'restaurant_lat', r.latitude,
        'restaurant_lng', r.longitude,
        'restaurant_phone', r.phone,
        'dropoff_area', jsonb_build_object(
          'city', o.delivery_address->>'city',
          'pincode', o.delivery_address->>'pincode',
          'landmark', o.delivery_address->>'landmark',
          'label', o.delivery_address->>'label'
        ),
        'estimated_delivery_earnings', COALESCE(o.delivery_fee, 0) + COALESCE(o.tip_amount, 0),
        'items_count', jsonb_array_length(COALESCE(o.items, '[]'::jsonb)),
        'created_at', o.created_at
      ) ORDER BY o.created_at ASC
    ),
    '[]'::JSONB
  ) INTO v_orders
  FROM public.orders o
  JOIN public.restaurants r ON r.id = o.restaurant_id
  WHERE o.rider_id IS NULL
    AND o.status IN ('ready', 'preparing');

  RETURN v_orders;
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. RIDER AVAILABILITY & STATUS TOGGLE RPC
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
    WHERE rider_id = v_rider.id AND status IN ('rider_assigned', 'picked_up', 'out_for_delivery')
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ACTIVE_ORDER',
      'message', 'Cannot go offline while an active delivery is in progress.'
    );
  END IF;

  UPDATE public.riders
  SET 
    status = p_status,
    updated_at = NOW()
  WHERE id = v_rider.id;

  RETURN jsonb_build_object('success', true, 'status', p_status, 'message', 'Availability updated successfully.');
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. ADMIN RIDER ONBOARDING ACTIVATION RPC
-- ------------------------------------------------------------------------------
-- Hardened:
--   - Validates that only reviewable applications (submitted, in_review) are processed.
--   - Protects existing privileged roles ('admin', 'restaurant_owner') from demotion.
--   - Synchronizes vehicle details and driving license into public.riders.
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
          emergency_contact_phone = v_app.emergency_contact_phone,
          updated_at = NOW()
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
      'user_id', v_app.user_id,
      'message', 'Rider application approved and partner account activated.'
    );
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'INVALID_ACTION', 'message', 'Action must be "approve" or "reject".');
END;
$$;

-- ------------------------------------------------------------------------------
-- 7. OWNERSHIP & EXECUTION PRIVILEGES
-- ------------------------------------------------------------------------------
ALTER FUNCTION public.validate_order_update() OWNER TO postgres;

ALTER FUNCTION public.verify_order_pickup_otp(UUID, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.verify_order_pickup_otp(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_order_pickup_otp(UUID, TEXT) TO authenticated, service_role;

ALTER FUNCTION public.claim_order_delivery(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.claim_order_delivery(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_order_delivery(UUID) TO authenticated, service_role;

ALTER FUNCTION public.get_available_delivery_orders() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.get_available_delivery_orders() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_available_delivery_orders() TO authenticated, service_role;

ALTER FUNCTION public.set_rider_availability(rider_status) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.set_rider_availability(rider_status) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_rider_availability(rider_status) TO authenticated, service_role;

ALTER FUNCTION public.activate_approved_rider(UUID, TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.activate_approved_rider(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.activate_approved_rider(UUID, TEXT, TEXT) TO authenticated, service_role;
