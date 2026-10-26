-- ============================================================================
-- LEX PORTUGAL AI — Migração 001: Esquema Inicial
-- Banco de Dados: TursoDB / SQLite (libSQL)
-- ============================================================================

-- Tabela de controlo de migrações
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  checksum TEXT NOT NULL
);

-- Organizações / Sociedades de Advogados (Multi-tenant)
CREATE TABLE IF NOT EXISTS organizacoes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  nif TEXT NOT NULL UNIQUE,
  morada TEXT,
  email_contacto TEXT,
  ativo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Utilizadores e Profissionais Forenses
CREATE TABLE IF NOT EXISTS utilizadores (
  id TEXT PRIMARY KEY,
  organizacao_id TEXT NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'advogado', 'solicitador', 'estagiario')),
  cedula_profissional TEXT,
  ativo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_utilizadores_org ON utilizadores(organizacao_id);

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  organizacao_id TEXT NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('singular', 'coletivo')),
  nif TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  morada TEXT,
  ativo INTEGER NOT NULL DEFAULT 1,
  observacoes TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  UNIQUE(organizacao_id, nif)
);

CREATE INDEX IF NOT EXISTS idx_clientes_org ON clientes(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_clientes_nif ON clientes(nif);

-- Processos Judiciais (Autos Citius)
CREATE TABLE IF NOT EXISTS processos (
  id TEXT PRIMARY KEY,
  organizacao_id TEXT NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  advogado_id TEXT REFERENCES utilizadores(id) ON DELETE SET NULL,
  numero_processual TEXT NOT NULL,
  tribunal TEXT NOT NULL,
  especie TEXT NOT NULL,
  ramo TEXT NOT NULL,
  cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  cliente_nome TEXT NOT NULL,
  juiz_relator TEXT,
  valor_causa REAL NOT NULL DEFAULT 0.0,
  estado TEXT NOT NULL CHECK(estado IN ('ativo', 'suspenso', 'em_recurso', 'findo', 'arquivado')),
  fase_processual TEXT NOT NULL,
  descricao TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  UNIQUE(organizacao_id, numero_processual)
);

CREATE INDEX IF NOT EXISTS idx_processos_org ON processos(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_processos_numero ON processos(numero_processual);
CREATE INDEX IF NOT EXISTS idx_processos_cliente ON processos(cliente_id);

-- Intervenientes e Partes nos Processos
CREATE TABLE IF NOT EXISTS intervenientes_processo (
  id TEXT PRIMARY KEY,
  processo_id TEXT NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  papel TEXT NOT NULL CHECK(papel IN ('autor', 'reu', 'assistente', 'testemunha', 'perito', 'contrainteressado', 'outro')),
  nif TEXT,
  representante_advogado TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_intervenientes_proc ON intervenientes_processo(processo_id);
CREATE INDEX IF NOT EXISTS idx_intervenientes_nome ON intervenientes_processo(nome);

-- Prazos Judiciais e Eventos Perentórios (Art. 138.º CPC)
CREATE TABLE IF NOT EXISTS prazos_processo (
  id TEXT PRIMARY KEY,
  processo_id TEXT NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  data_limite TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('prazo_legal', 'audiencia', 'diligencia_judicial', 'notificacao_citius', 'pagamento_taxa')),
  urgente INTEGER NOT NULL DEFAULT 0,
  cumprido INTEGER NOT NULL DEFAULT 0,
  base_legal TEXT NOT NULL,
  cumprido_em TEXT,
  cumprido_por TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_prazos_processo ON prazos_processo(processo_id);
CREATE INDEX IF NOT EXISTS idx_prazos_data ON prazos_processo(data_limite);
CREATE INDEX IF NOT EXISTS idx_prazos_pendentes ON prazos_processo(cumprido, data_limite);

-- Fontes Normativas e Jurisprudenciais
CREATE TABLE IF NOT EXISTS fontes_juridicas (
  id TEXT PRIMARY KEY,
  identificador TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('legislacao', 'jurisprudencia', 'doutrina', 'parecer_oficial')),
  ramo TEXT NOT NULL,
  entidade_emissora TEXT NOT NULL,
  data_oficial TEXT NOT NULL,
  url_oficial TEXT,
  versao TEXT NOT NULL,
  estado_vigencia TEXT NOT NULL CHECK(estado_vigencia IN ('em_vigor', 'revogado', 'alterado', 'vigencia_parcial', 'transitorio')),
  sumario TEXT,
  artigos_relevantes TEXT, -- Array serializado em JSON
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_fontes_identificador ON fontes_juridicas(identificador);
CREATE INDEX IF NOT EXISTS idx_fontes_ramo ON fontes_juridicas(ramo);

-- Minutas Jurídicas
CREATE TABLE IF NOT EXISTS minutas (
  id TEXT PRIMARY KEY,
  processo_id TEXT NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo_peca TEXT NOT NULL,
  versao INTEGER NOT NULL DEFAULT 1,
  estado TEXT NOT NULL CHECK(estado IN ('rascunho', 'em_revisao', 'verificada', 'pronta_assinatura')),
  conteudo TEXT NOT NULL,
  fundamentacao_legal TEXT, -- JSON
  jurisprudencia_citada TEXT, -- JSON
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_minutas_proc ON minutas(processo_id);

-- Memórias Operacionais, Semânticas e de Melhoria
CREATE TABLE IF NOT EXISTS memorias (
  id TEXT PRIMARY KEY,
  organizacao_id TEXT NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  processo_id TEXT REFERENCES processos(id) ON DELETE CASCADE,
  cliente_id TEXT REFERENCES clientes(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('operacional', 'semantica', 'melhoria')),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  proveniencia TEXT NOT NULL,
  valido INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_memorias_org ON memorias(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_memorias_proc ON memorias(processo_id);

-- Registos de Auditoria Imutáveis (Audit Trail)
CREATE TABLE IF NOT EXISTS registos_auditoria (
  id TEXT PRIMARY KEY,
  organizacao_id TEXT NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  utilizador_id TEXT,
  utilizador_nome TEXT NOT NULL,
  acao TEXT NOT NULL,
  entidade TEXT NOT NULL,
  detalhes TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('confirmado', 'alerta', 'erro')),
  ip_origem TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_auditoria_org ON registos_auditoria(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_data ON registos_auditoria(created_at);
