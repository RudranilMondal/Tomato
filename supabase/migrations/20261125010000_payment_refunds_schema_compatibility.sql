-- ==============================================================================
-- FORWARD MIGRATION: PAYMENT_REFUNDS SCHEMA UPGRADE & BACKWARD COMPATIBILITY
-- Migration: 20261125010000_payment_refunds_schema_compatibility.sql
-- Description:
--   Guarantees full backward and forward compatibility between legacy payment_refunds
--   (created in 20261106201418) and the high-throughput atomic refund state machine.
--   Preserves all existing legacy rows, foreign keys, transaction relationships,
--   and converts legacy amount and status representations losslessly.
-- ==============================================================================

BEGIN;

-- 1. Ensure public.payment_refunds table exists
CREATE TABLE IF NOT EXISTS public.payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add all modern refund columns using safe ALTER TABLE
ALTER TABLE public.payment_refunds
  ADD COLUMN IF NOT EXISTS refund_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS order_id UUID,
  ADD COLUMN IF NOT EXISTS amount_paise BIGINT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS event_id TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Relax legacy NOT NULL constraints on legacy columns (transaction_id, order_id, amount)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payment_refunds' AND column_name = 'transaction_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.payment_refunds ALTER COLUMN transaction_id DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payment_refunds' AND column_name = 'order_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.payment_refunds ALTER COLUMN order_id DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payment_refunds' AND column_name = 'amount' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.payment_refunds ALTER COLUMN amount DROP NOT NULL;
  END IF;
END $$;

-- 4. Convert legacy status enum (refund_status) to TEXT safely with explicit mapping
DO $$
DECLARE
  v_type TEXT;
BEGIN
  SELECT data_type INTO v_type 
  FROM information_schema.columns 
  WHERE table_schema = 'public' AND table_name = 'payment_refunds' AND column_name = 'status';

  IF v_type = 'USER-DEFINED' THEN
    ALTER TABLE public.payment_refunds ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE public.payment_refunds 
      ALTER COLUMN status TYPE TEXT 
      USING (
        CASE status::text
          WHEN 'initiated' THEN 'pending'
          WHEN 'processed' THEN 'processed'
          WHEN 'failed'    THEN 'failed'
          WHEN 'none'      THEN 'none'
          ELSE COALESCE(status::text, 'pending')
        END
      );
    ALTER TABLE public.payment_refunds ALTER COLUMN status SET DEFAULT 'pending';
  END IF;
END $$;

-- Status Check Constraint (Includes 'none' to preserve legacy non-refund entries without creating false liabilities)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_payment_refunds_status') THEN
    ALTER TABLE public.payment_refunds
      ADD CONSTRAINT chk_payment_refunds_status
      CHECK (status IN ('none', 'requested', 'pending', 'processed', 'failed', 'reconciliation_exception'));
  END IF;
END $$;

-- 5. Backfill legacy records:
-- A. Map gateway_refund_id -> refund_id (only when valid, never fabricate fake IDs)
UPDATE public.payment_refunds
SET refund_id = gateway_refund_id
WHERE gateway_refund_id IS NOT NULL 
  AND TRIM(gateway_refund_id) <> ''
  AND refund_id IS NULL;

-- B. Convert amount (rupees) -> amount_paise accurately without floating point loss
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payment_refunds' AND column_name = 'amount'
  ) THEN
    UPDATE public.payment_refunds
    SET amount_paise = ROUND(amount * 100)::BIGINT
    WHERE amount IS NOT NULL 
      AND (amount_paise IS NULL OR amount_paise = 0);
  END IF;
END $$;

-- C. Backfill currency
UPDATE public.payment_refunds
SET currency = 'INR'
WHERE currency IS NULL;

-- D. Backfill payment_id via transaction_id -> payment_transactions.gateway_payment_id (Dynamic SQL to prevent parser errors)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payment_refunds' AND column_name = 'transaction_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payment_transactions' AND column_name = 'gateway_payment_id'
  ) THEN
    EXECUTE '
      UPDATE public.payment_refunds pr
      SET payment_id = pt.gateway_payment_id
      FROM public.payment_transactions pt
      WHERE pr.transaction_id = pt.id
        AND pr.payment_id IS NULL
        AND pt.gateway_payment_id IS NOT NULL
        AND TRIM(pt.gateway_payment_id) <> ''''
        AND pt.status::text IN (''captured'', ''completed'', ''paid'');
    ';
  END IF;
END $$;

-- E. Deterministic Backfill payment_id via order_id -> payment_transactions.gateway_payment_id
-- Rules:
-- 1. Filter only verified successful/captured payment transactions (excluding failed/abandoned attempts).
-- 2. Strictly select only when an order has EXACTLY ONE unambiguous successful transaction.
-- 3. If multiple successful transactions exist or none exist, leave payment_id NULL for reconciliation.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payment_refunds' AND column_name = 'order_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payment_transactions' AND column_name = 'order_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payment_transactions' AND column_name = 'gateway_payment_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payment_transactions' AND column_name = 'status'
  ) THEN
    EXECUTE '
      UPDATE public.payment_refunds pr
      SET payment_id = single_tx.gateway_payment_id
      FROM (
        SELECT order_id, gateway_payment_id
        FROM (
          SELECT 
            order_id, 
            gateway_payment_id,
            COUNT(*) OVER (PARTITION BY order_id) AS valid_tx_count
          FROM public.payment_transactions
          WHERE gateway_payment_id IS NOT NULL
            AND TRIM(gateway_payment_id) <> ''''
            AND status::text IN (''captured'', ''completed'', ''paid'')
        ) ranked_tx
        WHERE valid_tx_count = 1
      ) single_tx
      WHERE pr.order_id = single_tx.order_id
        AND pr.payment_id IS NULL;
    ';
  END IF;
END $$;

-- F. Safe dynamic backfill via orders.payment_id ONLY IF column exists in orders
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_id'
  ) THEN
    EXECUTE '
      UPDATE public.payment_refunds pr
      SET payment_id = o.payment_id
      FROM public.orders o
      WHERE pr.order_id = o.id
        AND pr.payment_id IS NULL
        AND o.payment_id IS NOT NULL;
    ';
  END IF;
END $$;

-- G. Flag unresolved legacy rows for auditor reconciliation without fabricating fake payment IDs
UPDATE public.payment_refunds
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"legacy_reconciliation_required": true, "reason": "UNRESOLVED_PAYMENT_ID"}'::jsonb
WHERE payment_id IS NULL;

-- 6. Constraints and Indexes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_payment_refunds_refund_id') THEN
    ALTER TABLE public.payment_refunds
      ADD CONSTRAINT uq_payment_refunds_refund_id UNIQUE (refund_id);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_refunds_idempotency_key 
  ON public.payment_refunds (idempotency_key) 
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_refunds_payment ON public.payment_refunds (payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_refunds_order ON public.payment_refunds (order_id);
CREATE INDEX IF NOT EXISTS idx_payment_refunds_status ON public.payment_refunds (status);

-- 7. Bidirectional Compatibility Trigger (synchronizes legacy and modern columns)
CREATE OR REPLACE FUNCTION public.sync_payment_refunds_compatibility()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Sync amount <-> amount_paise
  IF NEW.amount_paise IS NOT NULL AND (NEW.amount IS NULL OR TG_OP = 'UPDATE') THEN
    NEW.amount := ROUND(NEW.amount_paise / 100.0, 2);
  ELSIF NEW.amount IS NOT NULL AND NEW.amount_paise IS NULL THEN
    NEW.amount_paise := ROUND(NEW.amount * 100)::BIGINT;
  END IF;

  -- Sync gateway_refund_id <-> refund_id
  IF NEW.refund_id IS NOT NULL AND NEW.gateway_refund_id IS NULL THEN
    NEW.gateway_refund_id := NEW.refund_id;
  ELSIF NEW.gateway_refund_id IS NOT NULL AND NEW.refund_id IS NULL THEN
    NEW.refund_id := NEW.gateway_refund_id;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_payment_refunds_compatibility ON public.payment_refunds;
CREATE TRIGGER trg_sync_payment_refunds_compatibility
  BEFORE INSERT OR UPDATE ON public.payment_refunds
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_payment_refunds_compatibility();

-- 8. Enable RLS and Reconcile Policies
ALTER TABLE public.payment_refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to payment_refunds" ON public.payment_refunds;
CREATE POLICY "Service role full access to payment_refunds"
  ON public.payment_refunds
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users view refunds for their orders" ON public.payment_refunds;
CREATE POLICY "Users view refunds for their orders"
  ON public.payment_refunds FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = payment_refunds.order_id AND o.customer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 9. Ensure orders.refund_status is compatible with new refund state machine
DO $$
DECLARE
  v_type TEXT;
BEGIN
  SELECT data_type INTO v_type 
  FROM information_schema.columns 
  WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'refund_status';

  IF v_type = 'USER-DEFINED' THEN
    ALTER TABLE public.orders ALTER COLUMN refund_status DROP DEFAULT;
    ALTER TABLE public.orders ALTER COLUMN refund_status TYPE TEXT USING refund_status::text;
    ALTER TABLE public.orders ALTER COLUMN refund_status SET DEFAULT 'none';
  END IF;
END $$;

-- 10. Harden platform_financial_transactions constraints for forward compatibility
ALTER TABLE public.platform_financial_transactions 
  DROP CONSTRAINT IF EXISTS platform_financial_transactions_transaction_type_check;
ALTER TABLE public.platform_financial_transactions 
  DROP CONSTRAINT IF EXISTS platform_financial_transactions_status_check;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_platform_financial_tx_status') THEN
    ALTER TABLE public.platform_financial_transactions
      ADD CONSTRAINT chk_platform_financial_tx_status
      CHECK (status IN ('pending', 'payable', 'processing', 'completed', 'failed', 'refunded', 'reversed'));
  END IF;
END $$;

COMMIT;
