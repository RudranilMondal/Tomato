-- ==============================================================================
-- TOMATTTO: PRODUCTION FINANCIAL PREFLIGHT VALIDATION (STRICT READ-ONLY)
-- File: supabase/tests/production_financial_preflight.sql
-- Description:
--   Comprehensive read-only diagnostic preflight script to run before deploying
--   financial migrations to staging or production.
--
-- CLASSIFICATION:
--   [ZERO-TOLERANCE]: Hard data integrity, security, or financial invariant
--                     violations. MUST return 0 rows before any migration.
--   [MANUAL-REVIEW]:  Flags historical records requiring administrative attention
--                     or manual ledger reconciliation. Does NOT treat normal
--                     unpaid/unverified applications as errors.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. IDENTIFIER & NULL VALUE INTEGRITY [ZERO-TOLERANCE]
-- ------------------------------------------------------------------------------

-- CHECK 1A: Completed registration transactions with NULL or empty payment_id
SELECT 'CHECK 1A: Completed Ledger Transactions Missing Payment ID' AS check_name,
       id AS transaction_id, reference_id, transaction_type, amount, currency, status
FROM public.platform_financial_transactions
WHERE transaction_type IN ('partner_registration', 'rider_registration')
  AND status = 'completed'
  AND (payment_id IS NULL OR length(trim(payment_id)) = 0);

-- CHECK 1B: Completed registration transactions with NULL, 0, or invalid amounts / currencies
SELECT 'CHECK 1B: Completed Ledger Transactions with Invalid Amount or Currency' AS check_name,
       id AS transaction_id, reference_id, transaction_type, amount, currency, status
FROM public.platform_financial_transactions
WHERE transaction_type IN ('partner_registration', 'rider_registration')
  AND status = 'completed'
  AND (amount IS NULL OR amount <> 499.00 OR currency IS NULL OR currency <> 'INR');

-- CHECK 1C: Applications marked as paid but missing registration_payment_id
SELECT 'CHECK 1C: Paid Applications Missing Payment ID' AS check_name,
       'restaurant' AS application_type, id AS application_id, restaurant_name AS name, registration_fee_paid, registration_paid_at
FROM public.restaurant_partner_applications
WHERE registration_fee_paid IS TRUE
  AND (registration_payment_id IS NULL OR length(trim(registration_payment_id)) = 0)
UNION ALL
SELECT 'CHECK 1C: Paid Applications Missing Payment ID' AS check_name,
       'rider' AS application_type, id AS application_id, full_name AS name, registration_fee_paid, registration_paid_at
FROM public.rider_applications
WHERE registration_fee_paid IS TRUE
  AND (registration_payment_id IS NULL OR length(trim(registration_payment_id)) = 0);

-- ------------------------------------------------------------------------------
-- 2. GLOBAL PAYMENT ID UNIQUENESS & CROSS-TABLE COLLISIONS [ZERO-TOLERANCE]
-- ------------------------------------------------------------------------------

-- CHECK 2A: Duplicate payment IDs on restaurant applications
SELECT 'CHECK 2A: Duplicate Restaurant Payment IDs' AS check_name,
       registration_payment_id, COUNT(*) AS occurrences, array_agg(id) AS application_ids
FROM public.restaurant_partner_applications
WHERE registration_payment_id IS NOT NULL AND length(trim(registration_payment_id)) > 0
GROUP BY registration_payment_id
HAVING COUNT(*) > 1;

-- CHECK 2B: Duplicate payment IDs on rider applications
SELECT 'CHECK 2B: Duplicate Rider Payment IDs' AS check_name,
       registration_payment_id, COUNT(*) AS occurrences, array_agg(id) AS application_ids
FROM public.rider_applications
WHERE registration_payment_id IS NOT NULL AND length(trim(registration_payment_id)) > 0
GROUP BY registration_payment_id
HAVING COUNT(*) > 1;

-- CHECK 2C: Cross-table payment ID collisions between restaurants and riders
SELECT 'CHECK 2C: Cross-Table Payment Collisions' AS check_name,
       rest.id AS restaurant_app_id,
       rider.id AS rider_app_id,
       rest.registration_payment_id
FROM public.restaurant_partner_applications rest
JOIN public.rider_applications rider
  ON rest.registration_payment_id = rider.registration_payment_id
WHERE rest.registration_payment_id IS NOT NULL
  AND length(trim(rest.registration_payment_id)) > 0;

-- ------------------------------------------------------------------------------
-- 3. APPLICATION VS FINANCIAL LEDGER CONSISTENCY [ZERO-TOLERANCE]
-- ------------------------------------------------------------------------------

-- CHECK 3A: Restaurant application with fee_paid=TRUE missing exact matching typed ledger transaction
-- Detects missing, NULL, mismatched payment IDs, wrong types, or wrong amounts
SELECT 'CHECK 3A: Paid Restaurant Applications Missing Matching Ledger Record' AS check_name,
       app.id AS application_id,
       app.restaurant_name,
       app.registration_payment_id
FROM public.restaurant_partner_applications app
LEFT JOIN public.platform_financial_transactions tx
  ON tx.reference_id = app.id::TEXT
  AND tx.transaction_type = 'partner_registration'
  AND tx.payment_id = app.registration_payment_id
  AND tx.amount = 499.00
  AND tx.currency = 'INR'
  AND tx.status = 'completed'
WHERE app.registration_fee_paid IS TRUE
  AND (
    app.registration_payment_id IS NULL
    OR length(trim(app.registration_payment_id)) = 0
    OR tx.id IS NULL
  );

-- CHECK 3B: Rider application with fee_paid=TRUE missing exact matching typed ledger transaction
-- Detects missing, NULL, mismatched payment IDs, wrong types, or wrong amounts
SELECT 'CHECK 3B: Paid Rider Applications Missing Matching Ledger Record' AS check_name,
       app.id AS application_id,
       app.full_name,
       app.registration_payment_id
FROM public.rider_applications app
LEFT JOIN public.platform_financial_transactions tx
  ON tx.reference_id = app.id::TEXT
  AND tx.transaction_type = 'rider_registration'
  AND tx.payment_id = app.registration_payment_id
  AND tx.amount = 499.00
  AND tx.currency = 'INR'
  AND tx.status = 'completed'
WHERE app.registration_fee_paid IS TRUE
  AND (
    app.registration_payment_id IS NULL
    OR length(trim(app.registration_payment_id)) = 0
    OR tx.id IS NULL
  );

-- CHECK 3C: Duplicate registration ledger records for the same application reference
SELECT 'CHECK 3C: Duplicate Registration Ledger Entries per Application' AS check_name,
       reference_id, transaction_type, COUNT(*) AS occurrences, array_agg(id) AS transaction_ids
FROM public.platform_financial_transactions
WHERE transaction_type IN ('partner_registration', 'rider_registration')
GROUP BY reference_id, transaction_type
HAVING COUNT(*) > 1;

-- CHECK 3D: Duplicate completed ledger transactions sharing the same payment_id
SELECT 'CHECK 3D: Duplicate Completed Ledger Entries per Payment ID' AS check_name,
       payment_id, COUNT(*) AS occurrences, array_agg(id) AS transaction_ids, array_agg(reference_id) AS references
FROM public.platform_financial_transactions
WHERE transaction_type IN ('partner_registration', 'rider_registration')
  AND status = 'completed'
  AND payment_id IS NOT NULL
GROUP BY payment_id
HAVING COUNT(*) > 1;

-- ------------------------------------------------------------------------------
-- 4. REFUND & REVERSAL INVARIANTS ACROSS LEDGER, REFUND TABLE & REGISTRY [ZERO-TOLERANCE]
-- ------------------------------------------------------------------------------

-- CHECK 4A: Approved restaurant applications with refunded or reversed registration payments
-- Evaluates platform_financial_transactions (status, refund type) AND public.payment_refunds
-- Matches refunds strictly via authoritative payment_id relationship (never unrelated reference_id) and enforces processed status
SELECT 'CHECK 4A: Approved Restaurants with Refunded/Reversed Fee' AS check_name,
       app.id AS application_id, app.restaurant_name, app.registration_payment_id
FROM public.restaurant_partner_applications app
WHERE app.status = 'approved'
  AND app.registration_payment_id IS NOT NULL
  AND length(trim(app.registration_payment_id)) > 0
  AND (
    EXISTS (
      SELECT 1 FROM public.platform_financial_transactions tx
      WHERE tx.reference_id = app.id::TEXT
        AND tx.payment_id = app.registration_payment_id
        AND tx.transaction_type = 'partner_registration'
        AND tx.status IN ('refunded', 'reversed')
    )
    OR EXISTS (
      SELECT 1 FROM public.platform_financial_transactions ref_tx
      WHERE ref_tx.payment_id = app.registration_payment_id
        AND ref_tx.transaction_type = 'refund'
        AND ref_tx.status = 'completed'
    )
    OR EXISTS (
      SELECT 1 FROM public.payment_refunds pr
      WHERE pr.payment_id = app.registration_payment_id
        AND pr.status = 'processed'
    )
  );

-- CHECK 4B: Approved rider applications with refunded or reversed registration payments
-- Evaluates platform_financial_transactions (status, refund type) AND public.payment_refunds
-- Matches refunds strictly via authoritative payment_id relationship (never unrelated reference_id) and enforces processed status
SELECT 'CHECK 4B: Approved Riders with Refunded/Reversed Fee' AS check_name,
       app.id AS application_id, app.full_name, app.registration_payment_id
FROM public.rider_applications app
WHERE app.status = 'approved'
  AND app.registration_payment_id IS NOT NULL
  AND length(trim(app.registration_payment_id)) > 0
  AND (
    EXISTS (
      SELECT 1 FROM public.platform_financial_transactions tx
      WHERE tx.reference_id = app.id::TEXT
        AND tx.payment_id = app.registration_payment_id
        AND tx.transaction_type = 'rider_registration'
        AND tx.status IN ('refunded', 'reversed')
    )
    OR EXISTS (
      SELECT 1 FROM public.platform_financial_transactions ref_tx
      WHERE ref_tx.payment_id = app.registration_payment_id
        AND ref_tx.transaction_type = 'refund'
        AND ref_tx.status = 'completed'
    )
    OR EXISTS (
      SELECT 1 FROM public.payment_refunds pr
      WHERE pr.payment_id = app.registration_payment_id
        AND pr.status = 'processed'
    )
  );

-- CHECK 4C: Refunded or reversed ledger/refund records marked 'completed' in registry
-- Strictly enforces registry status consistency against typed transactions and payment_refunds.
-- Matches refunds strictly via authoritative payment_id relationship.
SELECT 'CHECK 4C: Registry Completed Status Inconsistent with Refunded Ledger' AS check_name,
       reg.payment_id, reg.application_type, reg.application_id, reg.status AS reg_status
FROM public.partner_registration_payments reg
WHERE reg.status = 'completed'
  AND reg.application_type IN ('restaurant', 'rider')
  AND (
    EXISTS (
      SELECT 1 FROM public.platform_financial_transactions tx
      WHERE tx.reference_id = reg.application_id::TEXT
        AND tx.payment_id = reg.payment_id
        AND tx.transaction_type = (
          CASE 
            WHEN reg.application_type = 'restaurant' THEN 'partner_registration'
            WHEN reg.application_type = 'rider' THEN 'rider_registration'
            ELSE NULL
          END
        )
        AND tx.status IN ('refunded', 'reversed')
    )
    OR EXISTS (
      SELECT 1 FROM public.platform_financial_transactions ref_tx
      WHERE ref_tx.payment_id = reg.payment_id
        AND ref_tx.transaction_type = 'refund'
        AND ref_tx.status = 'completed'
    )
    OR EXISTS (
      SELECT 1 FROM public.payment_refunds pr
      WHERE pr.payment_id = reg.payment_id
        AND pr.status = 'processed'
    )
  );

-- CHECK 4D: Completed ledger transactions marked 'refunded' or 'reversed' in registry without any refund record
SELECT 'CHECK 4D: Registry Refunded Status Inconsistent with Completed Ledger' AS check_name,
       reg.payment_id, reg.application_type, reg.application_id, reg.status AS reg_status
FROM public.partner_registration_payments reg
JOIN public.platform_financial_transactions tx
  ON tx.reference_id = reg.application_id::TEXT
  AND tx.payment_id = reg.payment_id
  AND tx.transaction_type = (
    CASE 
      WHEN reg.application_type = 'restaurant' THEN 'partner_registration'
      WHEN reg.application_type = 'rider' THEN 'rider_registration'
      ELSE NULL
    END
  )
WHERE reg.status IN ('refunded', 'reversed')
  AND reg.application_type IN ('restaurant', 'rider')
  AND tx.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM public.platform_financial_transactions ref_tx
    WHERE ref_tx.payment_id = reg.payment_id
      AND ref_tx.transaction_type = 'refund'
      AND ref_tx.status = 'completed'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.payment_refunds pr
    WHERE pr.payment_id = reg.payment_id
      AND pr.status = 'processed'
  );

-- ------------------------------------------------------------------------------
-- 5. GRANDFATHERING COMPLIANCE & ADMIN AUTHORIZATION [ZERO-TOLERANCE]
-- ------------------------------------------------------------------------------

-- CHECK 5A: Restaurant grandfathering created after Nov 24, 2026 cutoff
SELECT 'CHECK 5A: Illegitimate Restaurant Legacy Grandfathering (Post-Cutoff)' AS check_name,
       id AS application_id, restaurant_name, created_at, is_legacy_grandfathered
FROM public.restaurant_partner_applications
WHERE is_legacy_grandfathered IS TRUE
  AND created_at > '2026-11-24 00:00:00+00';

-- CHECK 5B: Rider grandfathering created after Nov 24, 2026 cutoff
SELECT 'CHECK 5B: Illegitimate Rider Legacy Grandfathering (Post-Cutoff)' AS check_name,
       id AS application_id, full_name, created_at, is_legacy_grandfathered
FROM public.rider_applications
WHERE is_legacy_grandfathered IS TRUE
  AND created_at > '2026-11-24 00:00:00+00';

-- CHECK 5C: Grandfathered applications missing valid, complete audit log entry
-- Validates evidence, justification (>= 10 chars), cutoff date, and grant timestamp
SELECT 'CHECK 5C: Grandfathered Applications Missing Complete Audit Log Entry' AS check_name,
       'restaurant' AS application_type, app.id AS application_id
FROM public.restaurant_partner_applications app
LEFT JOIN public.partner_grandfathering_audit_log log
  ON log.application_id = app.id
  AND log.application_type = 'restaurant'
  AND log.granted_at IS NOT NULL
  AND log.historical_registration_date <= '2026-11-24 00:00:00+00'::TIMESTAMPTZ
  AND length(trim(log.evidence_reference)) > 0
  AND length(trim(log.justification)) >= 10
WHERE app.is_legacy_grandfathered IS TRUE AND log.id IS NULL
UNION ALL
SELECT 'CHECK 5C: Grandfathered Applications Missing Complete Audit Log Entry' AS check_name,
       'rider' AS application_type, app.id AS application_id
FROM public.rider_applications app
LEFT JOIN public.partner_grandfathering_audit_log log
  ON log.application_id = app.id
  AND log.application_type = 'rider'
  AND log.granted_at IS NOT NULL
  AND log.historical_registration_date <= '2026-11-24 00:00:00+00'::TIMESTAMPTZ
  AND length(trim(log.evidence_reference)) > 0
  AND length(trim(log.justification)) >= 10
WHERE app.is_legacy_grandfathered IS TRUE AND log.id IS NULL;

-- CHECK 5D: Audit log entries where grantor is not a verified platform administrator
-- Inspects actual admin authorization semantics matching admin_grant_legacy_grandfathering & public.is_admin():
-- Verified independently of caller session via existence in auth.users and public.profiles with role = 'admin'
SELECT 'CHECK 5D: Grandfathering Audit Log Entry with Unauthorized Grantor' AS check_name,
       log.id AS audit_id, log.application_type, log.application_id, log.granted_by, p.role AS grantor_role
FROM public.partner_grandfathering_audit_log log
LEFT JOIN public.profiles p ON p.id = log.granted_by
LEFT JOIN auth.users u ON u.id = log.granted_by
WHERE log.granted_by IS NULL
   OR u.id IS NULL
   OR p.id IS NULL
   OR p.role IS NULL
   OR p.role <> 'admin';

-- ------------------------------------------------------------------------------
-- 6. REGISTRY INTEGRITY & CORRESPONDENCE [MANUAL-REVIEW]
-- ------------------------------------------------------------------------------

-- CHECK 6A: Orphaned registry entries without matching typed application
SELECT 'CHECK 6A: Orphaned Registry Entries (No Typed Application)' AS check_name,
       reg.payment_id, reg.application_type, reg.application_id
FROM public.partner_registration_payments reg
LEFT JOIN public.restaurant_partner_applications rest
  ON reg.application_id = rest.id AND reg.application_type = 'restaurant'
LEFT JOIN public.rider_applications rider
  ON reg.application_id = rider.id AND reg.application_type = 'rider'
WHERE (reg.application_type = 'restaurant' AND rest.id IS NULL)
   OR (reg.application_type = 'rider' AND rider.id IS NULL);

-- CHECK 6B: Registry entries with invalid application_type or missing matching typed ledger record
-- Explicitly checks that application_type IN ('restaurant', 'rider') and maps strictly
SELECT 'CHECK 6B: Registry Entries Missing Valid Typed Ledger Record' AS check_name,
       reg.payment_id, reg.application_type, reg.application_id, reg.amount, reg.currency, reg.status
FROM public.partner_registration_payments reg
LEFT JOIN public.platform_financial_transactions tx
  ON tx.reference_id = reg.application_id::TEXT
  AND tx.payment_id = reg.payment_id
  AND tx.amount = reg.amount
  AND tx.currency = reg.currency
  AND tx.transaction_type = (
    CASE
      WHEN reg.application_type = 'restaurant' THEN 'partner_registration'
      WHEN reg.application_type = 'rider' THEN 'rider_registration'
      ELSE NULL
    END
  )
WHERE reg.application_type IS NULL
   OR reg.application_type NOT IN ('restaurant', 'rider')
   OR tx.id IS NULL;

-- CHECK 6C: Historical verified payments not yet reconciled in ownership registry
-- NOTE: Unpaid / unverified applications are strictly excluded and NOT treated as errors.
SELECT 'CHECK 6C: Historical Verified Payments Unreconciled in Registry' AS check_name,
       'restaurant' AS application_type, app.id AS application_id, app.registration_payment_id
FROM public.restaurant_partner_applications app
JOIN public.platform_financial_transactions tx
  ON tx.reference_id = app.id::TEXT
  AND tx.transaction_type = 'partner_registration'
  AND tx.payment_id = app.registration_payment_id
LEFT JOIN public.partner_registration_payments reg
  ON reg.payment_id = app.registration_payment_id
  AND reg.application_id = app.id
  AND reg.application_type = 'restaurant'
WHERE app.registration_payment_id IS NOT NULL
  AND length(trim(app.registration_payment_id)) > 0
  AND tx.amount = 499.00 AND tx.currency = 'INR'
  AND tx.status IN ('completed', 'refunded', 'reversed')
  AND reg.payment_id IS NULL
UNION ALL
SELECT 'CHECK 6C: Historical Verified Payments Unreconciled in Registry' AS check_name,
       'rider' AS application_type, app.id AS application_id, app.registration_payment_id
FROM public.rider_applications app
JOIN public.platform_financial_transactions tx
  ON tx.reference_id = app.id::TEXT
  AND tx.transaction_type = 'rider_registration'
  AND tx.payment_id = app.registration_payment_id
LEFT JOIN public.partner_registration_payments reg
  ON reg.payment_id = app.registration_payment_id
  AND reg.application_id = app.id
  AND reg.application_type = 'rider'
WHERE app.registration_payment_id IS NOT NULL
  AND length(trim(app.registration_payment_id)) > 0
  AND tx.amount = 499.00 AND tx.currency = 'INR'
  AND tx.status IN ('completed', 'refunded', 'reversed')
  AND reg.payment_id IS NULL;

-- CHECK 6D: Orphaned registration ledger transactions with no application
SELECT 'CHECK 6D: Orphaned Registration Ledger Transactions' AS check_name,
       tx.id AS transaction_id, tx.transaction_type, tx.reference_id, tx.payment_id, tx.amount, tx.currency, tx.status
FROM public.platform_financial_transactions tx
LEFT JOIN public.restaurant_partner_applications rest
  ON tx.reference_id = rest.id::TEXT AND tx.transaction_type = 'partner_registration'
LEFT JOIN public.rider_applications rider
  ON tx.reference_id = rider.id::TEXT AND tx.transaction_type = 'rider_registration'
WHERE tx.transaction_type IN ('partner_registration', 'rider_registration')
  AND rest.id IS NULL
  AND rider.id IS NULL;
