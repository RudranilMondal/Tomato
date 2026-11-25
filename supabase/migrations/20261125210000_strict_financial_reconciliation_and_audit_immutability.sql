-- ==============================================================================
-- Migration: 20261125210000_strict_financial_reconciliation_and_audit_immutability.sql
-- Description:
--   1. Strict Historical Reconciliation & Backfill:
--      - Enforces exact status validation: Only ('completed', 'refunded', 'reversed')
--        are reconciled. Pending, failed, or unknown statuses are strictly excluded.
--      - Enforces exact payment ID matching between application and ledger records:
--        app.registration_payment_id = tx.payment_id.
--      - Enforces strict cross-table payment collision detection: Any record in the
--        opposing application table with the same payment ID blocks automatic reconciliation.
--   2. Audit Log Immutability:
--      - Secures public.partner_grandfathering_audit_log against UPDATE or DELETE by
--        attaching a strict tamper-proof trigger.
--   3. Idempotent & Re-runnable:
--      - Uses ON CONFLICT (payment_id) DO NOTHING.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. IMMUTABLE AUDIT LOG PROTECTION
-- ------------------------------------------------------------------------------
-- Ensure no user, including platform admins, can mutate or delete compliance audit logs
CREATE OR REPLACE FUNCTION public.prevent_grandfathering_audit_log_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  RAISE EXCEPTION 'SECURITY VIOLATION: partner_grandfathering_audit_log entries are append-only and cannot be updated or deleted.'
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS trg_immutable_grandfathering_audit ON public.partner_grandfathering_audit_log;
CREATE TRIGGER trg_immutable_grandfathering_audit
  BEFORE UPDATE OR DELETE ON public.partner_grandfathering_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_grandfathering_audit_log_mutation();

-- ------------------------------------------------------------------------------
-- 2. STRICT HISTORICAL REGISTRATION PAYMENT RECONCILIATION & BACKFILL
-- ------------------------------------------------------------------------------

-- A. Reconcile Restaurant Applications
INSERT INTO public.partner_registration_payments (
  payment_id,
  application_type,
  application_id,
  user_id,
  amount,
  currency,
  status,
  claimed_at
)
SELECT
  app.registration_payment_id AS payment_id,
  'restaurant' AS application_type,
  app.id AS application_id,
  app.user_id,
  499.00 AS amount,
  'INR' AS currency,
  CASE
    WHEN tx.status IN ('refunded', 'reversed') THEN 'refunded'
    ELSE 'completed'
  END AS status,
  COALESCE(app.registration_paid_at, tx.created_at, app.created_at, NOW()) AS claimed_at
FROM public.restaurant_partner_applications app
JOIN public.platform_financial_transactions tx
  ON tx.reference_id = app.id::TEXT
  AND tx.transaction_type = 'partner_registration'
  AND tx.payment_id = app.registration_payment_id -- Issue 2: Exact payment ID matching
WHERE app.registration_payment_id IS NOT NULL
  AND length(trim(app.registration_payment_id)) > 0
  AND tx.payment_id IS NOT NULL
  AND length(trim(tx.payment_id)) > 0
  AND tx.amount = 499.00
  AND tx.currency = 'INR'
  AND tx.status IN ('completed', 'refunded', 'reversed') -- Issue 1: Explicit valid status only
  -- Issue 3: Cross-table collision detection (ANY record with same payment ID in opposing table)
  AND NOT EXISTS (
    SELECT 1 FROM public.rider_applications rider
    WHERE rider.registration_payment_id = app.registration_payment_id
  )
  -- Phase 1 Item 2: Exclude if multiple transactions exist for this payment_id (require manual reconciliation)
  AND (
    SELECT COUNT(*) FROM public.platform_financial_transactions dup_tx
    WHERE dup_tx.payment_id = app.registration_payment_id
  ) = 1
  -- Phase 1 Item 2: Exclude if multiple registration transactions exist for this application
  AND (
    SELECT COUNT(*) FROM public.platform_financial_transactions dup_app
    WHERE dup_app.reference_id = app.id::TEXT
      AND dup_app.transaction_type = 'partner_registration'
  ) = 1
ON CONFLICT (payment_id) DO NOTHING;

-- B. Reconcile Rider Applications
INSERT INTO public.partner_registration_payments (
  payment_id,
  application_type,
  application_id,
  user_id,
  amount,
  currency,
  status,
  claimed_at
)
SELECT
  app.registration_payment_id AS payment_id,
  'rider' AS application_type,
  app.id AS application_id,
  app.user_id,
  499.00 AS amount,
  'INR' AS currency,
  CASE
    WHEN tx.status IN ('refunded', 'reversed') THEN 'refunded'
    ELSE 'completed'
  END AS status,
  COALESCE(app.registration_paid_at, tx.created_at, app.created_at, NOW()) AS claimed_at
FROM public.rider_applications app
JOIN public.platform_financial_transactions tx
  ON tx.reference_id = app.id::TEXT
  AND tx.transaction_type = 'rider_registration'
  AND tx.payment_id = app.registration_payment_id -- Issue 2: Exact payment ID matching
WHERE app.registration_payment_id IS NOT NULL
  AND length(trim(app.registration_payment_id)) > 0
  AND tx.payment_id IS NOT NULL
  AND length(trim(tx.payment_id)) > 0
  AND tx.amount = 499.00
  AND tx.currency = 'INR'
  AND tx.status IN ('completed', 'refunded', 'reversed') -- Issue 1: Explicit valid status only
  -- Issue 3: Cross-table collision detection (ANY record with same payment ID in opposing table)
  AND NOT EXISTS (
    SELECT 1 FROM public.restaurant_partner_applications rest
    WHERE rest.registration_payment_id = app.registration_payment_id
  )
  -- Phase 1 Item 2: Exclude if multiple transactions exist for this payment_id (require manual reconciliation)
  AND (
    SELECT COUNT(*) FROM public.platform_financial_transactions dup_tx
    WHERE dup_tx.payment_id = app.registration_payment_id
  ) = 1
  -- Phase 1 Item 2: Exclude if multiple registration transactions exist for this application
  AND (
    SELECT COUNT(*) FROM public.platform_financial_transactions dup_app
    WHERE dup_app.reference_id = app.id::TEXT
      AND dup_app.transaction_type = 'rider_registration'
  ) = 1
ON CONFLICT (payment_id) DO NOTHING;

COMMIT;
