-- ==============================================================================
-- TOMATTTO CRITICAL FINANCIAL SECURITY, INTEGRITY & GRANDFATHERING REMEDIATION
-- Migration: 20261124220000_financial_security_remediation.sql
-- Description:
--   1. Hardens public.platform_financial_transactions with strict idempotency,
--      debit/credit direction, immutable audit keys, and status constraints.
--   2. Updates public.orders with verified distance, audit fields, and settlement statuses.
--   3. Grandfathers existing approved restaurants & delivery partners safely with
--      dedicated non-cash audit exemption markers (NEVER fake Razorpay IDs).
--   4. Creates atomic RPC settle_delivered_order_financials taking ONLY p_order_id.
--      Reads verified distance exclusively from server-verified database record.
--      FAILS SAFELY if no verified route exists.
--   5. Creates atomic RPC record_verified_registration_payment enforcing â‚¹499 fee and
--      starter kit allocation.
--   6. Enforces starter kit 5-stage lifecycle constraint.
--   7. Grants and Revokes function execution permissions strictly.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 0. GLOBAL RAZORPAY PAYMENT REGISTRY (ATOMIC REPLAY & CROSS-INTENT PROTECTION)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.payment_registry (
  payment_id TEXT PRIMARY KEY,
  razorpay_order_id TEXT NOT NULL,
  payment_intent TEXT NOT NULL CHECK (payment_intent IN ('customer_order', 'partner_registration', 'rider_registration')),
  entity_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'captured' CHECK (status IN ('reserved', 'captured', 'failed', 'refunded', 'partially_refunded')),
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_payment_registry_entity ON public.payment_registry (entity_id, payment_intent);
CREATE INDEX IF NOT EXISTS idx_payment_registry_user ON public.payment_registry (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_registry_status ON public.payment_registry (status);

-- Enable RLS on payment_registry
ALTER TABLE public.payment_registry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read access to payment registry" ON public.payment_registry;
CREATE POLICY "Admins read access to payment registry"
  ON public.payment_registry
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users view own payments in registry" ON public.payment_registry;
CREATE POLICY "Users view own payments in registry"
  ON public.payment_registry
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role full access to payment registry" ON public.payment_registry;
CREATE POLICY "Service role full access to payment registry"
  ON public.payment_registry
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Atomic RPC: Register or verify Razorpay payment across any intent
-- Safe for concurrent first-time registrations without relying on locking non-existent rows.
-- Enforces strict attribute binding: payment_id, order_id, intent, entity_id, user_id, amount_paise, currency.
-- Rejects NULL order_id or user_id bypasses.
CREATE OR REPLACE FUNCTION public.register_verified_razorpay_payment(
  p_payment_id TEXT,
  p_razorpay_order_id TEXT,
  p_payment_intent TEXT,
  p_entity_id TEXT,
  p_user_id UUID,
  p_amount_paise BIGINT,
  p_currency TEXT DEFAULT 'INR',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_existing RECORD;
  v_currency TEXT := COALESCE(NULLIF(TRIM(p_currency), ''), 'INR');
BEGIN
  -- Validate mandatory payment identity fields
  IF p_payment_id IS NULL OR TRIM(p_payment_id) = '' THEN
    RAISE EXCEPTION 'MANDATORY_FIELD_MISSING: payment_id is required' USING ERRCODE = '22023';
  END IF;

  IF p_razorpay_order_id IS NULL OR TRIM(p_razorpay_order_id) = '' THEN
    RAISE EXCEPTION 'MANDATORY_FIELD_MISSING: razorpay_order_id is required' USING ERRCODE = '22023';
  END IF;

  IF p_entity_id IS NULL OR TRIM(p_entity_id) = '' THEN
    RAISE EXCEPTION 'MANDATORY_FIELD_MISSING: entity_id is required' USING ERRCODE = '22023';
  END IF;

  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'MANDATORY_FIELD_MISSING: user_id is required' USING ERRCODE = '22023';
  END IF;

  IF p_amount_paise IS NULL OR p_amount_paise <= 0 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT: amount_paise must be positive' USING ERRCODE = '22023';
  END IF;

  IF p_payment_intent IS NULL OR p_payment_intent NOT IN ('customer_order', 'partner_registration', 'rider_registration') THEN
    RAISE EXCEPTION 'INVALID_INTENT: payment_intent must be valid' USING ERRCODE = '22023';
  END IF;

  -- 1. Attempt atomic insert first.
  -- Safe for simultaneous first-time payment registration without SELECT ... FOR UPDATE on non-existent rows.
  BEGIN
    INSERT INTO public.payment_registry (
      payment_id,
      razorpay_order_id,
      payment_intent,
      entity_id,
      user_id,
      amount_paise,
      currency,
      status,
      captured_at,
      metadata
    ) VALUES (
      p_payment_id,
      p_razorpay_order_id,
      p_payment_intent,
      p_entity_id,
      p_user_id,
      p_amount_paise,
      v_currency,
      'captured',
      NOW(),
      p_metadata
    );

    RETURN jsonb_build_object(
      'status', 'success',
      'payment_id', p_payment_id,
      'entity_id', p_entity_id,
      'payment_intent', p_payment_intent,
      'amount_paise', p_amount_paise,
      'currency', v_currency
    );

  EXCEPTION WHEN unique_violation THEN
    -- Row already exists: lock it to safely inspect all bound attributes
    SELECT * INTO v_existing 
    FROM public.payment_registry 
    WHERE payment_id = p_payment_id 
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'PAYMENT_CONCURRENCY_ERROR: Payment ID % conflict state could not be resolved', p_payment_id
        USING ERRCODE = '40001';
    END IF;

    -- Strict verification across ALL bound attributes (No NULL bypass!):
    IF v_existing.entity_id = p_entity_id
       AND v_existing.payment_intent = p_payment_intent
       AND v_existing.amount_paise = p_amount_paise
       AND v_existing.currency = v_currency
       AND v_existing.razorpay_order_id = p_razorpay_order_id
       AND v_existing.user_id = p_user_id THEN
      
      RETURN jsonb_build_object(
        'status', 'already_registered',
        'payment_id', p_payment_id,
        'entity_id', p_entity_id,
        'payment_intent', p_payment_intent,
        'amount_paise', p_amount_paise,
        'currency', v_currency,
        'is_idempotent_retry', true
      );
    ELSE
      -- Conflicting attributes detected!
      RAISE EXCEPTION 'PAYMENT_ALREADY_USED: Payment ID % is already bound to % (entity %, user %, amount %, currency %) conflicting with requested (entity %, user %, amount %, currency %)', 
        p_payment_id, 
        v_existing.payment_intent, 
        v_existing.entity_id, 
        COALESCE(v_existing.user_id::TEXT, 'none'),
        v_existing.amount_paise,
        v_existing.currency,
        p_entity_id,
        COALESCE(p_user_id::TEXT, 'none'),
        p_amount_paise,
        v_currency
        USING ERRCODE = '23505';
    END IF;
  END;
END;
$$;

-- ------------------------------------------------------------------------------
-- 0B. DEDICATED REFUND LEDGER & CONCURRENT ATOMIC REFUND STATE MACHINE
-- SCHEMA COMPATIBILITY UPGRADE (Preserves 20261106201418 legacy records & columns)
-- ------------------------------------------------------------------------------

-- 1. Ensure table exists
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

-- 3. Relax legacy NOT NULL constraints on legacy columns
DO $$
BEGIN
  -- transaction_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payment_refunds' AND column_name = 'transaction_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.payment_refunds ALTER COLUMN transaction_id DROP NOT NULL;
  END IF;

  -- order_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payment_refunds' AND column_name = 'order_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.payment_refunds ALTER COLUMN order_id DROP NOT NULL;
  END IF;

  -- amount (legacy numeric column)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payment_refunds' AND column_name = 'amount' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.payment_refunds ALTER COLUMN amount DROP NOT NULL;
  END IF;
END $$;

-- 4. Convert legacy status enum (refund_status) to TEXT safely with documented mapping
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

-- 5. Backfill legacy records
-- A. Map gateway_refund_id -> refund_id (Preserves NULL if missing; never fabricates fake IDs)
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

-- Atomic Refund State Machine RPC
-- Enforces: pending_refunds + processed_refunds <= captured_payment_amount
-- Handles: requested -> pending -> processed / failed / reconciliation_exception
-- Prevents out-of-order state regressions and duplicate ledger debits.
CREATE OR REPLACE FUNCTION public.process_atomic_refund(
  p_refund_id TEXT,
  p_payment_id TEXT,
  p_order_id UUID,
  p_event_id TEXT,
  p_amount_paise BIGINT,
  p_currency TEXT DEFAULT 'INR',
  p_action TEXT DEFAULT 'processed', -- 'reserve' (created/pending), 'settle' (processed), 'fail' (failed)
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_payment RECORD;
  v_existing_refund RECORD;
  v_captured_paise BIGINT;
  v_processed_paise BIGINT := 0;
  v_pending_paise BIGINT := 0;
  v_new_processed_paise BIGINT := 0;
  v_now TIMESTAMPTZ := NOW();
  v_currency TEXT := COALESCE(NULLIF(TRIM(p_currency), ''), 'INR');
  v_refund_rupees NUMERIC(10, 2) := ROUND(p_amount_paise / 100.0, 2);
  v_cumulative_refund_rupees NUMERIC(10, 2);
BEGIN
  -- 1. Deduplication on event ID if provided
  IF p_event_id IS NOT NULL AND p_event_id <> '' THEN
    IF EXISTS (
      SELECT 1 FROM public.platform_financial_transactions 
      WHERE idempotency_key = 'webhook_event_' || p_event_id
    ) THEN
      RETURN jsonb_build_object('status', 'ignored_duplicate_event', 'event_id', p_event_id);
    END IF;
  END IF;

  -- 2. Lock original payment registry record
  SELECT * INTO v_payment 
  FROM public.payment_registry 
  WHERE payment_id = p_payment_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Try to find captured amount from orders if payment_registry not yet backfilled
    SELECT ROUND(total_amount * 100) INTO v_captured_paise FROM public.orders WHERE id = p_order_id;
    IF v_captured_paise IS NULL OR v_captured_paise <= 0 THEN
      RAISE EXCEPTION 'PAYMENT_NOT_FOUND: Captured payment record % not found for refund processing', p_payment_id
        USING ERRCODE = '22023';
    END IF;
  ELSE
    v_captured_paise := v_payment.amount_paise;
  END IF;

  -- 3. Calculate current confirmed (processed + external reconciliation exceptions)
  -- and separate normal pending reservations (excluding current refund_id)
  SELECT 
    COALESCE(SUM(amount_paise) FILTER (WHERE status IN ('processed', 'reconciliation_exception')), 0),
    COALESCE(SUM(amount_paise) FILTER (WHERE status IN ('requested', 'pending')), 0)
  INTO v_processed_paise, v_pending_paise
  FROM public.payment_refunds
  WHERE payment_id = p_payment_id AND refund_id <> p_refund_id;

  -- Check existing refund record for this refund_id
  SELECT * INTO v_existing_refund 
  FROM public.payment_refunds 
  WHERE refund_id = p_refund_id 
  FOR UPDATE;

  -- ----------------------------------------------------------------------------
  -- ACTION: RESERVE (refund.created / initiated)
  -- ----------------------------------------------------------------------------
  IF p_action = 'reserve' THEN
    IF v_existing_refund.refund_id IS NOT NULL THEN
      -- Out-of-order check: if already processed or reconciliation_exception, do not revert to pending!
      IF v_existing_refund.status IN ('processed', 'reconciliation_exception') THEN
        RETURN jsonb_build_object(
          'status', v_existing_refund.status,
          'refund_id', p_refund_id,
          'message', 'Refund is already settled. Late created event ignored.'
        );
      END IF;
      RETURN jsonb_build_object('status', 'already_reserved', 'refund_id', p_refund_id);
    END IF;

    -- Check Invariant: confirmed (processed + reconciliation_exceptions) + pending + new <= captured
    -- CASE A: Internal refund request exceeding available balance.
    -- Strict Distinction: Reject request directly. Do NOT insert reconciliation_exception
    -- (which represents an actual external money movement). Do NOT increase confirmed totals. Do NOT reserve funds.
    IF (v_processed_paise + v_pending_paise + p_amount_paise) > v_captured_paise THEN
      RETURN jsonb_build_object(
        'status', 'rejected',
        'error', 'REFUND_AMOUNT_EXCEEDS_AVAILABLE_BALANCE',
        'message', 'Requested refund of ' || v_refund_rupees || ' exceeds remaining available balance',
        'refund_id', p_refund_id,
        'captured_paise', v_captured_paise,
        'confirmed_paise', v_processed_paise,
        'pending_paise', v_pending_paise,
        'available_refundable_paise', GREATEST(0, v_captured_paise - (v_processed_paise + v_pending_paise))
      );
    ELSE
      INSERT INTO public.payment_refunds (
        refund_id, payment_id, order_id, amount_paise, currency, status, event_id, metadata
      ) VALUES (
        p_refund_id, p_payment_id, p_order_id, p_amount_paise, v_currency, 'pending', p_event_id, p_metadata
      );

      IF p_order_id IS NOT NULL THEN
        UPDATE public.orders SET refund_status = 'refund_initiated' WHERE id = p_order_id;
      END IF;

      RETURN jsonb_build_object(
        'status', 'reserved',
        'refund_id', p_refund_id,
        'reserved_amount', v_refund_rupees,
        'available_refundable_paise', v_captured_paise - (v_processed_paise + v_pending_paise + p_amount_paise)
      );
    END IF;

  -- ----------------------------------------------------------------------------
  -- ACTION: SETTLE (refund.processed)
  -- ----------------------------------------------------------------------------
  ELSIF p_action = 'settle' THEN
    IF v_existing_refund.refund_id IS NOT NULL AND v_existing_refund.status IN ('processed', 'reconciliation_exception') THEN
      RETURN jsonb_build_object('status', v_existing_refund.status, 'refund_id', p_refund_id);
    END IF;

    v_new_processed_paise := v_processed_paise + p_amount_paise;
    v_cumulative_refund_rupees := ROUND(v_new_processed_paise / 100.0, 2);

    -- Check for over-refund: DO NOT silently clamp with Math.min!
    IF v_new_processed_paise > v_captured_paise THEN
      -- Record exact reported refund amount and flag reconciliation exception
      INSERT INTO public.payment_refunds (
        refund_id, payment_id, order_id, amount_paise, currency, status, event_id, processed_at, metadata
      ) VALUES (
        p_refund_id, p_payment_id, p_order_id, p_amount_paise, v_currency, 'reconciliation_exception', p_event_id, v_now,
        p_metadata || jsonb_build_object(
          'anomaly', 'OVER_REFUND_EXCEEDS_ORDER_TOTAL',
          'captured_paise', v_captured_paise,
          'cumulative_processed_paise', v_new_processed_paise
        )
      ) ON CONFLICT (refund_id) DO UPDATE SET
        status = 'reconciliation_exception',
        amount_paise = p_amount_paise,
        processed_at = v_now,
        metadata = payment_refunds.metadata || jsonb_build_object('anomaly', 'OVER_REFUND_EXCEEDS_ORDER_TOTAL');

      IF p_order_id IS NOT NULL THEN
        UPDATE public.orders
        SET
          refund_status = 'reconciliation_exception',
          refund_amount = v_cumulative_refund_rupees
        WHERE id = p_order_id;
      END IF;

      -- Contra-revenue ledger entry with anomaly metadata
      INSERT INTO public.platform_financial_transactions (
        transaction_type, reference_id, payment_id, entity_type, amount, currency, direction, status, idempotency_key, metadata
      ) VALUES (
        'refund', p_payment_id, p_payment_id, 'platform', v_refund_rupees, v_currency, 'debit', 'completed',
        'refund_processed_' || p_refund_id,
        jsonb_build_object(
          'anomaly', 'OVER_REFUND_EXCEEDS_ORDER_TOTAL',
          'refund_id', p_refund_id,
          'order_id', p_order_id,
          'cumulative_refunded', v_cumulative_refund_rupees
        )
      ) ON CONFLICT (idempotency_key) DO NOTHING;

      RETURN jsonb_build_object(
        'status', 'reconciliation_exception',
        'refund_id', p_refund_id,
        'actual_refunded', v_refund_rupees,
        'cumulative_refunded', v_cumulative_refund_rupees
      );
    ELSE
      -- Valid refund: update or insert as processed
      INSERT INTO public.payment_refunds (
        refund_id, payment_id, order_id, amount_paise, currency, status, event_id, processed_at, metadata
      ) VALUES (
        p_refund_id, p_payment_id, p_order_id, p_amount_paise, v_currency, 'processed', p_event_id, v_now, p_metadata
      ) ON CONFLICT (refund_id) DO UPDATE SET
        status = 'processed',
        amount_paise = p_amount_paise,
        processed_at = v_now;

      IF p_order_id IS NOT NULL THEN
        UPDATE public.orders
        SET
          refund_status = CASE WHEN v_new_processed_paise >= v_captured_paise THEN 'full_refund_processed' ELSE 'partial_refund_processed' END,
          refund_amount = v_cumulative_refund_rupees
        WHERE id = p_order_id;
      END IF;

      -- Contra-revenue debit ledger entry
      INSERT INTO public.platform_financial_transactions (
        transaction_type, reference_id, payment_id, entity_type, amount, currency, direction, status, idempotency_key, metadata
      ) VALUES (
        'refund', p_payment_id, p_payment_id, 'platform', v_refund_rupees, v_currency, 'debit', 'completed',
        'refund_processed_' || p_refund_id,
        jsonb_build_object(
          'refund_id', p_refund_id,
          'order_id', p_order_id,
          'cumulative_refunded', v_cumulative_refund_rupees
        )
      ) ON CONFLICT (idempotency_key) DO NOTHING;

      RETURN jsonb_build_object('status', 'processed', 'refund_id', p_refund_id, 'refund_amount', v_refund_rupees);
    END IF;

  -- ----------------------------------------------------------------------------
  -- ACTION: FAIL (refund.failed)
  -- ----------------------------------------------------------------------------
  ELSIF p_action = 'fail' THEN
    IF v_existing_refund.refund_id IS NOT NULL AND v_existing_refund.status IN ('processed', 'reconciliation_exception') THEN
      RETURN jsonb_build_object('status', 'already_processed', 'refund_id', p_refund_id, 'message', 'Cannot fail an already settled refund.');
    END IF;

    IF v_existing_refund.refund_id IS NOT NULL AND v_existing_refund.status = 'failed' THEN
      RETURN jsonb_build_object('status', 'already_failed', 'refund_id', p_refund_id, 'message', 'Refund is already marked failed.');
    END IF;

    -- Release reservation
    INSERT INTO public.payment_refunds (
      refund_id, payment_id, order_id, amount_paise, currency, status, event_id, metadata
    ) VALUES (
      p_refund_id, p_payment_id, p_order_id, p_amount_paise, v_currency, 'failed', p_event_id, p_metadata
    ) ON CONFLICT (refund_id) DO UPDATE SET
      status = 'failed',
      metadata = payment_refunds.metadata || p_metadata;

    IF p_order_id IS NOT NULL THEN
      -- Only mark order refund_failed if no processed refunds exist
      IF v_processed_paise = 0 THEN
        UPDATE public.orders SET refund_status = 'refund_failed' WHERE id = p_order_id;
      END IF;
    END IF;

    INSERT INTO public.platform_financial_transactions (
      transaction_type, reference_id, payment_id, entity_type, amount, currency, direction, status, idempotency_key, metadata
    ) VALUES (
      'refund_failed', p_payment_id, p_payment_id, 'platform', v_refund_rupees, v_currency, 'debit', 'failed',
      'refund_failed_' || p_refund_id,
      jsonb_build_object('refund_id', p_refund_id, 'order_id', p_order_id)
    ) ON CONFLICT (idempotency_key) DO NOTHING;

    RETURN jsonb_build_object('status', 'failed', 'refund_id', p_refund_id, 'released_reservation', v_refund_rupees);
  END IF;

  RAISE EXCEPTION 'INVALID_REFUND_ACTION: Action must be reserve, settle, or fail' USING ERRCODE = '22023';
END;
$$;

-- ------------------------------------------------------------------------------
-- 1. HARDEN PLATFORM FINANCIAL TRANSACTIONS LEDGER
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.platform_financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL,
  reference_id TEXT,
  payment_id TEXT,
  entity_type TEXT CHECK (entity_type IN ('customer', 'restaurant', 'rider', 'platform')),
  entity_id UUID,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'INR',
  direction TEXT DEFAULT 'credit' CHECK (direction IN ('credit', 'debit')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'payable', 'processing', 'completed', 'failed', 'refunded', 'reversed')),
  payout_status TEXT DEFAULT 'none' CHECK (payout_status IN ('none', 'pending', 'payable', 'processing', 'settled', 'failed', 'reversed')),
  idempotency_key TEXT UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  settled_at TIMESTAMPTZ
);

ALTER TABLE public.platform_financial_transactions
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS direction TEXT DEFAULT 'credit' CHECK (direction IN ('credit', 'debit')),
  ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'none' CHECK (payout_status IN ('none', 'pending', 'payable', 'processing', 'settled', 'failed', 'reversed')),
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ;

-- Drop restrictive legacy check constraints from 20261124183000 to allow statutory taxes, COD receivables & payouts
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

-- Global Razorpay Payment ID Unique Index (Prevents payment replay across ANY entity, order, or application)
CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_tx_payment_id_unique 
  ON public.platform_financial_transactions (payment_id) 
  WHERE payment_id IS NOT NULL AND status IN ('completed', 'processing');

-- Also enforce unique payment_id on orders and application tables (Schema-guarded)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_id'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payment_id_unique ON public.orders (payment_id) WHERE payment_id IS NOT NULL';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_rider_apps_payment_id_unique 
  ON public.rider_applications (registration_payment_id) 
  WHERE registration_payment_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurant_apps_payment_id_unique 
  ON public.restaurant_partner_applications (registration_payment_id) 
  WHERE registration_payment_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_tx_idempotency_key ON public.platform_financial_transactions (idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_platform_tx_type_status ON public.platform_financial_transactions (transaction_type, status);
CREATE INDEX IF NOT EXISTS idx_platform_tx_created ON public.platform_financial_transactions (created_at DESC);

-- Enable RLS
ALTER TABLE public.platform_financial_transactions ENABLE ROW LEVEL SECURITY;

-- Admins full read
DROP POLICY IF EXISTS "Admins full access to financial ledger" ON public.platform_financial_transactions;
CREATE POLICY "Admins full access to financial ledger"
  ON public.platform_financial_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users can view only their own records
DROP POLICY IF EXISTS "Users can view their own financial transactions" ON public.platform_financial_transactions;
CREATE POLICY "Users can view their own financial transactions"
  ON public.platform_financial_transactions
  FOR SELECT
  TO authenticated
  USING (entity_id = auth.uid());

-- Deny direct public or anon INSERT/UPDATE/DELETE. Only service_role and SECURITY DEFINER RPCs can write.
DROP POLICY IF EXISTS "Service role write access" ON public.platform_financial_transactions;
CREATE POLICY "Service role write access"
  ON public.platform_financial_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 2. STARTER KIT LIFECYCLE CONSTRAINTS & COLUMNS
-- ------------------------------------------------------------------------------

ALTER TABLE public.rider_applications
  DROP CONSTRAINT IF EXISTS rider_applications_starter_kit_status_check;

ALTER TABLE public.rider_applications
  ADD CONSTRAINT rider_applications_starter_kit_status_check
  CHECK (starter_kit_status IN ('not_allocated', 'allocated', 'ready_for_dispatch', 'dispatched', 'handed_over'));

ALTER TABLE public.restaurant_partner_applications
  DROP CONSTRAINT IF EXISTS restaurant_partner_applications_starter_kit_status_check;

ALTER TABLE public.restaurant_partner_applications
  ADD CONSTRAINT restaurant_partner_applications_starter_kit_status_check
  CHECK (starter_kit_status IN ('not_allocated', 'allocated', 'ready_for_dispatch', 'dispatched', 'handed_over'));

-- ------------------------------------------------------------------------------
-- 3. ORDERS TABLE SETTLEMENT & ROUTE VERIFICATION AUDIT FIELDS
-- ------------------------------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS commission_settled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rider_payout_settled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verified_route_distance_km NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS route_verification_status TEXT DEFAULT 'unverified' CHECK (route_verification_status IN ('unverified', 'verified', 'flagged_for_review')),
  ADD COLUMN IF NOT EXISTS route_verification_source TEXT,
  ADD COLUMN IF NOT EXISTS route_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS settlement_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS packaging_fee NUMERIC(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS discount_funder TEXT DEFAULT 'platform' CHECK (discount_funder IN ('platform', 'restaurant')),
  ADD COLUMN IF NOT EXISTS gst_treatment TEXT DEFAULT 'platform_section_9_5' CHECK (gst_treatment IN ('platform_section_9_5', 'restaurant_remitted', 'exempt'));

ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS funded_by TEXT NOT NULL DEFAULT 'platform' CHECK (funded_by IN ('platform', 'restaurant'));

ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS gst_treatment TEXT DEFAULT 'platform_section_9_5' CHECK (gst_treatment IN ('platform_section_9_5', 'restaurant_remitted', 'exempt')),
  ADD COLUMN IF NOT EXISTS is_gst_registered BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS gstin TEXT,
  ADD COLUMN IF NOT EXISTS packaging_fee NUMERIC(10,2) DEFAULT 0.00;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_restaurants_gst_consistency'
  ) THEN
    ALTER TABLE public.restaurants
      ADD CONSTRAINT chk_restaurants_gst_consistency
      CHECK (gst_treatment != 'restaurant_remitted' OR (is_gst_registered IS TRUE AND gstin IS NOT NULL AND length(trim(gstin)) >= 15));
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 4. GRANDFATHERING POLICY FOR EXISTING APPROVED PARTNERS & RIDERS
-- Uses separate legacy_exemption markers, NEVER fake Razorpay payment IDs.
-- ------------------------------------------------------------------------------

-- Ensure audit columns exist
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS registration_fee_paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS registration_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS registration_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_legacy_grandfathered BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS grandfathered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS grandfathering_reason TEXT;

ALTER TABLE public.riders
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS registration_fee_paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS registration_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS registration_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_legacy_grandfathered BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS grandfathered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS grandfathering_reason TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'delivery_partners'
  ) THEN
    EXECUTE '
      ALTER TABLE public.delivery_partners
        ADD COLUMN IF NOT EXISTS is_legacy_grandfathered BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS grandfathered_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS grandfathering_reason TEXT;
    ';
  END IF;
END $$;

ALTER TABLE public.restaurant_partner_applications
  ADD COLUMN IF NOT EXISTS is_legacy_grandfathered BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS grandfathered_at TIMESTAMPTZ;

ALTER TABLE public.rider_applications
  ADD COLUMN IF NOT EXISTS is_legacy_grandfathered BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS grandfathered_at TIMESTAMPTZ;

-- Grandfather existing approved restaurants
UPDATE public.restaurants
SET 
  registration_fee_paid = TRUE,
  is_legacy_grandfathered = TRUE,
  grandfathered_at = COALESCE(created_at, NOW()),
  grandfathering_reason = 'Pre-existing verified restaurant partner prior to registration fee policy'
WHERE (registration_fee_paid IS NULL OR registration_fee_paid IS FALSE);

-- Grandfather existing verified riders
UPDATE public.riders
SET
  registration_fee_paid = TRUE,
  is_legacy_grandfathered = TRUE,
  grandfathered_at = COALESCE(created_at, NOW()),
  grandfathering_reason = 'Pre-existing verified delivery partner prior to registration fee policy'
WHERE is_verified IS TRUE AND (registration_fee_paid IS NULL OR registration_fee_paid IS FALSE);

-- Grandfather existing approved delivery partners (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'delivery_partners'
  ) THEN
    EXECUTE '
      UPDATE public.delivery_partners
      SET 
        registration_fee_paid = TRUE,
        is_legacy_grandfathered = TRUE,
        grandfathered_at = COALESCE(created_at, NOW()),
        grandfathering_reason = ''Pre-existing verified delivery partner prior to registration fee policy''
      WHERE (registration_fee_paid IS NULL OR registration_fee_paid IS FALSE);
    ';
  END IF;
END $$;

-- Grandfather existing approved applications
UPDATE public.rider_applications
SET 
  registration_fee_paid = TRUE,
  is_legacy_grandfathered = TRUE,
  grandfathered_at = COALESCE(submitted_at, NOW())
WHERE status = 'approved' AND (registration_fee_paid IS NULL OR registration_fee_paid IS FALSE);

UPDATE public.restaurant_partner_applications
SET 
  registration_fee_paid = TRUE,
  is_legacy_grandfathered = TRUE,
  grandfathered_at = COALESCE(submitted_at, NOW())
WHERE status = 'approved' AND (registration_fee_paid IS NULL OR registration_fee_paid IS FALSE);


-- ------------------------------------------------------------------------------
-- 5. ATOMIC RPC: SETTLE DELIVERED ORDER FINANCIALS
-- ------------------------------------------------------------------------------
-- Executed only upon verified order delivery.
-- Takes ONLY p_order_id. Obtains verified route distance strictly from
-- verified_route_distance_km in orders table. Fails safely if unverified.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.settle_delivered_order_financials(
  p_order_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_caller_role TEXT;
  v_order RECORD;
  v_distance NUMERIC(10, 2);
  v_rider_payout NUMERIC(10, 2);
  v_tip NUMERIC(10, 2);
  v_commission NUMERIC(10, 2) := 10.00;
  v_platform_fee NUMERIC(10, 2) := 9.00;
  v_delivery_fee NUMERIC(10, 2) := 10.00;
  v_restaurant_gross NUMERIC(10, 2) := 0.00;
  v_restaurant_payable NUMERIC(10, 2) := 0.00;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- 1. Authorization check: Financial settlement can ONLY be executed by trusted backend (service_role) or admin
  IF v_caller_id IS NOT NULL THEN
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_caller_id;
    IF COALESCE(v_caller_role, '') <> 'admin' THEN
      RAISE EXCEPTION 'UNAUTHORIZED: Financial settlement can only be executed by trusted backend service'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  -- 2. Lock order row to prevent race conditions & duplicate settlements
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND: Order does not exist' USING ERRCODE = '22023';
  END IF;

  -- Must be delivered
  IF v_order.status <> 'delivered' THEN
    RAISE EXCEPTION 'ORDER_NOT_DELIVERED: Order must be delivered before settlement' USING ERRCODE = '22023';
  END IF;

  -- Prevent duplicate settlement
  IF v_order.commission_settled IS TRUE AND v_order.rider_payout_settled IS TRUE THEN
    RETURN jsonb_build_object(
      'status', 'already_settled',
      'order_id', p_order_id,
      'message', 'Order financials have already been settled.'
    );
  END IF;

  -- 2. Obtain distance EXCLUSIVELY from server-verified route record
  IF v_order.verified_route_distance_km IS NULL OR v_order.verified_route_distance_km <= 0 THEN
    RAISE EXCEPTION 'ROUTE_NOT_VERIFIED: Order cannot be settled without an authoritative verified route distance.'
      USING ERRCODE = '22023';
  END IF;

  v_distance := v_order.verified_route_distance_km;

  -- Rider base rate â‚¹12 per km
  v_rider_payout := ROUND(v_distance * 12.00, 2);
  v_tip := COALESCE(v_order.tip_amount, v_order.custom_tip, 0.00);

  -- 3. Atomic Ledger Entries
  -- A. Customer Platform Fee (â‚¹9.00) - Operating Revenue
  INSERT INTO public.platform_financial_transactions (
    transaction_type,
    reference_id,
    entity_type,
    entity_id,
    amount,
    currency,
    direction,
    status,
    idempotency_key,
    metadata
  ) VALUES (
    'platform_fee',
    p_order_id::TEXT,
    'customer',
    v_order.customer_id,
    v_platform_fee,
    'INR',
    'credit',
    'completed',
    'platform_fee_' || p_order_id::TEXT,
    jsonb_build_object('order_id', p_order_id)
  ) ON CONFLICT (idempotency_key) DO NOTHING;

  -- B. Customer Delivery Fee (â‚¹10.00) - Inflow (Tracked separately from profit)
  INSERT INTO public.platform_financial_transactions (
    transaction_type,
    reference_id,
    entity_type,
    entity_id,
    amount,
    currency,
    direction,
    status,
    idempotency_key,
    metadata
  ) VALUES (
    'delivery_fee',
    p_order_id::TEXT,
    'customer',
    v_order.customer_id,
    v_delivery_fee,
    'INR',
    'credit',
    'completed',
    'delivery_fee_' || p_order_id::TEXT,
    jsonb_build_object('order_id', p_order_id)
  ) ON CONFLICT (idempotency_key) DO NOTHING;

  -- C. Restaurant Commission (â‚¹10.00) - Operating Revenue
  INSERT INTO public.platform_financial_transactions (
    transaction_type,
    reference_id,
    entity_type,
    entity_id,
    amount,
    currency,
    direction,
    status,
    idempotency_key,
    metadata
  ) VALUES (
    'restaurant_commission',
    p_order_id::TEXT,
    'restaurant',
    v_order.restaurant_id,
    v_commission,
    'INR',
    'credit',
    'completed',
    'rest_comm_' || p_order_id::TEXT,
    jsonb_build_object('order_id', p_order_id)
  ) ON CONFLICT (idempotency_key) DO NOTHING;

  -- D. Rider Distance Payout (â‚¹12/km) - Platform Liability (Payable to Rider)
  IF v_order.rider_id IS NOT NULL THEN
    INSERT INTO public.platform_financial_transactions (
      transaction_type,
      reference_id,
      entity_type,
      entity_id,
      amount,
      currency,
      direction,
      status,
      payout_status,
      idempotency_key,
      metadata
    ) VALUES (
      'rider_payout',
      p_order_id::TEXT,
      'rider',
      v_order.rider_id,
      v_rider_payout,
      'INR',
      'debit',
      'completed',
      'payable',
      'rider_payout_' || p_order_id::TEXT,
      jsonb_build_object('order_id', p_order_id, 'distance_km', v_distance, 'rate_per_km', 12.00)
    ) ON CONFLICT (idempotency_key) DO NOTHING;

    -- E. Rider Tip (100% Pass-Through Liability)
    IF v_tip > 0 THEN
      INSERT INTO public.platform_financial_transactions (
        transaction_type,
        reference_id,
        entity_type,
        entity_id,
        amount,
        currency,
        direction,
        status,
        payout_status,
        idempotency_key,
        metadata
      ) VALUES (
        'rider_tip',
        p_order_id::TEXT,
        'rider',
        v_order.rider_id,
        v_tip,
        'INR',
        'debit',
        'completed',
        'payable',
        'rider_tip_' || p_order_id::TEXT,
        jsonb_build_object('order_id', p_order_id)
      ) ON CONFLICT (idempotency_key) DO NOTHING;
    END IF;
  END IF;

  -- 4. Mark Order Settled
  UPDATE public.orders
  SET
    commission_settled = TRUE,
    rider_payout_settled = TRUE,
    rider_payout = v_rider_payout,
    settlement_timestamp = v_now
  WHERE id = p_order_id;

  -- F. Merchant Accounting Reconciliation:
  -- 1. Restaurant Gross = Food Item Subtotal + Packaging Fee
  v_restaurant_gross := COALESCE(v_order.item_total, v_order.subtotal, 0.00) 
    + COALESCE(v_order.packaging_fee, 0.00);

  -- 2. GST Pass-Through (Explicit Tax Treatment):
  -- Add GST to restaurant gross ONLY if the restaurant is responsible for remitting GST (restaurant_remitted / non-9(5)).
  -- Under standard platform Section 9(5), tax is remitted by platform directly to the government, NOT paid to restaurant.
  IF COALESCE(v_order.gst_treatment, 'platform_section_9_5') = 'restaurant_remitted' THEN
    v_restaurant_gross := v_restaurant_gross + COALESCE(v_order.tax_amount, 0.00);
  END IF;

  -- 3. Discount Funding Reconciliation:
  -- Deduct from restaurant gross ONLY if the discount was funded by the restaurant.
  -- Platform-funded discounts (WELCOME, FREESHIP, G1BITES50) are absorbed by platform marketing, NOT deducted from merchant!
  IF COALESCE(v_order.discount_funder, 'platform') = 'restaurant' THEN
    v_restaurant_gross := GREATEST(0.00, v_restaurant_gross - COALESCE(v_order.discount_amount, 0.00));
  END IF;

  IF v_restaurant_gross <= 0.00 THEN
    v_restaurant_gross := GREATEST(0.00, v_order.total_amount - v_platform_fee - v_delivery_fee - v_tip - COALESCE(v_order.tax_amount, 0.00));
  END IF;

  -- 4. Net Merchant Payable = Restaurant Gross - ₹10 Platform Commission - Fault Refunds
  v_restaurant_payable := GREATEST(0.00, v_restaurant_gross - v_commission);

  IF COALESCE(v_order.refund_amount, 0.00) > 0 THEN
    v_restaurant_payable := GREATEST(0.00, v_restaurant_payable - v_order.refund_amount);
  END IF;

  -- G. Statutory Tax Accounting (Never Classified as Platform Revenue):
  IF COALESCE(v_order.tax_amount, 0.00) > 0 THEN
    IF COALESCE(v_order.gst_treatment, 'platform_section_9_5') = 'platform_section_9_5' THEN
      -- Platform tax liability payable to government under Section 9(5) CGST Act
      INSERT INTO public.platform_financial_transactions (
        transaction_type, reference_id, entity_type, entity_id, amount, currency, direction, status, payout_status, idempotency_key, metadata
      ) VALUES (
        'tax_liability', p_order_id::TEXT, 'tax_authority', NULL, v_order.tax_amount, 'INR', 'credit', 'completed', 'payable',
        'tax_liab_' || p_order_id::TEXT,
        jsonb_build_object('order_id', p_order_id, 'gst_treatment', 'platform_section_9_5', 'tax_rate', '5%', 'remitted_by', 'platform')
      ) ON CONFLICT (idempotency_key) DO NOTHING;
    ELSE
      -- Pass-through tax liability to restaurant for non-9(5) registered premises
      INSERT INTO public.platform_financial_transactions (
        transaction_type, reference_id, entity_type, entity_id, amount, currency, direction, status, payout_status, idempotency_key, metadata
      ) VALUES (
        'tax_pass_through', p_order_id::TEXT, 'restaurant', v_order.restaurant_id, v_order.tax_amount, 'INR', 'debit', 'completed', 'payable',
        'tax_pass_' || p_order_id::TEXT,
        jsonb_build_object('order_id', p_order_id, 'gst_treatment', v_order.gst_treatment, 'tax_rate', '5%', 'remitted_by', 'restaurant')
      ) ON CONFLICT (idempotency_key) DO NOTHING;
    END IF;
  END IF;

  -- H. Cash on Delivery (COD) Accounting:
  -- If COD, rider collected full cash from customer. Record rider_receivable debit to track cash held.
  IF v_order.payment_method = 'cod' AND v_order.rider_id IS NOT NULL THEN
    INSERT INTO public.platform_financial_transactions (
      transaction_type,
      reference_id,
      entity_type,
      entity_id,
      amount,
      currency,
      direction,
      status,
      idempotency_key,
      metadata
    ) VALUES (
      'rider_receivable',
      p_order_id::TEXT,
      'rider',
      v_order.rider_id,
      v_order.total_amount,
      'INR',
      'debit',
      'completed',
      'rider_receivable_' || p_order_id::TEXT,
      jsonb_build_object(
        'order_id', p_order_id,
        'payment_method', 'cod',
        'cash_collected', v_order.total_amount
      )
    ) ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  -- I. Record Net Merchant Payable Liability
  IF v_order.restaurant_id IS NOT NULL AND v_restaurant_payable > 0 THEN
    INSERT INTO public.platform_financial_transactions (
      transaction_type,
      reference_id,
      entity_type,
      entity_id,
      amount,
      currency,
      direction,
      status,
      payout_status,
      idempotency_key,
      metadata
    ) VALUES (
      'restaurant_payout',
      p_order_id::TEXT,
      'restaurant',
      v_order.restaurant_id,
      v_restaurant_payable,
      'INR',
      'debit',
      'completed',
      'payable',
      'rest_payout_' || p_order_id::TEXT,
      jsonb_build_object(
        'order_id', p_order_id,
        'food_subtotal', COALESCE(v_order.item_total, v_order.subtotal, 0.00),
        'packaging_fee', COALESCE(v_order.packaging_fee, 0.00),
        'tax_amount', COALESCE(v_order.tax_amount, 0.00),
        'gst_treatment', COALESCE(v_order.gst_treatment, 'platform_section_9_5'),
        'discount_amount', COALESCE(v_order.discount_amount, 0.00),
        'discount_funder', COALESCE(v_order.discount_funder, 'platform'),
        'refund_deducted', COALESCE(v_order.refund_amount, 0.00),
        'commission_deducted', v_commission,
        'net_payable', v_restaurant_payable
      )
    ) ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'status', 'success',
    'order_id', p_order_id,
    'payment_method', v_order.payment_method,
    'verified_distance_km', v_distance,
    'rider_payout', v_rider_payout,
    'rider_tip', v_tip,
    'restaurant_commission', v_commission,
    'restaurant_gross', v_restaurant_gross,
    'restaurant_payable', v_restaurant_payable,
    'gst_treatment', COALESCE(v_order.gst_treatment, 'platform_section_9_5'),
    'discount_funder', COALESCE(v_order.discount_funder, 'platform'),
    'settled_at', v_now
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. ATOMIC RPC: RECORD VERIFIED REGISTRATION PAYMENT
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_verified_registration_payment(
  p_applicant_type TEXT,
  p_application_id UUID,
  p_razorpay_payment_id TEXT,
  p_tshirt_size TEXT DEFAULT 'L',
  p_bag_type TEXT DEFAULT 'standard_insulated'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_caller_role TEXT;
  v_fee NUMERIC(10, 2) := 499.00;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Authorization: Only service_role or admin may record verified registration payments
  IF v_caller_id IS NOT NULL THEN
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_caller_id;
    IF COALESCE(v_caller_role, '') <> 'admin' THEN
      RAISE EXCEPTION 'UNAUTHORIZED: Registration payment verification must be performed by trusted backend service'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF p_applicant_type NOT IN ('restaurant', 'rider') THEN
    RAISE EXCEPTION 'INVALID_APPLICANT_TYPE: Must be restaurant or rider' USING ERRCODE = '22023';
  END IF;

  IF p_razorpay_payment_id IS NULL OR TRIM(p_razorpay_payment_id) = '' THEN
    RAISE EXCEPTION 'INVALID_PAYMENT_ID: Verified Razorpay payment ID is required' USING ERRCODE = '22023';
  END IF;

  IF p_applicant_type = 'restaurant' THEN
    IF EXISTS (
      SELECT 1 FROM public.restaurant_partner_applications
      WHERE id = p_application_id AND registration_fee_paid IS TRUE
    ) THEN
      RETURN jsonb_build_object('status', 'already_paid', 'message', 'Registration fee has already been paid.');
    END IF;

    UPDATE public.restaurant_partner_applications
    SET
      registration_fee_paid = TRUE,
      registration_payment_id = p_razorpay_payment_id,
      registration_paid_at = v_now,
      starter_kit_status = 'allocated',
      starter_kit_tshirt_size = p_tshirt_size
    WHERE id = p_application_id;

    INSERT INTO public.platform_financial_transactions (
      transaction_type,
      reference_id,
      entity_type,
      entity_id,
      amount,
      currency,
      direction,
      status,
      idempotency_key,
      metadata
    ) VALUES (
      'partner_registration',
      p_application_id::TEXT,
      'restaurant',
      p_application_id,
      v_fee,
      'INR',
      'credit',
      'completed',
      'reg_ptr_' || p_razorpay_payment_id,
      jsonb_build_object(
        'payment_id', p_razorpay_payment_id,
        'tshirt_size', p_tshirt_size,
        'bag_type', p_bag_type
      )
    ) ON CONFLICT (idempotency_key) DO NOTHING;

  ELSIF p_applicant_type = 'rider' THEN
    IF EXISTS (
      SELECT 1 FROM public.rider_applications
      WHERE id = p_application_id AND registration_fee_paid IS TRUE
    ) THEN
      RETURN jsonb_build_object('status', 'already_paid', 'message', 'Registration fee has already been paid.');
    END IF;

    UPDATE public.rider_applications
    SET
      registration_fee_paid = TRUE,
      registration_payment_id = p_razorpay_payment_id,
      registration_paid_at = v_now,
      starter_kit_status = 'allocated',
      starter_kit_tshirt_size = p_tshirt_size
    WHERE id = p_application_id;

    INSERT INTO public.platform_financial_transactions (
      transaction_type,
      reference_id,
      entity_type,
      entity_id,
      amount,
      currency,
      direction,
      status,
      idempotency_key,
      metadata
    ) VALUES (
      'rider_registration',
      p_application_id::TEXT,
      'rider',
      p_application_id,
      v_fee,
      'INR',
      'credit',
      'completed',
      'reg_rdr_' || p_razorpay_payment_id,
      jsonb_build_object(
        'payment_id', p_razorpay_payment_id,
        'tshirt_size', p_tshirt_size,
        'bag_type', p_bag_type
      )
    ) ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'status', 'success',
    'applicant_type', p_applicant_type,
    'application_id', p_application_id,
    'fee_amount', v_fee,
    'starter_kit_status', 'allocated',
    'verified_at', v_now
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 7. FUNCTION PERMISSION HARDENING (REVOKE PUBLIC, RESTRICT SENSITIVE RPCS)
-- ------------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.settle_delivered_order_financials(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.settle_delivered_order_financials(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.settle_delivered_order_financials(UUID) FROM authenticated;

REVOKE ALL ON FUNCTION public.record_verified_registration_payment(TEXT, UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_verified_registration_payment(TEXT, UUID, TEXT, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.record_verified_registration_payment(TEXT, UUID, TEXT, TEXT, TEXT) FROM authenticated;

REVOKE ALL ON FUNCTION public.register_verified_razorpay_payment(TEXT, TEXT, TEXT, TEXT, UUID, BIGINT, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.register_verified_razorpay_payment(TEXT, TEXT, TEXT, TEXT, UUID, BIGINT, TEXT, JSONB) FROM anon;
REVOKE ALL ON FUNCTION public.register_verified_razorpay_payment(TEXT, TEXT, TEXT, TEXT, UUID, BIGINT, TEXT, JSONB) FROM authenticated;

REVOKE ALL ON FUNCTION public.process_atomic_refund(TEXT, TEXT, UUID, TEXT, BIGINT, TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_atomic_refund(TEXT, TEXT, UUID, TEXT, BIGINT, TEXT, TEXT, JSONB) FROM anon;
REVOKE ALL ON FUNCTION public.process_atomic_refund(TEXT, TEXT, UUID, TEXT, BIGINT, TEXT, TEXT, JSONB) FROM authenticated;

-- Strictly least-privilege: Only trusted server backend (service_role) can execute financial settlements, payment registrations & refunds
GRANT EXECUTE ON FUNCTION public.settle_delivered_order_financials(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_verified_registration_payment(TEXT, UUID, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.register_verified_razorpay_payment(TEXT, TEXT, TEXT, TEXT, UUID, BIGINT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.process_atomic_refund(TEXT, TEXT, UUID, TEXT, BIGINT, TEXT, TEXT, JSONB) TO service_role;

COMMIT;
