-- 062_asaas_integration.sql
-- Add Asaas payment gateway columns to support payment tracking.

-- Asaas columns on pagamentos (payments table)
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS asaas_payment_id text;
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS asaas_customer_id text;
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS billing_type text DEFAULT 'PIX';
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS invoice_url text;
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS pix_qr_code text;
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS due_date date;
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS description text;

-- Index for webhook lookups by Asaas payment ID
CREATE INDEX IF NOT EXISTS idx_pagamentos_asaas_payment_id
  ON public.pagamentos(asaas_payment_id)
  WHERE asaas_payment_id IS NOT NULL;

-- Asaas customer ID on academies (one customer per academy in Asaas)
ALTER TABLE public.academies ADD COLUMN IF NOT EXISTS asaas_customer_id text;

-- paid_until on memberships for payment-driven membership activation
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS paid_until timestamptz;
