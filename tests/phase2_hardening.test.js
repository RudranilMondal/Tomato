import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import masking utilities
import { maskAadhaar, maskPan, maskBankAccount } from '../src/lib/masking.ts';

// Import tier utilities
import {
  DEFAULT_TIER_CONFIGURATIONS,
  calculateRiderTier,
  calculateTierPayout
} from '../src/lib/tierSystem.ts';

test('PHASE 2.1: Real Authentication & Isolated Demo Fallbacks', async (t) => {
  const unifiedModalPath = path.join(rootDir, 'src', 'components', 'auth', 'UnifiedAuthModal.tsx');
  const riderAuthPath = path.join(rootDir, 'src', 'components', 'rider', 'RiderAuthModal.tsx');
  const customerAuthPath = path.join(rootDir, 'src', 'components', 'customer', 'AuthScreen.tsx');

  assert.ok(fs.existsSync(unifiedModalPath));
  assert.ok(fs.existsSync(riderAuthPath));
  assert.ok(fs.existsSync(customerAuthPath));

  const unifiedContent = fs.readFileSync(unifiedModalPath, 'utf8');
  const riderAuthContent = fs.readFileSync(riderAuthPath, 'utf8');
  const customerAuthContent = fs.readFileSync(customerAuthPath, 'utf8');

  await t.test('UnifiedAuthModal sends phone OTP via Supabase without simulated bypass on real input', () => {
    assert.ok(unifiedContent.includes('supabase.auth.signInWithOtp'), 'Must call signInWithOtp on real input');
    assert.ok(unifiedContent.includes('supabase.auth.verifyOtp'), 'Must call verifyOtp for SMS');
    assert.ok(unifiedContent.includes('⚡ Quick Demo Login (Dev Only)'), 'Must isolate demo bypass to labeled dev section');
    assert.ok(unifiedContent.includes('handleExplicitDevLogin'), 'Must have explicit dev login handler');
  });

  await t.test('UnifiedAuthModal implements real Email and Google OAuth flows', () => {
    assert.ok(unifiedContent.includes('signInWithOAuth'), 'Must implement real signInWithOAuth');
    assert.ok(unifiedContent.includes('54324'), 'Must direct local developers to Mailpit for magic link preview');
    assert.ok(unifiedContent.includes('Google OAuth Provider Setup Notice') || unifiedContent.includes('Google OAuth Provider Notice'), 'Must document Supabase dashboard instructions');
  });

  await t.test('RiderAuthModal and AuthScreen isolate dev demo access', () => {
    assert.ok(riderAuthContent.includes('⚡ Quick Demo Login (Dev Only)'), 'Rider modal must label dev demo');
    assert.ok(riderAuthContent.includes('supabase.auth.signInWithOtp'), 'Rider modal must use real Supabase OTP on input');
    assert.ok(customerAuthContent.includes('⚡ Quick Demo Customer Login'), 'Customer screen must label dev demo');
    assert.ok(customerAuthContent.includes('signInWithOAuth'), 'Customer screen must use real Google OAuth');
  });
});

test('PHASE 2.2: Actual Camera Capture, WebRTC and Secure Storage', async (t) => {
  const selfieModalPath = path.join(rootDir, 'src', 'components', 'rider', 'RiderSelfieModal.tsx');
  assert.ok(fs.existsSync(selfieModalPath));
  const selfieContent = fs.readFileSync(selfieModalPath, 'utf8');

  await t.test('RiderSelfieModal uses WebRTC getUserMedia for live video feed', () => {
    assert.ok(selfieContent.includes('navigator.mediaDevices.getUserMedia'), 'Must invoke getUserMedia');
    assert.ok(selfieContent.includes("facingMode: 'user'"), 'Must request user-facing camera');
    assert.ok(selfieContent.includes('<video'), 'Must render live video element');
    assert.ok(selfieContent.includes('LIVE CAMERA'), 'Must display live camera badge');
  });

  await t.test('RiderSelfieModal captures real canvas frames and exports image', () => {
    assert.ok(selfieContent.includes('document.createElement(\'canvas\')'), 'Must create canvas for frame capture');
    assert.ok(selfieContent.includes('drawImage'), 'Must draw video frame to canvas');
    assert.ok(selfieContent.includes('toDataURL'), 'Must export frame as data URL');
  });

  await t.test('RiderSelfieModal cleans up all camera tracks on stop and unmount', () => {
    assert.ok(selfieContent.includes('getTracks().forEach'), 'Must stop all camera tracks');
    assert.ok(selfieContent.includes('stopCamera()'), 'Must invoke stopCamera on unmount and retake');
    assert.ok(selfieContent.includes('handleRetake'), 'Must allow photo retake');
  });

  await t.test('RiderSelfieModal uploads to private rider-selfie-evidence bucket', () => {
    assert.ok(selfieContent.includes('rider-selfie-evidence'), 'Must target rider-selfie-evidence bucket');
    assert.ok(selfieContent.includes('uploadProgress'), 'Must display upload progress indicator');
  });
});

test('PHASE 2.3: Sensitive Identifier Masking Utilities', async (t) => {
  await t.test('maskAadhaar formats to XXXX-XXXX-1234 preserving only last 4 digits', () => {
    assert.strictEqual(maskAadhaar('123456789012'), 'XXXX-XXXX-9012');
    assert.strictEqual(maskAadhaar('5432-8901-4455'), 'XXXX-XXXX-4455');
    assert.strictEqual(maskAadhaar(null), 'XXXX-XXXX-XXXX');
    assert.strictEqual(maskAadhaar(''), 'XXXX-XXXX-XXXX');
  });

  await t.test('maskPan masks first 5 characters to protect taxpayer identity', () => {
    assert.strictEqual(maskPan('ABCDE1234F'), 'XXXXX1234F');
    assert.strictEqual(maskPan('bzkpm9988q'), 'XXXXX9988Q');
    assert.strictEqual(maskPan(null), 'XXXXX1234X');
    assert.strictEqual(maskPan(''), 'XXXXX1234X');
  });

  await t.test('maskBankAccount preserves last 4 digits', () => {
    assert.strictEqual(maskBankAccount('987654321098'), '•••• •••• 1098');
    assert.strictEqual(maskBankAccount(null), '•••• •••• ••••');
  });
});

test('PHASE 2.4: Rider Tier Engine Boundary Tests', async (t) => {
  // Bronze: 0 rating, 0h, 0 orders
  // Silver: 4.6+ rating, 50h, 100 orders
  // Gold: 4.8+ rating, 150h, 300 orders

  await t.test('Rating boundaries (4.59 vs 4.60, 4.79 vs 4.80)', () => {
    // Rating 4.59 with max hours and orders remains Bronze
    assert.strictEqual(calculateRiderTier(4.59, 200, 500), 'bronze');
    // Rating 4.60 with qualifying hours and orders achieves Silver
    assert.strictEqual(calculateRiderTier(4.60, 50, 100), 'silver');
    // Rating 4.79 with Gold hours and orders remains Silver
    assert.strictEqual(calculateRiderTier(4.79, 200, 500), 'silver');
    // Rating 4.80 with Gold hours and orders achieves Gold
    assert.strictEqual(calculateRiderTier(4.80, 150, 300), 'gold');
  });

  await t.test('Working hours boundaries (49.9 vs 50.0, 149.9 vs 150.0)', () => {
    // Hours 49.9 with 5.0 rating and 500 orders remains Bronze
    assert.strictEqual(calculateRiderTier(5.0, 49.9, 500), 'bronze');
    // Hours 50.0 with Silver rating and orders achieves Silver
    assert.strictEqual(calculateRiderTier(4.6, 50.0, 100), 'silver');
    // Hours 149.9 with Gold rating and orders remains Silver
    assert.strictEqual(calculateRiderTier(4.9, 149.9, 400), 'silver');
    // Hours 150.0 with Gold rating and orders achieves Gold
    assert.strictEqual(calculateRiderTier(4.9, 150.0, 300), 'gold');
  });

  await t.test('Completed orders boundaries (99 vs 100, 299 vs 300)', () => {
    // Orders 99 with 5.0 rating and 200 hours remains Bronze
    assert.strictEqual(calculateRiderTier(5.0, 200, 99), 'bronze');
    // Orders 100 with Silver rating and hours achieves Silver
    assert.strictEqual(calculateRiderTier(4.6, 50, 100), 'silver');
    // Orders 299 with Gold rating and hours remains Silver
    assert.strictEqual(calculateRiderTier(4.8, 150, 299), 'silver');
    // Orders 300 with Gold rating and hours achieves Gold
    assert.strictEqual(calculateRiderTier(4.8, 150, 300), 'gold');
  });
});

test('PHASE 2.5: Tier-Based Payout Rates and Calculation Accuracy', async (t) => {
  await t.test('Bronze Tier Payout Breakdown (Base ₹40, ₹12/km, ₹10 surge, 1.0x)', () => {
    // 5 km, surge active (₹10), tip ₹25
    // core = 40 + (5 * 12 = 60) + 10 = 110. Multiplier 1.0 = 110. Tip 25 + Incentive 0 = 135
    const res = calculateTierPayout('bronze', 5, true, 25);
    assert.strictEqual(res.tier, 'bronze');
    assert.strictEqual(res.basePay, 40);
    assert.strictEqual(res.distancePay, 60);
    assert.strictEqual(res.surgePay, 10);
    assert.strictEqual(res.tierIncentive, 0);
    assert.strictEqual(res.multiplier, 1.0);
    assert.strictEqual(res.totalPay, 135);
  });

  await t.test('Silver Tier Payout Breakdown (Base ₹45, ₹14/km, ₹15 surge, 1.05x, ₹15 incentive)', () => {
    // 5 km, surge active (₹15), tip ₹20
    // core = 45 + (5 * 14 = 70) + 15 = 130. Multiplied = Math.round(130 * 1.05) = 137. Total = 137 + 20 + 15 = 172
    const res = calculateTierPayout('silver', 5, true, 20);
    assert.strictEqual(res.tier, 'silver');
    assert.strictEqual(res.basePay, 45);
    assert.strictEqual(res.distancePay, 70);
    assert.strictEqual(res.surgePay, 15);
    assert.strictEqual(res.tierIncentive, 15);
    assert.strictEqual(res.multiplier, 1.05);
    assert.strictEqual(res.totalPay, 172);
  });

  await t.test('Gold Tier Payout Breakdown (Base ₹55, ₹16/km, ₹20 surge, 1.10x, ₹30 incentive)', () => {
    // 5 km, surge active (₹20), tip ₹30
    // core = 55 + (5 * 16 = 80) + 20 = 155. Multiplied = Math.round(155 * 1.10) = 171. Total = 171 + 30 + 30 = 231
    const res = calculateTierPayout('gold', 5, true, 30);
    assert.strictEqual(res.tier, 'gold');
    assert.strictEqual(res.basePay, 55);
    assert.strictEqual(res.distancePay, 80);
    assert.strictEqual(res.surgePay, 20);
    assert.strictEqual(res.tierIncentive, 30);
    assert.strictEqual(res.multiplier, 1.10);
    assert.strictEqual(res.totalPay, 231);
  });
});

test('PHASE 2.6: Backend RPC Definitions & Database Constraints', async (t) => {
  const migrationPath = path.join(rootDir, 'supabase', 'migrations', '20261113200000_auth_kyc_and_rider_tier_system.sql');
  assert.ok(fs.existsSync(migrationPath));
  const sql = fs.readFileSync(migrationPath, 'utf8');

  await t.test('Migration provisions duty start, duty end and check selfie RPCs', () => {
    assert.ok(sql.includes('CREATE OR REPLACE FUNCTION public.rider_start_duty'), 'Must define rider_start_duty');
    assert.ok(sql.includes('CREATE OR REPLACE FUNCTION public.rider_end_duty'), 'Must define rider_end_duty');
    assert.ok(sql.includes('CREATE OR REPLACE FUNCTION public.check_rider_selfie_due'), 'Must define check_rider_selfie_due');
  });

  await t.test('Migration provisions immutable rider_order_payouts table with unique order constraint', () => {
    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.rider_order_payouts'), 'Must create rider_order_payouts table');
    assert.ok(sql.includes('CONSTRAINT uq_rider_order_payout UNIQUE (order_id)'), 'Must enforce unique order payout constraint');
    assert.ok(sql.includes('CREATE OR REPLACE FUNCTION public.record_rider_order_payout'), 'Must define record_rider_order_payout RPC');
  });

  await t.test('Migration provisions private rider-selfie-evidence bucket with RLS', () => {
    assert.ok(sql.includes("'rider-selfie-evidence'"), 'Must register rider-selfie-evidence bucket');
    assert.ok(sql.includes('public = false') || sql.includes('false, false, 5242880'), 'Bucket must be private');
    assert.ok(sql.includes('CREATE POLICY "Riders can upload own selfie evidence"'), 'Must define upload policy');
    assert.ok(sql.includes('CREATE POLICY "Riders and admins can view selfie evidence"'), 'Must define view policy');
  });
});

test('PHASE 2.7: Mandatory 4-Document Verification for Approvals', async (t) => {
  const contextPath = path.join(rootDir, 'src', 'context', 'TomatttoContext.tsx');
  assert.ok(fs.existsSync(contextPath));
  const contextSql = fs.readFileSync(contextPath, 'utf8');

  await t.test('Context blocks rider approval until all 4 mandatory personal documents are verified', () => {
    assert.ok(contextSql.includes('statuses.aadhaarFront !== \'verified\''), 'Must check aadhaarFront is verified');
    assert.ok(contextSql.includes('statuses.aadhaarBack !== \'verified\''), 'Must check aadhaarBack is verified');
    assert.ok(contextSql.includes('statuses.panFront !== \'verified\''), 'Must check panFront is verified');
    assert.ok(contextSql.includes('statuses.panBack !== \'verified\''), 'Must check panBack is verified');
  });

  await t.test('Context blocks restaurant approval until all 4 mandatory personal documents are verified', () => {
    assert.ok(contextSql.includes('mandatory4 = [\'aadhaarFront\', \'aadhaarBack\', \'personalPanFront\', \'personalPanBack\']'), 'Must specify all 4 mandatory personal docs');
    assert.ok(contextSql.includes('unverifiedMandatory.length > 0'), 'Must block approval if any mandatory doc is unverified');
  });
});
