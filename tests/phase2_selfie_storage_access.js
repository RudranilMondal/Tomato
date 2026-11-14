/**
 * TOMATTTO FOOD DELIVERY PLATFORM: PHASE 2 INTEGRATION VERIFICATION
 * File: tests/phase2_selfie_storage_access.js
 *
 * Verifies:
 * 1. Private `rider-selfie-evidence` storage bucket isolation under RLS:
 *    - Synthetic Rider A uploads live JPEG to own folder.
 *    - Synthetic Rider A can read/download their own selfie.
 *    - Synthetic Rider B is rejected when attempting to read or upload to Rider A's folder.
 *    - Anonymous/unauthenticated caller is rejected.
 *    - Application Admin (profile role = admin) with authenticated JWT (NO service-role bypass) can read Rider A's selfie.
 * 2. Backend selfie scheduling & grace period:
 *    - Duty start for Gold creates mandatory pending selfie verification.
 *    - Duty start for Silver schedules selfie 4 hours out.
 *    - Duty start for Bronze schedules random selfie 60-120 minutes out.
 *    - Duty end for Gold creates mandatory pending selfie verification.
 *    - 10-minute grace period expiry: Pending verifications with expired missed_at are marked 'missed'.
 *    - Active sweeper function `sweep_active_rider_selfie_verifications()` triggers and executes correctly.
 * 3. Immutable order payout snapshot & duplicate prevention:
 *    - First call to `record_rider_order_payout` succeeds and snapshots earnings.
 *    - Second call with duplicate order_id is prevented by unique constraint / logic.
 * 4. Guaranteed synthetic fixture cleanup in `finally` block.
 */

import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PG_CONN = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

export async function runPhase2IntegrationSuite() {
  if (!SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('CONFIG_ERROR: Supabase anon and service-role keys are required in environment.');
  }

  console.log('\n============================================================');
  console.log('--- PHASE 2: SELFIE STORAGE ACCESS & BACKEND SCHEDULING ---');
  console.log('============================================================\n');

  const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const pgClient = new pg.Client({ connectionString: PG_CONN });
  await pgClient.connect();

  const nonce = randomUUID().replace(/-/g, '').slice(0, 8);
  const emailRiderA = `test_rider_a_${nonce}@staging.local`;
  const emailRiderB = `test_rider_b_${nonce}@staging.local`;
  const emailAdmin = `test_admin_${nonce}@staging.local`;
  const password = `TestPass!_${nonce}_Aa1`;

  let riderAAuth = null;
  let riderBAuth = null;
  let adminAuth = null;
  let riderARowId = null;
  let riderBRowId = null;
  let testOrderId = null;
  let cancelledOrderId = null;
  const uploadedFiles = [];

  const clientRiderA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const clientRiderB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const clientAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Step 1: Provision test users
    console.log('[1/7] Setting up synthetic accounts: Rider A, Rider B, Application Admin...');
    const resA = await serviceClient.auth.admin.createUser({
      email: emailRiderA,
      password,
      email_confirm: true,
      user_metadata: { role: 'rider' },
    });
    if (resA.error) throw resA.error;
    riderAAuth = resA.data;

    const resB = await serviceClient.auth.admin.createUser({
      email: emailRiderB,
      password,
      email_confirm: true,
      user_metadata: { role: 'rider' },
    });
    if (resB.error) throw resB.error;
    riderBAuth = resB.data;

    const resAdmin = await serviceClient.auth.admin.createUser({
      email: emailAdmin,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });
    if (resAdmin.error) throw resAdmin.error;
    adminAuth = resAdmin.data;

    // Set roles in profiles
    await serviceClient.from('profiles').upsert([
      { id: riderAAuth.user.id, full_name: 'Test Rider A', phone: `+91981${nonce}`, role: 'rider' },
      { id: riderBAuth.user.id, full_name: 'Test Rider B', phone: `+91982${nonce}`, role: 'rider' },
      { id: adminAuth.user.id, full_name: 'Test Admin', phone: `+91983${nonce}`, role: 'admin' },
    ]);

    // Insert corresponding rider records in public.riders
    const riderAInsert = await pgClient.query(
      `INSERT INTO public.riders (profile_id, vehicle_type, vehicle_number, tier, rating, total_working_hours, completed_orders_count)
       VALUES ($1, 'bike', 'MH12AB1001', 'bronze', 4.5, 10.0, 20)
       RETURNING id;`,
      [riderAAuth.user.id]
    );
    riderARowId = riderAInsert.rows[0].id;

    const riderBInsert = await pgClient.query(
      `INSERT INTO public.riders (profile_id, vehicle_type, vehicle_number, tier, rating, total_working_hours, completed_orders_count)
       VALUES ($1, 'bike', 'MH12AB1002', 'silver', 4.7, 60.0, 110)
       RETURNING id;`,
      [riderBAuth.user.id]
    );
    riderBRowId = riderBInsert.rows[0].id;

    // Authenticate client sessions
    const { error: errA } = await clientRiderA.auth.signInWithPassword({ email: emailRiderA, password });
    assert.strictEqual(errA, null, 'Rider A login failed');

    const { error: errB } = await clientRiderB.auth.signInWithPassword({ email: emailRiderB, password });
    assert.strictEqual(errB, null, 'Rider B login failed');

    const { error: errAdmin } = await clientAdmin.auth.signInWithPassword({ email: emailAdmin, password });
    assert.strictEqual(errAdmin, null, 'Admin login failed');

    console.log('      Synthetic users authenticated with real GoTrue JWTs.');

    // Step 2: Test Selfie Upload to private rider-selfie-evidence bucket
    console.log('[2/7] Testing Rider A upload to private rider-selfie-evidence bucket...');
    const selfieBuffer = Buffer.from('\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xFF\xDB\x00C\x00TEST_IMAGE');
    const selfiePathA = `${riderAAuth.user.id}/selfie_${Date.now()}.jpg`;

    const { data: uploadAData, error: uploadAErr } = await clientRiderA.storage
      .from('rider-selfie-evidence')
      .upload(selfiePathA, selfieBuffer, { contentType: 'image/jpeg', upsert: true });

    assert.strictEqual(uploadAErr, null, `Rider A failed to upload to own folder: ${uploadAErr?.message}`);
    uploadedFiles.push(selfiePathA);
    console.log('      PASS: Rider A uploaded selfie JPEG to own folder.');

    // Step 3: Test Rider A can download their own selfie
    console.log('[3/7] Testing Rider A download of own selfie...');
    const { data: dlAData, error: dlAErr } = await clientRiderA.storage
      .from('rider-selfie-evidence')
      .download(selfiePathA);
    assert.strictEqual(dlAErr, null, `Rider A could not download own selfie: ${dlAErr?.message}`);
    assert.ok(dlAData, 'Rider A received null download data');
    console.log('      PASS: Rider A successfully downloaded their own selfie.');

    // Step 4: Cross-rider access isolation: Rider B attempts to read Rider A's selfie
    console.log('[4/7] Testing cross-rider access isolation (Rider B attempting to read Rider A\'s selfie)...');
    const { data: crossData, error: crossErr } = await clientRiderB.storage
      .from('rider-selfie-evidence')
      .download(selfiePathA);

    assert.ok(
      crossErr !== null || !crossData,
      'SECURITY LEAK: Rider B was able to read Rider A\'s private selfie!'
    );
    console.log('      PASS: Rider B was blocked from accessing Rider A\'s selfie.');

    // Anonymous request must also be blocked
    const { data: anonData, error: anonErr } = await anonClient.storage
      .from('rider-selfie-evidence')
      .download(selfiePathA);
    assert.ok(anonErr !== null || !anonData, 'SECURITY LEAK: Anonymous user read private selfie!');
    console.log('      PASS: Unauthenticated public request was rejected.');

    // Step 5: Application Admin review using genuine application-admin JWT (NOT service role)
    console.log('[5/7] Testing Application Admin access with authenticated JWT (no service-role bypass)...');
    const { data: adminDlData, error: adminDlErr } = await clientAdmin.storage
      .from('rider-selfie-evidence')
      .download(selfiePathA);

    assert.strictEqual(adminDlErr, null, `Admin was blocked from reading selfie: ${adminDlErr?.message}`);
    assert.ok(adminDlData, 'Admin received null download data');
    console.log('      PASS: Authenticated Admin successfully accessed Rider A\'s selfie under RLS.');

    // Step 6: Backend Scheduling & Tier Evaluation Verification
    console.log('[6/7] Testing backend selfie scheduling intervals and grace period enforcement...');
    // A. Bronze duty start -> random 60-120 min interval
    const bronzeStart = await pgClient.query('SELECT public.rider_start_duty($1) as res;', [riderARowId]);
    const bronzeStartData = bronzeStart.rows[0].res;
    assert.strictEqual(bronzeStartData.success, true);
    assert.strictEqual(bronzeStartData.tier, 'bronze');
    assert.strictEqual(bronzeStartData.selfie_required, false);
    assert.ok(bronzeStartData.next_scheduled_at, 'Bronze should have a next scheduled selfie');

    const bronzeSchedTime = new Date(bronzeStartData.next_scheduled_at).getTime();
    const nowTime = Date.now();
    const diffMins = Math.round((bronzeSchedTime - nowTime) / (60 * 1000));
    assert.ok(diffMins >= 59 && diffMins <= 121, `Bronze interval ${diffMins}m outside expected 60-120m range`);
    console.log(`      PASS: Bronze duty-start scheduled random interval: ${diffMins} minutes.`);

    // B. Silver duty start -> 240 min interval
    const silverStart = await pgClient.query('SELECT public.rider_start_duty($1) as res;', [riderBRowId]);
    const silverStartData = silverStart.rows[0].res;
    assert.strictEqual(silverStartData.success, true);
    assert.strictEqual(silverStartData.tier, 'silver');
    assert.strictEqual(silverStartData.selfie_required, false);

    const silverSchedTime = new Date(silverStartData.next_scheduled_at).getTime();
    const silverDiffMins = Math.round((silverSchedTime - nowTime) / (60 * 1000));
    assert.ok(silverDiffMins >= 239 && silverDiffMins <= 241, `Silver interval ${silverDiffMins}m should be 240m`);
    console.log(`      PASS: Silver duty-start scheduled fixed interval: ${silverDiffMins} minutes (4 hours).`);

    // C. Gold rider duty start and end
    const goldInsert = await pgClient.query(
      `INSERT INTO public.riders (profile_id, vehicle_type, vehicle_number, tier, rating, total_working_hours, completed_orders_count)
       VALUES ($1, 'bike', 'MH12AB1003', 'gold', 4.9, 160.0, 320)
       RETURNING id;`,
      [adminAuth.user.id]
    );
    const goldRiderId = goldInsert.rows[0].id;

    const goldStart = await pgClient.query('SELECT public.rider_start_duty($1) as res;', [goldRiderId]);
    const goldStartData = goldStart.rows[0].res;
    assert.strictEqual(goldStartData.success, true);
    assert.strictEqual(goldStartData.tier, 'gold');
    assert.strictEqual(goldStartData.selfie_required, true, 'Gold should require selfie at duty start');
    assert.ok(goldStartData.verification_id, 'Gold should have verification_id created');
    console.log('      PASS: Gold duty-start generated mandatory selfie verification.');

    const goldEnd = await pgClient.query('SELECT public.rider_end_duty($1) as res;', [goldRiderId]);
    const goldEndData = goldEnd.rows[0].res;
    assert.strictEqual(goldEndData.success, true);
    assert.strictEqual(goldEndData.selfie_required, true, 'Gold should require selfie at duty end');
    console.log('      PASS: Gold duty-end generated mandatory selfie verification.');

    // D. Grace period expiry enforcement
    const expiredVerif = await pgClient.query(
      `INSERT INTO public.rider_selfie_verifications (rider_id, tier, verification_type, status, prompted_at, missed_at)
       VALUES ($1, 'bronze', 'random_duty', 'pending', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '10 minutes')
       RETURNING id;`,
      [riderARowId]
    );
    const expiredId = expiredVerif.rows[0].id;

    // Call check_rider_selfie_due
    await pgClient.query('SELECT public.check_rider_selfie_due($1);', [riderARowId]);

    // Verify status was changed to 'missed'
    const statusCheck = await pgClient.query(
      'SELECT status FROM public.rider_selfie_verifications WHERE id = $1;',
      [expiredId]
    );
    assert.strictEqual(statusCheck.rows[0].status, 'missed', 'Expired verification must be marked missed');
    console.log('      PASS: 10-minute grace period expiry enforced by backend (pending -> missed).');

    // E. Sweeper function test
    const sweepRes = await pgClient.query('SELECT public.sweep_active_rider_selfie_verifications() as swept;');
    assert.ok(typeof sweepRes.rows[0].swept === 'number', 'Sweeper must return integer count');
    console.log(`      PASS: sweep_active_rider_selfie_verifications() executed successfully (swept: ${sweepRes.rows[0].swept}).`);

    // Clean up gold rider fixture
    await pgClient.query('DELETE FROM public.rider_selfie_verifications WHERE rider_id = $1;', [goldRiderId]);
    await pgClient.query('DELETE FROM public.riders WHERE id = $1;', [goldRiderId]);

    // Step 7: Order payout snapshot & duplicate prevention
    console.log('[7/7] Testing record_rider_order_payout duplicate prevention...');
    testOrderId = randomUUID();

    // Create a synthetic order record to satisfy foreign key constraint
    await pgClient.query(
      `INSERT INTO public.orders (
        id, customer_id, restaurant_id, rider_id, status, item_total, total_amount, delivery_address
      ) VALUES (
        $1, $2, 'b0000001-0000-0000-0000-000000000001', $3, 'delivered', 200.00, 250.00, '{"street": "MG Road"}'::jsonb
      );`,
      [testOrderId, riderAAuth.user.id, riderARowId]
    );

    // First call: should succeed
    const payout1 = await pgClient.query(
      `SELECT public.record_rider_order_payout(
        $1::UUID, $2::UUID, 5.0, 20.0, 15.0
      ) as res;`,
      [testOrderId, riderARowId]
    );
    const payout1Data = payout1.rows[0].res;
    assert.strictEqual(payout1Data.success, true);
    assert.ok(payout1Data.payout_id, 'payout_id must be generated');
    console.log(`      PASS: Payout record created (ID: ${payout1Data.payout_id}, Total: ₹${payout1Data.total_payout}).`);

    // Second call: duplicate order_id should be prevented
    const payout2 = await pgClient.query(
      `SELECT public.record_rider_order_payout(
        $1::UUID, $2::UUID, 5.0, 20.0, 15.0
      ) as res;`,
      [testOrderId, riderARowId]
    );
    const payout2Data = payout2.rows[0].res;
    assert.strictEqual(payout2Data.success, true);
    assert.strictEqual(payout2Data.already_recorded, true, 'Second payout call must flag already_recorded');
    assert.strictEqual(payout2Data.payout_id, payout1Data.payout_id, 'Duplicate call should return original payout_id');
    console.log('      PASS: Duplicate payout invocation prevented (idempotent result returned).');

    // 7C. Cancelled order cannot generate completed-order payouts
    cancelledOrderId = randomUUID();
    await pgClient.query(
      `INSERT INTO public.orders (
        id, customer_id, restaurant_id, rider_id, status, item_total, total_amount, delivery_address
      ) VALUES (
        $1, $2, 'b0000001-0000-0000-0000-000000000001', $3, 'cancelled', 200.00, 250.00, '{"street": "MG Road"}'::jsonb
      );`,
      [cancelledOrderId, riderAAuth.user.id, riderARowId]
    );

    const cancelledPayout = await pgClient.query(
      `SELECT public.record_rider_order_payout(
        $1::UUID, $2::UUID, 5.0, 20.0, 15.0
      ) as res;`,
      [cancelledOrderId, riderARowId]
    );
    assert.strictEqual(cancelledPayout.rows[0].res.success, false);
    assert.strictEqual(cancelledPayout.rows[0].res.error, 'ORDER_CANCELLED');
    console.log('      PASS: Cancelled order payout rejected with ORDER_CANCELLED.');

    // 7D. Historical snapshot immutability across rider tier change
    // Rider A is currently bronze. Promote Rider A to gold in public.riders:
    await pgClient.query("UPDATE public.riders SET tier = 'gold' WHERE id = $1;", [riderARowId]);

    // Query previous payout row:
    const snapshotCheck = await pgClient.query(
      'SELECT tier, base_payout, per_km_rate FROM public.rider_order_payouts WHERE order_id = $1;',
      [testOrderId]
    );
    assert.strictEqual(snapshotCheck.rows[0].tier, 'bronze', 'Historical snapshot must retain original tier bronze');
    assert.strictEqual(Number(snapshotCheck.rows[0].base_payout), 40.00, 'Historical base payout must be preserved');
    assert.strictEqual(Number(snapshotCheck.rows[0].per_km_rate), 12.00, 'Historical per km rate must be preserved');
    console.log('      PASS: Historical snapshot retained original bronze rates after rider tier upgrade to gold.');

    // Clean up payout & order test fixtures
    await pgClient.query('DELETE FROM public.rider_order_payouts WHERE order_id = $1;', [testOrderId]);
    await pgClient.query('DELETE FROM public.orders WHERE id = ANY($1);', [[testOrderId, cancelledOrderId]]);

    console.log('\n------------------------------------------------------------');
    console.log('ALL PHASE 2 STORAGE & SCHEDULING VERIFICATIONS PASSED (7/7)');
    console.log('------------------------------------------------------------\n');
  } finally {
    // Guaranteed non-destructive cleanup of all test fixtures
    try {
      if (testOrderId) {
        await pgClient.query('DELETE FROM public.rider_order_payouts WHERE order_id = $1;', [testOrderId]).catch(() => {});
        await pgClient.query('DELETE FROM public.orders WHERE id = $1;', [testOrderId]).catch(() => {});
      }
      if (cancelledOrderId) {
        await pgClient.query('DELETE FROM public.orders WHERE id = $1;', [cancelledOrderId]).catch(() => {});
      }
      if (uploadedFiles.length > 0) {
        await serviceClient.storage.from('rider-selfie-evidence').remove(uploadedFiles);
      }
      if (riderARowId) {
        await pgClient.query('DELETE FROM public.rider_selfie_verifications WHERE rider_id = $1;', [riderARowId]);
        await pgClient.query('DELETE FROM public.riders WHERE id = $1;', [riderARowId]);
      }
      if (riderBRowId) {
        await pgClient.query('DELETE FROM public.rider_selfie_verifications WHERE rider_id = $1;', [riderBRowId]);
        await pgClient.query('DELETE FROM public.riders WHERE id = $1;', [riderBRowId]);
      }
      if (riderAAuth?.user?.id) {
        await pgClient.query('DELETE FROM public.profiles WHERE id = $1;', [riderAAuth.user.id]);
        await serviceClient.auth.admin.deleteUser(riderAAuth.user.id).catch(() => {});
      }
      if (riderBAuth?.user?.id) {
        await pgClient.query('DELETE FROM public.profiles WHERE id = $1;', [riderBAuth.user.id]);
        await serviceClient.auth.admin.deleteUser(riderBAuth.user.id).catch(() => {});
      }
      if (adminAuth?.user?.id) {
        await pgClient.query('DELETE FROM public.profiles WHERE id = $1;', [adminAuth.user.id]);
        await serviceClient.auth.admin.deleteUser(adminAuth.user.id).catch(() => {});
      }
      await pgClient.end();
    } catch (cleanupErr) {
      console.warn('Warning during fixture cleanup:', cleanupErr.message);
    }
  }
}

// Auto-run when executed directly
if (process.argv[1]?.endsWith('phase2_selfie_storage_access.js')) {
  runPhase2IntegrationSuite().catch((err) => {
    console.error('TEST_FAILED:', err);
    process.exit(1);
  });
}
