-- ═══════════════════════════════════════════════════════
-- 024 — Prospecção de Academias (CRM)
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS prospects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  nome VARCHAR(200) NOT NULL,
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(50),
  bairro VARCHAR(100),
  telefone VARCHAR(20),
  site VARCHAR(200),
  google_maps_url TEXT,
  google_place_id VARCHAR(200),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),

  nota_google DECIMAL(2,1),
  total_avaliacoes INTEGER DEFAULT 0,

  instagram VARCHAR(100),
  instagram_seguidores INTEGER,
  facebook VARCHAR(200),

  modalidades TEXT[] DEFAULT '{}',
  alunos_estimados INTEGER,
  faturamento_estimado DECIMAL(10,2),
  tamanho VARCHAR(10),

  score_total INTEGER DEFAULT 0,
  score_breakdown JSONB DEFAULT '{}',
  classificacao VARCHAR(10) DEFAULT 'frio',
  sinais_dor TEXT[] DEFAULT '{}',
  sinais_oportunidade TEXT[] DEFAULT '{}',
  sistema_detectado VARCHAR(100),
  analise JSONB DEFAULT '{}',

  abordagem JSONB DEFAULT '{}',

  status VARCHAR(20) DEFAULT 'novo' CHECK (status IN (
    'novo','contactado','interessado','demo_agendada','negociando','fechado','perdido','ignorar'
  )),
  ultimo_contato TIMESTAMPTZ,
  proximo_contato TIMESTAMPTZ,
  canal_contato VARCHAR(30),
  observacoes TEXT,
  responsavel VARCHAR(100) DEFAULT 'Gregory',
  motivo_perda TEXT,

  academy_id UUID,

  fonte VARCHAR(20) DEFAULT 'google_places',
  buscado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prospect_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  data TIMESTAMPTZ NOT NULL DEFAULT now(),
  canal VARCHAR(30) NOT NULL,
  resumo TEXT NOT NULL,
  resultado VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_prospects_cidade ON prospects(cidade);
CREATE INDEX idx_prospects_score ON prospects(score_total DESC);
CREATE INDEX idx_prospects_classificacao ON prospects(classificacao);
CREATE INDEX idx_prospect_contacts_prospect ON prospect_contacts(prospect_id);

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prospects_all" ON prospects FOR ALL USING (true);
CREATE POLICY "contacts_all" ON prospect_contacts FOR ALL USING (true);
