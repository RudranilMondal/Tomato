-- ==============================================================================
-- 🍅 TOMATTTO FOOD DELIVERY PLATFORM: CORE DATABASE SCHEMA
-- Phase 1 & 2 Foundation Schema with RLS, Enums, and Triggers
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'restaurant_owner', 'restaurant_staff', 'rider', 'admin');
CREATE TYPE order_status AS ENUM (
  'placed',
  'accepted',
  'preparing',
  'ready',
  'rider_assigned',
  'picked_up',
  'out_for_delivery',
  'delivered',
  'rejected',
  'cancelled',
  'refunded'
);
CREATE TYPE payment_status AS ENUM ('pending', 'captured', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('upi', 'card', 'netbanking', 'wallet', 'cod');
CREATE TYPE dietary_type AS ENUM ('veg', 'non_veg', 'egg', 'vegan');
CREATE TYPE rider_status AS ENUM ('offline', 'online', 'busy', 'delivering');

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'customer',
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SAVED ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home', -- 'Home', 'Work', 'Other'
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RESTAURANTS
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CUISINES
CREATE TABLE IF NOT EXISTS cuisines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  banner_image TEXT,
  is_popular BOOLEAN DEFAULT FALSE
);

-- 6. RESTAURANT <-> CUISINE JUNCTION
CREATE TABLE IF NOT EXISTS restaurant_cuisines (
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  cuisine_id UUID REFERENCES cuisines(id) ON DELETE CASCADE,
  PRIMARY KEY (restaurant_id, cuisine_id)
);

-- 7. MENU CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  discount_price NUMERIC(10,2),
  dietary dietary_type NOT NULL DEFAULT 'veg',
  image_url TEXT,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_in_stock BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ITEM VARIANTS & ADD-ONS
CREATE TABLE IF NOT EXISTS item_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "Regular", "Large"
  price NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS item_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "Extra Cheese", "Raita"
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00
);

-- 10. COUPONS & PROMOS
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  max_discount_amount NUMERIC(10,2),
  min_order_value NUMERIC(10,2) DEFAULT 199.00,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ
);

-- 11. RIDERS
CREATE TABLE IF NOT EXISTS riders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_type TEXT DEFAULT 'Bike',
  vehicle_number TEXT NOT NULL,
  status rider_status DEFAULT 'offline',
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  rating NUMERIC(2,1) DEFAULT 4.8,
  total_deliveries INTEGER DEFAULT 0,
  earnings_today NUMERIC(10,2) DEFAULT 0.00
);

-- 12. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  rider_id UUID REFERENCES riders(id),
  status order_status DEFAULT 'placed',
  
  item_total NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) DEFAULT 35.00,
  platform_fee NUMERIC(10,2) DEFAULT 5.00,
  tax_amount NUMERIC(10,2) DEFAULT 0.00,
  discount_amount NUMERIC(10,2) DEFAULT 0.00,
  tip_amount NUMERIC(10,2) DEFAULT 0.00,
  total_amount NUMERIC(10,2) NOT NULL,
  
  applied_coupon TEXT REFERENCES coupons(code),
  payment_method payment_method DEFAULT 'upi',
  payment_status payment_status DEFAULT 'pending',
  
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

-- 13. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_variant TEXT,
  selected_addons JSONB
);

-- 14. ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. REVIEWS & RATINGS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access to restaurants, menu items, cuisines
CREATE POLICY "Public can view restaurants" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Public can view menu items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public can view cuisines" ON cuisines FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
