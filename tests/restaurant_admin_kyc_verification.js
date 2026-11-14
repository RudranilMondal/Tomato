/**
 * TOMATTTO FOOD DELIVERY PLATFORM:
 * RESTAURANT APPLICATION & DOCUMENT VERIFICATION INTEGRATION TEST
 * File: tests/restaurant_admin_kyc_verification.js
 *
 * Scenarios Tested:
 * 1. Admin reads restaurant partner applications list via PostgreSQL.
 * 2. Upload/Insert regulatory documents (PAN, FSSAI, GST, Bank Proof).
 * 3. Individual document verification (status update to verified/rejected in restaurant_partner_documents).
 * 4. Request Resubmission flow (admin_review_restaurant_application with 'action_required').
 * 5. Rejection flow (admin_review_restaurant_application with 'reject').
 * 6. Non-admin authorization guard: unauthorized caller is blocked with FORBIDDEN.
 * 7. Approval flow (admin_review_restaurant_application with 'approve') creating restaurant record.
 * 8. Targeted fixture cleanup.
 */

import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import pg from 'pg';

const { Client } = pg.default || pg;

const DB_CONFIG = {
  host: process.env.PGHOST || '127.0.0.1',
  port: parseInt(process.env.PGPORT || '54322', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'postgres',
};

async function runRestaurantAdminKycTest() {
  console.log('🚀 Starting Restaurant Application & Document KYC Integration Test...');

  const client = new Client(DB_CONFIG);
  await client.connect();

  const nonce = randomUUID().replace(/-/g, '').slice(0, 8);
  const adminId = randomUUID();
  const applicantId = randomUUID();
  const nonAdminId = randomUUID();
  const appId = randomUUID();
  const appRef = `TOM-TEST-REST-${nonce.toUpperCase()}`;
  const restName = `Spice Symphony Test ${nonce}`;

  const fixtures = {
    users: [adminId, applicantId, nonAdminId],
    apps: [appId],
    restaurantNames: [restName]
  };

  try {
    // 1. Create auth users and profiles
    await client.query(`
      INSERT INTO auth.users (id, email) VALUES
        ($1, $2), ($3, $4), ($5, $6)
    `, [
      adminId, `admin_${nonce}@tomattto.local`,
      applicantId, `applicant_${nonce}@tomattto.local`,
      nonAdminId, `user_${nonce}@tomattto.local`
    ]);

    await client.query(`
      INSERT INTO public.profiles (id, full_name, phone, role) VALUES
        ($1, 'Platform Admin', '+919900000001', 'admin'),
        ($2, 'Restaurant Owner', '+919900000002', 'restaurant_owner'),
        ($3, 'Regular Customer', '+919900000003', 'customer')
      ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
    `, [adminId, applicantId, nonAdminId]);
    console.log('  ✓ Admin, applicant and non-admin profiles created');

    // 2. Insert restaurant partner application
    await client.query(`
      INSERT INTO public.restaurant_partner_applications (
        id, application_ref, user_id, restaurant_name, restaurant_type,
        cuisines, description, phone, email, manager_name, manager_phone,
        address_line1, city, postal_code, ownership_token_hash, status, submitted_at
      ) VALUES (
        $1, $2, $3, $4, 'Dine-In & Delivery',
        ARRAY['North Indian', 'Mughlai'], 'Fine dining tandoor specialty',
        '+919876543210', 'owner@spice.local', 'Chef Vikram', '+919876543210',
        '80 Feet Road, Indiranagar', 'Bengaluru', '560038',
        'hash_${nonce}', 'submitted', NOW()
      );
    `, [appId, appRef, applicantId, restName]);
    console.log('  ✓ Restaurant application created:', appRef);

    // 3. Insert financial record
    await client.query(`
      INSERT INTO public.restaurant_partner_financials (
        application_id, legal_entity_name, business_type,
        pan_number_masked, has_gst, gstin,
        fssai_license_number, fssai_expiry_date,
        bank_name, bank_account_holder, bank_account_number_masked,
        bank_ifsc, bank_account_type, payout_schedule
      ) VALUES (
        $1, 'Spice Symphony Hospitality LLP', 'LLP',
        'AA••••••5F', true, '29AAAAA0000A1Z5',
        '11223344556677', (CURRENT_DATE + INTERVAL '1 year')::date,
        'HDFC Bank', 'Spice Symphony Hospitality LLP', '••••4821',
        'HDFC0000140', 'current', 'weekly'
      );
    `, [appId]);
    console.log('  ✓ Restaurant financial record created');

    // 4. Insert 4 regulatory documents with pending status
    const docTypes = ['pan_card', 'fssai_cert', 'gst_cert', 'bank_proof'];
    for (const dt of docTypes) {
      await client.query(`
        INSERT INTO public.restaurant_partner_documents (
          application_id, doc_type, storage_bucket, storage_path, file_name, status
        ) VALUES (
          $1, $2::kyc_doc_type, 'partner-kyc-documents', $3, $4, 'pending'
        );
      `, [appId, dt, `${appId}/${dt}.pdf`, `${dt}.pdf`]);
    }
    console.log('  ✓ 4 regulatory documents inserted with pending status');

    // 5. Test individual document verification (mark PAN card verified)
    const verifyDocRes = await client.query(`
      UPDATE public.restaurant_partner_documents
      SET status = 'verified', verified_at = NOW(), verified_by = $1
      WHERE application_id = $2 AND doc_type = 'pan_card'
      RETURNING status, verified_by;
    `, [adminId, appId]);
    assert.equal(verifyDocRes.rows[0].status, 'verified');
    assert.equal(verifyDocRes.rows[0].verified_by, adminId);
    console.log('  ✓ Individual document verification update (PAN card verified) passed');

    // 6. Test Non-Admin Authorization Guard on RPC
    // Set PostgREST authenticated context to non-admin user
    await client.query('SET ROLE authenticated;');
    await client.query(`
      SELECT
        set_config('request.jwt.claim.sub', $1, false),
        set_config('request.jwt.claim.role', 'authenticated', false),
        set_config('request.jwt.claims', json_build_object('sub', $1::uuid, 'role', 'authenticated')::text, false);
    `, [nonAdminId]);

    const unauthorizedRes = await client.query(`
      SELECT public.admin_review_restaurant_application($1, 'approve', NULL, 'Unauthorized attempt') AS result;
    `, [appId]);
    assert.equal(unauthorizedRes.rows[0].result.success, false);
    assert.equal(unauthorizedRes.rows[0].result.error, 'FORBIDDEN');
    console.log('  ✓ Unauthorized non-admin caller successfully blocked with FORBIDDEN');

    // 7. Test Admin Caller: Request Resubmission flow (action_required)
    await client.query(`
      SELECT
        set_config('request.jwt.claim.sub', $1, false),
        set_config('request.jwt.claim.role', 'authenticated', false),
        set_config('request.jwt.claims', json_build_object('sub', $1::uuid, 'role', 'authenticated')::text, false);
    `, [adminId]);

    const resubmitRes = await client.query(`
      SELECT public.admin_review_restaurant_application(
        $1, 'action_required', 'FSSAI License certificate scan is blurry. Please re-upload.', 'Automated test notes'
      ) AS result;
    `, [appId]);
    assert.equal(resubmitRes.rows[0].result.success, true);

    const resubmittedRow = await client.query(`
      SELECT status, rejection_reason FROM public.restaurant_partner_applications WHERE id = $1;
    `, [appId]);
    assert.equal(resubmittedRow.rows[0].status, 'action_required');
    assert.equal(resubmittedRow.rows[0].rejection_reason, 'FSSAI License certificate scan is blurry. Please re-upload.');
    console.log('  ✓ Resubmission flow (action_required) verified');

    // 8. Test Admin Caller: Rejection flow
    const rejectRes = await client.query(`
      SELECT public.admin_review_restaurant_application(
        $1, 'reject', 'Invalid statutory license registration details.', 'Automated rejection note'
      ) AS result;
    `, [appId]);
    assert.equal(rejectRes.rows[0].result.success, true);

    const rejectedRow = await client.query(`
      SELECT status, rejection_reason FROM public.restaurant_partner_applications WHERE id = $1;
    `, [appId]);
    assert.equal(rejectedRow.rows[0].status, 'rejected');
    assert.equal(rejectedRow.rows[0].rejection_reason, 'Invalid statutory license registration details.');
    console.log('  ✓ Rejection flow verified');

    // 9. Test Server-Side KYC Approval Blocker (Missing, Pending, Rejected Personal/Business Documents)
    console.log('  Testing server-side KYC blockers on restaurant approval...');

    // 9A. Personal documents (Aadhaar front/back, Personal PAN front/back) are completely missing
    const missingDocsApproval = await client.query(`
      SELECT public.admin_review_restaurant_application($1, 'approve', NULL, 'Attempt with missing docs') AS result;
    `, [appId]);
    assert.equal(missingDocsApproval.rows[0].result.success, false);
    assert.equal(missingDocsApproval.rows[0].result.error, 'DOCUMENTS_NOT_VERIFIED');
    assert.ok(missingDocsApproval.rows[0].result.missing_documents.includes('aadhaar_front'));
    assert.ok(missingDocsApproval.rows[0].result.missing_documents.includes('aadhaar_back'));
    assert.ok(missingDocsApproval.rows[0].result.missing_documents.includes('pan_front'));
    assert.ok(missingDocsApproval.rows[0].result.missing_documents.includes('pan_back'));
    console.log('  ✓ Server-side blocker: Approval rejected when mandatory personal KYC is missing');

    // 9B. Insert personal KYC documents with status 'pending'
    const personalDocTypes = ['aadhaar_front', 'aadhaar_back', 'pan_front', 'pan_back'];
    for (const dt of personalDocTypes) {
      await client.query(`
        INSERT INTO public.restaurant_partner_documents (
          application_id, doc_type, storage_bucket, storage_path, file_name, status
        ) VALUES (
          $1, $2::kyc_doc_type, 'partner-kyc-documents', $3, $4, 'pending'
        );
      `, [appId, dt, `${appId}/${dt}.jpg`, `${dt}.jpg`]);
    }

    const pendingDocsApproval = await client.query(`
      SELECT public.admin_review_restaurant_application($1, 'approve', NULL, 'Attempt with pending personal docs') AS result;
    `, [appId]);
    assert.equal(pendingDocsApproval.rows[0].result.success, false);
    assert.equal(pendingDocsApproval.rows[0].result.error, 'DOCUMENTS_NOT_VERIFIED');
    assert.ok(pendingDocsApproval.rows[0].result.unverified_documents.some((d) => d.includes('aadhaar_front')));
    console.log('  ✓ Server-side blocker: Approval rejected when mandatory personal KYC is pending');

    // 9C. Set aadhaar_front to 'rejected'
    await client.query(`
      UPDATE public.restaurant_partner_documents
      SET status = 'rejected'
      WHERE application_id = $1 AND doc_type = 'aadhaar_front';
    `, [appId]);

    const rejectedDocApproval = await client.query(`
      SELECT public.admin_review_restaurant_application($1, 'approve', NULL, 'Attempt with rejected aadhaar') AS result;
    `, [appId]);
    assert.equal(rejectedDocApproval.rows[0].result.success, false);
    assert.equal(rejectedDocApproval.rows[0].result.error, 'DOCUMENTS_NOT_VERIFIED');
    assert.ok(rejectedDocApproval.rows[0].result.unverified_documents.some((d) => d.includes('aadhaar_front (rejected)')));
    console.log('  ✓ Server-side blocker: Approval rejected when personal KYC document is rejected');

    // 9D. Mark all documents verified (both personal KYC and business KYC)
    await client.query(`
      UPDATE public.restaurant_partner_documents
      SET status = 'verified', verified_at = NOW(), verified_by = $1
      WHERE application_id = $2;
    `, [adminId, appId]);
    console.log('  ✓ All 6 mandatory personal & business documents marked as verified');

    // 10. Test Admin Caller: Final Approval Flow (approve)
    const approveRes = await client.query(`
      SELECT public.admin_review_restaurant_application(
        $1, 'approve', NULL, 'All documents verified successfully'
      ) AS result;
    `, [appId]);
    assert.equal(approveRes.rows[0].result.success, true);

    const approvedRow = await client.query(`
      SELECT status, rejection_reason FROM public.restaurant_partner_applications WHERE id = $1;
    `, [appId]);
    assert.equal(approvedRow.rows[0].status, 'approved');
    assert.equal(approvedRow.rows[0].rejection_reason, null);

    // Verify that active restaurant record was provisioned automatically in public.restaurants
    const restRow = await client.query(`
      SELECT id, name, is_open FROM public.restaurants WHERE name = $1;
    `, [restName]);
    assert.equal(restRow.rowCount, 1);
    assert.equal(restRow.rows[0].is_open, true);
    console.log('  ✓ Final Approval flow verified: Restaurant row automatically created in public.restaurants (is_open = true):', restRow.rows[0].id);

    console.log('🎉 ALL RESTAURANT KYC & APPLICATION WORKFLOW VERIFICATIONS PASSED SUCCESSFULLY!');
  } finally {
    console.log('🧹 Cleaning up test fixtures...');
    try {
      await client.query('RESET ROLE;');
      await client.query(`DELETE FROM public.restaurants WHERE name = ANY($1)`, [fixtures.restaurantNames]);
      await client.query(`DELETE FROM public.restaurant_partner_documents WHERE application_id = ANY($1)`, [fixtures.apps]);
      await client.query(`DELETE FROM public.restaurant_partner_financials WHERE application_id = ANY($1)`, [fixtures.apps]);
      await client.query(`DELETE FROM public.restaurant_partner_applications WHERE id = ANY($1)`, [fixtures.apps]);
      await client.query(`DELETE FROM public.profiles WHERE id = ANY($1)`, [fixtures.users]);
      await client.query(`DELETE FROM auth.users WHERE id = ANY($1)`, [fixtures.users]);
      console.log('  ✓ Test fixtures cleaned up cleanly.');
    } catch (cleanupErr) {
      console.warn('Cleanup warning:', cleanupErr);
    } finally {
      await client.end();
    }
  }
}

runRestaurantAdminKycTest().catch((err) => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
