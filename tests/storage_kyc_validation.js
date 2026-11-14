/**
 * TOMATTTO FOOD DELIVERY PLATFORM: STORAGE API & KYC POLICY VALIDATION
 * File: tests/storage_kyc_validation.js
 *
 * Scenarios Tested:
 * 1. Applicant uploads synthetic qualification proof to own folder.
 * 2. Applicant uploads allowed rider KYC document to own folder.
 * 3. Cross-applicant upload rejected (cannot upload to another applicant's directory).
 * 4. Cross-applicant direct download blocked (unauthorized access rejected).
 * 5. Unauthorized public request blocked from private KYC buckets.
 * 6. Authenticated application admin (profile role = admin) access verified under RLS.
 * 7. Signed URL generation for authorized applicant document.
 * 8. Signed URL download streams exact expected file content before expiration.
 * 9. Expired signed URLs verification (works before expiry, rejected after expiry).
 * 10. Invalid bucket or malformed path upload rejected.
 */

import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

// Configuration: Strictly read from environment variables; zero hardcoded secret strings
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function runStorageValidationTest() {
  // Validate required configuration
  if (!SUPABASE_ANON_KEY) {
    throw new Error('CONFIG_ERROR: VITE_SUPABASE_ANON_KEY environment variable is required.');
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('CONFIG_ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required.');
  }

  // Safety constraint: Restrict testing strictly to local Supabase stack
  if (!SUPABASE_URL.startsWith('http://127.0.0.1') && !SUPABASE_URL.startsWith('http://localhost')) {
    throw new Error(`SECURITY_BLOCK: Storage API test must be restricted to local Supabase (127.0.0.1). Configured URL: ${SUPABASE_URL}`);
  }

  // Service client: used ONLY for controlled fixture setup and teardown
  const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Track created fixtures for isolated, non-destructive teardown
  const app1Id = randomUUID();
  const app2Id = randomUUID();
  const nonce = randomUUID().replace(/-/g, '').slice(0, 8);
  const email1 = `storage_rider1_${nonce}@staging.local`;
  const email2 = `storage_rider2_${nonce}@staging.local`;
  const emailAdmin = `storage_admin_${nonce}@staging.local`;
  const password = `TestPass!_${nonce}_Aa1`;

  let user1Auth = null;
  let user2Auth = null;
  let adminAuth = null;
  const uploadedFiles = [];

  try {
    // 1. Setup two synthetic authenticated applicants and one synthetic admin via GoTrue
    const user1Res = await serviceClient.auth.admin.createUser({
      email: email1,
      password,
      email_confirm: true,
      user_metadata: { role: 'rider' },
    });
    if (user1Res.error) throw new Error(`Failed to create test user 1: ${user1Res.error.message}`);
    user1Auth = user1Res.data;

    const user2Res = await serviceClient.auth.admin.createUser({
      email: email2,
      password,
      email_confirm: true,
      user_metadata: { role: 'rider' },
    });
    if (user2Res.error) throw new Error(`Failed to create test user 2: ${user2Res.error.message}`);
    user2Auth = user2Res.data;

    const adminRes = await serviceClient.auth.admin.createUser({
      email: emailAdmin,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });
    if (adminRes.error) throw new Error(`Failed to create test admin: ${adminRes.error.message}`);
    adminAuth = adminRes.data;

    const actualUser1Id = user1Auth.user.id;
    const actualUser2Id = user2Auth.user.id;
    const actualAdminId = adminAuth.user.id;

    // Ensure profiles exist with designated roles
    await serviceClient.from('profiles').upsert([
      { id: actualUser1Id, full_name: 'Storage Applicant 1', phone: `+9191${nonce}`, role: 'rider' },
      { id: actualUser2Id, full_name: 'Storage Applicant 2', phone: `+9192${nonce}`, role: 'rider' },
      { id: actualAdminId, full_name: 'Storage Admin Auditor', phone: `+9190${nonce}`, role: 'admin' },
    ]);

    // Insert corresponding rider application records linking applicants to their folders
    await serviceClient.from('rider_applications').insert([
      {
        id: app1Id,
        user_id: actualUser1Id,
        application_ref: `RIDER-ST1-${nonce}`,
        full_name: 'Storage Applicant 1',
        phone: `+9191${nonce}`,
        city: 'Bengaluru',
        vehicle_type: 'Bike',
        vehicle_number: 'KA-01-ST-1111',
        status: 'draft',
      },
      {
        id: app2Id,
        user_id: actualUser2Id,
        application_ref: `RIDER-ST2-${nonce}`,
        full_name: 'Storage Applicant 2',
        phone: `+9192${nonce}`,
        city: 'Bengaluru',
        vehicle_type: 'Bike',
        vehicle_number: 'KA-02-ST-2222',
        status: 'draft',
      },
    ]);

    // Sign in as Applicant 1 to obtain a genuine authenticated client with scoped JWT
    const clientUser1 = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: login1Err } = await clientUser1.auth.signInWithPassword({
      email: email1,
      password,
    });
    if (login1Err) throw new Error(`Applicant 1 sign in failed: ${login1Err.message}`);

    // Sign in as Applicant 2 to obtain second authenticated client
    const clientUser2 = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: login2Err } = await clientUser2.auth.signInWithPassword({
      email: email2,
      password,
    });
    if (login2Err) throw new Error(`Applicant 2 sign in failed: ${login2Err.message}`);

    // Sign in as Application Admin to obtain genuine application-admin authenticated client
    const clientAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: loginAdminErr } = await clientAdmin.auth.signInWithPassword({
      email: emailAdmin,
      password,
    });
    if (loginAdminErr) throw new Error(`Admin sign in failed: ${loginAdminErr.message}`);

    // Synthetic file contents
    const sampleProofContent = Buffer.from('%PDF-1.4 Synthetic Bachelor Degree Proof Content');
    const sampleLicenseContent = Buffer.from('%PDF-1.4 Synthetic Driving License Proof Content');

    // Scenario 1: Applicant 1 uploads qualification proof to own folder -> Success
    const qualPath = `${app1Id}/qualification_proof.pdf`;
    const { error: upload1Err } = await clientUser1.storage
      .from('rider-kyc-documents')
      .upload(qualPath, sampleProofContent, { contentType: 'application/pdf', upsert: true });

    assert.strictEqual(upload1Err, null, `Applicant 1 qualification proof upload failed: ${upload1Err?.message}`);
    uploadedFiles.push({ bucket: 'rider-kyc-documents', path: qualPath });

    // Scenario 2: Applicant 1 uploads KYC document to own folder -> Success
    const licensePath = `${app1Id}/driving_license.pdf`;
    const { error: upload2Err } = await clientUser1.storage
      .from('rider-kyc-documents')
      .upload(licensePath, sampleLicenseContent, { contentType: 'application/pdf', upsert: true });

    assert.strictEqual(upload2Err, null, `Applicant 1 license upload failed: ${upload2Err?.message}`);
    uploadedFiles.push({ bucket: 'rider-kyc-documents', path: licensePath });

    // Scenario 3: Applicant 2 attempts to upload into Applicant 1 folder -> Blocked (403 / RLS error)
    const spoofPath = `${app1Id}/malicious_file.pdf`;
    const { error: spoofUploadErr } = await clientUser2.storage
      .from('rider-kyc-documents')
      .upload(spoofPath, Buffer.from('unauthorized'), { contentType: 'application/pdf' });

    assert.ok(spoofUploadErr !== null, 'Cross-applicant storage upload must be blocked by RLS');

    // Scenario 4: Applicant 2 attempts to download Applicant 1 private document -> Blocked
    const { data: crossDownloadData, error: crossDownloadErr } = await clientUser2.storage
      .from('rider-kyc-documents')
      .download(qualPath);

    assert.ok(
      crossDownloadErr !== null || !crossDownloadData,
      'Cross-applicant download must be denied by private bucket storage policies'
    );

    // Scenario 5: Unauthorized public (anon client) attempts to download document -> Blocked
    const { data: anonData, error: anonErr } = await anonClient.storage
      .from('rider-kyc-documents')
      .download(qualPath);

    assert.ok(anonErr !== null || !anonData, 'Anonymous download from private KYC bucket must be blocked');

    // Scenario 6: Authenticated Application Admin access verified under application admin RLS policy
    const { data: adminDownload, error: adminErr } = await clientAdmin.storage
      .from('rider-kyc-documents')
      .download(qualPath);

    assert.strictEqual(adminErr, null, `Authenticated admin download failed: ${adminErr?.message}`);
    assert.ok(adminDownload !== null, 'Authenticated admin must be able to retrieve KYC documents via RLS');

    // Scenario 7 & 8: Signed URL generation and stream verification before expiry
    const { data: signedUrlData, error: signErr } = await clientUser1.storage
      .from('rider-kyc-documents')
      .createSignedUrl(qualPath, 60);

    assert.strictEqual(signErr, null, `Signed URL creation failed: ${signErr?.message}`);
    assert.ok(signedUrlData?.signedUrl, 'Signed URL must be returned');

    const validResponse = await fetch(signedUrlData.signedUrl);
    assert.strictEqual(validResponse.status, 200, 'Signed URL HTTP GET must return 200 OK before expiration');
    const downloadedBuf = Buffer.from(await validResponse.arrayBuffer());
    assert.strictEqual(
      downloadedBuf.toString('utf8'),
      sampleProofContent.toString('utf8'),
      'Downloaded signed URL content must match original upload'
    );

    // Scenario 9: Signed URL expiration verification
    // Generate a short-lived URL with 2 seconds validity
    const { data: shortSignedUrl, error: shortSignErr } = await clientUser1.storage
      .from('rider-kyc-documents')
      .createSignedUrl(qualPath, 2);

    assert.strictEqual(shortSignErr, null, `Short signed URL creation failed: ${shortSignErr?.message}`);
    assert.ok(shortSignedUrl?.signedUrl, 'Short signed URL must be returned');

    // Confirm it works immediately (pre-expiry)
    const immediateRes = await fetch(shortSignedUrl.signedUrl);
    assert.strictEqual(immediateRes.status, 200, 'Signed URL must be valid immediately upon creation');

    // Wait bounded margin (3.5 seconds) ensuring token has expired past its 2-second lifetime
    await new Promise((resolve) => setTimeout(resolve, 3500));

    // Confirm it is rejected after expiration (HTTP 400, 401, or 403)
    const postExpiryRes = await fetch(shortSignedUrl.signedUrl);
    assert.ok(
      postExpiryRes.status === 400 || postExpiryRes.status === 401 || postExpiryRes.status === 403,
      `Expired signed URL must return error status. Expected 400/401/403, received HTTP ${postExpiryRes.status}`
    );

    // Scenario 10: Invalid bucket or malformed path upload rejected
    const { error: invalidBucketErr } = await clientUser1.storage
      .from('non-existent-bucket')
      .upload('test.pdf', Buffer.from('data'));

    assert.ok(invalidBucketErr !== null, 'Upload to invalid bucket must return error');

    console.log('[PASS] Storage KYC API validation passed: 10/10 scenarios validated.');
  } finally {
    // Teardown uploaded storage objects
    for (const f of uploadedFiles) {
      try {
        await serviceClient.storage.from(f.bucket).remove([f.path]);
      } catch {}
    }

    // Teardown database records
    try {
      await serviceClient.from('rider_applications').delete().in('id', [app1Id, app2Id]);
      await serviceClient.from('profiles').delete().in('id', [
        user1Auth?.user?.id,
        user2Auth?.user?.id,
        adminAuth?.user?.id,
      ]);
      if (user1Auth?.user?.id) await serviceClient.auth.admin.deleteUser(user1Auth.user.id).catch(() => {});
      if (user2Auth?.user?.id) await serviceClient.auth.admin.deleteUser(user2Auth.user.id).catch(() => {});
      if (adminAuth?.user?.id) await serviceClient.auth.admin.deleteUser(adminAuth.user.id).catch(() => {});
    } catch {}
  }
}

// Standalone execution wrapper
if (process.argv[1] && process.argv[1].endsWith('storage_kyc_validation.js')) {
  runStorageValidationTest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
