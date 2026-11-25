/**
 * Tomattto Platform Financial & Pricing Configuration
 * Central single source of truth for platform billing, partner commissions, and rider payouts.
 */

export const PRICING_CONFIG = {
  // Customer-facing order charges
  CUSTOMER_DELIVERY_FEE: 10,     // ₹10 fixed delivery charges
  CUSTOMER_PLATFORM_FEE: 9,      // ₹9 fixed platform fee

  // Restaurant-side charges
  RESTAURANT_COMMISSION_PER_ORDER: 10, // ₹10 fixed commission deducted per completed order

  // Delivery Partner Payouts
  RIDER_PAYOUT_PER_KM: 12,       // ₹12 per km for successfully completed delivery trips

  // Partner & Rider Onboarding Registration Fee (includes Starter Kit: T-shirt & Delivery Bag)
  PARTNER_REGISTRATION_FEE: 499, // ₹499 one-time registration fee for Restaurant Partners
  RIDER_REGISTRATION_FEE: 499,   // ₹499 one-time registration fee for Delivery Partners

  // Predefined Rider Tip Options (₹)
  PREDEFINED_TIPS: [20, 30, 50],
} as const;

export type PricingConfig = typeof PRICING_CONFIG;
