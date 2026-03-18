-- ═══════════════════════════════════════════════════════
-- 029 — Contact Messages (Landing page contact form)
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  telefone VARCHAR(20),
  assunto VARCHAR(200),
  mensagem TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'novo' CHECK (status IN ('novo', 'lido', 'respondido', 'arquivado')),
  respondido_em TIMESTAMPTZ,
  respondido_por VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created ON contact_messages(created_at DESC);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Superadmin can read all, public can insert
CREATE POLICY "contact_messages_insert" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages_select" ON contact_messages FOR ALL USING (true);
