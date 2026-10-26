/**
 * LEX PORTUGAL AI — Router da API REST com Validação no Servidor e Isolamento
 */

import { Router, Request, Response } from 'express';
import { getDbClient } from '../db/client';
import { requireAuth, validarAcessoProcesso, temPermissao } from '../security/auth';
import { validarNIFPortugues } from '../../utils/legal';

export const apiRouter = Router();

// Middleware de autenticação obrigatório para todas as rotas da API
apiRouter.use(requireAuth);

/**
 * Health check da base de dados e migrações
 */
apiRouter.get('/health', async (req: Request, res: Response) => {
  try {
    const client = getDbClient();
    const result = await client.execute('SELECT count(*) as count FROM schema_migrations');
    const migrationsCount = Number(result.rows[0].count);

    res.json({
      status: 'ok',
      database: 'TursoDB / libSQL',
      migracoesAplicadas: migrationsCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * CLIENTES: Listar
 */
apiRouter.get('/clientes', async (req: Request, res: Response) => {
  try {
    const client = getDbClient();
    const user = (req as any).user;

    const result = await client.execute({
      sql: 'SELECT * FROM clientes WHERE organizacao_id = ? ORDER BY created_at DESC',
      args: [user.organizacaoId],
    });

    res.json({ clientes: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * CLIENTES: Criar com validação estrita no servidor
 */
apiRouter.post('/clientes', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!temPermissao(user.role, 'manage_clients')) {
      return res.status(403).json({ error: 'Permissão insuficiente para criar clientes.' });
    }

    const { nome, tipo, nif, email, telefone, morada, observacoes } = req.body;

    if (!nome || !nif || !tipo) {
      return res.status(400).json({ error: 'Campos obrigatórios em falta: nome, nif ou tipo.' });
    }

    // Validação de NIF português no servidor
    if (!validarNIFPortugues(nif)) {
      return res.status(422).json({
        error: 'O NIF introduzido é inválido nos termos do algoritmo de verificação módulo 11 português.',
      });
    }

    const client = getDbClient();
    const id = `cli-${Date.now()}`;

    await client.execute({
      sql: `INSERT INTO clientes (id, organizacao_id, nome, tipo, nif, email, telefone, morada, observacoes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, user.organizacaoId, nome, tipo, nif, email || null, telefone || null, morada || null, observacoes || null],
    });

    // Registar na auditoria
    await client.execute({
      sql: `INSERT INTO registos_auditoria (id, organizacao_id, utilizador_id, utilizador_nome, acao, entidade, detalhes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `aud-${Date.now()}`,
        user.organizacaoId,
        user.id,
        user.nome,
        'Registo de Cliente',
        `Cliente: ${nome}`,
        `Novo cliente registado com NIF ${nif}.`,
        'confirmado',
      ],
    });

    res.status(201).json({ id, nome, nif, tipo, message: 'Cliente criado com sucesso.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PROCESSOS: Listar com isolamento de tenant
 */
apiRouter.get('/processos', async (req: Request, res: Response) => {
  try {
    const client = getDbClient();
    const user = (req as any).user;

    const result = await client.execute({
      sql: 'SELECT * FROM processos WHERE organizacao_id = ? ORDER BY created_at DESC',
      args: [user.organizacaoId],
    });

    res.json({ processos: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PROCESSOS: Obter detalhe com validação estrita de isolamento
 */
apiRouter.get('/processos/:id', async (req: Request, res: Response) => {
  try {
    const client = getDbClient();
    const user = (req as any).user;
    const processoId = req.params.id;

    const authCheck = await validarAcessoProcesso(client, user, processoId, 'leitura');
    if (!authCheck.permitido) {
      return res.status(403).json({ error: authCheck.motivo });
    }

    const procRes = await client.execute({
      sql: 'SELECT * FROM processos WHERE id = ?',
      args: [processoId],
    });

    const partesRes = await client.execute({
      sql: 'SELECT * FROM intervenientes_processo WHERE processo_id = ?',
      args: [processoId],
    });

    const prazosRes = await client.execute({
      sql: 'SELECT * FROM prazos_processo WHERE processo_id = ? ORDER BY data_limite ASC',
      args: [processoId],
    });

    res.json({
      processo: procRes.rows[0],
      intervenientes: partesRes.rows,
      prazos: prazosRes.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PRAZOS: Alternar cumprimento
 */
apiRouter.patch('/prazos/:id/cumprir', async (req: Request, res: Response) => {
  try {
    const client = getDbClient();
    const user = (req as any).user;
    const prazoId = req.params.id;

    const prazoRes = await client.execute({
      sql: 'SELECT * FROM prazos_processo WHERE id = ?',
      args: [prazoId],
    });

    if (prazoRes.rows.length === 0) {
      return res.status(404).json({ error: 'Prazo não encontrado.' });
    }

    const prazo = prazoRes.rows[0];
    const novoEstado = prazo.cumprido ? 0 : 1;
    const agora = new Date().toISOString();

    await client.execute({
      sql: 'UPDATE prazos_processo SET cumprido = ?, cumprido_em = ?, cumprido_por = ? WHERE id = ?',
      args: [novoEstado, novoEstado ? agora : null, novoEstado ? user.nome : null, prazoId],
    });

    // Registar no log de auditoria
    await client.execute({
      sql: `INSERT INTO registos_auditoria (id, organizacao_id, utilizador_id, utilizador_nome, acao, entidade, detalhes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `aud-${Date.now()}`,
        user.organizacaoId,
        user.id,
        user.nome,
        'Cumprimento de Prazo',
        `Prazo: ${prazo.titulo}`,
        `Prazo marcado como ${novoEstado ? 'CUMPRIDO' : 'PENDENTE'} pelo utilizador ${user.nome}.`,
        'confirmado',
      ],
    });

    res.json({ id: prazoId, cumprido: novoEstado === 1, message: 'Estado do prazo atualizado.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * REGISTOS DE AUDITORIA: Consultar audit trail imutável
 */
apiRouter.get('/auditoria', async (req: Request, res: Response) => {
  try {
    const client = getDbClient();
    const user = (req as any).user;

    const result = await client.execute({
      sql: 'SELECT * FROM registos_auditoria WHERE organizacao_id = ? ORDER BY created_at DESC LIMIT 100',
      args: [user.organizacaoId],
    });

    res.json({ logs: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * IA: Consultar Orquestrador Jurídico Gemini
 */
apiRouter.post('/ai/consultar', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { orquestrarConsultaJuridica, verificarLimiteUtilizacao } = await import('../ai/gemini');

    // 1. Verificar Limite de Utilização (Rate Limiting)
    const rateLimit = verificarLimiteUtilizacao(user.organizacaoId);
    if (!rateLimit.permitido) {
      return res.status(429).json({
        error: 'Limite de consultas da organização excedido. Aguarde 60 segundos antes de submeter nova análise.',
      });
    }

    const { consulta, contextoProcesso, ramoDireito } = req.body;

    if (!consulta) {
      return res.status(400).json({ error: 'O parâmetro "consulta" é obrigatório.' });
    }

    const resultado = await orquestrarConsultaJuridica(consulta, contextoProcesso, ramoDireito);

    // Registar na auditoria
    const client = getDbClient();
    await client.execute({
      sql: `INSERT INTO registos_auditoria (id, organizacao_id, utilizador_id, utilizador_nome, acao, entidade, detalhes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `aud-${Date.now()}`,
        user.organizacaoId,
        user.id,
        user.nome,
        'Consulta Jurídica IA (Gemini)',
        `Ramo: ${ramoDireito || 'Processo Civil'}`,
        `Consulta: "${consulta.substring(0, 50)}..." | Normas: ${resultado.normasAplicaveis.length}`,
        'confirmado',
      ],
    });

    res.json({ resultado });
  } catch (err: any) {
    const status = err.message.includes('429') ? 429 : err.message.includes('503') ? 503 : 500;
    res.status(status).json({ error: err.message });
  }
});

/**
 * IA: Execução Segura de Ferramenta Autorizada
 */
apiRouter.post('/ai/ferramenta', async (req: Request, res: Response) => {
  try {
    const { nome, args } = req.body;
    const { executarFerramentaServidor } = await import('../ai/gemini');

    const resultado = await executarFerramentaServidor(nome, args || {});
    res.json({ resultado });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * RAG: Pesquisa Híbrida Lexical e Semântica com Reordenação por Vigência
 */
apiRouter.post('/rag/pesquisar', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { termo, modo, ramo, tipoFonte, apenasEmVigor, tribunal, limite } = req.body;

    const { CORPUS_JURIDICO_PORTUGAL } = await import('../rag/corpus');
    const { executarPesquisaHibrida } = await import('../rag/hybridSearch');

    const resposta = executarPesquisaHibrida(CORPUS_JURIDICO_PORTUGAL, {
      termo: termo || '',
      modo,
      ramo,
      tipoFonte,
      apenasEmVigor: Boolean(apenasEmVigor),
      tribunal,
      limite: limite ? Number(limite) : 10,
    });

    // Registar na auditoria
    const client = getDbClient();
    await client.execute({
      sql: `INSERT INTO registos_auditoria (id, organizacao_id, utilizador_id, utilizador_nome, acao, entidade, detalhes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `aud-${Date.now()}`,
        user.organizacaoId,
        user.id,
        user.nome,
        'Pesquisa RAG Híbrida',
        `Termo: "${(termo || '').substring(0, 40)}"`,
        `Modo: ${modo || 'híbrida'} | Resultados: ${resposta.totalEncontrado} | Fontes Insuficientes: ${resposta.fontesInsuficientes ? 'SIM' : 'NÃO'}`,
        'confirmado',
      ],
    });

    res.json(resposta);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * RAG: Listar Fontes Jurídicas do Acervo
 */
apiRouter.get('/rag/fontes', async (req: Request, res: Response) => {
  try {
    const client = getDbClient();
    const result = await client.execute('SELECT * FROM fontes_juridicas ORDER BY data_oficial DESC');
    res.json({ fontes: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * RAG: Monitorização e Histórico de Atualizações de Fontes
 */
apiRouter.get('/rag/status-atualizacoes', async (_req: Request, res: Response) => {
  try {
    const { ServicoAtualizacaoFontes } = await import('../rag/updateService');
    const logs = ServicoAtualizacaoFontes.obterHistoricoAtualizacoes();
    res.json({
      status: 'operacional',
      ultimaVerificacao: new Date().toISOString(),
      logs,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * RAG: Ingestão Autorizada com Validação Temporal no Servidor
 */
apiRouter.post('/rag/ingerir', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!temPermissao(user.role, 'manage_clients')) {
      return res.status(403).json({ error: 'Permissão insuficiente para ingerir novas fontes no acervo.' });
    }

    const { fonte, sumario, artigos } = req.body;
    if (!fonte || !sumario) {
      return res.status(400).json({ error: 'Dados da fonte e sumário oficial são obrigatórios.' });
    }

    const { ServicoAtualizacaoFontes } = await import('../rag/updateService');
    const resultado = await ServicoAtualizacaoFontes.ingerirFonteAutorizada(
      fonte,
      sumario,
      Array.isArray(artigos) ? artigos : []
    );

    if (!resultado.sucesso) {
      return res.status(422).json({ error: resultado.erro });
    }

    res.status(201).json({
      mensagem: 'Diploma ou fonte jurídica oficial ingerida e indexada com sucesso.',
      id: resultado.id,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * FASE 6: Ingestão Documental (PDF/DOCX/Imagens) com OCR, Alerta Deontológico e Extração de Factos
 */
apiRouter.post('/documentos/ingerir', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const client = getDbClient();
    const { processoId, nomeFicheiro, tipoDocumento, formato, tamanhoBytes, conteudoTexto } = req.body;

    if (!processoId || !nomeFicheiro || !tipoDocumento || !formato) {
      return res.status(400).json({
        error: 'Campos obrigatórios: processoId, nomeFicheiro, tipoDocumento, formato.',
      });
    }

    const { ingerirDocumentoNoProcesso } = await import('../documents/analyzer');
    const docProcessado = await ingerirDocumentoNoProcesso(client, user, {
      processoId,
      nomeFicheiro,
      tipoDocumento,
      formato,
      tamanhoBytes: Number(tamanhoBytes) || 102400,
      conteudoTexto,
    });

    res.status(201).json({
      mensagem: 'Documento processado e indexado com sucesso.',
      documento: docProcessado,
    });
  } catch (err: any) {
    const status = err.message.includes('Acesso negado') || err.message.includes('Permissão insuficiente') ? 403 : 500;
    res.status(status).json({ error: err.message });
  }
});

/**
 * FASE 6: Listar Documentos de um Processo com Isolamento Rigoroso
 */
apiRouter.get('/processos/:id/documentos', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const client = getDbClient();
    const processoId = req.params.id;

    const authCheck = await validarAcessoProcesso(client, user, processoId, 'leitura');
    if (!authCheck.permitido) {
      return res.status(403).json({ error: authCheck.motivo });
    }

    const result = await client.execute({
      sql: 'SELECT * FROM documentos_processo WHERE processo_id = ? AND organizacao_id = ? ORDER BY created_at DESC',
      args: [processoId, user.organizacaoId],
    });

    res.json({ documentos: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * FASE 6: Obter Factos Extraídos e Cronologia Processual
 */
apiRouter.get('/processos/:id/factos', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const client = getDbClient();
    const processoId = req.params.id;

    const { obterFactosECronologiaDoProcesso } = await import('../documents/analyzer');
    const dados = await obterFactosECronologiaDoProcesso(client, user, processoId);

    res.json(dados);
  } catch (err: any) {
    const status = err.message.includes('Acesso negado') ? 403 : 500;
    res.status(status).json({ error: err.message });
  }
});

/**
 * FASE 6: Comparação de Documentos Processuais (Mapa do Contraditório)
 */
apiRouter.post('/processos/:id/comparar', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const client = getDbClient();
    const processoId = req.params.id;
    const { docAId, docBId, nomeDocA, nomeDocB, tipoA, tipoB } = req.body;

    const authCheck = await validarAcessoProcesso(client, user, processoId, 'leitura');
    if (!authCheck.permitido) {
      return res.status(403).json({ error: authCheck.motivo });
    }

    const { confrontarDocumentosProcessuais } = await import('../documents/analyzer');
    const confronto = confrontarDocumentosProcessuais(
      processoId,
      { id: docAId || 'doc-a', nome: nomeDocA || 'Petição Inicial', tipo: tipoA || 'peticao' },
      { id: docBId || 'doc-b', nome: nomeDocB || 'Contestação', tipo: tipoB || 'contestacao' }
    );

    // Gravar confronto na tabela de confrontos
    await client.execute({
      sql: `INSERT INTO confrontos_documentais (
              id, processo_id, organizacao_id, doc_a_id, doc_b_id, titulo,
              factos_concordantes, factos_controvertidos, contradicoes_diretas, resumo_contraditorio
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        confronto.id,
        processoId,
        user.organizacaoId,
        confronto.docAId,
        confronto.docBId,
        confronto.titulo,
        JSON.stringify(confronto.factosConcordantes),
        JSON.stringify(confronto.factosControvertidos),
        JSON.stringify(confronto.contradicoesDiretas),
        confronto.resumoContraditorio,
      ],
    });

    res.json({ confronto });
  } catch (err: any) {
    const status = err.message.includes('Acesso negado') ? 403 : 500;
    res.status(status).json({ error: err.message });
  }
});

/**
 * FASE 6: Deteção e Prevenção de Conflito de Interesses (Clientes e Partes Contrárias)
 */
apiRouter.post('/clientes/verificar-conflito', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const client = getDbClient();
    const { nome, nif } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'O nome do cliente é obrigatório para verificação de conflitos.' });
    }

    // Pesquisar se esta entidade já figura como parte contrária / réu em processos ativos
    const resultado = await client.execute({
      sql: `SELECT ip.id, ip.nome, ip.papel, p.numero_processual, p.estado, p.cliente_nome
            FROM intervenientes_processo ip
            JOIN processos p ON ip.processo_id = p.id
            WHERE p.organizacao_id = ? 
              AND (LOWER(ip.nome) LIKE LOWER(?) OR (ip.nif IS NOT NULL AND ip.nif = ?))
              AND p.estado IN ('ativo', 'em_recurso')`,
      args: [user.organizacaoId, `%${nome.trim()}%`, nif || ''],
    });

    const conflitos = resultado.rows.map((r: any) => ({
      processo: r.numero_processual,
      papelExistente: r.papel,
      clienteAtualDoEscritorio: r.cliente_nome,
      alerta: `A entidade "${nome}" figura como "${r.papel}" no processo ativo ${r.numero_processual} patrocinado a favor de "${r.cliente_nome}".`,
    }));

    res.json({
      existeConflito: conflitos.length > 0,
      totalConflitos: conflitos.length,
      detalhes: conflitos,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});



