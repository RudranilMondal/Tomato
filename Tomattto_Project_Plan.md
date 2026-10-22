# 🍅 Tomattto: Food Delivery Platform Plan

> A modern, fast, smart food ordering and delivery platform (Zomato-style).
> **Stack:** React Native (Expo) · Supabase · TypeScript
> **Goal of Phase 1:** a visually impressive, clickable demo (~20% of total work) that wins client confidence.

---

## 1. Product Overview

**Tomattto** connects three sides of the food ecosystem:

| Side | Who | What they do |
|---|---|---|
| Demand | Customers | Discover restaurants, order food, track delivery, pay, review |
| Supply | Restaurants | Manage menu, accept/reject orders, track earnings |
| Logistics | Delivery partners | Accept deliveries, navigate, earn money |
| Control | Admin (Tomattto team) | Onboard, moderate, manage payouts, offers, analytics |

### Brand direction
- **Name:** Tomattto
- **Personality:** Fresh, bold, playful, fast.
- **Primary colour:** Tomato red `#FF4B3A` (accent), with a warm off-white background `#FFF8F5`.
- **Secondary:** Deep charcoal `#1E1E24`, basil green `#2ECC71` (success/veg), mustard `#FFB400` (ratings/offers).
- **Typography:** Poppins or Plus Jakarta Sans (headings), Inter (body).
- **Style:** rounded cards (16–24px radius), soft shadows, large food imagery, glassmorphism on overlays, smooth micro-animations, full dark mode.

---

## 2. How Many Apps

**Total: 4 products** (3 mobile apps + 1 web panel), plus an optional marketing site.

| # | Product | Platform | Users |
|---|---|---|---|
| 1 | **Tomattto** (Customer App) | React Native (iOS + Android) | Customers |
| 2 | **Tomattto Partner** (Restaurant App) | React Native (iOS + Android, tablet-friendly) | Restaurant owners/staff |
| 3 | **Tomattto Rider** (Delivery App) | React Native (Android first, iOS later) | Delivery partners |
| 4 | **Tomattto Admin Panel** | Web (React / Next.js + Supabase) | Internal team |
| 5 *(optional)* | Marketing / landing website | Web (Next.js) | Public |

> Tip: build all three mobile apps from one **monorepo** with a shared design system, shared Supabase client, and shared types to save time.

---

## 3. Interfaces (Screens) per App

### 3.1 Customer App: Tomattto

**Onboarding and Auth**
1. Splash screen (animated logo)
2. Onboarding carousel (3 slides)
3. Login / Sign up (phone OTP, Google, Apple)
4. OTP verification
5. Location permission and set delivery location (map pin + search)
6. Profile setup (name, email, avatar)

**Discovery**
7. Home (location header, search bar, banners, cuisines, offers, "Top picks", "Near you", "Trending", filters)
8. Category / cuisine listing
9. Search (live suggestions, recent searches, dishes and restaurants)
10. Filters and sort sheet (rating, delivery time, price, veg/non-veg, offers, distance)
11. Restaurant listing (list and map view)
12. Restaurant detail (cover, info, offers, sticky category tabs, menu, reviews)
13. Dish detail bottom sheet (variants, add-ons, special instructions)
14. Photo gallery / reviews screen

**Ordering**
15. Cart (items, edit, coupons, tip, delivery instructions, bill summary)
16. Apply coupon screen
17. Checkout (address, delivery time, payment method)
18. Address manager (add/edit/delete, map picker, labels Home/Work/Other)
19. Payment screen (UPI, cards, wallet, COD)
20. Order placed (success animation)

**Post-order**
21. Live order tracking (map, status stepper, rider info, ETA)
22. Order history
23. Order detail / invoice
24. Rate & review (restaurant, dish, rider)
25. Help and support (order issues, chat/FAQ)
26. Re-order

**Account**
27. Profile
28. Favourites / wishlist
29. Wallet and Tomattto credits
30. Offers and coupons
31. Notifications centre
32. Refer and earn
33. Settings (language, theme, notifications, privacy)
34. About / Terms / Privacy

### 3.2 Restaurant Partner App: Tomattto Partner
1. Login (phone OTP / email)
2. Onboarding / KYC (FSSAI, GST, PAN, bank details, photos)
3. Dashboard (today's orders, earnings, ratings, online/offline toggle)
4. Incoming order popup (accept/reject with timer and sound)
5. Orders board (New · Preparing · Ready · Picked up · Completed · Cancelled)
6. Order detail (items, customer notes, set prep time)
7. Menu manager (categories, items, add/edit, photos, price, veg tag)
8. Item availability toggle (in stock/out of stock)
9. Offers and discounts manager
10. Restaurant profile (timings, address, cuisines, images)
11. Earnings and payouts (daily/weekly, settlements)
12. Reviews and ratings (reply)
13. Reports and analytics (top dishes, peak hours)
14. Notifications
15. Support
16. Settings

### 3.3 Delivery Partner App: Tomattto Rider
1. Login (OTP)
2. Onboarding / KYC (ID, licence, vehicle, selfie, bank)
3. Home (online/offline toggle, today's stats, heatmap of busy zones)
4. New delivery request (accept/reject with countdown)
5. Navigate to restaurant (map and directions)
6. Pickup confirmation (order verification / OTP)
7. Navigate to customer
8. Delivery confirmation (OTP / photo proof)
9. Earnings (daily, weekly, incentives, tips)
10. Payout and wallet (cash-in-hand, withdrawals)
11. Delivery history
12. Ratings and feedback
13. Support / SOS
14. Profile and documents
15. Settings

### 3.4 Admin Panel (Web)
1. Login (with roles)
2. Dashboard (GMV, orders, active users/riders, revenue, charts)
3. Live orders monitor (map and list)
4. Customer management
5. Restaurant management (approvals, KYC review, suspend, commission)
6. Rider management (approvals, KYC, live location, payouts)
7. Menu / category moderation
8. Order management and refunds
9. Coupons and promotions builder
10. Banners and homepage CMS
11. Cuisine and category management
12. Delivery zones, pricing and fee configuration
13. Payments and settlements
14. Reviews moderation
15. Support tickets
16. Push notification and campaign manager
17. Reports and analytics (exports)
18. Staff and role management (RBAC)
19. App settings (taxes, commission, surge, config flags)

---

## 4. Features (Complete List)

### 4.1 Customer features
- Phone OTP, Google and Apple sign-in; guest browsing
- GPS and manual location, multiple saved addresses
- Smart search: restaurants, dishes, cuisines; typo-tolerant; recent and trending searches
- Filters and sort: rating, delivery time, cost, veg only, offers, distance
- Restaurant detail with sticky menu categories, veg/non-veg marks, bestseller tags
- Dish customisation: variants, add-ons, quantity, special instructions
- Cart with persistence, multi-restaurant warning, bill breakdown (item total, taxes, delivery fee, platform fee, discounts, tip)
- Coupons, offers, referral credits, wallet
- Payments: UPI, cards, net banking, wallets, COD
- Schedule order for later
- Live order tracking on map, status timeline, ETA, call/chat with rider
- Order history, reorder, invoice download
- Ratings and reviews with photos (restaurant, dish, rider)
- Favourites and collections
- Push, SMS and in-app notifications
- Dark mode, multi-language (English, Hindi, Bengali)
- Skeleton loaders, offline-friendly caching, pull-to-refresh
- Help centre and issue reporting

### 4.2 Restaurant features
- KYC onboarding and approval status
- Online/offline and busy mode
- Real-time order alerts (sound and vibration)
- Accept/reject with reasons, set prep time
- Full menu CRUD with image upload, categories, variants, add-ons
- Stock toggle (auto re-enable on schedule)
- Own offers and discounts
- Earnings dashboard, payouts, commission breakdown
- Review replies and analytics
- Staff accounts

### 4.3 Rider features
- KYC onboarding, document upload
- Online/offline shift toggle
- Auto-assignment with accept/reject and timers
- In-app navigation, live location sharing
- Pickup and delivery OTP verification, photo proof
- Earnings, incentives, tips, payouts, cash-in-hand tracking
- SOS and support
- Performance stats

### 4.4 Admin features
- Role-based access, audit logs
- Approvals (restaurants, riders), suspensions
- Live operations map
- Commission, fee, tax and zone configuration
- Coupon/promo engine, banners CMS
- Refunds and disputes
- Settlement and payout management
- Analytics and CSV/PDF exports
- Campaign and notification manager

### 4.5 System-wide "smart" features
- Real-time order status (Supabase Realtime)
- Smart rider assignment (nearest, availability, rating)
- ETA calculation (prep time and travel time)
- Personalised recommendations (past orders, favourite cuisines)
- Surge pricing and peak-hour fees (configurable)
- Fraud checks (coupon abuse, fake orders)
- Image optimisation and CDN delivery

---

## 5. Technical Architecture

### 5.1 Stack
| Layer | Choice |
|---|---|
| Mobile | React Native + **Expo** (TypeScript), Expo Router |
| Styling / UI | NativeWind (Tailwind) or Tamagui; custom design system |
| Animation | Reanimated 3, Moti, Lottie, Skia (hero effects), Gesture Handler |
| Lists / images | FlashList, expo-image (caching, blurhash) |
| State | Zustand (client), TanStack Query (server cache) |
| Forms | React Hook Form + Zod |
| Maps | react-native-maps / Mapbox, Google Places for search |
| Backend | **Supabase**: Postgres, Auth, Storage, Realtime, Edge Functions |
| Geo | PostGIS (nearby restaurants, zones, rider matching) |
| Payments | Razorpay (UPI, cards, wallets) |
| Push | Expo Notifications / FCM / APNs |
| SMS/OTP | Supabase Auth phone provider (Twilio / MSG91) |
| Admin web | Next.js + Tailwind + shadcn/ui + Supabase |
| Analytics | PostHog / Firebase Analytics, Sentry for crashes |
| CI/CD | EAS Build and Update, GitHub Actions |

### 5.2 Supabase usage
- **Auth:** phone OTP, Google, Apple; role claims (customer, restaurant, rider, admin)
- **Database:** Postgres with Row Level Security (RLS) on every table
- **Storage buckets:** `restaurant-images`, `dish-images`, `avatars`, `kyc-documents` (private), `review-photos`, `banners`
- **Realtime:** order status, rider location, new-order alerts
- **Edge Functions:** payment webhooks, order pricing, rider assignment, notifications, refunds
- **Cron (pg_cron):** payout settlement, stock resets, abandoned cart reminders

### 5.3 Core database tables
`profiles` · `addresses` · `restaurants` · `restaurant_timings` · `cuisines` · `categories` · `menu_items` · `item_variants` · `item_addons` · `carts` · `cart_items` · `orders` · `order_items` · `order_status_history` · `payments` · `refunds` · `coupons` · `coupon_usage` · `reviews` · `favourites` · `riders` · `rider_locations` · `deliveries` · `wallets` · `wallet_transactions` · `payouts` · `delivery_zones` · `banners` · `notifications` · `support_tickets` · `app_settings` · `audit_logs`

### 5.4 Order lifecycle
`placed → accepted → preparing → ready → rider_assigned → picked_up → out_for_delivery → delivered`
(side states: `rejected`, `cancelled`, `refunded`)

### 5.5 Suggested monorepo structure
```
tomattto/
├── apps/
│   ├── customer/        # Expo app
│   ├── partner/         # Expo app (restaurants)
│   ├── rider/           # Expo app (delivery)
│   └── admin/           # Next.js
├── packages/
│   ├── ui/              # shared design system (RN components)
│   ├── supabase/        # client, types, queries
│   ├── config/          # eslint, tsconfig, tailwind
│   └── utils/
└── supabase/
    ├── migrations/
    ├── functions/
    └── seed.sql
```

---

## 6. UI / UX Guidelines (Modern · Cool · Smart · Fast)

- **Design system first:** tokens for colours, spacing (4/8 grid), radius, shadows, typography
- **Components:** Button, Input, Chip, Card, RestaurantCard, DishCard, BottomSheet, Stepper, Rating, Badge, Skeleton, Toast, EmptyState
- **Home page wow-factors:** parallax hero banner, auto-scrolling offers carousel, sticky search bar with blur, cuisine icons row, horizontal restaurant rails
- **Restaurant page:** collapsing header, sticky category tabs that sync with scroll, floating cart bar
- **Add-to-cart:** fly-to-cart animation, haptic feedback, animated quantity stepper
- **Tracking screen:** animated rider marker, route polyline, bottom sheet with status steps
- **Success screens:** Lottie confetti
- **Loading:** skeleton shimmers, never blank screens
- **Empty and error states:** friendly illustrations and retry actions
- **Gestures:** swipe to remove cart item, pull to refresh, draggable bottom sheets
- **Accessibility:** min 44px touch targets, contrast AA, dynamic font scaling
- **Dark mode** from day one

### Performance targets
- Cold start under 2.5s on mid-range Android
- 60 fps scrolling (FlashList, memoisation, image caching)
- Home screen API under 400ms (indexed queries, PostGIS, pagination)
- Optimised images (WebP, resized via Supabase image transforms)
- Hermes enabled, bundle size monitored, lazy-loaded screens
- Optimistic UI updates and offline cache via TanStack Query persistence

---

## 7. Phased Roadmap

| Phase | Name | Share of work |
|---|---|---|
| **1** | **Visual Prototype / Client Demo** | **20%** |
| 2 | Core Backend and Customer MVP | 25% |
| 3 | Restaurant and Rider Apps with Realtime | 20% |
| 4 | Payments, Offers, Wallet | 15% |
| 5 | Admin Panel and Operations | 12% |
| 6 | Polish, Testing, Launch | 8% |

---

### 🟢 PHASE 1 (20%): Visual Prototype to Impress the Client

**Objective:** a polished, clickable app that looks and feels like the real product, using **mock data and Supabase for images and a few live reads**, so the client can see the look and flow.

**Deliverables**
1. **Brand and design system:** logo, colours, fonts, component library, light and dark themes
2. **Customer app (main focus, fully styled):**
   - Splash, onboarding carousel, login/OTP screens (UI only, fake OTP accepted)
   - Location selection screen with map
   - **Home** (banners, cuisines, offers, restaurants near you, trending)
   - Search with suggestions and filters sheet
   - Restaurant listing and **restaurant detail** with menu
   - Dish bottom sheet with variants and add-ons
   - **Cart and checkout** UI with bill summary
   - Payment method selection UI
   - Order success animation
   - **Order tracking screen** with animated mock rider on map
   - Order history, favourites, profile, offers, notifications
3. **Restaurant Partner app (UI shells):** login, dashboard, incoming order popup, orders board, menu manager
4. **Rider app (UI shells):** home with online toggle, new request popup, navigation screen, earnings
5. **Admin panel (1 or 2 screens):** dashboard with charts, restaurant list
6. **Supabase setup (minimal):** project created, storage buckets for images, a small `restaurants` / `menu_items` seed so the home screen loads real images and data
7. **Demo build:** Android APK and Expo preview link; optional iOS TestFlight
8. **Demo script:** a 5-minute walkthrough (see below)

**Phase 1 acceptance checklist**
- [ ] All customer-app screens listed above are navigable
- [ ] Animations: splash, add-to-cart, success confetti, tracking marker
- [ ] Light and dark mode
- [ ] Skeleton loaders and empty states
- [ ] 15-20 seeded restaurants with real food photos and 100+ menu items
- [ ] Runs smoothly on a mid-range phone
- [ ] Client demo build delivered

**Suggested 5-minute client demo flow**
1. Open app, splash and onboarding
2. Log in and set location
3. Browse home, apply filter, search "biryani"
4. Open restaurant, scroll menu, customise a dish
5. Add to cart, apply coupon, checkout
6. Order placed, live tracking with moving rider
7. Switch to Partner app: accept order; Rider app: accept delivery
8. Show Admin dashboard

---

### 🟡 PHASE 2 (25%): Core Backend and Customer MVP
- Full database schema, migrations, RLS policies
- Supabase Auth (phone OTP, Google, Apple) with roles
- Real restaurant and menu data, geo-search (PostGIS), pagination
- Search (Postgres full-text and trigram)
- Real addresses, cart persistence, order creation (Edge Function with server-side pricing)
- Order history, favourites, reviews
- Push notification setup
- COD ordering end to end

### 🟡 PHASE 3 (20%): Restaurant and Rider Apps with Realtime
- Partner app: KYC, menu CRUD with image uploads, realtime orders, accept/reject, prep time
- Rider app: KYC, shift toggle, live location, assignment engine, pickup/delivery OTP
- Customer live tracking powered by real rider location
- Order status history and notifications for every transition

### 🟡 PHASE 4 (15%): Payments, Offers, Wallet
- Razorpay integration (UPI, cards, wallets) with webhooks and refunds
- Coupons engine, referral, wallet and credits
- Taxes, delivery fees, platform fee, surge rules
- Earnings, commission and payout calculations (restaurants and riders)
- Invoices (PDF)

### 🟡 PHASE 5 (12%): Admin Panel and Operations
- Full admin panel (all modules in section 3.4)
- Approvals, zones, banners CMS, campaigns
- Refunds, disputes, support tickets
- Analytics dashboards and exports
- RBAC and audit logs

### 🟡 PHASE 6 (8%): Polish, Testing, Launch
- Performance tuning, crash fixes, accessibility pass
- Automated tests (unit, E2E with Maestro/Detox)
- Security review (RLS audit, rate limits, secrets)
- Beta (TestFlight / Play internal testing), feedback round
- Store assets, privacy policy, terms; Play Store and App Store submission
- Monitoring (Sentry, PostHog), backups, runbook

---

## 8. Security and Compliance
- RLS on all tables; private bucket for KYC documents with signed URLs
- Server-side price calculation (never trust the client)
- Rate limiting on OTP and order endpoints
- Webhook signature verification for payments
- PII encryption at rest, minimal data collection
- Compliance (India): FSSAI licence display, GST invoices, DPDP Act consent, payment-gateway KYC
- App store policies (location, notifications, account deletion)

---

## 9. Third-Party Services Checklist
- Supabase project (Pro plan for production)
- Google Maps / Places or Mapbox key
- Razorpay account (business KYC)
- SMS/OTP provider (MSG91 / Twilio)
- Firebase (FCM) and Apple APNs
- Apple Developer ($99/yr) and Google Play Developer ($25 once)
- Sentry and PostHog
- Domain, email (support@), privacy policy page

---

## 10. Risks and Mitigations
| Risk | Mitigation |
|---|---|
| Scope creep | Freeze scope per phase; log new asks for the next phase |
| Rider tracking battery/cost | Throttle location updates (5-10 s while active only) |
| Realtime cost at scale | Subscribe only to relevant channels; use broadcast for locations |
| Payment failures | Webhook-driven status, idempotency keys, retry flows |
| Poor network | Caching, optimistic UI, retry queues |
| Fake orders / coupon abuse | Limits per user/device, fraud rules, COD limits for new users |

---

## 11. Suggested Timeline (1 to 2 developers)
| Phase | Estimate |
|---|---|
| Phase 1 | 2-3 weeks |
| Phase 2 | 4 weeks |
| Phase 3 | 3-4 weeks |
| Phase 4 | 2-3 weeks |
| Phase 5 | 3 weeks |
| Phase 6 | 2 weeks |
| **Total** | **~16-19 weeks** |

---

## 12. Immediate Next Steps
1. Confirm brand colours and logo direction with the client
2. Create the monorepo and Supabase project
3. Build the design system and UI kit
4. Collect food photos and seed data for the demo
5. Build the Phase 1 customer app screens, then the partner/rider shells
6. Prepare the demo build and walkthrough script
