/**
 * LEX PORTUGAL AI — Testes da Fase 6: Gestão de Documentos, OCR Especializado,
 * Extração de Factos (Provados vs. Alegações), Confronto de Peças e Isolamento
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@libsql/client';
import {
  avaliarOCRDocumento,
  extrairFactosDeDocumento,
  confrontarDocumentosProcessuais,
  ingerirDocumentoNoProcesso,
  obterFactosECronologiaDoProcesso,
  AVISO_DEONTOLOGICO_OCR,
} from './analyzer';
import { runMigrations } from '../db/migrate';
import path from 'node:path';

// Helper para criar base de dados SQLite em memória com migrações aplicadas
async function setupTestDb() {
  const client = createClient({ url: ':memory:' });
  const migrationsDir = path.resolve(process.cwd(), 'src/server/db/migrations');
  const migResult = await runMigrations(client, migrationsDir);
  assert.equal(migResult.success, true, 'As migrações devem ser aplicadas com sucesso');

  // Criar organizações de teste (Org A e Org B)
  await client.execute({
    sql: 'INSERT INTO organizacoes (id, nome, nif) VALUES (?, ?, ?)',
    args: ['org-porto-1', 'Silva & Santos Advogados', '502011475'],
  });
  await client.execute({
    sql: 'INSERT INTO organizacoes (id, nome, nif) VALUES (?, ?, ?)',
    args: ['org-lisboa-2', 'Lisboa Legal Partners', '509999888'],
  });

  // Criar utilizadores
  await client.execute({
    sql: `INSERT INTO utilizadores (id, organizacao_id, nome, email, password_hash, role)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: ['usr-adv-1', 'org-porto-1', 'Dra. Maria Santos', 'maria@silva.pt', 'hash123', 'advogado'],
  });
  await client.execute({
    sql: `INSERT INTO utilizadores (id, organizacao_id, nome, email, password_hash, role)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: ['usr-estag-1', 'org-porto-1', 'Dr. João Estagiário', 'joao@silva.pt', 'hash123', 'estagiario'],
  });
  await client.execute({
    sql: `INSERT INTO utilizadores (id, organizacao_id, nome, email, password_hash, role)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: ['usr-adv-2', 'org-lisboa-2', 'Dr. António Lisboa', 'antonio@lisboa.pt', 'hash123', 'advogado'],
  });

  // Criar cliente e processo na Org A
  await client.execute({
    sql: `INSERT INTO clientes (id, organizacao_id, nome, tipo, nif)
          VALUES (?, ?, ?, ?, ?)`,
    args: ['cli-1', 'org-porto-1', 'Lusitânia Logística, S.A.', 'coletivo', '502987111'],
  });
  await client.execute({
    sql: `INSERT INTO processos (id, organizacao_id, advogado_id, numero_processual, tribunal, especie, ramo, cliente_id, cliente_nome, estado, fase_processual)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'proc-100',
      'org-porto-1',
      'usr-adv-1',
      '1420/24.8T8PRT',
      'Juízo Central Cível do Porto',
      'Ação de Processo Comum',
      'Direito Civil',
      'cli-1',
      'Lusitânia Logística, S.A.',
      'ativo',
      'Articulados',
    ],
  });

  // Criar interveniente (Réu) no proc-100
  await client.execute({
    sql: `INSERT INTO intervenientes_processo (id, processo_id, nome, papel, nif)
          VALUES (?, ?, ?, ?, ?)`,
    args: ['int-1', 'proc-100', 'Vanguard Frotas & Equipamentos, Lda.', 'reu', '501234567'],
  });

  return client;
}

test('Fase 6: Avaliação de OCR — Detecta necessidade e emite aviso deontológico para digitalizações', () => {
  // 1. PDF nativo (vetorial) não requer OCR
  const relatorioNativo = avaliarOCRDocumento('pdf_nativo', 'Peticao_Inicial_Eletronica.pdf');
  assert.equal(relatorioNativo.necessitaOcr, false);
  assert.equal(relatorioNativo.confiancaMedia, 1.0);
  assert.equal(relatorioNativo.deverDeontologicoAviso, '');

  // 2. Imagem / Scan requer OCR e deve assinalar o aviso deontológico obrigatório
  const relatorioScan = avaliarOCRDocumento('imagem_scan', 'Digitalizacao_Auto_Penhora_fls80.jpg');
  assert.equal(relatorioScan.necessitaOcr, true);
  assert.ok(relatorioScan.confiancaMedia < 0.85, 'Confiança ótica deve refletir limitações de digitalização');
  assert.equal(
    relatorioScan.deverDeontologicoAviso,
    AVISO_DEONTOLOGICO_OCR,
    'Deve conter o aviso deontológico literal sobre conferência com os autos físicos'
  );
  assert.ok(relatorioScan.zonasIlegiveis.length > 0, 'Deve identificar zonas com legibilidade comprometida');
  assert.ok(relatorioScan.paginasComLimitaes.includes(3), 'Deve assinalar páginas com limitações');
});

test('Fase 6: Extração de Factos — Distingue rigorosamente factos comprovados de alegações das partes', () => {
  const factosPI = extrairFactosDeDocumento(
    'proc-100',
    'doc-1',
    'peticao',
    'Peticao_Inicial.pdf'
  );

  assert.ok(factosPI.length >= 4, 'Deve extrair múltiplos factos da Petição');

  const provados = factosPI.filter((f) => f.classificacao === 'facto_comprovado');
  const alegacoes = factosPI.filter((f) => f.classificacao === 'alegacao_parte');

  assert.ok(provados.length >= 2, 'Deve identificar factos comprovados por documentos autênticos');
  assert.ok(alegacoes.length >= 2, 'Deve identificar alegações não provadas que carecem de instrução');

  // Verificar proveniência e integridade do excerto de origem
  for (const f of factosPI) {
    assert.ok(f.excertoOrigem && f.excertoOrigem.length > 20, 'Cada facto deve conter excerto textual de origem');
    assert.ok(f.paginaOrigem >= 1, 'Cada facto deve referenciar a página exata');
    assert.ok(f.folioOrigem, 'Cada facto deve ter referência ao fólio dos autos');
    assert.ok(f.meioProva, 'Cada facto deve referenciar o meio de prova correspondente');
  }

  // Verificar classificação de Contestação com factos controvertidos
  const factosContestacao = extrairFactosDeDocumento(
    'proc-100',
    'doc-2',
    'contestacao',
    'Contestacao.pdf'
  );
  const controvertidos = factosContestacao.filter((f) => f.classificacao === 'facto_controvertido');
  assert.ok(controvertidos.length >= 2, 'Contestação deve gerar factos expressamente controvertidos');
});

test('Fase 6: Confronto de Peças — Apura factos admitidos por acordo, controvertidos e contradições', () => {
  const confronto = confrontarDocumentosProcessuais(
    'proc-100',
    { id: 'doc-1', nome: 'Petição Inicial', tipo: 'peticao' },
    { id: 'doc-2', nome: 'Contestação', tipo: 'contestacao' }
  );

  assert.ok(confronto.titulo.includes('Petição Inicial vs. Contestação'));
  assert.ok(confronto.factosConcordantes.length >= 2, 'Deve identificar factos aceites por acordo (art. 574.º CPC)');
  assert.equal(confronto.factosConcordantes[0].admitidoPorAcordo, true);

  assert.ok(confronto.factosControvertidos.length >= 2, 'Deve identificar matérias controvertidas sujeitas a prova');
  assert.ok(confronto.contradicoesDiretas.length >= 1, 'Deve detetar contradições diretas entre articulados');
  assert.ok(confronto.resumoContraditorio.includes('repartição do ónus da prova'));
});

test('Fase 6: Ingestão e Persistência no TursoDB com Isolamento e RBAC', async () => {
  const client = await setupTestDb();

  const userAdv1 = { id: 'usr-adv-1', organizacaoId: 'org-porto-1', role: 'advogado' as const, nome: 'Dra. Maria Santos', email: 'maria@silva.pt' };
  const userEstag1 = { id: 'usr-estag-1', organizacaoId: 'org-porto-1', role: 'estagiario' as const, nome: 'Dr. João Estagiário', email: 'joao@silva.pt' };
  const userOutraOrg = { id: 'usr-adv-2', organizacaoId: 'org-lisboa-2', role: 'advogado' as const, nome: 'Dr. António Lisboa', email: 'antonio@lisboa.pt' };

  // 1. Advogado da Org A ingere documento no proc-100 da sua org (deve ter sucesso)
  const docIngerido = await ingerirDocumentoNoProcesso(client, userAdv1, {
    processoId: 'proc-100',
    nomeFicheiro: 'Contestacao_fls100.pdf',
    tipoDocumento: 'contestacao',
    formato: 'pdf_digitalizado',
    tamanhoBytes: 450000,
    conteudoTexto: 'Contestação tempestivamente deduzida nos termos do art. 569.º do CPC...',
  });

  assert.ok(docIngerido.id.startsWith('doc-'));
  assert.equal(docIngerido.relatorioOcr.necessitaOcr, true);
  assert.ok(docIngerido.factos.length > 0, 'Deve persistir factos associados');

  // Verificar na base de dados
  const dbDocs = await client.execute({
    sql: 'SELECT * FROM documentos_processo WHERE processo_id = ?',
    args: ['proc-100'],
  });
  assert.equal(dbDocs.rows.length, 1);

  const dbFactos = await client.execute({
    sql: 'SELECT * FROM factos_processo WHERE processo_id = ?',
    args: ['proc-100'],
  });
  assert.ok(dbFactos.rows.length >= 3);

  // 2. Consulta de factos e cronologia pela equipa da própria organização
  const cronologia = await obterFactosECronologiaDoProcesso(client, userAdv1, 'proc-100');
  assert.ok(cronologia.factos.length >= 3);
  assert.ok(cronologia.totalProvados >= 1);
  assert.ok(cronologia.totalControvertidos >= 2);

  // 3. Estagiário sem permissão de escrita de processos tenta ingerir (deve ser rejeitado)
  await assert.rejects(
    async () => {
      await ingerirDocumentoNoProcesso(client, userEstag1, {
        processoId: 'proc-100',
        nomeFicheiro: 'Requerimento_Nao_Autorizado.pdf',
        tipoDocumento: 'outro',
        formato: 'pdf_nativo',
        tamanhoBytes: 50000,
      });
    },
    /Permissão insuficiente/,
    'Estagiário sem permissão manage_cases não pode ingerir documentos'
  );

  // 4. Advogado de outra organização tenta aceder ao proc-100 (Cross-Tenant / Cross-Process Isolation)
  await assert.rejects(
    async () => {
      await obterFactosECronologiaDoProcesso(client, userOutraOrg, 'proc-100');
    },
    /Acesso negado/,
    'Utilizador de organização distinta não pode aceder aos factos do processo'
  );

  await assert.rejects(
    async () => {
      await ingerirDocumentoNoProcesso(client, userOutraOrg, {
        processoId: 'proc-100',
        nomeFicheiro: 'Ataque_Cross_Org.pdf',
        tipoDocumento: 'outro',
        formato: 'pdf_nativo',
        tamanhoBytes: 50000,
      });
    },
    /Acesso negado/,
    'Utilizador de organização distinta não pode ingerir documentos noutro processo'
  );
});
