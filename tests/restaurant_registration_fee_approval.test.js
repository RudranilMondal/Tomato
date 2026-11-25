// ==============================================================================
// TOMATTTO: RESTAURANT REGISTRATION PAYMENT SECURITY INTEGRATION TEST SUITE
// File: tests/restaurant_registration_fee_approval.test.js
// ==============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import pg from 'pg';
const { Pool } = pg;

async function isPortOpen(host, port, timeoutMs = 400) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

const MANDATORY_DOCS = ['aadhaar_front', 'aadhaar_back', 'pan_front', 'pan_back', 'pan_card', 'fssai_cert'];

async function insertVerifiedKycDocs(client, appId) {
  for (const docType of MANDATORY_DOCS) {
    await client.query(`
      INSERT INTO public.restaurant_partner_documents (
        application_id, doc_type, storage_bucket, storage_path, file_name, status
      ) VALUES (
        $1, $2, 'partner-kyc-documents', $3, $4, 'verified'
      )
    `, [appId, docType, `${appId}/${docType}.jpg`, `${docType}.jpg`]);
  }
}

test('1. MIGRATION DDL VALIDATION: Forward migration exists and contains zero-trust checks', () => {
  const migPath = path.resolve(
    process.cwd(),
    'supabase/migrations/20261125161500_secure_restaurant_registration_payment_enforcement.sql'
  );
  assert.ok(fs.existsSync(migPath), 'Migration 20261125161500 must exist');
  const sql = fs.readFileSync(migPath, 'utf8');

  assert.match(sql, /REGISTRATION_FEE_NOT_PAID/i, 'Must specify REGISTRATION_FEE_NOT_PAID');
  assert.match(sql, /REGISTRATION_PAYMENT_REUSED/i, 'Must specify REGISTRATION_PAYMENT_REUSED');
  assert.match(sql, /REGISTRATION_PAYMENT_MISMATCH/i, 'Must specify REGISTRATION_PAYMENT_MISMATCH');
  assert.match(sql, /REGISTRATION_FEE_REFUNDED/i, 'Must specify REGISTRATION_FEE_REFUNDED');
  assert.match(sql, /amount = 499\.00/i, 'Must verify exact 499.00 amount');
  assert.match(sql, /currency = 'INR'/i, 'Must verify INR currency');
  assert.match(sql, /protect_partner_application_fields/i, 'Must harden protect_partner_application_fields');
  assert.match(sql, /idx_restaurant_app_reg_payment_id_uniq/i, 'Must create unique partial index');
});

test('2. INTEGRATION: Exhaustive PostgreSQL Verification of Registration Payment Security', async () => {
  const host = '127.0.0.1';
  const port = 54322;
  const dbUrl = `postgresql://postgres:postgres@${host}:${port}/postgres`;

  const available = await isPortOpen(host, port);
  if (!available) {
    console.log(`[SKIP] PostgreSQL not listening on ${host}:${port}. Integration suite skipped.`);
    return;
  }

  const pool = new Pool({ connectionString: dbUrl, max: 5 });
  const client = await pool.connect();

  try {
    // 0. Apply forward migrations
    const mig1Path = path.resolve(process.cwd(), 'supabase/migrations/20261125153000_enforce_restaurant_registration_fee_in_approval.sql');
    const mig2Path = path.resolve(process.cwd(), 'supabase/migrations/20261125161500_secure_restaurant_registration_payment_enforcement.sql');
    const mig3Path = path.resolve(process.cwd(), 'supabase/migrations/20261125183000_hardened_registration_security_and_ownership.sql');
    await client.query(fs.readFileSync(mig1Path, 'utf8'));
    await client.query(fs.readFileSync(mig2Path, 'utf8'));
    await client.query(fs.readFileSync(mig3Path, 'utf8'));

    // Users & Roles Setup
    const adminId = 'd0000000-0000-0000-0000-000000000001';
    const applicant1Id = 'd0000000-0000-0000-0000-000000000002';
    const applicant2Id = 'd0000000-0000-0000-0000-000000000003';

    await client.query(`
      INSERT INTO auth.users (id, email) VALUES
        ($1, 'sec_admin@tomattto.local'),
        ($2, 'sec_applicant1@tomattto.local'),
        ($3, 'sec_applicant2@tomattto.local')
      ON CONFLICT (id) DO NOTHING;
    `, [adminId, applicant1Id, applicant2Id]);

    await client.query(`
      INSERT INTO public.profiles (id, full_name, phone, role) VALUES
        ($1, 'Security Admin', '+919999990001', 'admin'),
        ($2, 'Applicant One', '+919999990002', 'customer'),
        ($3, 'Applicant Two', '+919999990003', 'customer')
      ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
    `, [adminId, applicant1Id, applicant2Id]);

    const setAuthContext = async (c, uid, role = 'authenticated') => {
      await c.query('SET ROLE authenticated;');
      await c.query(`
        SELECT
          set_config('request.jwt.claim.sub', $1, false),
          set_config('request.jwt.claim.role', $2, false),
          set_config('request.jwt.claims', json_build_object('sub', $1::uuid, 'role', $2)::text, false);
      `, [uid, role]);
    };

    const resetAuth = async (c) => {
      await c.query('RESET ROLE;');
      await c.query(`
        SELECT
          set_config('request.jwt.claim.sub', '', false),
          set_config('request.jwt.claim.role', '', false),
          set_config('request.jwt.claims', '', false);
      `);
    };

    // --------------------------------------------------------------------------
    // Test A: Fake payment ID (Non-empty string without ledger transaction) -> MUST FAIL
    // --------------------------------------------------------------------------
    await resetAuth(client);
    const appAId = 'a1111111-1111-1111-1111-111111111111';
    await client.query('DELETE FROM public.restaurant_partner_documents WHERE application_id = $1', [appAId]);
    await client.query('DELETE FROM public.restaurant_partner_applications WHERE id = $1', [appAId]);
    await client.query('DELETE FROM public.platform_financial_transactions WHERE reference_id = $1', [appAId]);
    await client.query(`
      INSERT INTO public.restaurant_partner_applications (
        id, user_id, application_ref, ownership_token_hash, restaurant_name, status, phone, email, address_line1, city, postal_code,
        registration_fee_paid, registration_payment_id, is_legacy_grandfathered, starter_kit_status
      ) VALUES (
        $1, $2, 'REF-TEST-A', 'hash_a', 'Test Fake Payment Restaurant', 'submitted', '+919999900001', 'fake@example.com', 'MG Road', 'Bengaluru', '560001',
        TRUE, 'pay_fake_unverified_123', FALSE, 'allocated'
      )
    `, [appAId, applicant1Id]);
    await insertVerifiedKycDocs(client, appAId);

    await setAuthContext(client, adminId);
    const resA = await client.query('SELECT public.admin_review_restaurant_application($1, \'approve\') AS result', [appAId]);
    const rA = resA.rows[0].result;
    assert.strictEqual(rA.success, false, 'Fake payment ID without ledger record must fail');
    assert.strictEqual(rA.error, 'REGISTRATION_FEE_NOT_PAID', 'Error must be REGISTRATION_FEE_NOT_PAID');
    console.log('✓ Test A: Fake payment ID string rejected with REGISTRATION_FEE_NOT_PAID');

    // --------------------------------------------------------------------------
    // Test B: Forged payment status by applicant via UPDATE -> MUST FAIL
    // --------------------------------------------------------------------------
    await resetAuth(client);
    const appBId = 'b1111111-1111-1111-1111-111111111111';
    await client.query('DELETE FROM public.restaurant_partner_documents WHERE application_id = $1', [appBId]);
    await client.query('DELETE FROM public.restaurant_partner_applications WHERE id = $1', [appBId]);
    await client.query(`
      INSERT INTO public.restaurant_partner_applications (
        id, user_id, application_ref, ownership_token_hash, restaurant_name, status, phone, email, address_line1, city, postal_code,
        registration_fee_paid, registration_payment_id, is_legacy_grandfathered, starter_kit_status
      ) VALUES (
        $1, $2, 'REF-TEST-B', 'hash_b', 'Test Forged Status Restaurant', 'draft', '+919999900002', 'forge@example.com', 'Koramangala', 'Bengaluru', '560034',
        FALSE, NULL, FALSE, 'not_allocated'
      )
    `, [appBId, applicant1Id]);

    await setAuthContext(client, applicant1Id);
    let forgeErrorB = null;
    try {
      await client.query(`
        UPDATE public.restaurant_partner_applications
        SET registration_fee_paid = TRUE
        WHERE id = $1
      `, [appBId]);
    } catch (err) {
      forgeErrorB = err;
    }
    assert.ok(forgeErrorB, 'Applicant must not be able to set registration_fee_paid = TRUE');
    assert.strictEqual(forgeErrorB.code, '42501', 'Must throw 42501 error');
    console.log('✓ Test B: Forged registration_fee_paid update by applicant blocked with 42501');

    // --------------------------------------------------------------------------
    // Test C: Forged grandfathering by applicant via UPDATE -> MUST FAIL
    // --------------------------------------------------------------------------
    let forgeErrorC = null;
    try {
      await client.query(`
        UPDATE public.restaurant_partner_applications
        SET is_legacy_grandfathered = TRUE
        WHERE id = $1
      `, [appBId]);
    } catch (err) {
      forgeErrorC = err;
    }
    assert.ok(forgeErrorC, 'Applicant must not be able to set is_legacy_grandfathered = TRUE');
    assert.strictEqual(forgeErrorC.code, '42501', 'Must throw 42501 error');
    console.log('✓ Test C: Forged is_legacy_grandfathered update by applicant blocked with 42501');

    // --------------------------------------------------------------------------
    // Test D: Cross-application payment reuse -> MUST FAIL
    // --------------------------------------------------------------------------
    await resetAuth(client);
    const appD1Id = 'd1111111-1111-1111-1111-111111111111';
    const appD2Id = 'd2222222-2222-2222-2222-222222222222';
    await client.query('DELETE FROM public.restaurant_partner_documents WHERE application_id = ANY($1::UUID[])', [[appD1Id, appD2Id]]);
    await client.query('DELETE FROM public.restaurant_partner_applications WHERE id = ANY($1::UUID[])', [[appD1Id, appD2Id]]);
    await client.query('DELETE FROM public.platform_financial_transactions WHERE reference_id = ANY($1::TEXT[])', [[appD1Id, appD2Id]]);

    const sharedPayId = 'pay_shared_test_reuse_999';

    // Application D1 pays legitimately
    await client.query(`
      INSERT INTO public.restaurant_partner_applications (
        id, user_id, application_ref, ownership_token_hash, restaurant_name, status, phone, email, address_line1, city, postal_code,
        registration_fee_paid, registration_payment_id, is_legacy_grandfathered, starter_kit_status
      ) VALUES (
        $1, $2, 'REF-TEST-D1', 'hash_d1', 'Test Valid Restaurant D1', 'submitted', '+919999900003', 'd1@example.com', 'Indiranagar', 'Bengaluru', '560038',
        TRUE, $3, FALSE, 'allocated'
      )
    `, [appD1Id, applicant1Id, sharedPayId]);
    await insertVerifiedKycDocs(client, appD1Id);

    await client.query(`
      INSERT INTO public.platform_financial_transactions (
        transaction_type, reference_id, payment_id, entity_type, entity_id, amount, currency, status, idempotency_key
      ) VALUES (
        'partner_registration', $1, $2, 'restaurant', $3::UUID, 499.00, 'INR', 'completed', 'reg_ptr_' || $2
      )
    `, [appD1Id, sharedPayId, appD1Id]);

    // Application D2 tries to link to same payment in financial transactions with different reference_id
    await client.query(`
      INSERT INTO public.restaurant_partner_applications (
        id, user_id, application_ref, ownership_token_hash, restaurant_name, status, phone, email, address_line1, city, postal_code,
        registration_fee_paid, registration_payment_id, is_legacy_grandfathered, starter_kit_status
      ) VALUES (
        $1, $2, 'REF-TEST-D2', 'hash_d2', 'Test Reused Payment Restaurant D2', 'submitted', '+919999900004', 'd2@example.com', 'Whitefield', 'Bengaluru', '560066',
        TRUE, NULL, FALSE, 'allocated'
      )
    `, [appD2Id, applicant2Id]);
    await insertVerifiedKycDocs(client, appD2Id);

    // D2 inserts ledger record with payment_id = NULL but metadata->>'payment_id' pointing to App D1's payment ID
    await client.query(`
      INSERT INTO public.platform_financial_transactions (
        transaction_type, reference_id, payment_id, entity_type, entity_id, amount, currency, status, idempotency_key, metadata
      ) VALUES (
        'partner_registration', $1, NULL, 'restaurant', $2::UUID, 499.00, 'INR', 'completed', 'reg_ptr_diff_002',
        jsonb_build_object('payment_id', $3::TEXT)
      )
    `, [appD2Id, appD2Id, sharedPayId]);

    await setAuthContext(client, adminId);
    const resD2 = await client.query('SELECT public.admin_review_restaurant_application($1, \'approve\') AS result', [appD2Id]);
    const rD2 = resD2.rows[0].result;
    assert.strictEqual(rD2.success, false, 'Approval must fail when payment is reused across applications');
    assert.strictEqual(rD2.error, 'REGISTRATION_PAYMENT_REUSED', 'Must report REGISTRATION_PAYMENT_REUSED');

    // Also verify database constraint blocks duplicate registration_payment_id directly
    await resetAuth(client);
    let dupConstraintErr = null;
    try {
      await client.query(`
        UPDATE public.restaurant_partner_applications
        SET registration_payment_id = $1
        WHERE id = $2
      `, [sharedPayId, appD2Id]);
    } catch (err) {
      dupConstraintErr = err;
    }
    assert.ok(dupConstraintErr, 'Database unique constraint must block duplicate registration_payment_id');
    assert.strictEqual(dupConstraintErr.code, '23505', 'Must throw 23505 unique violation');
    console.log('✓ Test D: Cross-application payment reuse blocked with REGISTRATION_PAYMENT_REUSED and unique constraint');

    // --------------------------------------------------------------------------
    // Test E: Incorrect amount (₹1 instead of ₹499) -> MUST FAIL
    // --------------------------------------------------------------------------
    await resetAuth(client);
    const appEId = 'e1111111-1111-1111-1111-111111111111';
    await client.query('DELETE FROM public.restaurant_partner_documents WHERE application_id = $1', [appEId]);
    await client.query('DELETE FROM public.restaurant_partner_applications WHERE id = $1', [appEId]);
    await client.query('DELETE FROM public.platform_financial_transactions WHERE reference_id = $1', [appEId]);
    await client.query(`
      INSERT INTO public.restaurant_partner_applications (
        id, user_id, application_ref, ownership_token_hash, restaurant_name, status, phone, email, address_line1, city, postal_code,
        registration_fee_paid, registration_payment_id, is_legacy_grandfathered, starter_kit_status
      ) VALUES (
        $1, $2, 'REF-TEST-E', 'hash_e', 'Test One Rupee Restaurant', 'submitted', '+919999900005', 'e@example.com', 'HSR Layout', 'Bengaluru', '560102',
        TRUE, 'pay_one_rupee_001', FALSE, 'allocated'
      )
    `, [appEId, applicant1Id]);
    await insertVerifiedKycDocs(client, appEId);

    await client.query(`
      INSERT INTO public.platform_financial_transactions (
        transaction_type, reference_id, payment_id, entity_type, entity_id, amount, currency, status, idempotency_key
      ) VALUES (
        'partner_registration', $1, 'pay_one_rupee_001', 'restaurant', $2::UUID, 1.00, 'INR', 'completed', 'reg_ptr_one_rupee_001'
      )
    `, [appEId, appEId]);

    await setAuthContext(client, adminId);
    const resE = await client.query('SELECT public.admin_review_restaurant_application($1, \'approve\') AS result', [appEId]);
    const rE = resE.rows[0].result;
    assert.strictEqual(rE.success, false, '₹1 registration payment must not permit approval');
    assert.strictEqual(rE.error, 'REGISTRATION_FEE_NOT_PAID', 'Error must be REGISTRATION_FEE_NOT_PAID');
    console.log('✓ Test E: Incorrect amount (₹1.00) rejected with REGISTRATION_FEE_NOT_PAID');

    // --------------------------------------------------------------------------
    // Test F: Wrong currency (USD instead of INR) -> MUST FAIL
    // --------------------------------------------------------------------------
    await resetAuth(client);
    const appFId = 'f1111111-1111-1111-1111-111111111111';
    await client.query('DELETE FROM public.restaurant_partner_documents WHERE application_id = $1', [appFId]);
    await client.query('DELETE FROM public.restaurant_partner_applications WHERE id = $1', [appFId]);
    await client.query('DELETE FROM public.platform_financial_transactions WHERE reference_id = $1', [appFId]);
    await client.query(`
      INSERT INTO public.restaurant_partner_applications (
        id, user_id, application_ref, ownership_token_hash, restaurant_name, status, phone, email, address_line1, city, postal_code,
        registration_fee_paid, registration_payment_id, is_legacy_grandfathered, starter_kit_status
      ) VALUES (
        $1, $2, 'REF-TEST-F', 'hash_f', 'Test USD Restaurant', 'submitted', '+919999900006', 'f@example.com', 'Hebbal', 'Bengaluru', '560024',
        TRUE, 'pay_usd_001', FALSE, 'allocated'
      )
    `, [appFId, applicant1Id]);
    await insertVerifiedKycDocs(client, appFId);

    await client.query(`
      INSERT INTO public.platform_financial_transactions (
        transaction_type, reference_id, payment_id, entity_type, entity_id, amount, currency, status, idempotency_key
      ) VALUES (
        'partner_registration', $1, 'pay_usd_001', 'restaurant', $2::UUID, 499.00, 'USD', 'completed', 'reg_ptr_usd_001'
      )
    `, [appFId, appFId]);

    await setAuthContext(client, adminId);
    const resF = await client.query('SELECT public.admin_review_restaurant_application($1, \'approve\') AS result', [appFId]);
    const rF = resF.rows[0].result;
    assert.strictEqual(rF.success, false, 'USD registration payment must not permit approval');
    assert.strictEqual(rF.error, 'REGISTRATION_FEE_NOT_PAID', 'Error must be REGISTRATION_FEE_NOT_PAID');
    console.log('✓ Test F: Wrong currency (USD) rejected with REGISTRATION_FEE_NOT_PAID');

    // --------------------------------------------------------------------------
    // Test G: Failed / Pending / Refunded transactions -> MUST FAIL
    // --------------------------------------------------------------------------
    // Case G1: status = 'failed'
    await resetAuth(client);
    const appGId = '00000000-0000-0000-0000-000000000007';
    await client.query('DELETE FROM public.restaurant_partner_documents WHERE application_id = $1', [appGId]);
    await client.query('DELETE FROM public.restaurant_partner_applications WHERE id = $1', [appGId]);
    await client.query('DELETE FROM public.platform_financial_transactions WHERE reference_id = $1', [appGId]);
    await client.query(`
      INSERT INTO public.restaurant_partner_applications (
        id, user_id, application_ref, ownership_token_hash, restaurant_name, status, phone, email, address_line1, city, postal_code,
        registration_fee_paid, registration_payment_id, is_legacy_grandfathered, starter_kit_status
      ) VALUES (
        $1, $2, 'REF-TEST-G', 'hash_g', 'Test Failed Status Restaurant', 'submitted', '+919999900007', 'g@example.com', 'JP Nagar', 'Bengaluru', '560078',
        TRUE, 'pay_failed_001', FALSE, 'allocated'
      )
    `, [appGId, applicant1Id]);
    await insertVerifiedKycDocs(client, appGId);

    await client.query(`
      INSERT INTO public.platform_financial_transactions (
        transaction_type, reference_id, payment_id, entity_type, entity_id, amount, currency, status, idempotency_key
      ) VALUES (
        'partner_registration', $1, 'pay_failed_001', 'restaurant', $2::UUID, 499.00, 'INR', 'failed', 'reg_ptr_failed_001'
      )
    `, [appGId, appGId]);

    await setAuthContext(client, adminId);
    const resG1 = await client.query('SELECT public.admin_review_restaurant_application($1, \'approve\') AS result', [appGId]);
    assert.strictEqual(resG1.rows[0].result.success, false, 'Failed status transaction must not permit approval');

    // Case G2: status = 'pending'
    await resetAuth(client);
    await client.query('UPDATE public.platform_financial_transactions SET status = \'pending\' WHERE reference_id = $1', [appGId]);
    await setAuthContext(client, adminId);
    const resG2 = await client.query('SELECT public.admin_review_restaurant_application($1, \'approve\') AS result', [appGId]);
    assert.strictEqual(resG2.rows[0].result.success, false, 'Pending status transaction must not permit approval');

    // Case G3: completed status, but refunded reversal transaction exists
    await resetAuth(client);
    await client.query('UPDATE public.platform_financial_transactions SET status = \'completed\' WHERE reference_id = $1', [appGId]);
    await client.query(`
      INSERT INTO public.platform_financial_transactions (
        transaction_type, reference_id, payment_id, entity_type, entity_id, amount, currency, status, idempotency_key
      ) VALUES (
        'refund', $1, 'ref_refund_001', 'restaurant', $2::UUID, 499.00, 'INR', 'completed', 'ref_refund_001'
      )
    `, [appGId, appGId]);
    await setAuthContext(client, adminId);
    const resG3 = await client.query('SELECT public.admin_review_restaurant_application($1, \'approve\') AS result', [appGId]);
    const rG3 = resG3.rows[0].result;
    assert.strictEqual(rG3.success, false, 'Refunded transaction must fail approval');
    assert.strictEqual(rG3.error, 'REGISTRATION_FEE_REFUNDED', 'Error must be REGISTRATION_FEE_REFUNDED');
    console.log('✓ Test G: Failed, pending, and refunded transactions rejected correctly');

    // --------------------------------------------------------------------------
    // Test H: Valid payment (Verified ₹499 INR ledger record + KYC) -> MUST SUCCEED
    // --------------------------------------------------------------------------
    await resetAuth(client);
    const appHId = '00000000-0000-0000-0000-000000000008';
    const payHId = 'pay_valid_h_499';
    await client.query('DELETE FROM public.restaurant_partner_documents WHERE application_id = $1', [appHId]);
    await client.query('DELETE FROM public.restaurant_partner_applications WHERE id = $1', [appHId]);
    await client.query('DELETE FROM public.partner_registration_payments WHERE payment_id = $1 OR application_id = $2', [payHId, appHId]);
    await client.query('DELETE FROM public.platform_financial_transactions WHERE reference_id = $1', [appHId]);
    await client.query(`
      INSERT INTO public.restaurant_partner_applications (
        id, user_id, application_ref, ownership_token_hash, restaurant_name, status, phone, email, address_line1, city, postal_code,
        registration_fee_paid, is_legacy_grandfathered, starter_kit_status
      ) VALUES (
        $1, $2, 'REF-TEST-H', 'hash_h', 'Test Valid Payment Restaurant', 'submitted', '+919999900008', 'h@example.com', 'MG Road', 'Bengaluru', '560001',
        FALSE, FALSE, 'not_allocated'
      )
    `, [appHId, applicant1Id]);
    await insertVerifiedKycDocs(client, appHId);

    // Record verified registration payment via service role
    const recH = await client.query(`
      SELECT public.record_verified_registration_payment('restaurant', $1::UUID, $2) AS result
    `, [appHId, payHId]);
    assert.strictEqual(recH.rows[0].result.status, 'success', 'Recording verified payment must succeed');

    // Admin approves
    await setAuthContext(client, adminId);
    const resH = await client.query('SELECT public.admin_review_restaurant_application($1, \'approve\') AS result', [appHId]);
    const rH = resH.rows[0].result;
    assert.strictEqual(rH.success, true, 'Valid payment approval must succeed');
    assert.strictEqual(rH.action, 'approved', 'Action must be approved');
    assert.ok(rH.restaurant_id, 'Restaurant ID must be returned');
    console.log('✓ Test H: Valid verified ₹499 INR payment successfully approved and provisioned');

    // --------------------------------------------------------------------------
    // Test I: Authorized legacy grandfathered application -> MUST SUCCEED
    // --------------------------------------------------------------------------
    await resetAuth(client);
    const appIId = '00000000-0000-0000-0000-000000000009';
    await client.query('DELETE FROM public.restaurant_partner_documents WHERE application_id = $1', [appIId]);
    await client.query('DELETE FROM public.restaurant_partner_applications WHERE id = $1', [appIId]);
    await client.query('DELETE FROM public.platform_financial_transactions WHERE reference_id = $1', [appIId]);
    await client.query(`
      INSERT INTO public.restaurant_partner_applications (
        id, user_id, application_ref, ownership_token_hash, restaurant_name, status, phone, email, address_line1, city, postal_code,
        registration_fee_paid, is_legacy_grandfathered, starter_kit_status
      ) VALUES (
        $1, $2, 'REF-TEST-I', 'hash_i', 'Test Grandfathered Restaurant', 'submitted', '+919999900009', 'i@example.com', 'MG Road', 'Bengaluru', '560001',
        FALSE, TRUE, 'not_allocated'
      )
    `, [appIId, applicant2Id]);
    await insertVerifiedKycDocs(client, appIId);

    await setAuthContext(client, adminId);
    const resI = await client.query('SELECT public.admin_review_restaurant_application($1, \'approve\') AS result', [appIId]);
    const rI = resI.rows[0].result;
    assert.strictEqual(rI.success, true, 'Grandfathered application must succeed without payment record');
    assert.strictEqual(rI.action, 'approved', 'Action must be approved');
    assert.ok(rI.restaurant_id, 'Restaurant ID must be returned');
    console.log('✓ Test I: Authorized legacy grandfathered application successfully approved');

    // --------------------------------------------------------------------------
    // Test J: Duplicate payment processing -> MUST BE IDEMPOTENT (already_paid)
    // --------------------------------------------------------------------------
    await resetAuth(client);
    const recJ = await client.query(`
      SELECT public.record_verified_registration_payment('restaurant', $1::UUID, $2) AS result
    `, [appHId, payHId]);
    assert.strictEqual(recJ.rows[0].result.status, 'already_paid', 'Duplicate payment attempt must return already_paid');
    console.log('✓ Test J: Duplicate payment attempt returns already_paid idempotently');

    // --------------------------------------------------------------------------
    // Test K: Unauthorized admin approval -> MUST FAIL WITH FORBIDDEN
    // --------------------------------------------------------------------------
    await setAuthContext(client, applicant1Id);
    const resK = await client.query('SELECT public.admin_review_restaurant_application($1, \'approve\') AS result', [appIId]);
    const rK = resK.rows[0].result;
    assert.strictEqual(rK.success, false, 'Non-admin approval must fail');
    assert.strictEqual(rK.error, 'FORBIDDEN', 'Must return FORBIDDEN');
    console.log('✓ Test K: Non-admin caller blocked with FORBIDDEN');

    // --------------------------------------------------------------------------
    // Test L: Concurrent approval attempts (Row Locking & Concurrency Protection)
    // --------------------------------------------------------------------------
    await resetAuth(client);
    const appLId = '00000000-0000-0000-0000-000000000010';
    await client.query('DELETE FROM public.restaurant_partner_documents WHERE application_id = $1', [appLId]);
    await client.query('DELETE FROM public.restaurant_partner_applications WHERE id = $1', [appLId]);
    await client.query('DELETE FROM public.platform_financial_transactions WHERE reference_id = $1', [appLId]);
    await client.query(`
      INSERT INTO public.restaurant_partner_applications (
        id, user_id, application_ref, ownership_token_hash, restaurant_name, status, phone, email, address_line1, city, postal_code,
        registration_fee_paid, is_legacy_grandfathered, starter_kit_status
      ) VALUES (
        $1, $2, 'REF-TEST-L', 'hash_l', 'Test Concurrent Restaurant', 'submitted', '+919999900010', 'l@example.com', 'MG Road', 'Bengaluru', '560001',
        FALSE, TRUE, 'not_allocated'
      )
    `, [appLId, applicant1Id]);
    await insertVerifiedKycDocs(client, appLId);

    const client2 = await pool.connect();
    try {
      await setAuthContext(client, adminId);
      await setAuthContext(client2, adminId);

      // Client 1 begins transaction and holds lock
      await client.query('BEGIN;');
      const p1 = client.query('SELECT public.admin_review_restaurant_application($1, \'approve\') AS result', [appLId]);

      // Delay slightly, then Client 2 attempts to approve the exact same row concurrently
      await new Promise(r => setTimeout(r, 60));
      const p2 = client2.query('SELECT public.admin_review_restaurant_application($1, \'approve\') AS result', [appLId]);

      // Await p1 (client 1 acquires lock and finishes RPC inside transaction)
      const rL1 = (await p1).rows[0].result;
      assert.strictEqual(rL1.success, true, 'First concurrent transaction must succeed');
      await client.query('COMMIT;');

      // Now p2 unblocks
      const rL2 = (await p2).rows[0].result;
      assert.strictEqual(rL2.success, false, 'Second concurrent transaction must fail');
      assert.strictEqual(rL2.error, 'INVALID_STATUS_TRANSITION', 'Second transaction must detect status already approved');
      console.log('✓ Test L: Concurrent approval row-locking tested: Client 1 approved, Client 2 rejected with INVALID_STATUS_TRANSITION');
    } finally {
      client2.release();
    }

    // --------------------------------------------------------------------------
    // Test M: Unauthenticated trigger rejection (auth.uid() IS NULL without service role)
    // --------------------------------------------------------------------------
    await resetAuth(client);
    await client.query('SET ROLE anon;');
    let unauthErrM = null;
    try {
      await client.query(`
        INSERT INTO public.restaurant_partner_applications (
          id, application_ref, ownership_token_hash, restaurant_name, status, phone, email, address_line1, city, postal_code,
          registration_fee_paid, is_legacy_grandfathered, starter_kit_status
        ) VALUES (
          gen_random_uuid(), 'REF-UNAUTH-01', 'hash_unauth', 'Unauth Rest', 'draft', '+919999900099', 'u@example.com', 'MG Road', 'Bengaluru', '560001',
          TRUE, TRUE, 'allocated'
        )
      `);
    } catch (err) {
      unauthErrM = err;
    }
    assert.ok(unauthErrM, 'Unauthenticated caller must be rejected by trigger');
    assert.strictEqual(unauthErrM.code, '42501', 'Must throw 42501');
    console.log('✓ Test M: Unauthenticated caller attempting application write blocked with 42501');

    // --------------------------------------------------------------------------
    // Test N: Global cross-table payment ownership (Restaurant vs Rider reuse)
    // --------------------------------------------------------------------------
    await resetAuth(client);
    const appN1Id = '11111111-2222-3333-4444-555555555555';
    const riderN2Id = '22222222-3333-4444-5555-666666666666';
    const sharedCrossPayId = 'pay_shared_cross_entity_888';

    await client.query('DELETE FROM public.partner_registration_payments WHERE payment_id = $1', [sharedCrossPayId]);
    await client.query('DELETE FROM public.restaurant_partner_applications WHERE id = $1', [appN1Id]);
    await client.query('DELETE FROM public.rider_applications WHERE id = $1', [riderN2Id]);

    await client.query(`
      INSERT INTO public.restaurant_partner_applications (
        id, user_id, application_ref, ownership_token_hash, restaurant_name, status, phone, email, address_line1, city, postal_code,
        registration_fee_paid, is_legacy_grandfathered, starter_kit_status
      ) VALUES (
        $1, $2, 'REF-TEST-N1', 'hash_n1', 'Test Global Owner Rest', 'submitted', '+919999900011', 'n1@example.com', 'MG Road', 'Bengaluru', '560001',
        FALSE, FALSE, 'not_allocated'
      )
    `, [appN1Id, applicant1Id]);

    await client.query(`
      INSERT INTO public.rider_applications (
        id, user_id, application_ref, full_name, phone, email, city, status,
        vehicle_type, vehicle_number, driving_license_number,
        registration_fee_paid, is_legacy_grandfathered, starter_kit_status
      ) VALUES (
        $1, $2, 'REF-RIDER-N2', 'Test Cross Rider', '+919999900012', 'n2@example.com', 'Bengaluru', 'submitted',
        'motorcycle', 'KA01AB1234', 'KA0120200001234',
        FALSE, FALSE, 'not_allocated'
      )
    `, [riderN2Id, applicant2Id]);

    // Restaurant claims sharedCrossPayId first via process_verified_registration_payment
    const claimRes1 = await client.query(`
      SELECT public.process_verified_registration_payment('restaurant', $1::UUID, $2) AS result
    `, [appN1Id, sharedCrossPayId]);
    assert.strictEqual(claimRes1.rows[0].result.status, 'success', 'First claim must succeed');

    // Rider attempts to claim the EXACT SAME payment ID
    let crossTheftErr = null;
    try {
      await client.query(`
        SELECT public.process_verified_registration_payment('rider', $1::UUID, $2) AS result
      `, [riderN2Id, sharedCrossPayId]);
    } catch (err) {
      crossTheftErr = err;
    }
    assert.ok(crossTheftErr, 'Rider must not be able to claim a payment already bound to a restaurant');
    assert.strictEqual(crossTheftErr.code, '23505', 'Must throw 23505 unique violation');
    console.log('✓ Test N: Cross-table payment reuse (Restaurant vs Rider) blocked with 23505 in global registry');

    // --------------------------------------------------------------------------
    // Test O: Safe Administrative Legacy Grandfathering Procedure & Audit Log
    // --------------------------------------------------------------------------
    await resetAuth(client);
    const appOId = '33333333-4444-5555-6666-777777777777';
    await client.query('DELETE FROM public.restaurant_partner_documents WHERE application_id = $1', [appOId]);
    await client.query('DELETE FROM public.restaurant_partner_applications WHERE id = $1', [appOId]);
    await client.query('DROP TRIGGER IF EXISTS trg_immutable_grandfathering_audit ON public.partner_grandfathering_audit_log');
    await client.query('DELETE FROM public.partner_grandfathering_audit_log WHERE application_id = $1', [appOId]);
    await client.query(`
      CREATE TRIGGER trg_immutable_grandfathering_audit
        BEFORE UPDATE OR DELETE ON public.partner_grandfathering_audit_log
        FOR EACH ROW
        EXECUTE FUNCTION public.prevent_grandfathering_audit_log_mutation();
    `);

    await client.query(`
      INSERT INTO public.restaurant_partner_applications (
        id, user_id, application_ref, ownership_token_hash, restaurant_name, status, phone, email, address_line1, city, postal_code,
        registration_fee_paid, is_legacy_grandfathered, starter_kit_status, created_at
      ) VALUES (
        $1, $2, 'REF-TEST-O', 'hash_o', 'Test Admin Grandfathered Rest', 'submitted', '+919999900013', 'o@example.com', 'MG Road', 'Bengaluru', '560001',
        FALSE, FALSE, 'not_allocated', '2026-10-01 10:00:00+00'
      )
    `, [appOId, applicant1Id]);
    await insertVerifiedKycDocs(client, appOId);

    // O1. Non-admin caller -> FORBIDDEN
    await setAuthContext(client, applicant1Id);
    const resO1 = await client.query(`
      SELECT public.admin_grant_legacy_grandfathering($1, 'restaurant', '2026-10-01'::timestamptz, 'CONTRACT-123', 'Historical contract onboarding') AS result
    `, [appOId]);
    assert.strictEqual(resO1.rows[0].result.success, false, 'Non-admin must not grant grandfathering');
    assert.strictEqual(resO1.rows[0].result.error, 'FORBIDDEN');

    // O2. Future date -> INVALID_HISTORICAL_DATE
    await setAuthContext(client, adminId);
    const resO2 = await client.query(`
      SELECT public.admin_grant_legacy_grandfathering($1, 'restaurant', '2026-12-01'::timestamptz, 'CONTRACT-123', 'Valid justification for test') AS result
    `, [appOId]);
    assert.strictEqual(resO2.rows[0].result.success, false);
    assert.strictEqual(resO2.rows[0].result.error, 'INVALID_HISTORICAL_DATE');

    // O3. Missing evidence -> MISSING_EVIDENCE
    const resO3 = await client.query(`
      SELECT public.admin_grant_legacy_grandfathering($1, 'restaurant', '2026-10-01'::timestamptz, '', 'Valid justification for test') AS result
    `, [appOId]);
    assert.strictEqual(resO3.rows[0].result.error, 'MISSING_EVIDENCE');

    // O4. Insufficient justification -> INSUFFICIENT_JUSTIFICATION
    const resO4 = await client.query(`
      SELECT public.admin_grant_legacy_grandfathering($1, 'restaurant', '2026-10-01'::timestamptz, 'CONTRACT-123', 'short') AS result
    `, [appOId]);
    assert.strictEqual(resO4.rows[0].result.error, 'INSUFFICIENT_JUSTIFICATION');

    // O5. Valid administrative call -> SUCCESS & AUDIT RECORDED
    const resO5 = await client.query(`
      SELECT public.admin_grant_legacy_grandfathering($1, 'restaurant', '2026-10-01'::timestamptz, 'CONTRACT-999', 'Verified legacy contract signed in October 2026') AS result
    `, [appOId]);
    assert.strictEqual(resO5.rows[0].result.success, true, 'Valid grandfathering must succeed');

    const auditRow = await client.query('SELECT * FROM public.partner_grandfathering_audit_log WHERE application_id = $1', [appOId]);
    assert.strictEqual(auditRow.rows.length, 1, 'Audit log row must be created');
    assert.strictEqual(auditRow.rows[0].evidence_reference, 'CONTRACT-999');

    // Verify approval now succeeds for this grandfathered application
    const resOApprove = await client.query('SELECT public.admin_review_restaurant_application($1, \'approve\') AS result', [appOId]);
    assert.strictEqual(resOApprove.rows[0].result.success, true, 'Grandfathered application must approve');
    console.log('✓ Test O: Administrative legacy grandfathering procedure & audit log fully verified');

    // --------------------------------------------------------------------------
    // Test P: Atomic registration payment processing RPC
    // --------------------------------------------------------------------------
    await resetAuth(client);
    const appPId = '44444444-5555-6666-7777-888888888888';
    const payPId = 'pay_atomic_p_499';
    await client.query('DELETE FROM public.restaurant_partner_documents WHERE application_id = $1', [appPId]);
    await client.query('DELETE FROM public.restaurant_partner_applications WHERE id = $1', [appPId]);
    await client.query('DELETE FROM public.partner_registration_payments WHERE payment_id = $1', [payPId]);
    await client.query('DELETE FROM public.platform_financial_transactions WHERE reference_id = $1', [appPId]);

    await client.query(`
      INSERT INTO public.restaurant_partner_applications (
        id, user_id, application_ref, ownership_token_hash, restaurant_name, status, phone, email, address_line1, city, postal_code,
        registration_fee_paid, is_legacy_grandfathered, starter_kit_status
      ) VALUES (
        $1, $2, 'REF-TEST-P', 'hash_p', 'Test Atomic RPC Rest', 'submitted', '+919999900014', 'p@example.com', 'MG Road', 'Bengaluru', '560001',
        FALSE, FALSE, 'not_allocated'
      )
    `, [appPId, applicant1Id]);
    await insertVerifiedKycDocs(client, appPId);

    // Call process_verified_registration_payment via service role
    const resP = await client.query(`
      SELECT public.process_verified_registration_payment('restaurant', $1::UUID, $2, 'order_p_123', 'XL', 'heavy_duty') AS result
    `, [appPId, payPId]);
    assert.strictEqual(resP.rows[0].result.status, 'success');

    // Verify application row updated
    const appPRow = await client.query('SELECT registration_fee_paid, registration_payment_id, starter_kit_tshirt_size FROM public.restaurant_partner_applications WHERE id = $1', [appPId]);
    assert.strictEqual(appPRow.rows[0].registration_fee_paid, true);
    assert.strictEqual(appPRow.rows[0].registration_payment_id, payPId);
    assert.strictEqual(appPRow.rows[0].starter_kit_tshirt_size, 'XL');

    // Verify global ownership row
    const ownPRow = await client.query('SELECT * FROM public.partner_registration_payments WHERE payment_id = $1', [payPId]);
    assert.strictEqual(ownPRow.rows.length, 1);
    assert.strictEqual(ownPRow.rows[0].application_id, appPId);

    // Verify financial ledger transaction
    const txPRow = await client.query('SELECT * FROM public.platform_financial_transactions WHERE reference_id = $1', [appPId]);
    assert.strictEqual(txPRow.rows.length, 1);
    assert.strictEqual(Number(txPRow.rows[0].amount), 499.00);
    assert.strictEqual(txPRow.rows[0].status, 'completed');

    // Verify admin approval succeeds
    await setAuthContext(client, adminId);
    const resPApprove = await client.query('SELECT public.admin_review_restaurant_application($1, \'approve\') AS result', [appPId]);
    assert.strictEqual(resPApprove.rows[0].result.success, true);
    console.log('✓ Test P: Atomic payment processing RPC verified across ownership, application, ledger & approval');

    // --------------------------------------------------------------------------
    // Test Q: Trusted service_role differentiation (Impersonation Resistance)
    // --------------------------------------------------------------------------
    await resetAuth(client);
    await setAuthContext(client, applicant1Id, 'authenticated');
    const isServiceApplicant = await client.query('SELECT public.is_service_role() AS is_serv;');
    assert.strictEqual(isServiceApplicant.rows[0].is_serv, false, 'Authenticated applicant must never evaluate to service_role = TRUE');

    // Attempting to call process_verified_registration_payment as authenticated applicant must be blocked
    let rpcAuthErr = null;
    try {
      await client.query(`
        SELECT public.process_verified_registration_payment('restaurant', $1::UUID, 'pay_forged_rpc') AS result
      `, [appPId]);
    } catch (err) {
      rpcAuthErr = err;
    }
    assert.ok(rpcAuthErr, 'Authenticated applicant must not be allowed to execute payment verification RPC');
    assert.strictEqual(rpcAuthErr.code, '42501', 'Must throw 42501 unauthorized');
    console.log('✓ Test Q: Service-role impersonation rejected; applicant blocked from executing verification RPC');

    // --------------------------------------------------------------------------
    // Test R: Historical payment ownership protection against cross-application reuse
    // --------------------------------------------------------------------------
    await resetAuth(client);
    const appRId = '55555555-6666-7777-8888-999999999999';
    const riderRId = '66666666-7777-8888-9999-000000000000';
    const payRHist = 'pay_hist_verified_499';

    await client.query('DELETE FROM public.restaurant_partner_documents WHERE application_id = $1', [appRId]);
    await client.query('DELETE FROM public.restaurant_partner_applications WHERE id = $1', [appRId]);
    await client.query('DELETE FROM public.rider_applications WHERE id = $1', [riderRId]);
    await client.query('DELETE FROM public.partner_registration_payments WHERE payment_id = $1', [payRHist]);
    await client.query('DELETE FROM public.platform_financial_transactions WHERE reference_id IN ($1, $2)', [appRId, riderRId]);

    // Insert historical restaurant application with verified payment ID in application & ledger
    await client.query(`
      INSERT INTO public.restaurant_partner_applications (
        id, user_id, application_ref, ownership_token_hash, restaurant_name, status, phone, email, address_line1, city, postal_code,
        registration_fee_paid, registration_payment_id, registration_paid_at, starter_kit_status, created_at
      ) VALUES (
        $1, $2, 'REF-HIST-R', 'hash_r', 'Historical Rest R', 'approved', '+919999900015', 'r@example.com', 'MG Road', 'Bengaluru', '560001',
        TRUE, $3, NOW() - INTERVAL '5 days', 'not_allocated', NOW() - INTERVAL '5 days'
      )
    `, [appRId, applicant1Id, payRHist]);

    await client.query(`
      INSERT INTO public.platform_financial_transactions (
        transaction_type, reference_id, payment_id, entity_type, entity_id, amount, currency, status, idempotency_key, created_at
      ) VALUES (
        'partner_registration', $1::TEXT, $2::TEXT, 'restaurant', $3::UUID, 499.00, 'INR', 'completed', 'reg_ptr_' || $2::TEXT, NOW() - INTERVAL '5 days'
      )
    `, [appRId, payRHist, appRId]);

    // Insert new rider application attempting to reuse the historical payment ID
    await client.query(`
      INSERT INTO public.rider_applications (
        id, user_id, application_ref, full_name, phone, email, city, status,
        vehicle_type, vehicle_number, driving_license_number,
        registration_fee_paid, is_legacy_grandfathered, starter_kit_status
      ) VALUES (
        $1, $2, 'REF-RIDER-R', 'Attacker Rider R', '+919999900016', 'riderr@example.com', 'Bengaluru', 'submitted',
        'motorcycle', 'KA01AB5555', 'DL5555555555',
        FALSE, FALSE, 'not_allocated'
      )
    `, [riderRId, applicant2Id]);

    // Attempting to claim historical restaurant payment for rider must fail
    let histTheftErr = null;
    try {
      await client.query(`
        SELECT public.process_verified_registration_payment('rider', $1::UUID, $2) AS result
      `, [riderRId, payRHist]);
    } catch (err) {
      histTheftErr = err;
    }
    assert.ok(histTheftErr, 'Historical payment ID must be protected against cross-application claim');
    assert.strictEqual(histTheftErr.code, '23505', 'Must throw 23505 duplicate/already bound');
    console.log('✓ Test R: Historical payment ownership protected; un-backfilled payment cannot be reused by another application');

    // --------------------------------------------------------------------------
    // Test S: Atomic RPC rollback after partial writes (Mid-Transaction Rollback Proof)
    // --------------------------------------------------------------------------
    await resetAuth(client);
    const appSId = '77777777-8888-9999-aaaa-bbbbbbbbbbbb';
    const payRollback = 'pay_rollback_partial_write_499';
    await client.query('DELETE FROM public.restaurant_partner_documents WHERE application_id = $1', [appSId]);
    await client.query('DELETE FROM public.restaurant_partner_applications WHERE id = $1', [appSId]);
    await client.query('DELETE FROM public.partner_registration_payments WHERE payment_id = $1', [payRollback]);
    await client.query('DELETE FROM public.platform_financial_transactions WHERE payment_id = $1 OR reference_id = $2', [payRollback, appSId]);

    // Create a valid submitted restaurant application
    await client.query(`
      INSERT INTO public.restaurant_partner_applications (
        id, user_id, application_ref, ownership_token_hash, restaurant_name, status, phone, email, address_line1, city, postal_code,
        registration_fee_paid, is_legacy_grandfathered, starter_kit_status
      ) VALUES (
        $1, $2, 'REF-TEST-S', 'hash_s', 'Test Rollback Mid-Tx Rest', 'submitted', '+919999900017', 's@example.com', 'MG Road', 'Bengaluru', '560001',
        FALSE, FALSE, 'not_allocated'
      )
    `, [appSId, applicant1Id]);
    await insertVerifiedKycDocs(client, appSId);

    // Create a temporary test trigger on platform_financial_transactions that fails BEFORE INSERT
    // This allows partner_registration_payments and restaurant_partner_applications writes to execute first,
    // then forces an unhandled exception on the final step, proving PL/pgSQL transaction atomicity.
    await client.query(`
      CREATE OR REPLACE FUNCTION public._test_fail_on_tx_insert()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      AS $$
      BEGIN
        IF NEW.payment_id = 'pay_rollback_partial_write_499' THEN
          RAISE EXCEPTION 'TEST_INJECTED_LEDGER_FAILURE: Simulating failure during ledger insertion'
            USING ERRCODE = 'P0001';
        END IF;
        RETURN NEW;
      END;
      $$;

      DROP TRIGGER IF EXISTS trg_test_fail_on_tx_insert ON public.platform_financial_transactions;
      CREATE TRIGGER trg_test_fail_on_tx_insert
        BEFORE INSERT ON public.platform_financial_transactions
        FOR EACH ROW
        EXECUTE FUNCTION public._test_fail_on_tx_insert();
    `);

    let rollbackErr = null;
    try {
      await client.query(`
        SELECT public.process_verified_registration_payment('restaurant', $1::UUID, $2) AS result
      `, [appSId, payRollback]);
    } catch (err) {
      rollbackErr = err;
    } finally {
      // Guaranteed cleanup of temporary test trigger in all scenarios
      await client.query(`
        DROP TRIGGER IF EXISTS trg_test_fail_on_tx_insert ON public.platform_financial_transactions;
        DROP FUNCTION IF EXISTS public._test_fail_on_tx_insert();
      `);
    }

    assert.ok(rollbackErr, 'Calling RPC with injected mid-transaction failure must throw');
    assert.strictEqual(rollbackErr.code, 'P0001', 'Must throw P0001 TEST_INJECTED_LEDGER_FAILURE');

    // Verify 1: partner_registration_payments row was ROLLED BACK
    const orphanCheckRegistry = await client.query('SELECT * FROM public.partner_registration_payments WHERE payment_id = $1', [payRollback]);
    assert.strictEqual(orphanCheckRegistry.rows.length, 0, 'partner_registration_payments write must be rolled back');

    // Verify 2: restaurant_partner_applications update was ROLLED BACK
    const appStateCheck = await client.query('SELECT registration_fee_paid, registration_payment_id FROM public.restaurant_partner_applications WHERE id = $1', [appSId]);
    assert.strictEqual(appStateCheck.rows[0].registration_fee_paid, false, 'Application registration_fee_paid must remain FALSE');
    assert.strictEqual(appStateCheck.rows[0].registration_payment_id, null, 'Application registration_payment_id must remain NULL');

    // Verify 3: platform_financial_transactions has ZERO rows
    const orphanCheckLedger = await client.query('SELECT * FROM public.platform_financial_transactions WHERE payment_id = $1', [payRollback]);
    assert.strictEqual(orphanCheckLedger.rows.length, 0, 'No row must be left in platform_financial_transactions');
    console.log('✓ Test S: Mid-transaction rollback verified; all partial writes across ownership, application, and ledger rolled back');

    // --------------------------------------------------------------------------
    // Test T: partner_grandfathering_audit_log immutability (Tamper-proof trigger)
    // --------------------------------------------------------------------------
    await resetAuth(client);
    let auditUpdateErr = null;
    try {
      await client.query(`
        UPDATE public.partner_grandfathering_audit_log
        SET justification = 'Tampered justification by unauthorized user'
        WHERE application_id = $1
      `, [appOId]);
    } catch (err) {
      auditUpdateErr = err;
    }
    assert.ok(auditUpdateErr, 'Updating grandfathering audit log must be rejected');
    assert.strictEqual(auditUpdateErr.code, '42501', 'Must throw 42501 on audit log update');

    let auditDeleteErr = null;
    try {
      await client.query(`
        DELETE FROM public.partner_grandfathering_audit_log
        WHERE application_id = $1
      `, [appOId]);
    } catch (err) {
      auditDeleteErr = err;
    }
    assert.ok(auditDeleteErr, 'Deleting grandfathering audit log must be rejected');
    assert.strictEqual(auditDeleteErr.code, '42501', 'Must throw 42501 on audit log delete');
    console.log('✓ Test T: partner_grandfathering_audit_log immutability verified; UPDATE and DELETE strictly blocked with 42501');

    // Cleanup all test records
    await resetAuth(client);
    await client.query("DELETE FROM public.restaurants WHERE name LIKE 'Test %'");
    await client.query('DELETE FROM public.restaurant_partner_documents WHERE application_id = ANY($1::UUID[])', [
      [appAId, appBId, appD1Id, appD2Id, appEId, appFId, appGId, appHId, appIId, appLId, appN1Id, appOId, appPId, appRId, appSId]
    ]);
    await client.query('DELETE FROM public.platform_financial_transactions WHERE reference_id = ANY($1::TEXT[])', [
      [appAId, appBId, appD1Id, appD2Id, appEId, appFId, appGId, appHId, appIId, appLId, appN1Id, riderN2Id, appOId, appPId, appRId, riderRId, appSId]
    ]);
    await client.query('DELETE FROM public.partner_registration_payments WHERE application_id = ANY($1::UUID[])', [
      [appAId, appBId, appD1Id, appD2Id, appEId, appFId, appGId, appHId, appIId, appLId, appN1Id, riderN2Id, appOId, appPId, appRId, riderRId, appSId]
    ]);
    // Allow audit log cleanup for test runner via dropping trigger temporarily or deleting test IDs
    await client.query('DROP TRIGGER IF EXISTS trg_immutable_grandfathering_audit ON public.partner_grandfathering_audit_log');
    await client.query('DELETE FROM public.partner_grandfathering_audit_log WHERE application_id = ANY($1::UUID[])', [
      [appAId, appBId, appD1Id, appD2Id, appEId, appFId, appGId, appHId, appIId, appLId, appN1Id, riderN2Id, appOId, appPId, appRId, appSId]
    ]);
    await client.query(`
      CREATE TRIGGER trg_immutable_grandfathering_audit
        BEFORE UPDATE OR DELETE ON public.partner_grandfathering_audit_log
        FOR EACH ROW
        EXECUTE FUNCTION public.prevent_grandfathering_audit_log_mutation();
    `);
    await client.query('DELETE FROM public.restaurant_partner_applications WHERE id = ANY($1::UUID[])', [
      [appAId, appBId, appD1Id, appD2Id, appEId, appFId, appGId, appHId, appIId, appLId, appN1Id, appOId, appPId, appRId, appSId]
    ]);
    await client.query('DELETE FROM public.rider_applications WHERE id = ANY($1::UUID[])', [
      [riderN2Id, riderRId]
    ]);
    await client.query('DELETE FROM public.profiles WHERE id = ANY($1::UUID[])', [[adminId, applicant1Id, applicant2Id]]);
    await client.query('DELETE FROM auth.users WHERE id = ANY($1::UUID[])', [[adminId, applicant1Id, applicant2Id]]);

  } finally {
    client.release();
    await pool.end();
  }
});
