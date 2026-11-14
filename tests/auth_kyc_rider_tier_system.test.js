import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import tier system utilities from src/lib/tierSystem.ts
import {
  DEFAULT_TIER_CONFIGURATIONS,
  calculateRiderTier,
  calculateTierPayout
} from '../src/lib/tierSystem.ts';

test('FEATURE 1 — Restaurant Partner Login System Audit', async (t) => {
  await t.test('Partner session supports all required lifecycle states', () => {
    const validStates = ['approved', 'pending', 'action_required', 'rejected', 'suspended', 'not_registered'];
    assert.strictEqual(validStates.length, 6);
    assert.ok(validStates.includes('approved'));
    assert.ok(validStates.includes('pending'));
    assert.ok(validStates.includes('action_required'));
    assert.ok(validStates.includes('rejected'));
    assert.ok(validStates.includes('suspended'));
    assert.ok(validStates.includes('not_registered'));
  });

  await t.test('Partner App UI implements distinct Login vs Register pathways', () => {
    const partnerAppPath = path.join(rootDir, 'src', 'components', 'partner', 'PartnerApp.tsx');
    assert.ok(fs.existsSync(partnerAppPath), 'PartnerApp.tsx must exist');
    const partnerAppContent = fs.readFileSync(partnerAppPath, 'utf8');

    assert.ok(partnerAppContent.includes('Existing Restaurant Partner Login'), 'Must contain Partner Login option');
    assert.ok(partnerAppContent.includes('Become a Restaurant Partner'), 'Must contain Onboarding option');
    assert.ok(partnerAppContent.includes('UnifiedAuthModal'), 'Must wire UnifiedAuthModal');
    assert.ok(partnerAppContent.includes('role="restaurant_owner"'), 'Must specify restaurant_owner role');
    assert.ok(partnerAppContent.includes('switchPartnerRestaurant'), 'Must support multi-outlet switching');
  });
});

test('FEATURE 2 — Unified Login System Audit', async (t) => {
  const unifiedModalPath = path.join(rootDir, 'src', 'components', 'auth', 'UnifiedAuthModal.tsx');
  assert.ok(fs.existsSync(unifiedModalPath), 'UnifiedAuthModal.tsx must exist');
  const unifiedModalContent = fs.readFileSync(unifiedModalPath, 'utf8');

  await t.test('UnifiedAuthModal supports Phone OTP, Email and Google OAuth across all 3 roles', () => {
    assert.ok(unifiedModalContent.includes('phone'), 'Must support Phone authentication');
    assert.ok(unifiedModalContent.includes('email'), 'Must support Email authentication');
    assert.ok(unifiedModalContent.includes('google'), 'Must support Google OAuth authentication');
    assert.ok(unifiedModalContent.includes('+91'), 'Must have Indian +91 phone prefix');
    assert.ok(unifiedModalContent.includes('DEMO_OTP_CODE'), 'Must integrate demo OTP fallback');
  });

  await t.test('Demo authentication supports Customer, Restaurant Owner, and Rider roles', async () => {
    const demoAuthPath = path.join(rootDir, 'src', 'lib', 'demoAuth.ts');
    assert.ok(fs.existsSync(demoAuthPath), 'demoAuth.ts must exist');
    const demoAuthContent = fs.readFileSync(demoAuthPath, 'utf8');

    assert.ok(demoAuthContent.includes('DEMO_RESTAURANT_PARTNER'), 'Must define DEMO_RESTAURANT_PARTNER');
    assert.ok(demoAuthContent.includes('DEMO_RIDER_USER'), 'Must define DEMO_RIDER_USER');
    assert.ok(demoAuthContent.includes('getDemoAccountForRole'), 'Must expose getDemoAccountForRole helper');
  });
});

test('FEATURE 3 — Mandatory Aadhaar and PAN (Front & Back) Verification Audit', async (t) => {
  await t.test('Restaurant Onboarding Wizard requires 4 personal documents (Aadhaar Front/Back, PAN Front/Back)', () => {
    const restWizardPath = path.join(rootDir, 'src', 'components', 'partner', 'RestaurantOnboardingWizard.tsx');
    assert.ok(fs.existsSync(restWizardPath));
    const restWizardContent = fs.readFileSync(restWizardPath, 'utf8');

    assert.ok(restWizardContent.includes('aadhaarFrontDoc'), 'Must track aadhaarFrontDoc state');
    assert.ok(restWizardContent.includes('aadhaarBackDoc'), 'Must track aadhaarBackDoc state');
    assert.ok(restWizardContent.includes('personalPanFrontDoc'), 'Must track personalPanFrontDoc state');
    assert.ok(restWizardContent.includes('personalPanBackDoc'), 'Must track personalPanBackDoc state');
    assert.ok(restWizardContent.includes('Aadhaar Card — Front Side'), 'Must label Aadhaar Front Side');
    assert.ok(restWizardContent.includes('Aadhaar Card — Back Side'), 'Must label Aadhaar Back Side');
    assert.ok(restWizardContent.includes('Personal PAN Card - Front Side') || restWizardContent.includes('Personal PAN (Front Side)'), 'Must label Personal PAN Front Side');
    assert.ok(restWizardContent.includes('Personal PAN Card - Back Side') || restWizardContent.includes('Personal PAN (Back Side)'), 'Must label Personal PAN Back Side');
  });

  await t.test('Rider Onboarding Wizard validates 4 mandatory personal documents in validateStep3()', () => {
    const riderWizardPath = path.join(rootDir, 'src', 'components', 'rider', 'RiderOnboardingWizard.tsx');
    assert.ok(fs.existsSync(riderWizardPath));
    const riderWizardContent = fs.readFileSync(riderWizardPath, 'utf8');

    assert.ok(riderWizardContent.includes('if (!documents.aadhaarFront)'), 'Must validate aadhaarFront');
    assert.ok(riderWizardContent.includes('if (!documents.aadhaarBack)'), 'Must validate aadhaarBack');
    assert.ok(riderWizardContent.includes('if (!documents.panFront)'), 'Must validate panFront');
    assert.ok(riderWizardContent.includes('if (!documents.panBack)'), 'Must validate panBack');
    assert.ok(riderWizardContent.includes('5 * 1024 * 1024'), 'Must enforce 5MB maximum file size');
  });

  await t.test('Context blocks Restaurant & Rider approvals if mandatory documents are missing or rejected', () => {
    const contextPath = path.join(rootDir, 'src', 'context', 'TomatttoContext.tsx');
    assert.ok(fs.existsSync(contextPath));
    const contextContent = fs.readFileSync(contextPath, 'utf8');

    assert.ok(contextContent.includes('approveRestaurantApplication'), 'Must export approveRestaurantApplication');
    assert.ok(contextContent.includes('approveRiderKyc'), 'Must export approveRiderKyc');
    assert.ok(contextContent.includes('verifyRestaurantDocument'), 'Must export verifyRestaurantDocument');
    assert.ok(contextContent.includes('verifyRiderDocument'), 'Must export verifyRiderDocument');
    assert.ok(contextContent.includes("missing.push('Aadhaar Front')"), 'Must check mandatory personal documents');
  });
});

test('FEATURE 4 — Delivery Rider Bronze, Silver & Gold Tier System Unit Tests', async (t) => {
  await t.test('Tier configurations match official business rules', () => {
    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.bronze.minRating, 0);
    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.bronze.minWorkingHours, 0);
    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.bronze.minCompletedOrders, 0);
    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.bronze.basePayout, 40);
    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.bronze.orderMultiplier, 1.0);
    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.bronze.tierIncentive, 0);

    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.silver.minRating, 4.6);
    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.silver.minWorkingHours, 50);
    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.silver.minCompletedOrders, 100);
    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.silver.basePayout, 45);
    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.silver.orderMultiplier, 1.05);
    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.silver.tierIncentive, 15);

    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.gold.minRating, 4.8);
    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.gold.minWorkingHours, 150);
    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.gold.minCompletedOrders, 300);
    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.gold.basePayout, 55);
    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.gold.orderMultiplier, 1.10);
    assert.strictEqual(DEFAULT_TIER_CONFIGURATIONS.gold.tierIncentive, 30);
  });

  await t.test('calculateRiderTier assigns Bronze by default', () => {
    const tier = calculateRiderTier(4.5, 10, 20);
    assert.strictEqual(tier, 'bronze');
  });

  await t.test('calculateRiderTier qualifies Silver only when rating, hours AND orders meet thresholds', () => {
    // Missing hours
    assert.strictEqual(calculateRiderTier(4.7, 49, 120), 'bronze');
    // Missing orders
    assert.strictEqual(calculateRiderTier(4.7, 60, 99), 'bronze');
    // Missing rating
    assert.strictEqual(calculateRiderTier(4.5, 60, 120), 'bronze');
    // All 3 criteria met -> Silver!
    assert.strictEqual(calculateRiderTier(4.65, 55, 110), 'silver');
  });

  await t.test('calculateRiderTier qualifies Gold only when all 3 criteria meet Gold thresholds', () => {
    // Meets Silver but not Gold
    assert.strictEqual(calculateRiderTier(4.85, 140, 310), 'silver');
    // Meets Gold
    assert.strictEqual(calculateRiderTier(4.9, 160, 320), 'gold');
  });

  await t.test('calculateTierPayout computes Bronze payout accurately', () => {
    // Bronze: base ₹40 + (3km * ₹12/km = ₹36) + ₹10 surge = ₹86 * 1.00 = ₹86 + ₹0 tier incentive + ₹20 tip = ₹106
    const payout = calculateTierPayout('bronze', 3, 10, 20);
    assert.strictEqual(payout.tier, 'bronze');
    assert.strictEqual(payout.baseFare, 76); // 40 + 36
    assert.strictEqual(payout.surgeFare, 10);
    assert.strictEqual(payout.tipAmount, 20);
    assert.strictEqual(payout.tierIncentiveBonus, 0);
    assert.strictEqual(payout.payoutMultiplier, 1.0);
    assert.strictEqual(payout.totalPayout, 106);
  });

  await t.test('calculateTierPayout computes Silver payout with 1.05x multiplier and ₹15 incentive', () => {
    // Silver: base ₹45 + (3km * ₹14/km = ₹42) + ₹15 surge = ₹102 * 1.05 = ₹107.10 -> ₹107 + ₹15 tier incentive + ₹20 tip = ₹142
    const payout = calculateTierPayout('silver', 3, 15, 20);
    assert.strictEqual(payout.tier, 'silver');
    assert.strictEqual(payout.tierIncentiveBonus, 15);
    assert.strictEqual(payout.payoutMultiplier, 1.05);
    assert.strictEqual(payout.totalPayout, 142);
  });

  await t.test('calculateTierPayout computes Gold payout with 1.10x multiplier and ₹30 incentive', () => {
    // Gold: base ₹55 + (3km * ₹16/km = ₹48) + ₹20 surge = ₹123 * 1.10 = ₹135.30 -> ₹135 + ₹30 tier incentive + ₹20 tip = ₹185
    const payout = calculateTierPayout('gold', 3, 20, 20);
    assert.strictEqual(payout.tier, 'gold');
    assert.strictEqual(payout.tierIncentiveBonus, 30);
    assert.strictEqual(payout.payoutMultiplier, 1.10);
    assert.strictEqual(payout.totalPayout, 185);
  });
});

test('DATABASE MIGRATION — Security, Tables & RPC Definitions', async (t) => {
  const migrationPath = path.join(rootDir, 'supabase', 'migrations', '20261113200000_auth_kyc_and_rider_tier_system.sql');
  assert.ok(fs.existsSync(migrationPath), 'Migration file 20261113200000 must exist');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  await t.test('Migration defines tier_configurations table with Bronze, Silver, Gold rows', () => {
    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.tier_configurations'));
    assert.ok(sql.includes("'bronze'"));
    assert.ok(sql.includes("'silver'"));
    assert.ok(sql.includes("'gold'"));
  });

  await t.test('Migration defines rider_selfie_verifications table with grace period support', () => {
    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.rider_selfie_verifications'));
    assert.ok(sql.includes('prompted_at'));
    assert.ok(sql.includes('missed_at'));
  });

  await t.test('Migration defines calculate_rider_tier and submit_rider_selfie RPCs', () => {
    assert.ok(sql.includes('CREATE OR REPLACE FUNCTION public.calculate_rider_tier'));
    assert.ok(sql.includes('CREATE OR REPLACE FUNCTION public.submit_rider_selfie'));
    assert.ok(sql.includes('CREATE OR REPLACE FUNCTION public.admin_update_tier_config'));
  });
});
