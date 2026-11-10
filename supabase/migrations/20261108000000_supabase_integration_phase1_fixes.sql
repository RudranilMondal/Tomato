-- ==============================================================================
-- 🍅 TOMATTTO FOOD DELIVERY PLATFORM: HARDENED INTEGRATION MIGRATION
-- Migration: 20261108000000_supabase_integration_phase1_fixes.sql
--
-- Scope:
-- 1. Legacy OTP Migration & Full Table Sanitation:
--    - Preserves genuine legacy plaintext OTPs from orders.pickup_otp/delivery_otp.
--    - Adopts conservative cryptographic verification strategy (pickup_verified = FALSE,
--      delivery_verified = FALSE) without falsely inferring verification from orders.status.
--    - Assigns locked, inert placeholders ('0000', attempts = 5, is_locked = TRUE) for missing values
--      and historical orders without prior OTP records.
--    - Preserves all existing order_otps records (WHERE NOT EXISTS / ON CONFLICT DO NOTHING).
--    - Safely inspects pg_trigger.tgenabled to restore original trigger active state.
--    - Permanently sanitizes public.orders.pickup_otp and delivery_otp to masked '••••'.
--
-- 2. Hardened Order Lifecycle State Machine:
--    - Updates public.validate_order_update() to prevent unlogged administrative bypasses.
--    - Enforces universal immutability on core structural keys (id, customer_id, restaurant_id, created_at)
--      and all financial/payment/OTP fields across all roles including administrators.
--    - Blocks arbitrary direct administrative status jumps, routing exceptional interventions
--      strictly to the auditable public.admin_resolve_order_delivery() recovery RPC.
--    - Concurrency-hardened order claim validation: locks rider row, checks for concurrent deliveries,
--      and transitions rider to 'busy'.
--    - Enforces customer cancellation boundaries, restaurant owner progression, and rider OTP sequence.
--
-- 3. Cryptographically Secure & Unbiased OTP Security Functions:
--    - Introduces public.generate_unbiased_otp() utilizing 32-bit cryptographically secure
--      rejection sampling (cutoff 4,294,962,000 for exact uniform distribution over [1000, 9999]).
--    - Upgrades public.sync_order_otps() to utilize unbiased rejection sampling and extensions search_path.
--    - Hardens public.verify_order_pickup_otp() and public.verify_order_delivery_otp():
--      * Strict upfront rejection of NULL and empty OTPs (prevents SQL three-valued logic bypass).
--      * Uses NULL-safe IS DISTINCT FROM comparison.
--      * Explicitly rejects '0000' placeholder OTPs.
--      * Safe rider release on delivery completion: locks rider, checks concurrent active orders,
--        preserves offline status, and only returns to 'online' if verified.
--    - Hardens public.get_customer_delivery_otp() and public.get_restaurant_pickup_otp() against masked placeholders.
--
-- 4. Concurrency-Safe Order Claiming RPC (claim_order_delivery):
--    - Hardens public.claim_order_delivery() with uniform row-lock ordering (orders -> riders).
--    - Eliminates potential deadlocks with delivery completion and admin recovery.
--
-- 5. Controlled Administrative Delivery Recovery RPC:
--    - Implements public.admin_resolve_order_delivery() for stuck/anomaly order resolution.
--    - Atomically audited in public.admin_audit_logs and public.order_status_history without
--      falsifying cryptographic verification flags in public.order_otps.
--    - Safely releases assigned riders respecting concurrent deliveries and offline states.
--
-- 6. Correct public.get_available_delivery_orders() RPC:
--    - Eliminates invalid column references (orders.items and orders.order_number).
--    - Accurately derives total item count and item overview from public.order_items.
--    - Enforces verified AND online rider authorization (or platform administrator).
--    - Excludes restaurant_phone and all customer PII from pre-acceptance payload.
--    - Completely removes hardcoded location fallbacks ('Bengaluru', '560038').
--
-- 7. Idempotent Supabase Realtime Publication Configuration:
--    - Registers public.orders, public.order_status_history, and public.riders idempotently.
--    - Sets REPLICA IDENTITY FULL on public.orders for comprehensive UPDATE broadcasts.
--
-- 8. Address Compatibility Architectural Contract (Documentation):
--    - Documents frontend-to-backend structured delivery address contract.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. LEGACY OTP PRESERVATION & ORDERS TABLE SANITATION
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  v_validate_trigger_enabled "char" := NULL;
BEGIN
  -- A. Inspect original enabled/disabled state of trg_validate_order_update
  SELECT t.tgenabled INTO v_validate_trigger_enabled
  FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE t.tgname = 'trg_validate_order_update'
    AND c.relname = 'orders'
    AND n.nspname = 'public';

  -- Only disable if the trigger is currently active (not 'D')
  IF v_validate_trigger_enabled IS NOT NULL AND v_validate_trigger_enabled <> 'D' THEN
    ALTER TABLE public.orders DISABLE TRIGGER trg_validate_order_update;
  END IF;

  -- B. Migrate unmigrated legacy order OTPs into public.order_otps
  -- Conservative Verification Strategy:
  -- - Does NOT infer verification solely from orders.status because legacy database
  --   records did not capture cryptographic verification proofs.
  -- - Sets pickup_verified = FALSE and delivery_verified = FALSE.
  -- - Every order in public.orders without an order_otps record receives an entry.
  -- - If a legacy order had a missing or masked OTP, the placeholder ('0000') is permanently locked
  --   (is_pickup_locked/is_delivery_locked = TRUE and attempts = 5) so it can never be verified.
  INSERT INTO public.order_otps (
    order_id,
    pickup_otp,
    delivery_otp,
    pickup_verified,
    delivery_verified,
    pickup_attempts,
    delivery_attempts,
    max_attempts,
    is_pickup_locked,
    is_delivery_locked,
    created_at,
    updated_at
  )
  SELECT
    o.id,
    COALESCE(NULLIF(REPLACE(o.pickup_otp, '•', ''), ''), '0000') AS pickup_otp,
    COALESCE(NULLIF(REPLACE(o.delivery_otp, '•', ''), ''), '0000') AS delivery_otp,
    FALSE AS pickup_verified,
    FALSE AS delivery_verified,
    CASE
      WHEN NULLIF(REPLACE(o.pickup_otp, '•', ''), '') IS NULL THEN 5
      ELSE 0
    END AS pickup_attempts,
    CASE
      WHEN NULLIF(REPLACE(o.delivery_otp, '•', ''), '') IS NULL THEN 5
      ELSE 0
    END AS delivery_attempts,
    5 AS max_attempts,
    CASE
      WHEN NULLIF(REPLACE(o.pickup_otp, '•', ''), '') IS NULL THEN TRUE
      ELSE FALSE
    END AS is_pickup_locked,
    CASE
      WHEN NULLIF(REPLACE(o.delivery_otp, '•', ''), '') IS NULL THEN TRUE
      ELSE FALSE
    END AS is_delivery_locked,
    COALESCE(o.created_at, NOW()),
    NOW()
  FROM public.orders o
  WHERE NOT EXISTS (
    SELECT 1 FROM public.order_otps ot WHERE ot.order_id = o.id
  )
  ON CONFLICT (order_id) DO NOTHING;

  -- C. Permanently sanitize legacy plaintext OTP columns on public.orders
  UPDATE public.orders
  SET pickup_otp = '••••',
      delivery_otp = '••••'
  WHERE pickup_otp IS DISTINCT FROM '••••'
     OR delivery_otp IS DISTINCT FROM '••••';

  -- D. Restore validation trigger to its exact original state (only re-enable if originally active)
  IF v_validate_trigger_enabled IS NOT NULL AND v_validate_trigger_enabled <> 'D' THEN
    ALTER TABLE public.orders ENABLE TRIGGER trg_validate_order_update;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 1B. HARDENED IS_SERVICE_ROLE (RESPECTS POSTGREST JWT CLAIMS)
-- ------------------------------------------------------------------------------
-- Prevents defect where checking current_user IN ('postgres') inside a SECURITY DEFINER
-- function causes is_service_role() to always return TRUE for all callers.
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
-- 2. HARDENED ORDER LIFECYCLE STATE MACHINE (VALIDATE_ORDER_UPDATE)
-- ------------------------------------------------------------------------------
-- Enforces database-level state machine rules, blocks arbitrary direct administrative
-- status jumps, guarantees immutable structural and financial keys, and audits administrative updates.

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

    -- Update rider status to 'busy' if still online
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

DROP TRIGGER IF EXISTS trg_validate_order_update ON public.orders;
CREATE TRIGGER trg_validate_order_update
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_update();

-- ------------------------------------------------------------------------------
-- 3. CRYPTOGRAPHICALLY SECURE UNBIASED OTP GENERATION & VERIFICATION RPCS
-- ------------------------------------------------------------------------------

-- A. Cryptographically Secure Unbiased OTP Generator
-- Uses 32-bit cryptographically secure random bytes with rejection sampling.
-- Desired range is [1000, 9999] (9,000 discrete outcomes).
-- 2^32 = 4,294,967,296.
-- 477,218 * 9,000 = 4,294,962,000.
-- Any random integer in [0, 4,294,961,999] gives exact uniform probability for each outcome.
-- Values >= 4,294,962,000 (only 5,296 out of 4.29B, probability 0.000123%) are rejected and resampled.
-- Modulo bias is completely eliminated.
CREATE OR REPLACE FUNCTION public.generate_unbiased_otp()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions
AS $$
DECLARE
  v_raw BIGINT;
BEGIN
  LOOP
    v_raw := ('x' || encode(gen_random_bytes(4), 'hex'))::bit(32)::bigint;
    IF v_raw < 4294962000 THEN
      RETURN ((v_raw % 9000) + 1000)::TEXT;
    END IF;
  END LOOP;
END;
$$;

ALTER FUNCTION public.generate_unbiased_otp() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.generate_unbiased_otp() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_unbiased_otp() TO authenticated, service_role;

-- B. Trigger functions to initialize and protect order OTPs
-- 1) BEFORE INSERT: Generates or extracts initial OTPs, stages them in transaction-local
--    storage, and unconditionally masks orders.pickup_otp / orders.delivery_otp so
--    plaintext OTPs are never stored in public.orders or broadcast via Realtime.
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

DROP TRIGGER IF EXISTS trg_mask_order_otps ON public.orders;
CREATE TRIGGER trg_mask_order_otps
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.mask_order_otps();

-- 2) AFTER INSERT: Creates the child record in public.order_otps now that the parent
--    orders row exists (satisfying foreign key order_otps_order_id_fkey).
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

DROP TRIGGER IF EXISTS trg_sync_order_otps ON public.orders;
CREATE TRIGGER trg_sync_order_otps
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_order_otps();

-- C. Synchronized Pickup OTP Verification RPC
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
  -- Upfront parameter validation: reject NULL or empty OTP immediately
  IF p_otp IS NULL OR LENGTH(TRIM(p_otp)) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_OTP',
      'message', 'Pickup OTP cannot be empty.'
    );
  END IF;

  -- 1. Exclusively lock the parent orders row
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

  -- 2. Authorization check
  IF auth.uid() IS NULL OR (auth.uid() <> v_rider_profile_id AND NOT public.is_admin(auth.uid())) THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED', 'message', 'Access denied: Only the assigned delivery rider can verify pickup.');
  END IF;

  -- 3. Exclusively lock the child order_otps row
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

  -- 4. Idempotent success check
  IF v_pickup_verified AND v_order_status = 'picked_up' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Order pickup has already been verified.');
  END IF;

  -- 5. Check if pickup verification is locked
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

  -- 7. Explicit placeholder rejection: '0000' can never be verified
  IF TRIM(p_otp) = '0000' OR TRIM(v_actual_otp) = '0000' THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_OTP', 'message', 'Invalid or unissued pickup OTP.');
  END IF;

  -- 8. Validate OTP with row lock held (NULL-safe IS DISTINCT FROM comparison)
  IF TRIM(p_otp) IS DISTINCT FROM TRIM(v_actual_otp) THEN
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

  -- 9. Valid OTP: mark verified and atomically advance order status
  UPDATE public.order_otps
  SET pickup_verified = TRUE, updated_at = NOW()
  WHERE order_id = p_order_id;

  UPDATE public.orders
  SET status = 'picked_up', updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true, 'message', 'Pickup verified successfully. Order status updated to picked_up.');
END;
$$;

ALTER FUNCTION public.verify_order_pickup_otp(UUID, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.verify_order_pickup_otp(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_order_pickup_otp(UUID, TEXT) TO authenticated, service_role;

-- D. Synchronized Delivery OTP Verification RPC with Safe Rider Release
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
  v_max INTEGER;
  v_is_locked BOOLEAN;
  v_rider_rec RECORD;
  v_has_concurrent_order BOOLEAN := FALSE;
BEGIN
  -- Upfront parameter validation: reject NULL or empty OTP immediately
  IF p_otp IS NULL OR LENGTH(TRIM(p_otp)) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_OTP',
      'message', 'Delivery OTP cannot be empty.'
    );
  END IF;

  -- 1. Exclusively lock the parent orders row
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

  -- 2. Authorization check
  IF auth.uid() IS NULL OR (auth.uid() <> v_rider_profile_id AND NOT public.is_admin(auth.uid())) THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED', 'message', 'Access denied: Only the assigned delivery rider can verify delivery.');
  END IF;

  -- 3. Exclusively lock the child order_otps row
  SELECT
    ot.delivery_otp,
    ot.delivery_verified,
    ot.delivery_attempts,
    ot.max_attempts,
    ot.is_delivery_locked
  INTO
    v_actual_otp,
    v_delivery_verified,
    v_attempts,
    v_max,
    v_is_locked
  FROM public.order_otps ot
  WHERE ot.order_id = p_order_id
  FOR UPDATE;

  IF v_actual_otp IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'ORDER_NOT_FOUND', 'message', 'OTP record not found for this order.');
  END IF;

  -- 4. Idempotent success check
  IF v_delivery_verified AND v_order_status = 'delivered' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Order delivery has already been verified.');
  END IF;

  -- 5. Check if delivery verification is locked
  IF v_is_locked OR v_attempts >= v_max THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'LOCKED',
      'message', format('Delivery verification locked: Maximum attempts (%s of %s) exceeded. Please contact platform support.', v_attempts, v_max),
      'attempts', v_attempts,
      'max_attempts', v_max,
      'is_locked', true
    );
  END IF;

  -- 6. Enforce that order status is strictly out_for_delivery
  IF v_order_status <> 'out_for_delivery' THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_STATUS', 'message', format('Order is not out for delivery (current status: %s).', v_order_status));
  END IF;

  -- 7. Explicit placeholder rejection: '0000' can never be verified
  IF TRIM(p_otp) = '0000' OR TRIM(v_actual_otp) = '0000' THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_OTP', 'message', 'Invalid or unissued delivery OTP.');
  END IF;

  -- 8. Validate OTP with row lock held (NULL-safe IS DISTINCT FROM comparison)
  IF TRIM(p_otp) IS DISTINCT FROM TRIM(v_actual_otp) THEN
    UPDATE public.order_otps
    SET delivery_attempts = delivery_attempts + 1,
        is_delivery_locked = (delivery_attempts + 1 >= max_attempts),
        updated_at = NOW()
    WHERE order_id = p_order_id;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_OTP',
      'message', format('Invalid delivery OTP. Attempt %s of %s.', v_attempts + 1, v_max),
      'attempts', v_attempts + 1,
      'max_attempts', v_max,
      'is_locked', (v_attempts + 1 >= v_max)
    );
  END IF;

  -- 9. Valid OTP: mark verified and atomically advance order status
  UPDATE public.order_otps
  SET delivery_verified = TRUE, updated_at = NOW()
  WHERE order_id = p_order_id;

  UPDATE public.orders
  SET status = 'delivered', updated_at = NOW()
  WHERE id = p_order_id;

  -- 10. Safe rider release:
  -- Lock rider row, check concurrent orders, preserve offline states
  SELECT * INTO v_rider_rec
  FROM public.riders
  WHERE id = v_rider_id
  FOR UPDATE;

  IF FOUND THEN
    -- Check if rider has another active incomplete delivery
    SELECT EXISTS (
      SELECT 1 FROM public.orders
      WHERE rider_id = v_rider_id
        AND id <> p_order_id
        AND status IN ('rider_assigned'::order_status, 'picked_up'::order_status, 'out_for_delivery'::order_status)
    ) INTO v_has_concurrent_order;

    -- Only set to online if no concurrent order exists, rider was busy/delivering, and is verified
    IF NOT v_has_concurrent_order THEN
      IF v_rider_rec.status IN ('busy'::rider_status, 'delivering'::rider_status) AND v_rider_rec.is_verified IS TRUE THEN
        UPDATE public.riders
        SET status = 'online'::rider_status
        WHERE id = v_rider_id;
      END IF;
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Delivery verified successfully. Order status updated to delivered.');
END;
$$;

ALTER FUNCTION public.verify_order_delivery_otp(UUID, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.verify_order_delivery_otp(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_order_delivery_otp(UUID, TEXT) TO authenticated, service_role;

-- E. Customer Delivery OTP Retrieval RPC (Masked against placeholders)
CREATE OR REPLACE FUNCTION public.get_customer_delivery_otp(p_order_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
DECLARE
  v_customer_id UUID;
  v_otp TEXT;
BEGIN
  SELECT customer_id INTO v_customer_id FROM public.orders WHERE id = p_order_id;

  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  IF auth.uid() IS NULL OR (auth.uid() <> v_customer_id AND NOT public.is_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied: Only the customer who placed this order can view the delivery OTP.';
  END IF;

  SELECT
    CASE
      WHEN ot.is_delivery_locked OR ot.delivery_otp = '0000' OR ot.delivery_otp LIKE '%•%' THEN NULL
      ELSE ot.delivery_otp
    END INTO v_otp
  FROM public.order_otps ot
  WHERE ot.order_id = p_order_id;

  RETURN v_otp;
END;
$$;

ALTER FUNCTION public.get_customer_delivery_otp(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.get_customer_delivery_otp(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_customer_delivery_otp(UUID) TO authenticated, service_role;

-- F. Restaurant Owner Pickup OTP Retrieval RPC (Masked against placeholders)
CREATE OR REPLACE FUNCTION public.get_restaurant_pickup_otp(p_order_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
DECLARE
  v_owner_id UUID;
  v_otp TEXT;
BEGIN
  SELECT r.owner_id INTO v_owner_id
  FROM public.orders o
  JOIN public.restaurants r ON r.id = o.restaurant_id
  WHERE o.id = p_order_id;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  IF auth.uid() IS NULL OR (auth.uid() <> v_owner_id AND NOT public.is_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied: Only the restaurant owner can view the pickup OTP.';
  END IF;

  SELECT
    CASE
      WHEN ot.is_pickup_locked OR ot.pickup_otp = '0000' OR ot.pickup_otp LIKE '%•%' THEN NULL
      ELSE ot.pickup_otp
    END INTO v_otp
  FROM public.order_otps ot
  WHERE ot.order_id = p_order_id;

  RETURN v_otp;
END;
$$;

ALTER FUNCTION public.get_restaurant_pickup_otp(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.get_restaurant_pickup_otp(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_restaurant_pickup_otp(UUID) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 4. CONCURRENCY-SAFE ORDER CLAIMING RPC (CLAIM_ORDER_DELIVERY)
-- ------------------------------------------------------------------------------
-- Hardened with uniform row-lock ordering: orders -> riders.
-- Guarantees that concurrent transactions cannot assign multiple active deliveries
-- or produce deadlock cycles with delivery verification or admin recovery.

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

  -- 2. Exclusively lock the candidate order row FIRST (consistent orders -> riders lock ordering)
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

  -- Order must be in a claimable state ('ready' or 'preparing')
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

-- 4B. Protect rider fields trigger function (hardened for schema without created_at/updated_at)
CREATE OR REPLACE FUNCTION public.protect_rider_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Service role bypass (allows backend workers/cron jobs full update access)
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  -- 2. Authentication check: unauthenticated users cannot modify rider details
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

-- 4C. Rider availability RPC (hardened for schema without updated_at)
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

-- 4D. Admin rider activation RPC (hardened for schema without created_at/updated_at)
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

-- ------------------------------------------------------------------------------
-- 5. CONTROLLED ADMINISTRATIVE DELIVERY RESOLUTION RPC
-- ------------------------------------------------------------------------------
-- Provides an authorized, auditable recovery path for orders that cannot complete
-- normal verification (e.g. lost device, legacy unverified row, in-person customer resolution).
-- Does NOT falsely claim OTP verification in order_otps.

CREATE OR REPLACE FUNCTION public.admin_resolve_order_delivery(
  p_order_id UUID,
  p_resolution_action TEXT, -- 'FORCE_DELIVER' or 'CANCEL_UNFULFILLED'
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_admin_id UUID;
  v_order RECORD;
  v_rider_rec RECORD;
  v_has_concurrent_order BOOLEAN := FALSE;
  v_target_status order_status;
BEGIN
  -- 1. Authorization check: authenticated platform administrator or backend service_role
  v_admin_id := auth.uid();
  IF (v_admin_id IS NULL OR NOT public.is_admin(v_admin_id)) AND NOT public.is_service_role() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'Access denied: Only platform administrators can execute emergency order resolution.'
    );
  END IF;

  -- 2. Input validation: strict action whitelist
  IF p_resolution_action NOT IN ('FORCE_DELIVER', 'CANCEL_UNFULFILLED') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_ACTION',
      'message', 'Invalid resolution action. Must be FORCE_DELIVER or CANCEL_UNFULFILLED.'
    );
  END IF;

  -- 3. Non-empty recovery reason requirement (minimum 10 characters)
  IF p_reason IS NULL OR LENGTH(TRIM(p_reason)) < 10 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INSUFFICIENT_REASON',
      'message', 'A detailed resolution reason of at least 10 characters is required for audit compliance.'
    );
  END IF;

  -- 4. Exclusively lock the order row FIRST (consistent orders -> riders lock ordering)
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'ORDER_NOT_FOUND', 'message', 'Order not found.');
  END IF;

  -- 5. Validate current order status against requested recovery action
  IF p_resolution_action = 'FORCE_DELIVER' THEN
    IF v_order.status NOT IN ('picked_up', 'out_for_delivery') THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'INVALID_ORDER_STATE',
        'message', format('Cannot force delivery for order in state "%s". Must be picked_up or out_for_delivery.', v_order.status)
      );
    END IF;
    v_target_status := 'delivered'::order_status;

  ELSIF p_resolution_action = 'CANCEL_UNFULFILLED' THEN
    IF v_order.status = 'delivered' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'ALREADY_DELIVERED',
        'message', 'Delivered orders are terminal and cannot be cancelled.'
      );
    END IF;
    IF v_order.status = 'cancelled' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'ALREADY_CANCELLED',
        'message', 'Order is already cancelled.'
      );
    END IF;
    v_target_status := 'cancelled'::order_status;
  END IF;

  -- 6. Set transaction-scoped configuration flag to authorize trigger bypass
  PERFORM set_config('tomattto.admin_recovery_in_progress', 'true', true);

  -- 7. Execute order status transition
  UPDATE public.orders
  SET status = v_target_status, updated_at = NOW()
  WHERE id = p_order_id;

  -- Reset recovery session flag immediately after the authorized order update
  PERFORM set_config('tomattto.admin_recovery_in_progress', 'false', true);

  -- 8. Safe rider status release:
  -- Lock rider row SECOND, check concurrent orders, preserve offline states
  IF v_order.rider_id IS NOT NULL THEN
    SELECT * INTO v_rider_rec
    FROM public.riders
    WHERE id = v_order.rider_id
    FOR UPDATE;

    IF FOUND THEN
      -- Check if rider has another active incomplete delivery
      SELECT EXISTS (
        SELECT 1 FROM public.orders
        WHERE rider_id = v_order.rider_id
          AND id <> p_order_id
          AND status IN ('rider_assigned'::order_status, 'picked_up'::order_status, 'out_for_delivery'::order_status)
      ) INTO v_has_concurrent_order;

      -- Only set to online if no concurrent order exists, rider was busy/delivering, and is verified
      IF NOT v_has_concurrent_order THEN
        IF v_rider_rec.status IN ('busy'::rider_status, 'delivering'::rider_status) AND v_rider_rec.is_verified IS TRUE THEN
          UPDATE public.riders
          SET status = 'online'::rider_status
          WHERE id = v_order.rider_id;
        END IF;
      END IF;
    END IF;
  END IF;

  -- 9. Atomic audit logging in public.admin_audit_logs
  INSERT INTO public.admin_audit_logs (
    admin_id,
    action,
    target_type,
    target_id,
    details
  ) VALUES (
    v_admin_id,
    'ADMIN_RESOLVE_ORDER_' || p_resolution_action,
    'order',
    p_order_id::text,
    jsonb_build_object(
      'reason', TRIM(p_reason),
      'previous_status', v_order.status,
      'new_status', v_target_status,
      'resolution_action', p_resolution_action,
      'resolved_at', NOW()
    )
  );

  -- 10. Atomic logging in public.order_status_history
  INSERT INTO public.order_status_history (
    order_id,
    status,
    note,
    changed_by
  ) VALUES (
    p_order_id,
    v_target_status,
    'Admin Recovery (' || p_resolution_action || '): ' || TRIM(p_reason),
    v_admin_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'action', p_resolution_action,
    'status', v_target_status,
    'message', 'Order resolved successfully by administrator.'
  );
END;
$$;

ALTER FUNCTION public.admin_resolve_order_delivery(UUID, TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_resolve_order_delivery(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_resolve_order_delivery(UUID, TEXT, TEXT) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 6. CORRECTED GET_AVAILABLE_DELIVERY_ORDERS RPC
-- ------------------------------------------------------------------------------
-- Privacy-preserving query for unassigned orders ready for immediate pickup.
-- Enforces that caller is authenticated, verified, AND currently online (or admin).

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
  -- 1. Authentication check
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RETURN '[]'::JSONB;
  END IF;

  -- 2. Authorization check: verified & online delivery rider, or platform administrator
  SELECT * INTO v_rider
  FROM public.riders
  WHERE profile_id = v_caller_id;

  IF NOT FOUND AND NOT public.is_admin(v_caller_id) THEN
    RETURN '[]'::JSONB;
  END IF;

  IF (v_rider.is_verified IS NOT TRUE OR v_rider.status <> 'online') AND NOT public.is_admin(v_caller_id) THEN
    RETURN '[]'::JSONB;
  END IF;

  -- 3. Query unassigned orders currently 'ready' for immediate pickup
  -- PRIVACY & LEAST PRIVILEGE:
  -- - Filters strictly to o.status = 'ready' (riders only dispatched once food is packed).
  -- - Omits customer name, customer phone, exact door/flat numbers, and OTPs.
  -- - Omits restaurant_phone (prevents unsolicited kitchen phone calls prior to claim).
  -- - Does NOT invent or hardcode city/pincode fallbacks; returns genuine values or NULL.
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', o.id,
        'order_ref', 'TOM-' || UPPER(SUBSTRING(REPLACE(o.id::text, '-', '') FROM 1 FOR 6)),
        'status', o.status,
        'restaurant_id', o.restaurant_id,
        'restaurant_name', r.name,
        'restaurant_address', r.address_text,
        'restaurant_lat', r.latitude,
        'restaurant_lng', r.longitude,
        'dropoff_area', jsonb_build_object(
          'city', NULLIF(TRIM(o.delivery_address->>'city'), ''),
          'pincode', NULLIF(TRIM(o.delivery_address->>'pincode'), ''),
          'landmark', NULLIF(TRIM(o.delivery_address->>'landmark'), ''),
          'label', NULLIF(TRIM(o.delivery_address->>'label'), ''),
          'area', COALESCE(
            NULLIF(TRIM(o.delivery_address->>'locality'), ''),
            NULLIF(TRIM(o.delivery_address->>'street'), ''),
            NULLIF(TRIM(o.delivery_address->>'addressLine'), '')
          )
        ),
        'estimated_delivery_earnings', COALESCE(o.delivery_fee, 35.00) + COALESCE(o.tip_amount, 0.00) + 15.00,
        'items_count', COALESCE(oi_summary.total_items, 0),
        'items_preview', COALESCE(oi_summary.items_preview, 'Prepared Meal Package'),
        'delivery_instructions', o.delivery_instructions,
        'special_cooking_instructions', o.special_cooking_instructions,
        'created_at', o.created_at
      ) ORDER BY o.created_at ASC
    ),
    '[]'::JSONB
  ) INTO v_orders
  FROM public.orders o
  JOIN public.restaurants r ON r.id = o.restaurant_id
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(SUM(oi.quantity), COUNT(oi.id))::INTEGER AS total_items,
      string_agg(oi.quantity::text || 'x ' || oi.name, ', ') AS items_preview
    FROM public.order_items oi
    WHERE oi.order_id = o.id
  ) oi_summary ON true
  WHERE o.rider_id IS NULL
    AND o.status = 'ready'::order_status;

  RETURN v_orders;
END;
$$;

ALTER FUNCTION public.get_available_delivery_orders() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.get_available_delivery_orders() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_available_delivery_orders() TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 7. SUPABASE REALTIME PUBLICATION CONFIGURATION
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- A. Enable Realtime on public.orders
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'orders'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;

    -- B. Enable Realtime on public.order_status_history
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'order_status_history'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;
    END IF;

    -- C. Enable Realtime on public.riders
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'riders'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.riders;
    END IF;
  END IF;
END $$;

-- Set REPLICA IDENTITY FULL on orders to ensure Realtime payload broadcasts
-- include full row data on UPDATE events for all authorized subscribers.
-- (Safe because Section 1 permanently sanitized orders.pickup_otp and orders.delivery_otp).
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- ------------------------------------------------------------------------------
-- 8. ADDRESS COMPATIBILITY ARCHITECTURAL CONTRACT (DOCUMENTATION)
-- ------------------------------------------------------------------------------
-- AUDIT NOTE:
-- The database public.create_order() function requires:
--   p_delivery_address JSONB with keys: street, city, pincode (and optional landmark, label).
-- The frontend Order interface in src/types/index.ts models:
--   deliveryAddress: { label: string; addressLine: string; landmark?: string; }
--
-- Integration Policy:
-- - In Phase 1B, the frontend placeOrder() RPC wrapper will continue providing:
--     p_delivery_address: {
--       street: addressLine || '100ft Road, Indiranagar',
--       city: 'Bengaluru',
--       pincode: '560038',
--       label: label || 'Home',
--       addressLine: addressLine
--     }
-- - This satisfies the existing create_order contract without breaking backward compatibility
--   or requiring any disruptive changes to the create_order RPC signature.

-- ------------------------------------------------------------------------------
-- 9. RLS RECURSION ELIMINATION (RIDERS & ORDERS CROSS-TABLE POLICIES)
-- ------------------------------------------------------------------------------
-- 9. RLS RECURSION ELIMINATION & ANTI-SPOOFING HELPERS
-- ------------------------------------------------------------------------------
-- Breaks mutual recursion loop between public.riders and public.orders policies.
-- Uses single-argument SECURITY DEFINER helpers with fixed search_path to evaluate
-- cross-table authorization strictly against caller auth.uid() and table data.

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
  IF p_rider_id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF public.is_service_role() THEN
    RETURN TRUE;
  END IF;

  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT profile_id INTO v_rider_profile_id
  FROM public.riders
  WHERE id = p_rider_id;

  IF NOT FOUND OR v_rider_profile_id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF v_caller_id = v_rider_profile_id THEN
    RETURN TRUE;
  END IF;

  IF public.is_admin(v_caller_id) THEN
    RETURN TRUE;
  END IF;

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
  IF p_rider_id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF public.is_service_role() THEN
    RETURN TRUE;
  END IF;

  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.riders
    WHERE id = p_rider_id AND profile_id = v_caller_id
  );
END;
$$;

ALTER FUNCTION public.is_rider_user(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_rider_user(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_rider_user(UUID) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Authorized users view riders" ON public.riders;
CREATE POLICY "Authorized users view riders"
  ON public.riders FOR SELECT
  USING (
    public.can_view_rider(id)
  );

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

DROP FUNCTION IF EXISTS public.can_view_rider(UUID, UUID);
DROP FUNCTION IF EXISTS public.is_rider_user(UUID, UUID);
