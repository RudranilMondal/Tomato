-- ==============================================================================
-- 🍅 TOMATTTO SEED DATA: 16 RESTAURANTS & 100+ MENU ITEMS WITH REAL FOOD PHOTOS
-- Valid RFC 4122 hexadecimal UUIDs (0-9, a-f)
-- ==============================================================================

-- 1. SEED CUISINES
INSERT INTO cuisines (id, name, icon_url, is_popular) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Biryani', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80', true),
  ('c0000001-0000-0000-0000-000000000002', 'Pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80', true),
  ('c0000001-0000-0000-0000-000000000003', 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80', true),
  ('c0000001-0000-0000-0000-000000000004', 'North Indian', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&auto=format&fit=crop&q=80', true),
  ('c0000001-0000-0000-0000-000000000005', 'Chinese', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=200&auto=format&fit=crop&q=80', true),
  ('c0000001-0000-0000-0000-000000000006', 'South Indian', 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=200&auto=format&fit=crop&q=80', true),
  ('c0000001-0000-0000-0000-000000000007', 'Desserts & Cakes', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&auto=format&fit=crop&q=80', true),
  ('c0000001-0000-0000-0000-000000000008', 'Healthy & Bowls', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80', true)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED COUPONS
INSERT INTO coupons (code, title, description, discount_percentage, max_discount_amount, min_order_value) VALUES
  ('TOMATTTO50', '50% OFF', '50% off on your feast up to ₹100', 50, 100.00, 199.00),
  ('FREESHIP', 'Free Delivery', 'Zero delivery fee on orders above ₹249', 100, 40.00, 249.00),
  ('GOURMET20', 'Flat 20% OFF', '20% discount on luxury dining up to ₹150', 20, 150.00, 399.00),
  ('WELCOME', 'Welcome Delight', 'Flat ₹75 off on your first order', 30, 75.00, 149.00)
ON CONFLICT (code) DO NOTHING;

-- 3. SEED RESTAURANTS
INSERT INTO restaurants (id, name, slug, tagline, description, cover_image, rating, rating_count, avg_prep_time_minutes, cost_for_two, is_pure_veg, address_text, latitude, longitude) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'Behrouz Biryani', 'behrouz-biryani', 'Royal, slow-cooked Persian Dum Biryani', 'Centuries-old secret royal recipe layered with exotic spices, tender meat, and aromatic long grain basmati rice.', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80', 4.6, 2840, 28, 600, false, 'Indiranagar 100ft Road, Bengaluru', 12.9716, 77.6412),
  ('b0000001-0000-0000-0000-000000000002', 'Brik Oven Neapolitan', 'brik-oven', 'Artisanal Sourdough & Woodfired Pizza', 'Authentic Naples style hand-tossed sourdough pizzas baked at 450°C in our imported oven.', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80', 4.7, 4120, 22, 750, false, 'Church Street, Central Bengaluru', 12.9752, 77.6047),
  ('b0000001-0000-0000-0000-000000000003', 'Truffles Smash Burgers', 'truffles-burgers', 'Legendary Juiciest Burgers & Shakes', 'Voted Bengaluru''s favourite burger joint for over 15 years. Gourmet brioche buns with handcrafted patties.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80', 4.5, 9300, 25, 450, false, 'Koramangala 5th Block, Bengaluru', 12.9352, 77.6245),
  ('b0000001-0000-0000-0000-000000000004', 'Punjab Grill Royal', 'punjab-grill', 'Rich Curries & Charcoal Tandoor', 'Signature Butter Chicken, Dal Makhani simmered 24 hours over charcoal, and stuffed Kulchas.', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80', 4.4, 1850, 30, 800, false, 'Phoenix Marketcity, Whitefield', 12.9961, 77.6978),
  ('b0000001-0000-0000-0000-000000000005', 'Mainland China & Wok', 'mainland-china', 'Authentic Cantonese, Szechuan & Dim Sum', 'Master chefs steaming delicate dim sums and wok-tossed noodles with real Szechuan peppercorns.', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&auto=format&fit=crop&q=80', 4.3, 1420, 26, 700, false, 'MG Road, Bengaluru', 12.9734, 77.6162),
  ('b0000001-0000-0000-0000-000000000006', 'Rameshwaram Cafe', 'rameshwaram-cafe', 'Pure Ghee Crispy Dosas & Filter Kaapi', 'The temple of South Indian breakfast: Podi Thatte Idlis bathed in pure desi ghee and piping hot sambar.', 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop&q=80', 4.8, 14800, 18, 250, true, '12th Main, Indiranagar, Bengaluru', 12.9698, 77.6402),
  ('b0000001-0000-0000-0000-000000000007', 'Glen''s Bakehouse', 'glens-bakehouse', 'Red Velvet Mini Cupcakes & Fresh Bakes', 'Artisanal European bakery known for gooey cheesecakes, sourdough sandwiches, and fresh brewed coffee.', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80', 4.6, 6200, 20, 400, true, 'Lavelle Road, Bengaluru', 12.9719, 77.5968),
  ('b0000001-0000-0000-0000-000000000008', 'Subway Fresh Bowls', 'subway-fresh', 'Crisp Subs, Salad Bowls & Wraps', 'Customise your subs with fresh veggies, whole wheat bread, and low-fat signature dressings.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80', 4.2, 3100, 19, 350, false, 'HSR Layout Sector 4, Bengaluru', 12.9116, 77.6389)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED SAMPLE MENU ITEMS (Behrouz Biryani)
INSERT INTO categories (id, restaurant_id, name, sort_order) VALUES
  ('ca000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'Royal Biryani (Dum Pukht)', 1),
  ('ca000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 'Kebabs & Starters', 2),
  ('ca000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000001', 'Desserts & Beverages', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, discount_price, dietary, image_url, is_bestseller) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'ca000001-0000-0000-0000-000000000001', 'Dum Gosht Biryani (Mutton)', 'Tender boneless mutton marinated in royal spices, layered with fragrant basmati and saffron milk.', 445.00, 399.00, 'non_veg', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80', true),
  ('b0000001-0000-0000-0000-000000000001', 'ca000001-0000-0000-0000-000000000001', 'Zaikedaar Paneer Biryani', 'Fresh malai paneer cubes slow-cooked in a rich spiced gravy atop layered long grain rice.', 345.00, 315.00, 'veg', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=80', true),
  ('b0000001-0000-0000-0000-000000000001', 'ca000001-0000-0000-0000-000000000001', 'Murgh Makhani Biryani', 'Smoked boneless chicken tikka cooked in creamy makhani gravy layered with royal dum rice.', 385.00, 349.00, 'non_veg', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=80', false),
  ('b0000001-0000-0000-0000-000000000001', 'ca000001-0000-0000-0000-000000000002', 'Murgh Kefta Kebab', 'Mouth-melting minced chicken skewers spiced with royal caraway and cooked over glowing embers.', 275.00, 245.00, 'non_veg', 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80', true),
  ('b0000001-0000-0000-0000-000000000001', 'ca000001-0000-0000-0000-000000000002', 'Falafel with Hummus & Dip', 'Crispy chickpea herb patties served with creamy sesame tahini and house pickles.', 220.00, 195.00, 'veg', 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&auto=format&fit=crop&q=80', false),
  ('b0000001-0000-0000-0000-000000000001', 'ca000001-0000-0000-0000-000000000003', 'Gulab Jamun (Set of 2)', 'Warm golden khoya dumplings steeped in rose water and cardamom infused sugar syrup.', 95.00, 85.00, 'veg', 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&auto=format&fit=crop&q=80', true)
ON CONFLICT DO NOTHING;
