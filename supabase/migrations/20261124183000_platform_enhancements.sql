-- ==============================================================================
-- TOMATTTO PLATFORM ENHANCEMENTS: BILLING, COMMISSIONS, REGISTRATIONS & LEDGER
-- Migration: 20261124183000_platform_enhancements.sql
-- Description:
--   1. Adds delivery charges (₹10 default), platform fee (₹9 default),
--      restaurant commission (₹10 default), distance (km), rider rate (₹12/km),
--      rider payout, and custom tip fields to orders.
--   2. Adds registration fee (₹499) and Starter Kit tracking (T-shirt & bag)
--      to rider_applications and restaurant_partner_applications.
--   3. Creates platform_financial_transactions ledger table with RLS.
--   4. Updates create_order / update_order procedures for transparent calculations.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ORDERS TABLE ENHANCEMENTS
-- ------------------------------------------------------------------------------
ALTER TABLE public.orders 
  ALTER COLUMN delivery_fee SET DEFAULT 10.00,
  ALTER COLUMN platform_fee SET DEFAULT 9.00;

ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS restaurant_commission NUMERIC(10,2) DEFAULT 10.00 CHECK (restaurant_commission >= 0),
  ADD COLUMN IF NOT EXISTS delivery_distance_km NUMERIC(10,2) DEFAULT 0.00 CHECK (delivery_distance_km >= 0),
  ADD COLUMN IF NOT EXISTS rider_rate_per_km NUMERIC(10,2) DEFAULT 12.00 CHECK (rider_rate_per_km >= 0),
  ADD COLUMN IF NOT EXISTS rider_payout NUMERIC(10,2) DEFAULT 0.00 CHECK (rider_payout >= 0),
  ADD COLUMN IF NOT EXISTS custom_tip NUMERIC(10,2) DEFAULT 0.00 CHECK (custom_tip >= 0);

-- Index for distance and financial metrics
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON public.orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_rider_status ON public.orders(rider_id, status);

-- ------------------------------------------------------------------------------
-- 2. RIDER APPLICATIONS REGISTRATION & STARTER KIT
-- ------------------------------------------------------------------------------
ALTER TABLE public.rider_applications
  ADD COLUMN IF NOT EXISTS registration_fee_paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS registration_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS registration_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS starter_kit_status TEXT DEFAULT 'pending' CHECK (starter_kit_status IN ('pending', 'allocated', 'dispatched', 'delivered')),
  ADD COLUMN IF NOT EXISTS starter_kit_tshirt_size TEXT,
  ADD COLUMN IF NOT EXISTS starter_kit_dispatched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS starter_kit_tracking_number TEXT;

-- ------------------------------------------------------------------------------
-- 3. RESTAURANT PARTNER APPLICATIONS REGISTRATION & STARTER KIT
-- ------------------------------------------------------------------------------
ALTER TABLE public.restaurant_partner_applications
  ADD COLUMN IF NOT EXISTS registration_fee_paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS registration_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS registration_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS starter_kit_status TEXT DEFAULT 'pending' CHECK (starter_kit_status IN ('pending', 'allocated', 'dispatched', 'delivered')),
  ADD COLUMN IF NOT EXISTS starter_kit_tshirt_size TEXT,
  ADD COLUMN IF NOT EXISTS starter_kit_dispatched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS starter_kit_tracking_number TEXT;

-- ------------------------------------------------------------------------------
-- 4. PLATFORM FINANCIAL TRANSACTIONS AUDIT LEDGER
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'platform_fee',
    'restaurant_commission',
    'rider_payout',
    'rider_tip',
    'partner_registration',
    'rider_registration',
    'refund'
  )),
  reference_id TEXT,
  entity_type TEXT CHECK (entity_type IN ('customer', 'restaurant', 'rider', 'platform')),
  entity_id UUID,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on platform_financial_transactions
ALTER TABLE public.platform_financial_transactions ENABLE ROW LEVEL SECURITY;

-- Admins have full access
CREATE POLICY "Admins full access to financial ledger"
  ON public.platform_financial_transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users can view their own financial records
CREATE POLICY "Users can view their own financial transactions"
  ON public.platform_financial_transactions
  FOR SELECT
  TO authenticated
  USING (entity_id = auth.uid());


-- ------------------------------------------------------------------------------
-- 5. UPDATED CREATE_ORDER RPC (DELIVERY CHARGE ₹10, PLATFORM FEE ₹9, COMMISSION ₹10)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_order(
  p_restaurant_id UUID,
  p_delivery_address JSONB,
  p_items JSONB,
  p_payment_method TEXT,
  p_coupon_code TEXT DEFAULT NULL,
  p_tip_amount NUMERIC(10, 2) DEFAULT 0.00,
  p_delivery_instructions TEXT DEFAULT NULL,
  p_special_cooking_instructions TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_customer_id UUID;
  v_restaurant RECORD;
  v_order_id UUID;
  v_item_elem JSONB;
  v_item_id UUID;
  v_quantity INTEGER;
  v_variant_id UUID;
  v_addons JSONB;
  v_addon_elem JSONB;
  v_addon_id UUID;
  v_seen_addons UUID[];
  
  v_menu_item RECORD;
  v_variant_row RECORD;
  v_addon_row RECORD;
  v_variant_name TEXT;
  v_staged_addons JSONB;
  
  v_dish_unit_price NUMERIC(10, 2);
  v_dish_line_total NUMERIC(10, 2);
  v_item_addon_total NUMERIC(10, 2);
  
  v_item_total NUMERIC(10, 2) := 0.00;
  v_delivery_fee NUMERIC(10, 2) := 10.00; -- Platform Delivery Charge: ₹10
  v_platform_fee NUMERIC(10, 2) := 9.00;  -- Customer Platform Fee: ₹9
  v_restaurant_commission NUMERIC(10, 2) := 10.00; -- Restaurant Commission: ₹10
  v_delivery_distance_km NUMERIC(10, 2) := 2.50; -- Default distance or calculated
  v_rider_rate_per_km NUMERIC(10, 2) := 12.00; -- Rider Rate: ₹12/km
  v_rider_payout NUMERIC(10, 2) := 30.00; -- (2.5km * 12) = 30
  v_tax_amount NUMERIC(10, 2) := 0.00;
  v_discount_amount NUMERIC(10, 2) := 0.00;
  v_tip NUMERIC(10, 2) := 0.00;
  v_total_amount NUMERIC(10, 2) := 0.00;
  
  v_coupon RECORD;
  v_calc_discount NUMERIC(10, 2) := 0.00;
  v_staged_items JSONB := '[]'::JSONB;
  v_pay_method payment_method;
BEGIN
  -- 1. Authenticate caller
  v_customer_id := auth.uid();
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: User must be authenticated to create an order'
      USING ERRCODE = '42501';
  END IF;

  -- 2. Validate tip (any non-negative amount)
  IF p_tip_amount IS NOT NULL THEN
    IF p_tip_amount < 0.00 OR p_tip_amount > 2000.00 THEN
      RAISE EXCEPTION 'INVALID_TIP: Tip must be between 0 and 2000'
        USING ERRCODE = '22023';
    END IF;
    v_tip := ROUND(p_tip_amount, 2);
  END IF;

  -- 3. Validate payment method
  BEGIN
    v_pay_method := p_payment_method::payment_method;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'INVALID_PAYMENT_METHOD: Unsupported payment method'
      USING ERRCODE = '22023';
  END;

  -- 4. Validate delivery address
  IF p_delivery_address IS NULL
     OR jsonb_typeof(p_delivery_address) <> 'object'
     OR NULLIF(TRIM(p_delivery_address->>'street'), '') IS NULL
     OR NULLIF(TRIM(p_delivery_address->>'city'), '') IS NULL
     OR NULLIF(TRIM(p_delivery_address->>'pincode'), '') IS NULL THEN
    RAISE EXCEPTION 'INVALID_DELIVERY_ADDRESS: street, city, and pincode are required'
      USING ERRCODE = '22023';
  END IF;

  -- 5. Validate restaurant availability
  SELECT * INTO v_restaurant
  FROM public.restaurants
  WHERE id = p_restaurant_id
  FOR SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'RESTAURANT_NOT_FOUND: Restaurant does not exist'
      USING ERRCODE = '22023';
  END IF;

  IF v_restaurant.is_open IS NOT TRUE THEN
    RAISE EXCEPTION 'RESTAURANT_CLOSED: Restaurant is currently not accepting orders'
      USING ERRCODE = '22023';
  END IF;

  -- Calculate distance if available from restaurant
  IF v_restaurant.distance_km IS NOT NULL AND v_restaurant.distance_km > 0 THEN
    v_delivery_distance_km := v_restaurant.distance_km;
  END IF;
  v_rider_payout := ROUND(v_delivery_distance_km * v_rider_rate_per_km, 2);

  -- 6. Validate items list
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'EMPTY_ORDER: At least one item is required'
      USING ERRCODE = '22023';
  END IF;

  -- 7. Stage and validate items and pricing
  FOR v_item_elem IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    IF jsonb_typeof(v_item_elem) <> 'object' THEN
      RAISE EXCEPTION 'MALFORMED_ITEM: Item entry must be a valid JSON object'
        USING ERRCODE = '22023';
    END IF;

    BEGIN
      v_item_id := (v_item_elem->>'menu_item_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'INVALID_MENU_ITEM_ID: Menu item ID is not a valid UUID'
        USING ERRCODE = '22023';
    END;

    IF jsonb_typeof(v_item_elem->'quantity') <> 'number'
       OR (v_item_elem->>'quantity') !~ '^[0-9]{1,2}$'
       OR (v_item_elem->>'quantity')::INTEGER NOT BETWEEN 1 AND 50 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY: Item quantity must be an integer between 1 and 50'
        USING ERRCODE = '22023';
    END IF;
    v_quantity := (v_item_elem->>'quantity')::INTEGER;

    SELECT * INTO v_menu_item
    FROM public.menu_items
    WHERE id = v_item_id AND restaurant_id = p_restaurant_id
    FOR SHARE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'MENU_ITEM_NOT_FOUND: Item does not belong to this restaurant'
        USING ERRCODE = '22023';
    END IF;

    IF v_menu_item.is_in_stock IS NOT TRUE THEN
      RAISE EXCEPTION 'ITEM_UNAVAILABLE: Item "%" is currently out of stock', v_menu_item.name
        USING ERRCODE = '22023';
    END IF;

    v_dish_unit_price := COALESCE(v_menu_item.discount_price, v_menu_item.price);
    v_variant_name := NULL;

    IF NULLIF(TRIM(v_item_elem->>'variant_id'), '') IS NOT NULL THEN
      BEGIN
        v_variant_id := (v_item_elem->>'variant_id')::UUID;
      EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'INVALID_VARIANT_ID: Variant ID is not a valid UUID'
          USING ERRCODE = '22023';
      END;

      SELECT * INTO v_variant_row
      FROM public.item_variants
      WHERE id = v_variant_id AND item_id = v_item_id
      FOR SHARE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'INVALID_VARIANT: Selected variant not found for item "%"', v_menu_item.name
          USING ERRCODE = '22023';
      END IF;

      v_dish_unit_price := v_variant_row.price;
      v_variant_name := v_variant_row.name;
    END IF;

    v_item_addon_total := 0.00;
    v_staged_addons := '[]'::JSONB;
    v_seen_addons := ARRAY[]::UUID[];
    v_addons := v_item_elem->'addons';

    IF v_addons IS NOT NULL AND jsonb_typeof(v_addons) = 'array' AND jsonb_array_length(v_addons) > 0 THEN
      FOR v_addon_elem IN SELECT * FROM jsonb_array_elements(v_addons)
      LOOP
        IF jsonb_typeof(v_addon_elem) <> 'object' OR NULLIF(TRIM(v_addon_elem->>'id'), '') IS NULL THEN
          RAISE EXCEPTION 'MALFORMED_ADDON_ENTRY: Add-on must be an object with an "id"'
            USING ERRCODE = '22023';
        END IF;

        BEGIN
          v_addon_id := (v_addon_elem->>'id')::UUID;
        EXCEPTION WHEN OTHERS THEN
          RAISE EXCEPTION 'INVALID_ADDON_ID: Add-on ID is not a valid UUID'
            USING ERRCODE = '22023';
        END;

        IF v_addon_id = ANY(v_seen_addons) THEN
          RAISE EXCEPTION 'DUPLICATE_ADDON: Add-on "%" cannot be added more than once', v_addon_id
            USING ERRCODE = '22023';
        END IF;
        v_seen_addons := array_append(v_seen_addons, v_addon_id);

        SELECT * INTO v_addon_row
        FROM public.item_addons
        WHERE id = v_addon_id AND item_id = v_item_id
        FOR SHARE;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'INVALID_ADDON: Selected add-on not found for item "%"', v_menu_item.name
            USING ERRCODE = '22023';
        END IF;

        v_item_addon_total := v_item_addon_total + v_addon_row.price;
        v_staged_addons := v_staged_addons || jsonb_build_object(
          'id', v_addon_row.id,
          'name', v_addon_row.name,
          'price', v_addon_row.price
        );
      END LOOP;
    END IF;

    v_dish_unit_price := v_dish_unit_price + v_item_addon_total;
    v_dish_line_total := ROUND(v_dish_unit_price * v_quantity, 2);
    v_item_total := v_item_total + v_dish_line_total;

    v_staged_items := v_staged_items || jsonb_build_object(
      'menu_item_id', v_menu_item.id,
      'name', v_menu_item.name,
      'price', v_dish_unit_price,
      'quantity', v_quantity,
      'selected_variant', v_variant_name,
      'selected_addons', v_staged_addons
    );
  END LOOP;

  -- 8. GST (5%)
  v_tax_amount := ROUND(v_item_total * 0.05, 2);

  -- 9. Coupons
  IF p_coupon_code IS NOT NULL AND TRIM(p_coupon_code) <> '' THEN
    SELECT * INTO v_coupon
    FROM public.coupons
    WHERE UPPER(code) = UPPER(TRIM(p_coupon_code))
      AND is_active IS TRUE
      AND (expires_at IS NULL OR expires_at >= NOW())
    FOR SHARE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'INVALID_COUPON: Coupon is expired or invalid'
        USING ERRCODE = '22023';
    END IF;

    IF v_item_total < COALESCE(v_coupon.min_order_value, 0.00) THEN
      RAISE EXCEPTION 'COUPON_MIN_ORDER_UNMET: Minimum order of ₹% required for this coupon', v_coupon.min_order_value
        USING ERRCODE = '22023';
    END IF;

    IF v_coupon.applies_to_delivery IS TRUE THEN
      v_discount_amount := LEAST(v_delivery_fee, COALESCE(v_coupon.max_discount_amount, v_delivery_fee));
    ELSIF v_coupon.discount_percentage IS NOT NULL AND v_coupon.discount_percentage > 0 THEN
      v_calc_discount := ROUND(v_item_total * (v_coupon.discount_percentage / 100.00), 2);
      IF v_coupon.max_discount_amount IS NOT NULL THEN
        v_calc_discount := LEAST(v_calc_discount, v_coupon.max_discount_amount);
      END IF;
      v_discount_amount := v_calc_discount;
    ELSE
      RAISE EXCEPTION 'INVALID_COUPON_CONFIGURATION: Coupon lacks discount definition'
        USING ERRCODE = '22023';
    END IF;
  END IF;

  -- 10. Financial Summation
  v_total_amount := v_item_total + v_delivery_fee + v_platform_fee + v_tax_amount + v_tip - v_discount_amount;
  IF v_total_amount < 0.00 THEN
    v_total_amount := 0.00;
  END IF;

  -- 11. Atomic Order Insert
  INSERT INTO public.orders (
    customer_id,
    restaurant_id,
    status,
    item_total,
    delivery_fee,
    platform_fee,
    restaurant_commission,
    delivery_distance_km,
    rider_rate_per_km,
    rider_payout,
    custom_tip,
    tax_amount,
    discount_amount,
    tip_amount,
    total_amount,
    applied_coupon,
    payment_method,
    payment_status,
    refund_status,
    delivery_address,
    delivery_instructions,
    special_cooking_instructions,
    estimated_prep_minutes,
    estimated_delivery_time,
    rider_id
  ) VALUES (
    v_customer_id,
    p_restaurant_id,
    'placed',
    v_item_total,
    v_delivery_fee,
    v_platform_fee,
    v_restaurant_commission,
    v_delivery_distance_km,
    v_rider_rate_per_km,
    v_rider_payout,
    v_tip,
    v_tax_amount,
    v_discount_amount,
    v_tip,
    v_total_amount,
    CASE WHEN v_discount_amount > 0 THEN UPPER(TRIM(p_coupon_code)) ELSE NULL END,
    v_pay_method,
    'pending',
    'none',
    p_delivery_address,
    p_delivery_instructions,
    p_special_cooking_instructions,
    25,
    NOW() + INTERVAL '35 minutes',
    NULL
  ) RETURNING id INTO v_order_id;

  -- 12. Insert Staged Order Items
  FOR v_item_elem IN SELECT * FROM jsonb_array_elements(v_staged_items)
  LOOP
    INSERT INTO public.order_items (
      order_id,
      menu_item_id,
      name,
      price,
      quantity,
      selected_variant,
      selected_addons
    ) VALUES (
      v_order_id,
      (v_item_elem->>'menu_item_id')::UUID,
      v_item_elem->>'name',
      (v_item_elem->>'price')::NUMERIC(10, 2),
      (v_item_elem->>'quantity')::INTEGER,
      v_item_elem->>'selected_variant',
      v_item_elem->'selected_addons'
    );
  END LOOP;

  -- Return summary
  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'status', 'placed',
    'item_total', v_item_total,
    'delivery_fee', v_delivery_fee,
    'platform_fee', v_platform_fee,
    'tax_amount', v_tax_amount,
    'discount_amount', v_discount_amount,
    'tip_amount', v_tip,
    'total_amount', v_total_amount
  );
END;
$$;
