-- ============================================================================
-- LEX PORTUGAL AI — Migração 003: Redação de Minutas, Citações, Versões,
-- Revisão Adversarial, Proveniência e Feedback Supervisionado
-- Banco de Dados: TursoDB / SQLite (libSQL)
-- ============================================================================

-- Tabela de Minutas Jurídicas Principais
CREATE TABLE IF NOT EXISTS minutas_juridicas (
  id TEXT PRIMARY KEY,
  organizacao_id TEXT NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  processo_id TEXT NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  tipo_peca TEXT NOT NULL CHECK(tipo_peca IN ('peticao_inicial', 'contestacao', 'alegacoes_recurso', 'requerimento_prova', 'reclamacao', 'resposta_excecoes', 'parecer')),
  titulo TEXT NOT NULL,
  tribunal TEXT,
  juizo TEXT,
  conteudo_atual TEXT NOT NULL,
  versao_atual INTEGER NOT NULL DEFAULT 1,
  estado TEXT NOT NULL CHECK(estado IN ('rascunho', 'em_revisao', 'aprovado', 'rejeitado')),
  criado_por TEXT NOT NULL REFERENCES utilizadores(id),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_minutas_proc ON minutas_juridicas(processo_id);
CREATE INDEX IF NOT EXISTS idx_minutas_org ON minutas_juridicas(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_minutas_estado ON minutas_juridicas(estado);

-- Tabela de Versões Históricas da Minuta (Controlo de Versões)
CREATE TABLE IF NOT EXISTS versoes_minuta (
  id TEXT PRIMARY KEY,
  minuta_id TEXT NOT NULL REFERENCES minutas_juridicas(id) ON DELETE CASCADE,
  numero_versao INTEGER NOT NULL,
  conteudo TEXT NOT NULL,
  diferencas_resumo TEXT,
  motivo_alteracao TEXT,
  criado_por TEXT NOT NULL REFERENCES utilizadores(id),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  UNIQUE(minuta_id, numero_versao)
);

CREATE INDEX IF NOT EXISTS idx_versoes_minuta ON versoes_minuta(minuta_id);

-- Tabela de Revisões Adversariais e Deteção de Afirmações Sem Suporte
CREATE TABLE IF NOT EXISTS revisoes_adversariais (
  id TEXT PRIMARY KEY,
  minuta_id TEXT NOT NULL REFERENCES minutas_juridicas(id) ON DELETE CASCADE,
  versao_num INTEGER NOT NULL,
  afirmacoes_sem_suporte TEXT, -- JSON array de { paragrafo_num, texto, motivo, severidade, sugestao_remediacao }
  pontos_vulneraveis TEXT, -- JSON array de { titulo, descricao, contra_argumento_provavel, base_legal_oponente, sugestao_reforco }
  citacoes_invalidas TEXT, -- JSON array de { citacao, erro, tipo }
  risco_global TEXT NOT NULL CHECK(risco_global IN ('baixo', 'medio', 'alto')),
  sugestoes_reforco TEXT, -- JSON array
  data_revisao TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_revisoes_minuta ON revisoes_adversariais(minuta_id);

-- Tabela de Memória Persistente com Proveniência (Zero-Training / Segredo Profissional)
CREATE TABLE IF NOT EXISTS memorias_proveniencia (
  id TEXT PRIMARY KEY,
  organizacao_id TEXT NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  processo_id TEXT NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  minuta_id TEXT REFERENCES minutas_juridicas(id) ON DELETE CASCADE,
  chave_conceito TEXT NOT NULL,
  factos_utilizados TEXT, -- JSON array com { id, folio, classificacao, excerto }
  fontes_rag_utilizadas TEXT, -- JSON array com { artigo, diploma, vigencia, citation }
  confidencial_nao_treinar INTEGER NOT NULL DEFAULT 1 CHECK(confidencial_nao_treinar IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_memorias_proc ON memorias_proveniencia(processo_id);
CREATE INDEX IF NOT EXISTS idx_memorias_minuta ON memorias_proveniencia(minuta_id);

-- Tabela de Feedback Supervisionado pelo Advogado Titular
CREATE TABLE IF NOT EXISTS feedbacks_supervisionados (
  id TEXT PRIMARY KEY,
  minuta_id TEXT NOT NULL REFERENCES minutas_juridicas(id) ON DELETE CASCADE,
  advogado_id TEXT NOT NULL REFERENCES utilizadores(id),
  decisao TEXT NOT NULL CHECK(decisao IN ('aprovado', 'rejeitado', 'ajustes_solicitados')),
  notas_deontologicas TEXT,
  motivo_rejeicao TEXT,
  conformidade_ordem INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_minuta ON feedbacks_supervisionados(minuta_id);
