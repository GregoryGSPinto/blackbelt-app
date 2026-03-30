-- 086_manual_payment.sql
-- Adiciona campos para baixa manual de pagamento em faturas.

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS manual_payment BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
