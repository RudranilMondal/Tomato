-- ==============================================================================
-- 🍅 TOMATTTO FOOD DELIVERY PLATFORM: COMPLETE BACKEND MIGRATION (HARDENED)
-- Migration: 20261106201418_tomattto_complete_backend.sql
-- Description: Core tables, missing domains, immutable audit logs, triggers
--              for role-protection, strict order status workflows, wallet balance
--              tamper protection, and fine-grained Row Level Security (RLS).
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. ENUMS (Safe creation avoiding duplicate object errors)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'restaurant_owner', 'restaurant_staff', 'rider', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'placed', 'accepted', 'preparing', 'ready', 'rider_assigned', 
    'picked_up', 'out_for_delivery', 'delivered', 'rejected', 'cancelled', 'refunded'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'captured', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('upi', 'card', 'netbanking', 'wallet', 'cod');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE dietary_type AS ENUM ('veg', 'non_veg', 'egg', 'vegan');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE rider_status AS ENUM ('offline', 'online', 'busy', 'delivering');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM (
    'draft', 'submitted', 'in_review', 'verified', 'approved', 'rejected', 'action_required'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE kyc_doc_type AS ENUM (
    'fssai_cert', 'pan_card', 'gst_cert', 'bank_proof', 
    'aadhaar_card', 'driving_license', 'vehicle_rc', 'menu_copy'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE wallet_txn_type AS ENUM ('credit', 'debit');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE wallet_txn_source AS ENUM (
    'cashback', 'refund', 'topup', 'order_payment', 'admin_adjustment'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payout_status AS ENUM ('scheduled', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payout_schedule AS ENUM ('daily', 'weekly', 'biweekly', 'monthly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'order_update', 'promo', 'system', 'payout', 'verification'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_gateway AS ENUM ('razorpay', 'stripe', 'cashfree', 'phonepe', 'simulated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE refund_status AS ENUM ('none', 'initiated', 'processed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==============================================================================
-- 3. CORE IDENTITY & USER PROFILES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'customer',
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. RESTAURANTS & CATALOG
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  cover_image TEXT,
  logo_image TEXT,
  rating NUMERIC(2,1) DEFAULT 4.5,
  rating_count INTEGER DEFAULT 0,
  avg_prep_time_minutes INTEGER DEFAULT 25,
  cost_for_two INTEGER DEFAULT 400,
  is_pure_veg BOOLEAN DEFAULT FALSE,
  is_open BOOLEAN DEFAULT TRUE,
  fssai_licence_number TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address_text TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  commission_percentage NUMERIC(4,2) DEFAULT 18.00,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.cuisines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  banner_image TEXT,
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.restaurant_cuisines (
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  cuisine_id UUID REFERENCES public.cuisines(id) ON DELETE CASCADE,
  PRIMARY KEY (restaurant_id, cuisine_id)
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  discount_price NUMERIC(10,2) CHECK (discount_price IS NULL OR discount_price <= price),
  dietary dietary_type NOT NULL DEFAULT 'veg',
  image_url TEXT,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_in_stock BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.item_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.item_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER CHECK (discount_percentage BETWEEN 1 AND 100),
  max_discount_amount NUMERIC(10,2),
  min_order_value NUMERIC(10,2) DEFAULT 199.00,
  applies_to_delivery BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. PERSISTENT SHOPPING CARTS
-- ==============================================================================

-- Ensure applies_to_delivery column and backfill FREESHIP attributes
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS applies_to_delivery BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.coupons
SET applies_to_delivery = TRUE,
    max_discount_amount = 40.00,
    min_order_value = 249.00
WHERE UPPER(code) = 'FREESHIP';

CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  selected_variant JSONB DEFAULT NULL,
  selected_addons JSONB DEFAULT '[]'::jsonb,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. RIDERS & ACTIVE STATUS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_type TEXT DEFAULT 'Bike',
  vehicle_number TEXT NOT NULL,
  status rider_status DEFAULT 'offline',
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  rating NUMERIC(2,1) DEFAULT 4.8,
  total_deliveries INTEGER DEFAULT 0,
  earnings_today NUMERIC(10,2) DEFAULT 0.00,
  is_verified BOOLEAN DEFAULT FALSE,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- ==============================================================================
-- 7. ORDERS, ITEMS & TRACKING
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  rider_id UUID REFERENCES public.riders(id),
  status order_status DEFAULT 'placed',
  
  item_total NUMERIC(10,2) NOT NULL CHECK (item_total >= 0),
  delivery_fee NUMERIC(10,2) DEFAULT 35.00 CHECK (delivery_fee >= 0),
  platform_fee NUMERIC(10,2) DEFAULT 5.00 CHECK (platform_fee >= 0),
  tax_amount NUMERIC(10,2) DEFAULT 0.00 CHECK (tax_amount >= 0),
  discount_amount NUMERIC(10,2) DEFAULT 0.00 CHECK (discount_amount >= 0),
  tip_amount NUMERIC(10,2) DEFAULT 0.00 CHECK (tip_amount >= 0),
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  
  applied_coupon TEXT REFERENCES public.coupons(code),
  payment_method payment_method DEFAULT 'upi',
  payment_status payment_status DEFAULT 'pending',
  refund_status refund_status DEFAULT 'none',
  
  delivery_address JSONB NOT NULL,
  delivery_instructions TEXT,
  special_cooking_instructions TEXT,
  
  estimated_prep_minutes INTEGER DEFAULT 25,
  estimated_delivery_time TIMESTAMPTZ,
  pickup_otp TEXT,
  delivery_otp TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_status refund_status DEFAULT 'none';

-- Secure OTP storage isolated from standard client order queries
CREATE TABLE IF NOT EXISTS public.order_otps (
  order_id UUID PRIMARY KEY REFERENCES public.orders(id) ON DELETE CASCADE,
  pickup_otp TEXT NOT NULL,
  delivery_otp TEXT NOT NULL,
  pickup_verified BOOLEAN DEFAULT FALSE,
  delivery_verified BOOLEAN DEFAULT FALSE,
  pickup_attempts INTEGER DEFAULT 0,
  delivery_attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  is_pickup_locked BOOLEAN DEFAULT FALSE,
  is_delivery_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_otps ADD COLUMN IF NOT EXISTS pickup_attempts INTEGER DEFAULT 0;
ALTER TABLE public.order_otps ADD COLUMN IF NOT EXISTS delivery_attempts INTEGER DEFAULT 0;
ALTER TABLE public.order_otps ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 5;
ALTER TABLE public.order_otps ADD COLUMN IF NOT EXISTS is_pickup_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE public.order_otps ADD COLUMN IF NOT EXISTS is_delivery_locked BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  selected_variant TEXT,
  selected_addons JSONB
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_status_history ADD COLUMN IF NOT EXISTS changed_by UUID REFERENCES public.profiles(id);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_reviews_order_id'
  ) THEN
    ALTER TABLE public.reviews ADD CONSTRAINT uq_reviews_order_id UNIQUE (order_id);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==============================================================================
-- 8. RESTAURANT PARTNER ONBOARDING & COMPLIANCE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.restaurant_partner_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_ref TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ownership_token_hash TEXT NOT NULL,
  status application_status NOT NULL DEFAULT 'draft',
  
  -- Step 1 Details
  restaurant_name TEXT NOT NULL,
  restaurant_type TEXT DEFAULT 'Dine-in & Delivery',
  cuisines TEXT[] DEFAULT '{}',
  description TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  manager_name TEXT,
  manager_phone TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  operating_hours JSONB DEFAULT '{}'::jsonb,
  
  -- Workflow & Review Tracking
  rejection_reason TEXT,
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank & Tax Details isolated from public access
CREATE TABLE IF NOT EXISTS public.restaurant_partner_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.restaurant_partner_applications(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  
  -- Step 2: Verification details
  legal_entity_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  pan_number_masked TEXT NOT NULL,
  pan_number_encrypted TEXT,
  has_gst BOOLEAN DEFAULT TRUE,
  gstin TEXT,
  fssai_license_number TEXT NOT NULL,
  fssai_expiry_date DATE NOT NULL,
  
  -- Step 3: Bank details
  bank_name TEXT NOT NULL,
  bank_account_holder TEXT NOT NULL,
  bank_account_number_masked TEXT NOT NULL,
  bank_account_number_encrypted TEXT,
  bank_ifsc TEXT NOT NULL,
  bank_account_type TEXT DEFAULT 'current',
  payout_schedule payout_schedule DEFAULT 'weekly',
  
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.restaurant_partner_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.restaurant_partner_applications(id) ON DELETE CASCADE,
  doc_type kyc_doc_type NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'partner-kyc-documents',
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status verification_status DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.partner_application_recovery_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.restaurant_partner_applications(id) ON DELETE CASCADE,
  ticket_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. RIDER ONBOARDING & VERIFICATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.rider_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  application_ref TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'Bike',
  vehicle_number TEXT NOT NULL,
  driving_license_number TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  status application_status DEFAULT 'draft',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rider_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_application_id UUID REFERENCES public.rider_applications(id) ON DELETE CASCADE,
  rider_id UUID REFERENCES public.riders(id) ON DELETE CASCADE,
  doc_type kyc_doc_type NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'rider-kyc-documents',
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status verification_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. PAYMENTS, TRANSACTIONS & REFUNDS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'INR',
  gateway payment_gateway DEFAULT 'simulated',
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  gateway_signature TEXT,
  payment_method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  error_code TEXT,
  error_description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  gateway_refund_id TEXT,
  reason TEXT,
  status refund_status DEFAULT 'initiated',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. WALLETS & TRANSACTIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_wallets (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_user_id UUID NOT NULL REFERENCES public.user_wallets(user_id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  type wallet_txn_type NOT NULL,
  source wallet_txn_source NOT NULL,
  description TEXT NOT NULL,
  reference_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  balance_after NUMERIC(10,2) NOT NULL CHECK (balance_after >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. RESTAURANT PAYOUTS & RIDER EARNINGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.restaurant_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  gross_sales NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (gross_sales >= 0),
  platform_commission NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (platform_commission >= 0),
  tax_deducted NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (tax_deducted >= 0),
  net_payout NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (net_payout >= 0),
  status payout_status DEFAULT 'scheduled',
  utr_number TEXT,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rider_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
  tip_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (tip_amount >= 0),
  surge_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (surge_amount >= 0),
  total_earned NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (total_earned >= 0),
  status payout_status DEFAULT 'scheduled',
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 13. NOTIFICATIONS, AUDIT & PLATFORM SETTINGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'system',
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 14. PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON public.restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_geo ON public.restaurants(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_carts_user ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_rider ON public.orders(rider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_history_order ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_partner_app_ref ON public.restaurant_partner_applications(application_ref);
CREATE INDEX IF NOT EXISTS idx_partner_app_user ON public.restaurant_partner_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_app_status ON public.restaurant_partner_applications(status);
CREATE INDEX IF NOT EXISTS idx_rider_app_user ON public.rider_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_order ON public.payment_transactions(gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_wallet_txns_user ON public.wallet_transactions(wallet_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.user_notifications(user_id, is_read);

-- ==============================================================================
-- 15. SECURITY DEFINER HELPER FUNCTIONS & INTEGRITY TRIGGERS
-- ==============================================================================

-- Check if the current executing context is a trusted service-role or database administrator
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- 1. Direct superuser, postgres, or internal supabase administrator
  IF current_user IN ('postgres', 'supabase_admin') THEN
    RETURN TRUE;
  END IF;

  -- 2. Supabase PostgREST / GoTrue auth JWT role claim
  BEGIN
    IF auth.role() = 'service_role' THEN
      RETURN TRUE;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  BEGIN
    IF (auth.jwt() ->> 'role') = 'service_role' THEN
      RETURN TRUE;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN FALSE;
END;
$$;

-- Check if a given user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Protect profile fields on INSERT and UPDATE (prevents role elevation and tampering)
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- On INSERT, ensure regular users cannot create admin/privileged profiles or create profiles for other user IDs
  IF (TG_OP = 'INSERT') THEN
    IF public.is_service_role() THEN
      RETURN NEW;
    END IF;

    IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
      IF NEW.id <> auth.uid() THEN
        RAISE EXCEPTION 'Access denied: You can only create a profile for your own authenticated user ID.';
      END IF;
      IF NEW.role IS DISTINCT FROM 'customer' THEN
        NEW.role := 'customer';
      END IF;
      IF NEW.is_active IS FALSE THEN
        NEW.is_active := TRUE;
      END IF;
    ELSIF auth.uid() IS NULL THEN
      -- Anonymous context without service role
      IF NEW.role IS DISTINCT FROM 'customer' THEN
        NEW.role := 'customer';
      END IF;
      IF NEW.is_active IS FALSE THEN
        NEW.is_active := TRUE;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- On UPDATE, strictly prevent non-admins from changing role, active state, id, or created_at
  IF (TG_OP = 'UPDATE') THEN
    IF public.is_service_role() THEN
      NEW.updated_at := NOW();
      RETURN NEW;
    END IF;

    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Access denied: Unauthenticated users cannot modify profiles.';
    END IF;

    IF NOT public.is_admin(auth.uid()) THEN
      IF (OLD.role IS DISTINCT FROM NEW.role) THEN
        RAISE EXCEPTION 'Access denied: Only platform administrators can change user roles.';
      END IF;
      IF (OLD.is_active IS DISTINCT FROM NEW.is_active) THEN
        RAISE EXCEPTION 'Access denied: Only platform administrators can deactivate or activate profiles.';
      END IF;
      IF (OLD.id IS DISTINCT FROM NEW.id) THEN
        RAISE EXCEPTION 'Access denied: Profile ID is immutable.';
      END IF;
      IF (OLD.created_at IS DISTINCT FROM NEW.created_at) THEN
        RAISE EXCEPTION 'Access denied: Profile created_at timestamp is immutable.';
      END IF;
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_fields();

-- Auto-provision a customer wallet when a profile is created
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_wallets (user_id, balance)
  VALUES (NEW.id, 0.00)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_profile_created_wallet ON public.profiles;
CREATE TRIGGER trg_on_profile_created_wallet
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_wallet();

-- Restrict restaurant profile updates (commission, ratings, ownership and verification are admin-controlled)
CREATE OR REPLACE FUNCTION public.protect_restaurant_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_service_role() THEN
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Unauthenticated users cannot modify restaurants.';
  END IF;

  IF NOT public.is_admin(auth.uid()) THEN
    IF (OLD.id IS DISTINCT FROM NEW.id) THEN
      RAISE EXCEPTION 'Access denied: Restaurant ID is immutable.';
    END IF;
    IF (OLD.owner_id IS DISTINCT FROM NEW.owner_id) THEN
      RAISE EXCEPTION 'Access denied: Restaurant ownership can only be transferred by administrators.';
    END IF;
    IF (OLD.commission_percentage IS DISTINCT FROM NEW.commission_percentage) THEN
      RAISE EXCEPTION 'Access denied: Restaurant commission percentage can only be modified by administrators.';
    END IF;
    IF (OLD.is_verified IS DISTINCT FROM NEW.is_verified) THEN
      RAISE EXCEPTION 'Access denied: Restaurant verification status can only be modified by administrators.';
    END IF;
    IF (OLD.rating IS DISTINCT FROM NEW.rating) OR (OLD.rating_count IS DISTINCT FROM NEW.rating_count) THEN
      RAISE EXCEPTION 'Access denied: Restaurant ratings and rating counts cannot be directly modified.';
    END IF;
    IF (OLD.created_at IS DISTINCT FROM NEW.created_at) THEN
      RAISE EXCEPTION 'Access denied: Restaurant created_at timestamp is immutable.';
    END IF;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_restaurant_fields ON public.restaurants;
CREATE TRIGGER trg_protect_restaurant_fields
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.protect_restaurant_fields();

-- Protect rider records from untrusted balance/verification tampering
CREATE OR REPLACE FUNCTION public.protect_rider_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_service_role() THEN
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Unauthenticated users cannot modify rider details.';
  END IF;

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
    IF (OLD.created_at IS DISTINCT FROM NEW.created_at) THEN
      RAISE EXCEPTION 'Access denied: Rider created_at timestamp is immutable.';
    END IF;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_rider_fields ON public.riders;
CREATE TRIGGER trg_protect_rider_fields
BEFORE UPDATE ON public.riders
FOR EACH ROW
EXECUTE FUNCTION public.protect_rider_fields();

-- Enforce strict role-based order updates and prevent financial tampering
CREATE OR REPLACE FUNCTION public.validate_order_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN := FALSE;
  v_is_owner BOOLEAN := FALSE;
  v_is_rider BOOLEAN := FALSE;
  v_is_customer BOOLEAN := FALSE;
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

  v_is_customer := (auth.uid() = OLD.customer_id);
  v_is_owner := EXISTS (
    SELECT 1 FROM public.restaurants r 
    WHERE r.id = OLD.restaurant_id AND r.owner_id = auth.uid()
  );
  v_is_rider := EXISTS (
    SELECT 1 FROM public.riders rd 
    WHERE rd.id = OLD.rider_id AND rd.profile_id = auth.uid()
  );

  -- 1. Universal immutable fields for all non-admin roles:
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

  -- 2. Validate customer permissions
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

  -- 3. Validate restaurant owner permissions
  IF v_is_owner THEN
    -- Restaurant owner CANNOT change rider assignment, delivery address, or customer instructions
    IF (OLD.rider_id IS DISTINCT FROM NEW.rider_id) OR
       (OLD.delivery_address IS DISTINCT FROM NEW.delivery_address) OR
       (OLD.delivery_instructions IS DISTINCT FROM NEW.delivery_instructions) OR
       (OLD.special_cooking_instructions IS DISTINCT FROM NEW.special_cooking_instructions) THEN
      RAISE EXCEPTION 'Access denied: Restaurant owners cannot modify rider assignment, delivery address, or customer instructions.';
    END IF;

    -- Restaurant owner can transition: placed -> accepted, accepted -> preparing, preparing -> ready, placed -> rejected
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
      IF NOT (
        (OLD.status = 'placed' AND NEW.status IN ('accepted', 'rejected')) OR
        (OLD.status = 'accepted' AND NEW.status = 'preparing') OR
        (OLD.status = 'preparing' AND NEW.status = 'ready')
      ) THEN
        RAISE EXCEPTION 'Invalid status transition for restaurant owner: % -> %', OLD.status, NEW.status;
      END IF;
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  -- 4. Validate rider permissions
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

    -- Strict intended sequence: ready -> picked_up -> out_for_delivery -> delivered
    -- Direct updates cannot bypass atomic OTP verification
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
      IF (OLD.status = 'ready' AND NEW.status = 'picked_up') THEN
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
        RAISE EXCEPTION 'Invalid status transition for rider: % -> %. Riders must follow sequence: ready -> picked_up -> out_for_delivery -> delivered.', OLD.status, NEW.status;
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

-- Automatically log all order status changes into order_status_history
CREATE OR REPLACE FUNCTION public.log_order_status_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.order_status_history (
      order_id,
      status,
      note,
      changed_by
    ) VALUES (
      NEW.id,
      NEW.status,
      CONCAT('Status changed from ', OLD.status, ' to ', NEW.status),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_order_status_history ON public.orders;
CREATE TRIGGER trg_log_order_status_history
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_order_status_history();

-- Protect wallet balances from direct client update
CREATE OR REPLACE FUNCTION public.protect_wallet_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service role and superusers can manage balances
  IF public.is_service_role() THEN
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  -- Block any non-admin (including anonymous callers) from altering wallet balances directly
  IF auth.uid() IS NULL OR NOT public.is_admin(auth.uid()) THEN
    IF (OLD.balance IS DISTINCT FROM NEW.balance) THEN
      RAISE EXCEPTION 'Access denied: Wallet balances can only be updated via verified financial transactions.';
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_wallet_balance ON public.user_wallets;
CREATE TRIGGER trg_protect_wallet_balance
BEFORE UPDATE ON public.user_wallets
FOR EACH ROW
EXECUTE FUNCTION public.protect_wallet_balance();

-- Enforce order item integrity (prevents injection into processed orders and enforces server prices)
CREATE OR REPLACE FUNCTION public.validate_order_item_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_status order_status;
  v_actual_price NUMERIC(10,2);
  v_is_in_stock BOOLEAN;
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  -- 1. Ensure associated order is strictly in 'placed' status
  SELECT status INTO v_order_status
  FROM public.orders
  WHERE id = NEW.order_id;

  IF v_order_status IS NULL THEN
    RAISE EXCEPTION 'Order not found for order item.';
  END IF;

  IF v_order_status <> 'placed' THEN
    RAISE EXCEPTION 'Cannot add items to an order that is already being prepared or delivered.';
  END IF;

  -- 2. Validate price against menu_items table
  SELECT COALESCE(discount_price, price), is_in_stock
  INTO v_actual_price, v_is_in_stock
  FROM public.menu_items
  WHERE id = NEW.menu_item_id;

  IF v_actual_price IS NULL THEN
    RAISE EXCEPTION 'Menu item does not exist.';
  END IF;

  IF NOT v_is_in_stock THEN
    RAISE EXCEPTION 'Cannot add item: Item is currently out of stock.';
  END IF;

  -- Enforce server-side authoritative price
  NEW.price := v_actual_price;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_order_item_integrity ON public.order_items;
CREATE TRIGGER trg_validate_order_item_integrity
BEFORE INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_item_integrity();

-- Protect rider applications against self-approval and reviewer tampering
CREATE OR REPLACE FUNCTION public.protect_rider_application_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  IF (TG_OP = 'INSERT') THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
      NEW.user_id := auth.uid();
      -- Force initial status to draft or submitted only
      IF NEW.status NOT IN ('draft', 'submitted') THEN
        NEW.status := 'draft';
      END IF;
      -- Zero out admin reviewer fields
      NEW.reviewed_by := NULL;
      NEW.reviewed_at := NULL;
      NEW.rejection_reason := NULL;
    END IF;
    RETURN NEW;
  END IF;

  IF (TG_OP = 'UPDATE') THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
      IF OLD.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Access denied: You can only update your own application.';
      END IF;
      IF (OLD.id IS DISTINCT FROM NEW.id) OR (OLD.application_ref IS DISTINCT FROM NEW.application_ref) OR (OLD.user_id IS DISTINCT FROM NEW.user_id) THEN
        RAISE EXCEPTION 'Access denied: Application identifiers are immutable.';
      END IF;
      IF (OLD.reviewed_by IS DISTINCT FROM NEW.reviewed_by) OR 
         (OLD.reviewed_at IS DISTINCT FROM NEW.reviewed_at) OR 
         (OLD.rejection_reason IS DISTINCT FROM NEW.rejection_reason) THEN
        RAISE EXCEPTION 'Access denied: Reviewer fields can only be modified by administrators.';
      END IF;
      IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        IF NOT (OLD.status = 'draft' AND NEW.status = 'submitted') THEN
          RAISE EXCEPTION 'Applicants can only submit draft applications for review.';
        END IF;
      END IF;
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_rider_application_fields ON public.rider_applications;
CREATE TRIGGER trg_protect_rider_application_fields
BEFORE INSERT OR UPDATE ON public.rider_applications
FOR EACH ROW
EXECUTE FUNCTION public.protect_rider_application_fields();

-- Protect restaurant partner applications against self-approval and reviewer tampering
CREATE OR REPLACE FUNCTION public.protect_partner_application_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  IF (TG_OP = 'INSERT') THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
      NEW.user_id := auth.uid();
      IF NEW.status NOT IN ('draft', 'submitted') THEN
        NEW.status := 'draft';
      END IF;
      NEW.reviewed_by := NULL;
      NEW.reviewed_at := NULL;
      NEW.rejection_reason := NULL;
      NEW.reviewer_notes := NULL;
    END IF;
    RETURN NEW;
  END IF;

  IF (TG_OP = 'UPDATE') THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
      IF OLD.user_id IS NOT NULL AND OLD.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Access denied: You can only update your own application.';
      END IF;
      IF (OLD.id IS DISTINCT FROM NEW.id) OR (OLD.application_ref IS DISTINCT FROM NEW.application_ref) THEN
        RAISE EXCEPTION 'Access denied: Application identifiers are immutable.';
      END IF;
      IF (OLD.reviewed_by IS DISTINCT FROM NEW.reviewed_by) OR 
         (OLD.reviewed_at IS DISTINCT FROM NEW.reviewed_at) OR 
         (OLD.rejection_reason IS DISTINCT FROM NEW.rejection_reason) OR
         (OLD.reviewer_notes IS DISTINCT FROM NEW.reviewer_notes) THEN
        RAISE EXCEPTION 'Access denied: Reviewer fields can only be modified by administrators.';
      END IF;
      IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        IF NOT (OLD.status = 'draft' AND NEW.status = 'submitted') THEN
          RAISE EXCEPTION 'Applicants can only submit draft applications for review.';
        END IF;
      END IF;
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_partner_application_fields ON public.restaurant_partner_applications;
CREATE TRIGGER trg_protect_partner_application_fields
BEFORE INSERT OR UPDATE ON public.restaurant_partner_applications
FOR EACH ROW
EXECUTE FUNCTION public.protect_partner_application_fields();

-- Validate review submissions (strictly delivered orders, matches customer and restaurant)
CREATE OR REPLACE FUNCTION public.validate_review_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_status order_status;
  v_order_customer_id UUID;
  v_order_restaurant_id UUID;
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  SELECT status, customer_id, restaurant_id 
  INTO v_order_status, v_order_customer_id, v_order_restaurant_id
  FROM public.orders
  WHERE id = NEW.order_id;

  IF v_order_status IS NULL THEN
    RAISE EXCEPTION 'Order not found for review.';
  END IF;

  IF v_order_status <> 'delivered' THEN
    RAISE EXCEPTION 'Reviews are only permitted for delivered orders.';
  END IF;

  IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
    IF v_order_customer_id <> auth.uid() OR NEW.customer_id <> auth.uid() THEN
      RAISE EXCEPTION 'You can only review orders that you placed.';
    END IF;
  END IF;

  NEW.restaurant_id := v_order_restaurant_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_review_submission ON public.reviews;
CREATE TRIGGER trg_validate_review_submission
BEFORE INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.validate_review_submission();

-- Protect initial order placement against client spoofing
CREATE OR REPLACE FUNCTION public.protect_order_placement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Unauthenticated users cannot place orders.';
  END IF;

  -- 1. Enforce that customer can only place order for their own authenticated profile
  NEW.customer_id := auth.uid();

  -- 2. Strictly enforce initial unfulfilled order states
  NEW.status := 'placed';
  NEW.payment_status := 'pending';
  NEW.refund_status := 'none';
  NEW.rider_id := NULL;
  NEW.created_at := NOW();
  NEW.updated_at := NOW();

  -- 3. Enforce default platform fee if not set or tampered
  IF NEW.platform_fee IS NULL OR NEW.platform_fee < 5.00 THEN
    NEW.platform_fee := 5.00;
  END IF;

  -- 4. Validate applied coupon if provided
  IF NEW.applied_coupon IS NOT NULL AND TRIM(NEW.applied_coupon) <> '' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.coupons
      WHERE code = TRIM(NEW.applied_coupon)
        AND is_active = TRUE
        AND (expires_at IS NULL OR expires_at > NOW())
    ) THEN
      RAISE EXCEPTION 'Invalid or expired coupon code: %', NEW.applied_coupon;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_order_placement ON public.orders;
CREATE TRIGGER trg_protect_order_placement
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.protect_order_placement();

-- Automatically isolate order OTPs into order_otps table and mask them in public.orders
CREATE OR REPLACE FUNCTION public.sync_order_otps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pickup_otp TEXT;
  v_delivery_otp TEXT;
BEGIN
  -- Untrusted clients CANNOT supply or override OTP values.
  -- Only backend service_role or platform administrators may specify custom values for testing.
  IF public.is_service_role() OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())) THEN
    v_pickup_otp := COALESCE(NULLIF(NEW.pickup_otp, ''), (1000 + (('x' || encode(gen_random_bytes(2), 'hex'))::bit(16)::integer % 9000))::TEXT);
    v_delivery_otp := COALESCE(NULLIF(NEW.delivery_otp, ''), (1000 + (('x' || encode(gen_random_bytes(2), 'hex'))::bit(16)::integer % 9000))::TEXT);
  ELSE
    -- For all regular customer/client order creations, ALWAYS generate cryptographically secure server-side OTPs
    v_pickup_otp := (1000 + (('x' || encode(gen_random_bytes(2), 'hex'))::bit(16)::integer % 9000))::TEXT;
    v_delivery_otp := (1000 + (('x' || encode(gen_random_bytes(2), 'hex'))::bit(16)::integer % 9000))::TEXT;
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

  -- Mask plaintext OTPs in public.orders so ordinary queries do not expose them to riders
  NEW.pickup_otp := '••••';
  NEW.delivery_otp := '••••';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_order_otps ON public.orders;
CREATE TRIGGER trg_sync_order_otps
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_order_otps();

-- Secure RPC: Customer retrieves their delivery OTP
CREATE OR REPLACE FUNCTION public.get_customer_delivery_otp(p_order_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  SELECT delivery_otp INTO v_otp FROM public.order_otps WHERE order_id = p_order_id;
  RETURN v_otp;
END;
$$;

-- Secure RPC: Restaurant owner retrieves pickup OTP
CREATE OR REPLACE FUNCTION public.get_restaurant_pickup_otp(p_order_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  SELECT pickup_otp INTO v_otp FROM public.order_otps WHERE order_id = p_order_id;
  RETURN v_otp;
END;
$$;

-- Secure RPC: Rider verifies pickup OTP and transitions order to 'picked_up'
-- Uses pessimistic row-locking (FOR UPDATE) to serialize concurrent requests and eliminate race conditions
CREATE OR REPLACE FUNCTION public.verify_order_pickup_otp(p_order_id UUID, p_otp TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  -- 6. Enforce that order status is strictly 'ready'
  IF v_order_status <> 'ready' THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_STATUS', 'message', format('Order is not ready for pickup (current status: %s).', v_order_status));
  END IF;

  -- 7. Validate OTP with row lock held
  IF TRIM(p_otp) <> TRIM(v_actual_otp) THEN
    -- Increment attempts persistently in the database without raising an exception (prevents transaction rollback)
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

-- Secure RPC: Rider verifies delivery OTP and transitions order to 'delivered'
-- Uses pessimistic row-locking (FOR UPDATE) to serialize concurrent requests and eliminate race conditions
CREATE OR REPLACE FUNCTION public.verify_order_delivery_otp(p_order_id UUID, p_otp TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED', 'message', 'Access denied: Only the assigned delivery rider can verify delivery.');
  END IF;

  -- 3. Exclusively lock the child order_otps row second (orders -> order_otps)
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

  -- 4. Idempotent success check (if already verified and delivered)
  IF v_delivery_verified AND v_order_status = 'delivered' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Order delivery has already been verified.');
  END IF;

  -- 5. Check if delivery verification is locked due to too many failed attempts
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

  -- 6. Enforce that order status is strictly 'out_for_delivery'
  IF v_order_status <> 'out_for_delivery' THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_STATUS', 'message', format('Order is not out for delivery (current status: %s).', v_order_status));
  END IF;

  -- 7. Validate OTP with row lock held
  IF TRIM(p_otp) <> TRIM(v_actual_otp) THEN
    -- Increment attempts persistently in the database without raising an exception (prevents transaction rollback)
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

  -- 8. Valid OTP: mark verified and atomically advance order status
  UPDATE public.order_otps
  SET delivery_verified = TRUE, updated_at = NOW()
  WHERE order_id = p_order_id;

  UPDATE public.orders
  SET status = 'delivered', updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true, 'message', 'Delivery verified successfully. Order status updated to delivered.');
END;
$$;

-- Secure RPC: Restaurant owner retrieves negotiated commission percentage
CREATE OR REPLACE FUNCTION public.get_restaurant_commission(p_restaurant_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_commission NUMERIC(4,2);
BEGIN
  IF public.is_service_role() OR public.is_admin(auth.uid()) THEN
    SELECT commission_percentage INTO v_commission FROM public.restaurants WHERE id = p_restaurant_id;
    RETURN v_commission;
  END IF;

  IF auth.uid() IS NOT NULL THEN
    SELECT commission_percentage INTO v_commission 
    FROM public.restaurants 
    WHERE id = p_restaurant_id AND owner_id = auth.uid();
    RETURN v_commission;
  END IF;

  RETURN NULL;
END;
$$;

-- Restrict function execution permissions to prevent anonymous probing
REVOKE EXECUTE ON FUNCTION public.get_customer_delivery_otp(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_customer_delivery_otp(UUID) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_restaurant_pickup_otp(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_restaurant_pickup_otp(UUID) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.verify_order_pickup_otp(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_order_pickup_otp(UUID, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.verify_order_delivery_otp(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_order_delivery_otp(UUID, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_restaurant_commission(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_restaurant_commission(UUID) TO authenticated, service_role;

-- Secure RPC: Authoritative atomic order creation function
-- Computes prices, taxes, delivery fee, discounts, and totals from trusted database records
-- Drop any historical signatures of create_order to prevent insecure overloads
DROP FUNCTION IF EXISTS public.create_order(UUID, JSONB, JSONB, TEXT, TEXT, TEXT, NUMERIC, payment_method);
DROP FUNCTION IF EXISTS public.create_order(UUID, JSONB, JSONB, TEXT, TEXT, NUMERIC, TEXT, TEXT);

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
  v_delivery_fee NUMERIC(10, 2) := 35.00;
  v_platform_fee NUMERIC(10, 2) := 5.00;
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

  -- 2. Validate tip
  IF p_tip_amount IS NOT NULL THEN
    IF p_tip_amount < 0.00 OR p_tip_amount > 500.00 THEN
      RAISE EXCEPTION 'INVALID_TIP: Tip must be between 0 and 500'
        USING ERRCODE = '22023';
    END IF;
    v_tip := ROUND(p_tip_amount, 2);
  END IF;

  -- 3. Validate payment method against payment_method enum
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

  -- 5. Validate restaurant availability with shared read lock
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

    -- Overflow-safe quantity validation
    IF jsonb_typeof(v_item_elem->'quantity') <> 'number'
       OR (v_item_elem->>'quantity') !~ '^[0-9]{1,2}$'
       OR (v_item_elem->>'quantity')::INTEGER NOT BETWEEN 1 AND 50 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY: Item quantity must be an integer between 1 and 50'
        USING ERRCODE = '22023';
    END IF;
    v_quantity := (v_item_elem->>'quantity')::INTEGER;

    -- Query authoritative menu item with shared lock
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

    -- Base price (discount_price if available, else regular price)
    v_dish_unit_price := COALESCE(v_menu_item.discount_price, v_menu_item.price);
    v_variant_name := NULL;

    -- Optional variant resolution from public.item_variants
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

    -- Optional add-ons resolution from public.item_addons
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

        -- Prevent duplicate add-on IDs for the same item
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

  -- 8. Calculate 5% GST
  v_tax_amount := ROUND(v_item_total * 0.05, 2);

  -- 9. Authoritative Coupon Verification
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

ALTER FUNCTION public.create_order(UUID, JSONB, JSONB, TEXT, TEXT, NUMERIC, TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.create_order(UUID, JSONB, JSONB, TEXT, TEXT, NUMERIC, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_order(UUID, JSONB, JSONB, TEXT, TEXT, NUMERIC, TEXT, TEXT) TO authenticated, service_role;
CREATE OR REPLACE VIEW public.public_restaurants AS
SELECT 
  id,
  owner_id,
  name,
  slug,
  tagline,
  description,
  cover_image,
  logo_image,
  rating,
  rating_count,
  avg_prep_time_minutes,
  cost_for_two,
  is_pure_veg,
  is_open,
  phone,
  email,
  address_text,
  latitude,
  longitude,
  is_verified,
  created_at,
  updated_at
FROM public.restaurants
WHERE is_open = true OR is_verified = true;

-- ==============================================================================
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_partner_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_partner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_application_recovery_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Profiles Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users view their own profile" ON public.profiles;
CREATE POLICY "Users view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users insert their own profile" ON public.profiles;
CREATE POLICY "Users insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users update their own profile" ON public.profiles;
CREATE POLICY "Users update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins delete profiles" ON public.profiles;
CREATE POLICY "Admins delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- Addresses Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users manage their own addresses" ON public.addresses;
CREATE POLICY "Users manage their own addresses"
  ON public.addresses FOR ALL
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- Restaurants & Catalog Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Public can view active restaurants" ON public.restaurants;
CREATE POLICY "Public can view active restaurants"
  ON public.restaurants FOR SELECT
  USING (is_open = true OR auth.uid() = owner_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Owners and admins insert restaurants" ON public.restaurants;
CREATE POLICY "Owners and admins insert restaurants"
  ON public.restaurants FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners and admins update restaurants" ON public.restaurants;
CREATE POLICY "Owners and admins update restaurants"
  ON public.restaurants FOR UPDATE
  USING (auth.uid() = owner_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = owner_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins delete restaurants" ON public.restaurants;
CREATE POLICY "Admins delete restaurants"
  ON public.restaurants FOR DELETE
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public can view cuisines" ON public.cuisines;
CREATE POLICY "Public can view cuisines"
  ON public.cuisines FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage cuisines" ON public.cuisines;
CREATE POLICY "Admins manage cuisines"
  ON public.cuisines FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public can view restaurant cuisines" ON public.restaurant_cuisines;
CREATE POLICY "Public can view restaurant cuisines"
  ON public.restaurant_cuisines FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners manage restaurant cuisines" ON public.restaurant_cuisines;
CREATE POLICY "Owners manage restaurant cuisines"
  ON public.restaurant_cuisines FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND (r.owner_id = auth.uid() OR public.is_admin(auth.uid())))
  );

DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners manage categories" ON public.categories;
CREATE POLICY "Owners manage categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND (r.owner_id = auth.uid() OR public.is_admin(auth.uid())))
  );

DROP POLICY IF EXISTS "Public can view menu items" ON public.menu_items;
CREATE POLICY "Public can view menu items"
  ON public.menu_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners manage menu items" ON public.menu_items;
CREATE POLICY "Owners manage menu items"
  ON public.menu_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND (r.owner_id = auth.uid() OR public.is_admin(auth.uid())))
  );

DROP POLICY IF EXISTS "Public can view item variants" ON public.item_variants;
CREATE POLICY "Public can view item variants"
  ON public.item_variants FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners manage item variants" ON public.item_variants;
CREATE POLICY "Owners manage item variants"
  ON public.item_variants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.menu_items m 
      JOIN public.restaurants r ON r.id = m.restaurant_id 
      WHERE m.id = item_id AND (r.owner_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Public can view item addons" ON public.item_addons;
CREATE POLICY "Public can view item addons"
  ON public.item_addons FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners manage item addons" ON public.item_addons;
CREATE POLICY "Owners manage item addons"
  ON public.item_addons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.menu_items m 
      JOIN public.restaurants r ON r.id = m.restaurant_id 
      WHERE m.id = item_id AND (r.owner_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Public can view active coupons" ON public.coupons;
CREATE POLICY "Public can view active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

DROP POLICY IF EXISTS "Admins manage coupons" ON public.coupons;
CREATE POLICY "Admins manage coupons"
  ON public.coupons FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- Carts Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users manage their own cart" ON public.carts;
CREATE POLICY "Users manage their own cart"
  ON public.carts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their own cart items" ON public.cart_items;
CREATE POLICY "Users manage their own cart items"
  ON public.cart_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.user_id = auth.uid())
  );

-- ------------------------------------------------------------------------------
-- Riders Policies (Restricted: Coordinates & PII visible only to assigned parties)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public view online riders" ON public.riders;
DROP POLICY IF EXISTS "Authorized users view riders" ON public.riders;
CREATE POLICY "Authorized users view riders"
  ON public.riders FOR SELECT
  USING (
    auth.uid() = profile_id
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.rider_id = public.riders.id
        AND (
          o.customer_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = o.restaurant_id AND r.owner_id = auth.uid())
        )
        AND o.status IN ('rider_assigned', 'picked_up', 'out_for_delivery')
    )
  );

DROP POLICY IF EXISTS "Riders and admins update rider state" ON public.riders;
CREATE POLICY "Riders and admins update rider state"
  ON public.riders FOR UPDATE
  USING (auth.uid() = profile_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = profile_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage riders" ON public.riders;
CREATE POLICY "Admins manage riders"
  ON public.riders FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- Orders & Order Items Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authorized users view orders" ON public.orders;
CREATE POLICY "Authorized users view orders"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = customer_id
    OR EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.riders rd WHERE rd.id = rider_id AND rd.profile_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Customers can place orders" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_service_role" ON public.orders;
CREATE POLICY "orders_insert_service_role"
  ON public.orders FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authorized parties can update order status" ON public.orders;
CREATE POLICY "Authorized parties can update order status"
  ON public.orders FOR UPDATE
  USING (
    auth.uid() = customer_id
    OR EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.riders rd WHERE rd.id = rider_id AND rd.profile_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Authorized users view order items" ON public.order_items;
CREATE POLICY "Authorized users view order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_id AND (
        o.customer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = o.restaurant_id AND r.owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.riders rd WHERE rd.id = o.rider_id AND rd.profile_id = auth.uid())
        OR public.is_admin(auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Customers insert order items for own order" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_service_role" ON public.order_items;
CREATE POLICY "order_items_insert_service_role"
  ON public.order_items FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- Order OTPs Policies (Access restricted to Admins & Service Role; users access via RPC)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins manage order otps" ON public.order_otps;
CREATE POLICY "Admins manage order otps"
  ON public.order_otps FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authorized users view order status history" ON public.order_status_history;
CREATE POLICY "Authorized users view order status history"
  ON public.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_id AND (
        o.customer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = o.restaurant_id AND r.owner_id = auth.uid())
        OR public.is_admin(auth.uid())
      )
    )
  );

-- ------------------------------------------------------------------------------
-- Reviews Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Customers create reviews for delivered orders" ON public.reviews;
CREATE POLICY "Customers create reviews for delivered orders"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid() AND o.status = 'delivered')
  );

DROP POLICY IF EXISTS "Customers update own reviews" ON public.reviews;
CREATE POLICY "Customers update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = customer_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = customer_id OR public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- Restaurant Partner Application & Financials Policies
-- ------------------------------------------------------------------------------
-- Public/anonymous queries are denied; edge functions use service role.
-- Authenticated applicants can view their own application; Admins view all.
DROP POLICY IF EXISTS "Applicants and admins view applications" ON public.restaurant_partner_applications;
CREATE POLICY "Applicants and admins view applications"
  ON public.restaurant_partner_applications FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Applicants can insert draft applications" ON public.restaurant_partner_applications;
CREATE POLICY "Applicants can insert draft applications"
  ON public.restaurant_partner_applications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Applicants can update draft applications" ON public.restaurant_partner_applications;
CREATE POLICY "Applicants can update draft applications"
  ON public.restaurant_partner_applications FOR UPDATE
  USING (
    (auth.uid() = user_id AND status = 'draft')
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    (auth.uid() = user_id AND status IN ('draft', 'submitted'))
    OR public.is_admin(auth.uid())
  );

-- Sensitive financial and KYC documents: ONLY accessible by Admins or Service Role
DROP POLICY IF EXISTS "Only admins view partner financials" ON public.restaurant_partner_financials;
CREATE POLICY "Only admins view partner financials"
  ON public.restaurant_partner_financials FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins view partner documents" ON public.restaurant_partner_documents;
CREATE POLICY "Only admins view partner documents"
  ON public.restaurant_partner_documents FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins view recovery tickets" ON public.partner_application_recovery_tickets;
CREATE POLICY "Only admins view recovery tickets"
  ON public.partner_application_recovery_tickets FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- Rider Applications & Documents Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Riders view own application" ON public.rider_applications;
CREATE POLICY "Riders view own application"
  ON public.rider_applications FOR SELECT
  USING ((auth.uid() IS NOT NULL AND auth.uid() = user_id) OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Riders insert own application" ON public.rider_applications;
CREATE POLICY "Riders insert own application"
  ON public.rider_applications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Riders update draft application" ON public.rider_applications;
CREATE POLICY "Riders update draft application"
  ON public.rider_applications FOR UPDATE
  USING ((auth.uid() = user_id AND status = 'draft') OR public.is_admin(auth.uid()))
  WITH CHECK ((auth.uid() = user_id AND status IN ('draft', 'submitted')) OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage rider applications" ON public.rider_applications;
CREATE POLICY "Admins manage rider applications"
  ON public.rider_applications FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins manage rider documents" ON public.rider_documents;
CREATE POLICY "Only admins manage rider documents"
  ON public.rider_documents FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- Payments & Refunds Policies (Immutable from frontend)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users view their own payment transactions" ON public.payment_transactions;
CREATE POLICY "Users view their own payment transactions"
  ON public.payment_transactions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Untrusted frontend cannot INSERT, UPDATE, or DELETE payment transactions directly.
-- Transactions must be created and updated via verified Edge Functions using service_role.
DROP POLICY IF EXISTS "Admins can view all payment transactions" ON public.payment_transactions;
CREATE POLICY "Admins can view all payment transactions"
  ON public.payment_transactions FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users view refunds for their orders" ON public.payment_refunds;
CREATE POLICY "Users view refunds for their orders"
  ON public.payment_refunds FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- Wallets & Wallet Transactions Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users view their own wallet" ON public.user_wallets;
CREATE POLICY "Users view their own wallet"
  ON public.user_wallets FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Direct INSERT or UPDATE to user_wallets from untrusted client is disallowed (handled by triggers & service_role)
DROP POLICY IF EXISTS "Admins manage user wallets" ON public.user_wallets;
CREATE POLICY "Admins manage user wallets"
  ON public.user_wallets FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users view their own wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Users view their own wallet transactions"
  ON public.wallet_transactions FOR SELECT
  USING (auth.uid() = wallet_user_id OR public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- Payouts & Earnings Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Restaurant owners view their payouts" ON public.restaurant_payouts;
CREATE POLICY "Restaurant owners view their payouts"
  ON public.restaurant_payouts FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admins manage restaurant payouts" ON public.restaurant_payouts;
CREATE POLICY "Admins manage restaurant payouts"
  ON public.restaurant_payouts FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Riders view their earnings" ON public.rider_earnings;
CREATE POLICY "Riders view their earnings"
  ON public.rider_earnings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.riders rd WHERE rd.id = rider_id AND rd.profile_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admins manage rider earnings" ON public.rider_earnings;
CREATE POLICY "Admins manage rider earnings"
  ON public.rider_earnings FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- Notifications Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users view own notifications" ON public.user_notifications;
CREATE POLICY "Users view own notifications"
  ON public.user_notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users mark notifications as read" ON public.user_notifications;
CREATE POLICY "Users mark notifications as read"
  ON public.user_notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own notifications" ON public.user_notifications;
CREATE POLICY "Users delete own notifications"
  ON public.user_notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Admin Audit Logs & Settings Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Only admins view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Only admins view audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public can view public platform settings" ON public.platform_settings;
CREATE POLICY "Public can view public platform settings"
  ON public.platform_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins modify platform settings" ON public.platform_settings;
CREATE POLICY "Only admins modify platform settings"
  ON public.platform_settings FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
