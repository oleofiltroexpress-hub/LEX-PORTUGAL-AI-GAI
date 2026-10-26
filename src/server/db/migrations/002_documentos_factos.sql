-- ============================================================================
-- LEX PORTUGAL AI — Migração 002: Ingestão Documental, OCR e Extração de Factos
-- Banco de Dados: TursoDB / SQLite (libSQL)
-- ============================================================================

-- Tabela de Documentos Ingeridos nos Processos
CREATE TABLE IF NOT EXISTS documentos_processo (
  id TEXT PRIMARY KEY,
  processo_id TEXT NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  organizacao_id TEXT NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  nome_ficheiro TEXT NOT NULL,
  tipo_documento TEXT NOT NULL CHECK(tipo_documento IN ('peticao', 'contestacao', 'replica', 'treplica', 'sentenca', 'despacho', 'recurso', 'parecer_pericial', 'prova_documental', 'contrato', 'fatura', 'outro')),
  formato TEXT NOT NULL CHECK(formato IN ('pdf_nativo', 'pdf_digitalizado', 'docx', 'imagem_scan')),
  tamanho_bytes INTEGER NOT NULL,
  necessita_ocr INTEGER NOT NULL DEFAULT 0,
  confianca_ocr REAL,
  avisos_ocr TEXT, -- Array JSON com limitações de leitura
  numero_paginas INTEGER NOT NULL DEFAULT 1,
  conteudo_texto TEXT,
  estado_processamento TEXT NOT NULL CHECK(estado_processamento IN ('pendente', 'em_processamento', 'concluido', 'erro')),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_docs_proc ON documentos_processo(processo_id);
CREATE INDEX IF NOT EXISTS idx_docs_org ON documentos_processo(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_docs_tipo ON documentos_processo(tipo_documento);

-- Tabela de Factos Extraídos e Cronologia Processual
CREATE TABLE IF NOT EXISTS factos_processo (
  id TEXT PRIMARY KEY,
  processo_id TEXT NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  documento_id TEXT NOT NULL REFERENCES documentos_processo(id) ON DELETE CASCADE,
  organizacao_id TEXT NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  classificacao TEXT NOT NULL CHECK(classificacao IN ('facto_comprovado', 'alegacao_parte', 'facto_controvertido')),
  descricao TEXT NOT NULL,
  data_evento TEXT,
  ordem_cronologica INTEGER NOT NULL DEFAULT 0,
  excerto_origem TEXT NOT NULL,
  pagina_origem INTEGER NOT NULL,
  folio_origem TEXT,
  meio_prova TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_factos_proc ON factos_processo(processo_id);
CREATE INDEX IF NOT EXISTS idx_factos_doc ON factos_processo(documento_id);
CREATE INDEX IF NOT EXISTS idx_factos_class ON factos_processo(classificacao);
CREATE INDEX IF NOT EXISTS idx_factos_data ON factos_processo(data_evento);

-- Tabela de Confrontos / Comparações de Peças (Mapa do Contraditório)
CREATE TABLE IF NOT EXISTS confrontos_documentais (
  id TEXT PRIMARY KEY,
  processo_id TEXT NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  organizacao_id TEXT NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  doc_a_id TEXT NOT NULL REFERENCES documentos_processo(id) ON DELETE CASCADE,
  doc_b_id TEXT NOT NULL REFERENCES documentos_processo(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  factos_concordantes TEXT, -- Array JSON
  factos_controvertidos TEXT, -- Array JSON
  contradicoes_diretas TEXT, -- Array JSON
  resumo_contraditorio TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_confrontos_proc ON confrontos_documentais(processo_id);
