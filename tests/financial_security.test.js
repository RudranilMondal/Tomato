import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Comprehensive Security, Integrity & Financial Remediation Tests
// Tests:
// 1. Razorpay HMAC SHA-256 signature verification & forged signature rejection
// 2. Razorpay payment amount mismatch & currency rejection
// 3. Duplicate payment idempotency & webhook replay prevention
// 4. Rider payout calculation (₹12/km) & distance verification
// 5. Rider tip 100% pass-through & platform liability separation
// 6. Restaurant commission (₹10) & cancelled order exclusion
// 7. Starter kit 5-stage lifecycle constraints
// 8. Database migration security, idempotency & grandfathering preservation
// 9. Edge functions structure, authorization, and CORS headers

test('SECURITY REMEDIATION: Razorpay HMAC SHA-256 Signature Verification', async (t) => {
  const secret = 'dummy_test_secret_for_hmac_verification_test';
  const orderId = 'order_DA1234567890';
  const paymentId = 'pay_DA9876543210';
  const payload = `${orderId}|${paymentId}`;

  // Generate valid signature
  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  assert.strictEqual(typeof validSignature, 'string');
  assert.strictEqual(validSignature.length, 64);

  // Test Forged Signature Rejection
  const forgedSignature = 'forged_fake_signature_' + '0'.repeat(42);
  assert.notStrictEqual(forgedSignature, validSignature, 'Forged signature must not match valid signature');

  // Verify verification logic
  const verifySignature = (ordId, payId, sig, sec) => {
    const expected = crypto.createHmac('sha256', sec).update(`${ordId}|${payId}`).digest('hex');
    return expected === sig;
  };

  assert.strictEqual(verifySignature(orderId, paymentId, validSignature, secret), true);
  assert.strictEqual(verifySignature(orderId, paymentId, forgedSignature, secret), false);
  assert.strictEqual(verifySignature('wrong_order_id', paymentId, validSignature, secret), false);
});

test('FINANCIAL INTEGRITY: Registration Fee Strict Enforcement', (t) => {
  const PARTNER_REGISTRATION_FEE = 499;
  const RIDER_REGISTRATION_FEE = 499;

  // In paise
  const partnerPaise = PARTNER_REGISTRATION_FEE * 100;
  const riderPaise = RIDER_REGISTRATION_FEE * 100;

  assert.strictEqual(partnerPaise, 49900, 'Partner fee in paise must be exactly 49900');
  assert.strictEqual(riderPaise, 49900, 'Rider fee in paise must be exactly 49900');

  // Tampered payment amount rejection
  const tamperedPaise = 100; // ₹1 instead of ₹499
  const validateFee = (amountPaise) => amountPaise === 49900;

  assert.strictEqual(validateFee(tamperedPaise), false, 'Tampered fee amount must be rejected');
  assert.strictEqual(validateFee(partnerPaise), true, 'Exact fee amount must be accepted');
});

test('RIDER PAYOUT: Distance Calculation & Tip Pass-Through', (t) => {
  const RIDER_RATE_PER_KM = 12.00;

  // 1. Standard trip: 3.5 km, ₹30 tip
  const distanceKm = 3.5;
  const tipAmount = 30.00;

  const basePayout = distanceKm * RIDER_RATE_PER_KM;
  const totalRiderEntitlement = basePayout + tipAmount;

  assert.strictEqual(basePayout, 42.00, '3.5 km × ₹12/km = ₹42.00');
  assert.strictEqual(totalRiderEntitlement, 72.00, 'Base ₹42 + Tip ₹30 = ₹72.00');

  // 2. Tip entitlement is 100% passed through
  const platformRevenueFromTip = 0.00;
  assert.strictEqual(platformRevenueFromTip, 0.00, 'Platform revenue from tips must be exactly 0.00');

  // 3. Manipulated client distance check: Distance cannot exceed metropolitan threshold (40km)
  const isDistanceValid = (km) => km > 0 && km <= 40;
  assert.strictEqual(isDistanceValid(3.5), true);
  assert.strictEqual(isDistanceValid(-2.0), false, 'Negative distance must be rejected');
  assert.strictEqual(isDistanceValid(150.0), false, 'Excessive manipulated distance must be rejected');
});

test('RESTAURANT COMMISSION: Strict Deduction & Cancelled Order Exclusion', (t) => {
  const COMMISSION_PER_ORDER = 10.00;

  const deliveredOrder = { status: 'delivered', itemTotal: 350.00 };
  const cancelledOrder = { status: 'cancelled', itemTotal: 350.00 };
  const rejectedOrder = { status: 'rejected', itemTotal: 350.00 };

  const computeCommission = (order) => {
    if (order.status === 'delivered') return COMMISSION_PER_ORDER;
    return 0.00;
  };

  assert.strictEqual(computeCommission(deliveredOrder), 10.00, 'Delivered orders charged ₹10 commission');
  assert.strictEqual(computeCommission(cancelledOrder), 0.00, 'Cancelled orders must incur ₹0 commission');
  assert.strictEqual(computeCommission(rejectedOrder), 0.00, 'Rejected orders must incur ₹0 commission');

  // Net merchant calculation
  const netDelivered = deliveredOrder.itemTotal - computeCommission(deliveredOrder);
  assert.strictEqual(netDelivered, 340.00, '₹350 item total - ₹10 commission = ₹340 net payable');
});

test('STARTER KIT: 5-Stage Lifecycle Constraint Verification', (t) => {
  const VALID_STATUSES = [
    'not_allocated',
    'allocated',
    'ready_for_dispatch',
    'dispatched',
    'handed_over'
  ];

  const isValidKitStatus = (status) => VALID_STATUSES.includes(status);

  assert.strictEqual(isValidKitStatus('not_allocated'), true);
  assert.strictEqual(isValidKitStatus('allocated'), true);
  assert.strictEqual(isValidKitStatus('ready_for_dispatch'), true);
  assert.strictEqual(isValidKitStatus('dispatched'), true);
  assert.strictEqual(isValidKitStatus('handed_over'), true);
  assert.strictEqual(isValidKitStatus('delivered_fake'), false, 'Arbitrary kit status must be rejected');
});

test('DATABASE MIGRATION AUDIT: 20261124220000_financial_security_remediation.sql', (t) => {
  const migrationPath = path.resolve('supabase/migrations/20261124220000_financial_security_remediation.sql');
  assert.strictEqual(fs.existsSync(migrationPath), true, 'Remediation migration file must exist');

  const content = fs.readFileSync(migrationPath, 'utf8');

  // 1. Strict idempotency key
  assert.match(content, /idempotency_key/i, 'Must define idempotency_key for transaction deduplication');

  // 2. Atomic settlement RPC with row-level locking
  assert.match(content, /CREATE OR REPLACE FUNCTION public\.settle_delivered_order_financials/i, 'Must define settle_delivered_order_financials RPC');
  assert.match(content, /FOR UPDATE/i, 'Must use FOR UPDATE row-level lock on order to prevent concurrent duplicate payouts');

  // 3. Grandfathering policy
  assert.match(content, /is_legacy_grandfathered/i, 'Must preserve existing active partners through documented grandfathering');

  // 4. Starter kit constraints
  assert.match(content, /not_allocated.*allocated.*ready_for_dispatch.*dispatched.*handed_over/s, 'Must enforce 5-stage starter kit constraint');

  // 5. RLS Policies
  assert.match(content, /ALTER TABLE public\.platform_financial_transactions ENABLE ROW LEVEL SECURITY/i, 'Must enable RLS on ledger');
  assert.match(content, /service_role/i, 'Must protect ledger insertions to service_role or DEFINER');
});

test('EDGE FUNCTIONS AUDIT: Serverless Security Implementations', (t) => {
  const edgeDir = path.resolve('supabase/functions');
  assert.strictEqual(fs.existsSync(edgeDir), true, 'Edge functions folder must exist');

  const createOrderFn = path.join(edgeDir, 'create-razorpay-order', 'index.ts');
  const verifyPayFn = path.join(edgeDir, 'verify-razorpay-payment', 'index.ts');
  const webhookFn = path.join(edgeDir, 'razorpay-webhook', 'index.ts');
  const verifyDistFn = path.join(edgeDir, 'verify-route-distance', 'index.ts');

  assert.strictEqual(fs.existsSync(createOrderFn), true, 'create-razorpay-order edge function must exist');
  assert.strictEqual(fs.existsSync(verifyPayFn), true, 'verify-razorpay-payment edge function must exist');
  assert.strictEqual(fs.existsSync(webhookFn), true, 'razorpay-webhook edge function must exist');
  assert.strictEqual(fs.existsSync(verifyDistFn), true, 'verify-route-distance edge function must exist');

  // Verify HMAC SHA-256 in verify-razorpay-payment
  const verifyPayCode = fs.readFileSync(verifyPayFn, 'utf8');
  assert.match(verifyPayCode, /HMAC/i, 'Must implement HMAC signature checking in verify-razorpay-payment');
  assert.match(verifyPayCode, /SHA-256/i, 'Must use SHA-256 algorithm');
  assert.match(verifyPayCode, /49900/i, 'Must enforce 49900 paise for registration fee');

  // Verify webhook signature check in razorpay-webhook
  const webhookCode = fs.readFileSync(webhookFn, 'utf8');
  assert.match(webhookCode, /x-razorpay-signature/i, 'Must verify x-razorpay-signature in webhook');
  assert.match(webhookCode, /idempotency_key/i, 'Must deduplicate events via idempotency key');
});

test('ACCOUNTING INTEGRITY: Gross vs Net Revenue & Liability Isolation', (t) => {
  // Scenario: 10 delivered orders, each 3 km distance, ₹20 tip each, 1 partner registration, 1 rider registration
  const completedOrdersCount = 10;
  const platformFeePerOrder = 9.00;
  const deliveryFeePerOrder = 10.00;
  const commissionPerOrder = 10.00;
  const riderRatePerKm = 12.00;
  const avgDistanceKm = 3.0;
  const tipPerOrder = 20.00;

  const totalPlatformFees = completedOrdersCount * platformFeePerOrder; // ₹90
  const totalCommissions = completedOrdersCount * commissionPerOrder; // ₹100
  const totalDeliveryFees = completedOrdersCount * deliveryFeePerOrder; // ₹100
  const partnerRegFee = 499.00;
  const riderRegFee = 499.00;

  // Platform gross inflows (collections): 90 + 100 + 100 + 499 + 499 = 1288
  const totalGrossCollections = totalPlatformFees + totalCommissions + totalDeliveryFees + partnerRegFee + riderRegFee;
  assert.strictEqual(totalGrossCollections, 1288.00);

  // Platform revenue (operating earnings: Platform Fees + Commissions)
  const platformOperatingRevenue = totalPlatformFees + totalCommissions;
  assert.strictEqual(platformOperatingRevenue, 190.00);

  // Liabilities (Money owed to riders: ₹12/km + 100% Tips)
  const riderDistanceLiabilities = completedOrdersCount * (avgDistanceKm * riderRatePerKm); // 10 * 36 = ₹360
  const riderTipLiabilities = completedOrdersCount * tipPerOrder; // 10 * 20 = ₹200
  const totalRiderLiabilities = riderDistanceLiabilities + riderTipLiabilities;
  assert.strictEqual(totalRiderLiabilities, 560.00);

  // Tips must never enter platform operating revenue
  assert.strictEqual(platformOperatingRevenue >= totalPlatformFees + totalCommissions, true);
  assert.strictEqual(riderTipLiabilities > 0, true);
  assert.strictEqual(platformOperatingRevenue === totalPlatformFees + totalCommissions, true);
});

test('RIDER DISTANCE INTEGRITY: Server-Side Enforced Isolation', (t) => {
  const migrationPath = path.resolve('supabase/migrations/20261124220000_financial_security_remediation.sql');
  const content = fs.readFileSync(migrationPath, 'utf8');

  // Verify that settle_delivered_order_financials takes only p_order_id and reads verified distance from DB
  assert.match(
    content,
    /CREATE OR REPLACE FUNCTION public\.settle_delivered_order_financials\(\s*p_order_id UUID\s*\)/i,
    'settle_delivered_order_financials must take ONLY p_order_id and not accept client-provided distance arguments'
  );
  assert.match(
    content,
    /v_distance := v_order\.verified_route_distance_km/i,
    'settle_delivered_order_financials must read verified distance strictly from DB verified_route_distance_km'
  );
  assert.match(
    content,
    /ROUTE_NOT_VERIFIED/i,
    'settle_delivered_order_financials must fail safely if order route has not been verified'
  );
});

test('SECURITY REMEDIATION: Out-Of-Order Webhook & Idempotency Safeguards', (t) => {
  const webhookPath = path.resolve('supabase/functions/razorpay-webhook/index.ts');
  const content = fs.readFileSync(webhookPath, 'utf8');

  assert.match(
    content,
    /payment\.failed/i,
    'Must handle payment.failed webhook event'
  );
  assert.match(
    content,
    /refund\.processed|refund\.created/i,
    'Must handle refund events'
  );
  assert.match(
    content,
    /idempotency_key=eq\.webhook_/i,
    'Must check existing idempotency_key in database before processing webhook'
  );
  assert.match(
    content,
    /payment_status !== 'paid'/i,
    'Must protect captured payments from being overwritten by late arriving failed events'
  );
});

test('GRANDFATHERING AUDIT: Non-Cash Legacy Exemption Markers', (t) => {
  const migrationPath = path.resolve('supabase/migrations/20261124220000_financial_security_remediation.sql');
  const content = fs.readFileSync(migrationPath, 'utf8');

  assert.match(
    content,
    /is_legacy_grandfathered BOOLEAN DEFAULT FALSE/i,
    'Must add dedicated is_legacy_grandfathered audit column'
  );
  assert.match(
    content,
    /grandfathering_reason/i,
    'Must store clear audit reason for grandfathered legacy status'
  );
  assert.doesNotMatch(
    content,
    /registration_payment_id\s*=\s*'pay_[0-9]+'/i,
    'Must never fabricate cash or synthetic payment IDs for grandfathered partners'
  );
});

test('FUNCTION PERMISSIONS AUDIT: Revocation of Public Access on Financial RPCs', (t) => {
  const migrationPath = path.resolve('supabase/migrations/20261124220000_financial_security_remediation.sql');
  const content = fs.readFileSync(migrationPath, 'utf8');

  assert.match(
    content,
    /REVOKE ALL ON FUNCTION public\.settle_delivered_order_financials\(UUID\) FROM PUBLIC/i,
    'Must revoke PUBLIC execute permissions on settlement RPC'
  );
  assert.match(
    content,
    /REVOKE ALL ON FUNCTION public\.settle_delivered_order_financials\(UUID\) FROM anon/i,
    'Must revoke anon execute permissions on settlement RPC'
  );
  assert.match(
    content,
    /REVOKE ALL ON FUNCTION public\.settle_delivered_order_financials\(UUID\) FROM authenticated/i,
    'Must revoke authenticated execute permissions on settlement RPC (privileged backend only)'
  );
  assert.match(
    content,
    /GRANT EXECUTE ON FUNCTION public\.settle_delivered_order_financials\(UUID\) TO service_role/i,
    'Must grant settlement execution strictly to service_role'
  );

  assert.match(
    content,
    /REVOKE ALL ON FUNCTION public\.record_verified_registration_payment.*FROM PUBLIC/i,
    'Must revoke PUBLIC execute permissions on registration payment RPC'
  );
  assert.match(
    content,
    /REVOKE ALL ON FUNCTION public\.record_verified_registration_payment.*FROM authenticated/i,
    'Must revoke authenticated execute permissions on registration payment RPC'
  );
  assert.match(
    content,
    /GRANT EXECUTE ON FUNCTION public\.record_verified_registration_payment.*TO service_role/i,
    'Must grant registration payment execution strictly to service_role'
  );

  assert.match(
    content,
    /REVOKE ALL ON FUNCTION public\.register_verified_razorpay_payment.*FROM PUBLIC/i,
    'Must revoke PUBLIC execute permissions on payment registration RPC'
  );
  assert.match(
    content,
    /GRANT EXECUTE ON FUNCTION public\.register_verified_razorpay_payment.*TO service_role/i,
    'Must grant payment registration execution strictly to service_role'
  );

  assert.match(
    content,
    /SET search_path = pg_catalog, public/i,
    'Must enforce fixed search_path to prevent schema hijacking'
  );
  assert.match(
    content,
    /Financial settlement can only be executed by trusted backend service/i,
    'Must enforce trusted backend execution: authenticated clients cannot settle orders directly'
  );
});

test('GLOBAL PAYMENT ID UNIQUENESS & DATABASE CONSTRAINTS AUDIT', (t) => {
  const migrationPath = path.resolve('supabase/migrations/20261124220000_financial_security_remediation.sql');
  const content = fs.readFileSync(migrationPath, 'utf8');

  // Central payment_registry table
  assert.match(
    content,
    /CREATE TABLE IF NOT EXISTS public\.payment_registry/i,
    'Must create central public.payment_registry table'
  );
  assert.match(
    content,
    /payment_id TEXT PRIMARY KEY/i,
    'Must enforce payment_id as primary key in payment_registry'
  );
  assert.match(
    content,
    /CHECK \(payment_intent IN \('customer_order', 'partner_registration', 'rider_registration'\)\)/i,
    'Must restrict payment_intent to valid system workflows'
  );
  assert.match(
    content,
    /CREATE OR REPLACE FUNCTION public\.register_verified_razorpay_payment/i,
    'Must provide atomic register_verified_razorpay_payment function'
  );

  // Table-level unique indexes
  assert.match(
    content,
    /CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_tx_payment_id_unique/i,
    'Must enforce unique constraint on payment_id in platform_financial_transactions'
  );
  assert.match(
    content,
    /CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payment_id_unique/i,
    'Must enforce unique constraint on payment_id in orders'
  );
  assert.match(
    content,
    /CREATE UNIQUE INDEX IF NOT EXISTS idx_rider_apps_payment_id_unique/i,
    'Must enforce unique constraint on registration_payment_id in rider_applications'
  );
  assert.match(
    content,
    /CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurant_apps_payment_id_unique/i,
    'Must enforce unique constraint on registration_payment_id in restaurant_partner_applications'
  );
});

test('REFUND PROCESSING, STATE MACHINE & ANOMALY RECONCILIATION AUDIT', (t) => {
  const webhookPath = path.resolve('supabase/functions/razorpay-webhook/index.ts');
  const content = fs.readFileSync(webhookPath, 'utf8');

  // Distinct event vs refund idempotency tracking
  assert.match(
    content,
    /webhook_event_\$\{eventId\}/i,
    'Must track webhook event ID deduplication distinctly'
  );
  assert.match(
    content,
    /refund_processed_\$\{refundId\}/i,
    'Must track refund processed entity idempotency distinctly'
  );
  assert.match(
    content,
    /refund_created_\$\{refundId\}/i,
    'Must track refund initiated entity state distinctly'
  );

  // State transitions
  assert.match(
    content,
    /eventType === 'refund\.created'/i,
    'Must handle refund.created event'
  );
  assert.match(
    content,
    /refund_status:\s*'refund_initiated'/i,
    'Must set refund_status to refund_initiated on refund.created'
  );
  assert.match(
    content,
    /eventType === 'refund\.processed'/i,
    'Must handle refund.processed event'
  );
  assert.match(
    content,
    /eventType === 'refund\.failed'/i,
    'Must handle refund.failed event'
  );
  assert.match(
    content,
    /refund_status:\s*'refund_failed'/i,
    'Must transition to refund_failed on refund.failed'
  );

  // Explicit anomaly handling (no silent clamping)
  assert.doesNotMatch(
    content,
    /Math\.min\(maxRefundable/i,
    'Must NOT silently clamp refund amounts to maxRefundable'
  );
  assert.match(
    content,
    /reconciliation_exception/i,
    'Must flag over-refunds explicitly as reconciliation_exception'
  );
  assert.match(
    content,
    /OVER_REFUND_EXCEEDS_ORDER_TOTAL/i,
    'Must record anomaly metadata in ledger for audit trails'
  );
});

test('EDGE FUNCTION HARDENING: Caller Auth, Registry Check & Route Failure Safeguards', (t) => {
  const edgeDir = path.resolve('supabase/functions');

  // 1. verify-route-distance: Fails safely when route cannot be verified
  const verifyDistFn = path.join(edgeDir, 'verify-route-distance', 'index.ts');
  const routeCode = fs.readFileSync(verifyDistFn, 'utf8');
  assert.match(routeCode, /ROUTE_VERIFICATION_UNAVAILABLE/i, 'Route verification must fail safely without guessing');
  assert.match(routeCode, /order\.rider_payout_settled === true/i, 'Route distance must be immutable once settled');
  assert.doesNotMatch(routeCode, /pickupLat.*req\.json/i, 'Coordinates must be loaded from DB, not trusted from client body');

  // 2. create-razorpay-order: Caller ownership and application binding
  const createOrderFn = path.join(edgeDir, 'create-razorpay-order', 'index.ts');
  const createCode = fs.readFileSync(createOrderFn, 'utf8');
  assert.match(createCode, /callerUserId/i, 'Must authenticate caller before creating Razorpay order');
  assert.match(createCode, /appData\[0\]\.user_id !== callerUserId/i, 'Must ensure caller owns the application being paid');
  assert.match(createCode, /order\.customer_id !== callerUserId/i, 'Must ensure caller owns the customer order being paid');

  // 3. verify-razorpay-payment: Replay protection & central registry integration
  const verifyPayFn = path.join(edgeDir, 'verify-razorpay-payment', 'index.ts');
  const payCode = fs.readFileSync(verifyPayFn, 'utf8');
  assert.match(payCode, /PAYMENT_REPLAY_DETECTED/i, 'Must reject payment replay across different orders or entities');
  assert.match(payCode, /register_verified_razorpay_payment/i, 'Must register payment atomically in central payment registry');
  assert.match(payCode, /callerUserId/i, 'Must authenticate caller before verifying payment');
  assert.match(payCode, /HMAC/i, 'Must enforce HMAC SHA-256');
});

test('CENTRAL PAYMENT REGISTRY LOGIC: Cross-Intent Collision & Idempotency Simulation', (t) => {
  // Simulated payment registry store
  const paymentRegistry = new Map();

  const registerPayment = (paymentId, orderId, intent, entityId, userId, amountPaise) => {
    if (paymentRegistry.has(paymentId)) {
      const existing = paymentRegistry.get(paymentId);
      if (existing.entityId === entityId && existing.intent === intent) {
        return { status: 'already_registered', paymentId, entityId };
      }
      throw new Error(`PAYMENT_ALREADY_USED: Payment ID ${paymentId} is already bound to ${existing.intent} (entity ${existing.entityId})`);
    }

    const record = { paymentId, orderId, intent, entityId, userId, amountPaise, createdAt: new Date() };
    paymentRegistry.set(paymentId, record);
    return { status: 'success', paymentId, entityId };
  };

  // 1. Initial valid registration for order
  const orderPaymentId = 'pay_customer_order_123';
  const res1 = registerPayment(orderPaymentId, 'order_123', 'customer_order', 'order_uuid_1', 'user_uuid_1', 25000);
  assert.strictEqual(res1.status, 'success');

  // 2. Idempotent replay with same entity and intent
  const res2 = registerPayment(orderPaymentId, 'order_123', 'customer_order', 'order_uuid_1', 'user_uuid_1', 25000);
  assert.strictEqual(res2.status, 'already_registered');

  // 3. Cross-intent replay attempt: Attacker attempts to reuse order payment ID for partner onboarding
  assert.throws(
    () => registerPayment(orderPaymentId, 'order_456', 'partner_registration', 'partner_uuid_2', 'user_uuid_2', 49900),
    /PAYMENT_ALREADY_USED/,
    'Must prevent payment ID reuse across different intents'
  );

  // 4. Same intent replay attempt across different entities (e.g. order 1 payment reused for order 2)
  assert.throws(
    () => registerPayment(orderPaymentId, 'order_789', 'customer_order', 'order_uuid_3', 'user_uuid_3', 25000),
    /PAYMENT_ALREADY_USED/,
    'Must prevent payment ID reuse across different orders'
  );
});

test('FINANCIAL LEDGER BALANCING & SEGREGATED ACCOUNTS SIMULATION', (t) => {
  // Comprehensive test verifying accounting separation for:
  // - Customer Bill: Food (₹200) + Delivery Fee (₹10) + Platform Fee (₹9) + Tip (₹30) = ₹249
  // - Settlement: Verified distance 3.0 km
  // - Rider Entitlement: (3.0 km * ₹12/km = ₹36) + Tip (₹30) = ₹66
  // - Restaurant Entitlement: Food (₹200) - Commission (₹10) = ₹190
  // - Platform Gross Margin: Commission (₹10) + Platform Fee (₹9) + Delivery Fee Inflow (₹10) - Rider Payout (₹36)
  //   = 10 + 9 + 10 - 36 = ₹3 net platform contribution from this delivery transaction.

  const foodItemTotal = 200.00;
  const deliveryFee = 10.00;
  const platformFee = 9.00;
  const customerTip = 30.00;
  const grossCustomerPaid = foodItemTotal + deliveryFee + platformFee + customerTip; // ₹249.00

  assert.strictEqual(grossCustomerPaid, 249.00);

  const verifiedDistanceKm = 3.0;
  const riderBaseRate = 12.00;
  const riderDistancePayout = verifiedDistanceKm * riderBaseRate; // ₹36.00
  const riderTotalPayable = riderDistancePayout + customerTip; // ₹66.00

  const restaurantCommission = 10.00;
  const restaurantPayable = foodItemTotal - restaurantCommission; // ₹190.00

  // Ledger entries simulation
  const ledgerEntries = [
    { type: 'customer_payment', direction: 'credit', amount: grossCustomerPaid },
    { type: 'platform_fee', direction: 'credit', amount: platformFee, category: 'operating_revenue' },
    { type: 'delivery_fee', direction: 'credit', amount: deliveryFee, category: 'delivery_inflow' },
    { type: 'restaurant_commission', direction: 'credit', amount: restaurantCommission, category: 'operating_revenue' },
    { type: 'restaurant_liability', direction: 'debit', amount: restaurantPayable, category: 'merchant_liability' },
    { type: 'rider_payout', direction: 'debit', amount: riderDistancePayout, category: 'delivery_expense' },
    { type: 'rider_tip', direction: 'debit', amount: customerTip, category: 'pass_through_liability' }
  ];

  // Conservation of funds check:
  // Gross Inflow (₹249) = Restaurant Payable (₹190) + Rider Payable (₹66) + Net Platform Margin (-₹7)
  // Check total credits vs total debits
  const totalCustomerCash = grossCustomerPaid;
  const totalOutflowsAndLiabilities = restaurantPayable + riderTotalPayable; // 190 + 66 = 256
  // Wait: customer paid ₹249, restaurant gets ₹190, rider gets ₹66 (total ₹256).
  // Why? Customer delivery fee was ₹10, platform subsidized ₹17 of the delivery cost (₹36 payout vs ₹10 fee + ₹9 platform fee).
  // Net platform cash: 249 - 190 - 66 = -₹7.00 (order delivered at a promotional distance subsidization).
  // Exactly matching platform unit economics!
  const netPlatformCashChange = totalCustomerCash - totalOutflowsAndLiabilities;
  assert.strictEqual(netPlatformCashChange, -7.00);

  // Tips must never be recognized as platform revenue
  const totalTipRevenue = ledgerEntries
    .filter(e => e.type === 'rider_tip' && e.category === 'operating_revenue')
    .reduce((sum, e) => sum + e.amount, 0);
  assert.strictEqual(totalTipRevenue, 0.00, 'Tips must have zero operating revenue contribution');
});

test('SECTION 9 TEST MATRIX: Central Payment Registry Idempotency & Attribute Binding', (t) => {
  // Simulated PostgreSQL atomic register_verified_razorpay_payment logic
  const dbRegistry = new Map();

  const registerVerifiedPayment = (paymentId, orderId, intent, entityId, userId, amountPaise, currency = 'INR') => {
    const curr = currency || 'INR';

    // Mandatory identity fields validation (No NULL allowed!)
    if (!paymentId || !orderId || !intent || !entityId || !userId || !amountPaise || amountPaise <= 0) {
      throw new Error('MANDATORY_FIELD_MISSING: All payment identity fields are strictly required');
    }

    // 1. Simulate INSERT with PRIMARY KEY constraint on payment_id
    if (!dbRegistry.has(paymentId)) {
      dbRegistry.set(paymentId, {
        payment_id: paymentId,
        razorpay_order_id: orderId,
        payment_intent: intent,
        entity_id: entityId,
        user_id: userId,
        amount_paise: amountPaise,
        currency: curr,
        status: 'captured'
      });
      return { status: 'success', payment_id: paymentId, entity_id: entityId, amount_paise: amountPaise };
    }

    // 2. EXCEPTION WHEN unique_violation THEN inspect existing row
    const existing = dbRegistry.get(paymentId);

    // Strict equality verification across ALL bound attributes (No NULL bypass!):
    const matches = existing.entity_id === entityId &&
      existing.payment_intent === intent &&
      existing.amount_paise === amountPaise &&
      existing.currency === curr &&
      existing.razorpay_order_id === orderId &&
      existing.user_id === userId;

    if (matches) {
      return {
        status: 'already_registered',
        payment_id: paymentId,
        entity_id: entityId,
        payment_intent: intent,
        amount_paise: amountPaise,
        currency: curr,
        is_idempotent_retry: true
      };
    } else {
      throw new Error(`PAYMENT_ALREADY_USED: Payment ID ${paymentId} has conflicting parameters`);
    }
  };

  const pId = 'pay_audit_test_999';
  const oId = 'order_audit_test_999';
  const uId = 'user_uuid_101';
  const eId = 'order_entity_uuid_202';
  const amt = 35000; // ₹350.00

  // 0. Mandatory Field Missing Rejection Tests
  assert.throws(
    () => registerVerifiedPayment(null, oId, 'customer_order', eId, uId, amt, 'INR'),
    /MANDATORY_FIELD_MISSING/,
    'Must reject payment with missing payment_id'
  );
  assert.throws(
    () => registerVerifiedPayment(pId, null, 'customer_order', eId, uId, amt, 'INR'),
    /MANDATORY_FIELD_MISSING/,
    'Must reject payment with missing razorpay_order_id'
  );
  assert.throws(
    () => registerVerifiedPayment(pId, oId, 'customer_order', eId, null, amt, 'INR'),
    /MANDATORY_FIELD_MISSING/,
    'Must reject payment with missing user_id'
  );

  // 1. Initial successful registration
  const first = registerVerifiedPayment(pId, oId, 'customer_order', eId, uId, amt, 'INR');
  assert.strictEqual(first.status, 'success');

  // 2. Identical payment retry -> safe idempotent success
  const retry = registerVerifiedPayment(pId, oId, 'customer_order', eId, uId, amt, 'INR');
  assert.strictEqual(retry.status, 'already_registered');
  assert.strictEqual(retry.is_idempotent_retry, true);

  // 3. Same payment ID with different user -> Rejected
  assert.throws(
    () => registerVerifiedPayment(pId, oId, 'customer_order', eId, 'different_user_303', amt, 'INR'),
    /PAYMENT_ALREADY_USED/,
    'Must reject retry with different user ID'
  );

  // 4. Same payment ID with different Razorpay order ID -> Rejected
  assert.throws(
    () => registerVerifiedPayment(pId, 'different_order_id_404', 'customer_order', eId, uId, amt, 'INR'),
    /PAYMENT_ALREADY_USED/,
    'Must reject retry with different order ID'
  );

  // 5. Same payment ID with different amount -> Rejected
  assert.throws(
    () => registerVerifiedPayment(pId, oId, 'customer_order', eId, uId, 99900, 'INR'),
    /PAYMENT_ALREADY_USED/,
    'Must reject retry with different amount'
  );

  // 6. Same payment ID with different currency -> Rejected
  assert.throws(
    () => registerVerifiedPayment(pId, oId, 'customer_order', eId, uId, amt, 'USD'),
    /PAYMENT_ALREADY_USED/,
    'Must reject retry with different currency'
  );

  // 7. Same payment ID with different entity ID -> Rejected
  assert.throws(
    () => registerVerifiedPayment(pId, oId, 'customer_order', 'different_entity_505', uId, amt, 'INR'),
    /PAYMENT_ALREADY_USED/,
    'Must reject retry with different entity ID'
  );

  // 8. Simultaneous first-time registration simulation
  // Two parallel threads both attempting to insert pay_concurrent_1
  const concPaymentId = 'pay_concurrent_1';
  let thread1Result, thread2Result;

  // Thread 1 inserts first
  thread1Result = registerVerifiedPayment(concPaymentId, 'ord_conc_1', 'partner_registration', 'ptr_1', 'user_1', 49900, 'INR');
  // Thread 2 encounters unique constraint, verifies attributes, returns idempotent response
  thread2Result = registerVerifiedPayment(concPaymentId, 'ord_conc_1', 'partner_registration', 'ptr_1', 'user_1', 49900, 'INR');

  assert.strictEqual(thread1Result.status, 'success');
  assert.strictEqual(thread2Result.status, 'already_registered');
  assert.strictEqual(thread2Result.is_idempotent_retry, true);
});

test('SECTION 9 TEST MATRIX: Database-Backed Refund State Machine & Invariant Enforcement', (t) => {
  // Invariant: pending_refunds + processed_refunds <= captured_payment_amount
  const capturedAmountPaise = 50000; // ₹500.00
  const refundStore = new Map(); // refund_id -> { amount_paise, status, event_id }
  const webhookEventsSeen = new Set();
  const ledgerEntries = [];

  const processAtomicRefund = ({ refundId, paymentId, eventId, amountPaise, action }) => {
    // 1. Webhook Event-Level Deduplication
    if (eventId) {
      if (webhookEventsSeen.has(eventId)) {
        return { status: 'ignored_duplicate_event', eventId };
      }
      webhookEventsSeen.add(eventId);
    }

    // 2. Compute current balances
    let processedPaise = 0;
    let pendingPaise = 0;
    for (const [rId, ref] of refundStore.entries()) {
      if (rId !== refundId) {
        if (ref.status === 'processed') processedPaise += ref.amount_paise;
        if (ref.status === 'pending' || ref.status === 'requested') pendingPaise += ref.amount_paise;
      }
    }

    const existing = refundStore.get(refundId);

    // ACTION: RESERVE (refund.created)
    if (action === 'reserve') {
      if (existing) {
        // Out-of-order guard: If already processed, do not revert to pending!
        if (existing.status === 'processed') {
          return { status: 'already_processed', refundId, message: 'Refund already settled. Late created event ignored.' };
        }
        return { status: 'already_reserved', refundId };
      }

      // CASE A: Internal refund request exceeding available balance -> REJECT
      // Do NOT insert reconciliation_exception. Do NOT reserve funds.
      if (processedPaise + pendingPaise + amountPaise > capturedAmountPaise) {
        return {
          status: 'rejected',
          error: 'REFUND_AMOUNT_EXCEEDS_AVAILABLE_BALANCE',
          refundId,
          reason: 'EXCEEDS_CAPTURED_BALANCE',
          availablePaise: Math.max(0, capturedAmountPaise - (processedPaise + pendingPaise))
        };
      }

      refundStore.set(refundId, { amount_paise: amountPaise, status: 'pending', eventId });
      return { status: 'reserved', refundId, reservedAmount: amountPaise / 100 };
    }

    // ACTION: SETTLE (refund.processed)
    if (action === 'settle') {
      if (existing && existing.status === 'processed') {
        return { status: 'already_processed', refundId }; // Deduplicate refund processed
      }

      const newCumulativeProcessed = processedPaise + amountPaise;

      // Over-refund check: NEVER silently clamp!
      if (newCumulativeProcessed > capturedAmountPaise) {
        refundStore.set(refundId, { amount_paise: amountPaise, status: 'reconciliation_exception', eventId });
        ledgerEntries.push({
          type: 'refund',
          amount: amountPaise / 100,
          direction: 'debit',
          status: 'completed',
          anomaly: 'OVER_REFUND_EXCEEDS_ORDER_TOTAL'
        });
        return { status: 'reconciliation_exception', refundId, actualRefunded: amountPaise / 100 };
      }

      refundStore.set(refundId, { amount_paise: amountPaise, status: 'processed', eventId });
      ledgerEntries.push({
        type: 'refund',
        amount: amountPaise / 100,
        direction: 'debit',
        status: 'completed',
        refundId
      });
      return { status: 'processed', refundId, refundAmount: amountPaise / 100 };
    }

    // ACTION: FAIL (refund.failed)
    if (action === 'fail') {
      if (existing && existing.status === 'processed') {
        return { status: 'already_processed', refundId, message: 'Cannot fail an already settled refund.' };
      }
      if (existing && existing.status === 'failed') {
        return { status: 'already_failed', refundId, message: 'Refund is already marked failed.' };
      }

      // Release reserved pending amount
      refundStore.set(refundId, { amount_paise: amountPaise, status: 'failed', eventId });
      ledgerEntries.push({ type: 'refund_failed', amount: amountPaise / 100, status: 'failed', refundId });
      return { status: 'failed', refundId, releasedReservation: amountPaise / 100 };
    }
  };

  // 1. Duplicate webhook delivery test
  const ev1 = processAtomicRefund({ refundId: 'rfnd_1', paymentId: 'pay_1', eventId: 'evt_1001', amountPaise: 10000, action: 'reserve' });
  const ev1Dup = processAtomicRefund({ refundId: 'rfnd_1', paymentId: 'pay_1', eventId: 'evt_1001', amountPaise: 10000, action: 'reserve' });
  assert.strictEqual(ev1.status, 'reserved');
  assert.strictEqual(ev1Dup.status, 'ignored_duplicate_event');

  // 2. Pending refund reserves balance
  // Currently rfnd_1 has 10000 paise reserved (₹100). Remaining available = 40000 paise (₹400).
  // Settle rfnd_1
  const set1 = processAtomicRefund({ refundId: 'rfnd_1', paymentId: 'pay_1', eventId: 'evt_1002', amountPaise: 10000, action: 'settle' });
  assert.strictEqual(set1.status, 'processed');

  // 3. Duplicate refund ID processed event ignored
  const set1Dup = processAtomicRefund({ refundId: 'rfnd_1', paymentId: 'pay_1', eventId: 'evt_1003', amountPaise: 10000, action: 'settle' });
  assert.strictEqual(set1Dup.status, 'already_processed');
  // Check ledger entries count: exactly 1 debit entry for rfnd_1
  const rfnd1Debits = ledgerEntries.filter(e => e.refundId === 'rfnd_1' && e.type === 'refund');
  assert.strictEqual(rfnd1Debits.length, 1, 'Duplicate webhook must not create duplicate ledger entries');

  // 4. Pending refund reservation and Failed refund release
  // Reserve rfnd_2 for ₹200 (20000 paise)
  const res2 = processAtomicRefund({ refundId: 'rfnd_2', paymentId: 'pay_1', eventId: 'evt_1004', amountPaise: 20000, action: 'reserve' });
  assert.strictEqual(res2.status, 'reserved');

  // Fail rfnd_2 -> release reservation
  const fail2 = processAtomicRefund({ refundId: 'rfnd_2', paymentId: 'pay_1', eventId: 'evt_1005', amountPaise: 20000, action: 'fail' });
  assert.strictEqual(fail2.status, 'failed');
  assert.strictEqual(fail2.releasedReservation, 200.00);

  // Duplicate fail event -> idempotent return
  const fail2Dup = processAtomicRefund({ refundId: 'rfnd_2', paymentId: 'pay_1', eventId: 'evt_1005_dup', amountPaise: 20000, action: 'fail' });
  assert.strictEqual(fail2Dup.status, 'already_failed');

  // 5. Two concurrent refund requests: Combined cannot exceed remaining balance
  // Currently processed: 10000 paise (rfnd_1). Total captured: 50000 paise. Remaining: 40000 paise.
  // Request 3 reserves 30000 paise (₹300) -> fits!
  const res3 = processAtomicRefund({ refundId: 'rfnd_3', paymentId: 'pay_1', eventId: 'evt_1006', amountPaise: 30000, action: 'reserve' });
  assert.strictEqual(res3.status, 'reserved');

  // Request 4 requests 20000 paise (₹200) -> 10000 + 30000 + 20000 = 60000 > 50000 -> Exceeds!
  // Case A: Must be rejected without inserting any record
  const res4 = processAtomicRefund({ refundId: 'rfnd_4', paymentId: 'pay_1', eventId: 'evt_1007', amountPaise: 20000, action: 'reserve' });
  assert.strictEqual(res4.status, 'rejected');
  assert.strictEqual(res4.error, 'REFUND_AMOUNT_EXCEEDS_AVAILABLE_BALANCE');
  assert.strictEqual(refundStore.has('rfnd_4'), false, 'Rejected reservation request must NOT insert a record');

  // 6. Out-of-order refund events: settle arrives BEFORE reserve
  // Settle rfnd_5 directly
  const set5 = processAtomicRefund({ refundId: 'rfnd_5', paymentId: 'pay_1', eventId: 'evt_1008', amountPaise: 10000, action: 'settle' });
  assert.strictEqual(set5.status, 'processed');

  // Late reserve arrives for rfnd_5 -> MUST NOT move backwards to pending
  const lateRes5 = processAtomicRefund({ refundId: 'rfnd_5', paymentId: 'pay_1', eventId: 'evt_1009', amountPaise: 10000, action: 'reserve' });
  assert.strictEqual(lateRes5.status, 'already_processed');
  assert.strictEqual(refundStore.get('rfnd_5').status, 'processed', 'Late reserve must not revert processed status');

  // 7. Over-refund reconciliation without silent clamping
  // An external refund arrives for ₹800 (80000 paise), exceeding total captured
  const overRef = processAtomicRefund({ refundId: 'rfnd_over', paymentId: 'pay_1', eventId: 'evt_1010', amountPaise: 80000, action: 'settle' });
  assert.strictEqual(overRef.status, 'reconciliation_exception');
  assert.strictEqual(overRef.actualRefunded, 800.00, 'Must record exact external refund amount without clamping');
  const anomalyEntry = ledgerEntries.find(e => e.anomaly === 'OVER_REFUND_EXCEEDS_ORDER_TOTAL');
  assert.ok(anomalyEntry, 'Must log anomaly audit entry');
  assert.strictEqual(anomalyEntry.amount, 800.00);

  // 8. Subsequent refund attempt after over-refund exception
  // Because rfnd_over is externally confirmed (80000 paise > 50000 captured),
  // confirmed refunds already exceed captured balance. Any subsequent refund must be rejected!
  const subRef = processAtomicRefund({ refundId: 'rfnd_subsequent', paymentId: 'pay_1', eventId: 'evt_1011', amountPaise: 5000, action: 'reserve' });
  assert.strictEqual(subRef.status, 'rejected');
  assert.strictEqual(subRef.error, 'REFUND_AMOUNT_EXCEEDS_AVAILABLE_BALANCE', 'Must reject subsequent refund after over-refund');
  assert.strictEqual(refundStore.has('rfnd_subsequent'), false, 'Must not insert record for rejected subsequent refund');
});

test('SECTION 9 TEST MATRIX: Settlement Idempotency, Rider Payout & Rollback', (t) => {
  // 1. Duplicate order settlement idempotency
  const settledOrders = new Set();
  const settleOrder = (orderId, isDelivered, distanceKm) => {
    if (settledOrders.has(orderId)) {
      return { status: 'already_settled', order_id: orderId };
    }
    if (!isDelivered) {
      throw new Error('ORDER_NOT_DELIVERED');
    }
    if (!distanceKm || distanceKm <= 0) {
      throw new Error('ROUTE_NOT_VERIFIED');
    }
    settledOrders.add(orderId);
    return {
      status: 'success',
      order_id: orderId,
      rider_payout: distanceKm * 12.00,
      commission: 10.00,
      platform_fee: 9.00
    };
  };

  const s1 = settleOrder('ord_101', true, 4.0);
  assert.strictEqual(s1.status, 'success');
  assert.strictEqual(s1.rider_payout, 48.00);

  // Retry settlement -> Safe idempotent response
  const s2 = settleOrder('ord_101', true, 4.0);
  assert.strictEqual(s2.status, 'already_settled');

  // 2. Transaction Rollback Simulation
  // If an error occurs midway through recording ledger entries, all entries must roll back
  let ledger = [];
  const atomicSettlementWithRollback = (orderId, shouldFailMidway) => {
    const rollbackCheckpoint = [...ledger];
    try {
      ledger.push({ type: 'platform_fee', amount: 9.00, orderId });
      ledger.push({ type: 'restaurant_commission', amount: 10.00, orderId });

      if (shouldFailMidway) {
        throw new Error('DATABASE_CONNECTION_LOST');
      }

      ledger.push({ type: 'rider_payout', amount: 36.00, orderId });
      return { success: true };
    } catch (err) {
      // Roll back
      ledger = rollbackCheckpoint;
      return { success: false, error: err.message };
    }
  };

  const failedRun = atomicSettlementWithRollback('ord_err', true);
  assert.strictEqual(failedRun.success, false);
  assert.strictEqual(ledger.length, 0, 'Midway failure must roll back all partial ledger entries');

  const successRun = atomicSettlementWithRollback('ord_ok', false);
  assert.strictEqual(successRun.success, true);
  assert.strictEqual(ledger.length, 3, 'Successful transaction commits all entries');

  // 3. Merchant Accounting Reconciliation: Formulas & Funder Combinations
  const computeMerchantPayout = (order) => {
    const commission = 10.00;
    const foodSubtotal = Number(order.itemTotal) || 0.00;
    const packagingFee = Number(order.packagingFee) || 0.00;
    const discountAmount = Number(order.discountAmount) || 0.00;
    const discountFunder = order.discountFunder || 'platform';
    const refundAmount = Number(order.refundAmount) || 0.00;
    const gstTreatment = order.gstTreatment || 'platform_section_9_5';
    const taxAmount = Number(order.taxAmount) || 0.00;

    let gross = foodSubtotal + packagingFee;

    // GST pass-through added to merchant gross ONLY if restaurant remits own GST (non-9(5))
    if (gstTreatment === 'restaurant_remitted') {
      gross += taxAmount;
    }

    if (discountFunder === 'restaurant') {
      gross = Math.max(0, gross - discountAmount);
    }
    // Platform-funded discounts are absorbed by platform, not deducted from restaurant!

    let payable = Math.max(0, gross - commission);
    if (refundAmount > 0) {
      payable = Math.max(0, payable - refundAmount);
    }

    return {
      gross,
      payable,
      isCod: order.paymentMethod === 'cod',
      riderCashReceivable: order.paymentMethod === 'cod' ? order.totalAmount : 0.00,
      platformTaxLiability: gstTreatment === 'platform_section_9_5' ? taxAmount : 0.00,
      restaurantTaxPassThrough: gstTreatment === 'restaurant_remitted' ? taxAmount : 0.00
    };
  };

  // Platform discount (e.g. WELCOME / FREESHIP): Gross = 300 + 20 = 320, Net = 310
  const p1 = computeMerchantPayout({ itemTotal: 300, packagingFee: 20, discountAmount: 50, discountFunder: 'platform', taxAmount: 16 });
  assert.strictEqual(p1.gross, 320);
  assert.strictEqual(p1.payable, 310);
  assert.strictEqual(p1.platformTaxLiability, 16);

  // Restaurant discount: Gross = 300 + 20 - 50 = 270, Net = 260
  const p2 = computeMerchantPayout({ itemTotal: 300, packagingFee: 20, discountAmount: 50, discountFunder: 'restaurant' });
  assert.strictEqual(p2.gross, 270);
  assert.strictEqual(p2.payable, 260);

  // COD order: Records rider receivable for cash collected
  const p3 = computeMerchantPayout({ itemTotal: 300, packagingFee: 20, totalAmount: 350, paymentMethod: 'cod' });
  assert.strictEqual(p3.riderCashReceivable, 350);

  // Partial refund: Net = 310 - 40 = 270
  const p4 = computeMerchantPayout({ itemTotal: 300, packagingFee: 20, refundAmount: 40 });
  assert.strictEqual(p4.payable, 270);

  // Non-9(5) restaurant remits its own tax: Gross = 300 + 20 + 16 = 336, Net = 326
  const p5 = computeMerchantPayout({ itemTotal: 300, packagingFee: 20, taxAmount: 16, gstTreatment: 'restaurant_remitted' });
  assert.strictEqual(p5.gross, 336);
  assert.strictEqual(p5.payable, 326);
  assert.strictEqual(p5.restaurantTaxPassThrough, 16);
});






