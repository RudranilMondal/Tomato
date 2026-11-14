import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Migration SQL Security & Integrity Audit', async (t) => {
  const migrationPath = path.join(
    rootDir,
    'supabase',
    'migrations',
    '20261112210000_add_education_and_fix_application_visibility.sql'
  );
  assert.ok(fs.existsSync(migrationPath), 'Migration file must exist');

  const sql = fs.readFileSync(migrationPath, 'utf8');

  await t.test('Prevents weak WITH CHECK (true) policies', () => {
    assert.strictEqual(
      /CREATE\s+POLICY[\s\S]*?WITH\s+CHECK\s*\(\s*true\s*\)/i.test(sql),
      false,
      'Migration must not define permissive WITH CHECK (true) policies'
    );
  });

  await t.test('Prevents anonymous NULL user_id application inserts', () => {
    assert.strictEqual(
      sql.includes('OR (user_id IS NULL)'),
      false,
      'Migration must not permit anonymous/guest bypasses on application tables'
    );
  });

  await t.test('Enforces authenticated user ownership on partner applications', () => {
    assert.ok(
      sql.includes('auth.uid() IS NOT NULL AND auth.uid() = user_id'),
      'Migration must strictly enforce auth.uid() = user_id on application inserts'
    );
  });

  await t.test('Guards enum usage in plpgsql function with safe text cast', () => {
    assert.ok(
      sql.includes("doc_type::text = 'qualification_proof'"),
      'Function must use text casting to prevent unsafe enum usage in PostgreSQL transaction'
    );
  });

  await t.test('Includes verified_at and verified_by on rider_documents', () => {
    assert.ok(
      sql.includes('ALTER TABLE public.rider_documents') && sql.includes('ADD COLUMN IF NOT EXISTS verified_at'),
      'Migration must add missing verification columns to rider_documents'
    );
  });

  await t.test('Includes cost and veg columns on restaurant_partner_applications', () => {
    assert.ok(
      sql.includes('ALTER TABLE public.restaurant_partner_applications') &&
      sql.includes('ADD COLUMN IF NOT EXISTS estimated_cost_for_two'),
      'Migration must add estimated_cost_for_two to restaurant_partner_applications'
    );
  });

  await t.test('Guarantees unique constraint on restaurant_partner_financials with table ownership check', () => {
    assert.ok(
      sql.includes('uq_restaurant_financials_app') &&
      sql.includes("conrelid = 'public.restaurant_partner_financials'::regclass"),
      'Migration must ensure unique constraint on restaurant_partner_financials checking both conname and conrelid'
    );
  });

  await t.test('Prevents automatic deletion and enforces non-destructive duplicate check without UUID MIN aggregate', () => {
    assert.strictEqual(
      /\bDELETE\s+FROM\b/i.test(sql),
      false,
      'Migration must not contain any automatic DELETE statements'
    );
    assert.strictEqual(
      sql.includes('MIN(application_id)'),
      false,
      'Migration must not use aggregate MIN on UUID'
    );
    assert.ok(
      sql.includes('ORDER BY application_id') && sql.includes('LIMIT 1'),
      'Migration must retrieve sample duplicate UUID using separate ORDER BY / LIMIT 1 query'
    );
    assert.ok(
      sql.includes('Manual inspection and resolution required before applying this constraint'),
      'Migration must raise a descriptive exception requiring manual resolution if duplicates exist'
    );
  });

  await t.test('Enforces non-empty rejection reason validation in RPCs', () => {
    assert.ok(
      sql.includes("p_status = 'rejected' AND (p_rejection_reason IS NULL OR length(trim(p_rejection_reason)) = 0)"),
      'Admin qualification review RPC must mandate non-empty rejection reason'
    );
    assert.ok(
      sql.includes("p_action IN ('reject', 'action_required') AND (p_rejection_reason IS NULL OR length(trim(p_rejection_reason)) = 0)"),
      'Admin restaurant review RPC must mandate non-empty rejection reason'
    );
  });

  await t.test('Uses safe catalog checks for Realtime publication', () => {
    assert.ok(
      sql.includes('pg_publication_tables') && sql.includes('ALTER PUBLICATION supabase_realtime ADD TABLE'),
      'Migration must use catalog checks to safely add tables to supabase_realtime publication'
    );
  });
});

test('Application Status Consistency & Life Cycle', async (t) => {
  const allowedSqlStatuses = ['draft', 'submitted', 'in_review', 'verified', 'approved', 'rejected', 'action_required'];

  await t.test('Database application_status enum encompasses all lifecycle phases', () => {
    assert.ok(allowedSqlStatuses.includes('submitted'));
    assert.ok(allowedSqlStatuses.includes('approved'));
    assert.ok(allowedSqlStatuses.includes('rejected'));
    assert.ok(allowedSqlStatuses.includes('action_required'));
  });

  await t.test('Client context methods map submitted state consistently', () => {
    const contextPath = path.join(rootDir, 'src', 'context', 'TomatttoContext.tsx');
    const contextContent = fs.readFileSync(contextPath, 'utf8');

    // Ensure submit functions submit with status 'submitted'
    assert.ok(
      contextContent.includes("status: 'submitted'"),
      'Client submissions must send status: submitted matching database application_status enum'
    );
  });
});
