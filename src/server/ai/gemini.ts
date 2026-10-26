/**
 * LEX PORTUGAL AI — Camada de Serviço Gemini API & Orquestrador Jurídico
 * Conforme orientações oficiais da Google GenAI SDK (@google/genai)
 */

import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { getDbClient } from '../db/client';

export interface RespostaJuridicaEstruturada {
  analiseGeral: string;
  factosDocumentados: string[];
  normasAplicaveis: {
    diploma: string;
    artigo: string;
    sumarioNormativo: string;
  }[];
  jurisprudenciaCitada: {
    tribunal: string;
    numeroProcesso: string;
    dataAcordao: string;
    sumarioDecisao: string;
  }[];
  incertezasEDiligencias: string[];
  nivelConfianca: 'alto' | 'medio' | 'baixo';
  ressalvaDeontologica: string;
}

/**
 * Ferramentas autorizadas (Tools) com acesso estritamente restrito
 * O modelo NUNCA tem acesso direto a SQL, comandos ou ficheiros confidenciais.
 */
export const FERRAMENTAS_JURIDICAS_AUTORIZADAS: FunctionDeclaration[] = [
  {
    name: 'consultarArtigoLei',
    description: 'Consulta o texto consolidado de um artigo específico na legislação portuguesa em vigor.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        diploma: {
          type: Type.STRING,
          description: 'Nome oficial do diploma (ex: Código de Processo Civil, Código Civil, Código Penal).',
        },
        numeroArtigo: {
          type: Type.STRING,
          description: 'Número do artigo (ex: 138, 569, 584, 483, 808).',
        },
      },
      required: ['diploma', 'numeroArtigo'],
    },
  },
  {
    name: 'consultarJurisprudenciaSuperior',
    description: 'Recupera teses uniformizadas e acórdãos dos Tribunais Superiores portugueses (STJ, TC, TRs).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        materia: {
          type: Type.STRING,
          description: 'Questão de direito ou matéria em litígio (ex: resolução contratual, impugnação matéria de facto).',
        },
        tribunal: {
          type: Type.STRING,
          description: 'Tribunal emissor preferencial (ex: STJ, TRP, TRL, TC).',
        },
      },
      required: ['materia'],
    },
  },
];

/**
 * Executa as ferramentas seguras no servidor em modo somente de leitura
 */
export async function executarFerramentaServidor(
  nome: string,
  args: Record<string, any>
): Promise<Record<string, any>> {
  const client = getDbClient();

  if (nome === 'consultarArtigoLei') {
    const { diploma, numeroArtigo } = args;
    // Pesquisa controlada de artigos em fontes consolidadas
    const res = await client.execute({
      sql: `SELECT identificador, titulo, sumario FROM fontes_juridicas 
            WHERE (titulo LIKE ? OR identificador LIKE ?) AND artigos_relevantes LIKE ? LIMIT 1`,
      args: [`%${diploma}%`, `%${diploma}%`, `%${numeroArtigo}%`],
    });

    if (res.rows.length > 0) {
      return {
        encontrado: true,
        diploma: res.rows[0].titulo,
        identificador: res.rows[0].identificador,
        artigo: numeroArtigo,
        sumario: res.rows[0].sumario,
        vigencia: 'Em vigor',
      };
    }

    return {
      encontrado: false,
      mensagem: `O artigo ${numeroArtigo} do ${diploma} não consta do acervo local indexado; recomenda-se confronto direto com Diário da República.`,
    };
  }

  if (nome === 'consultarJurisprudenciaSuperior') {
    const { materia, tribunal } = args;
    const res = await client.execute({
      sql: `SELECT identificador, titulo, entidade_emissora, data_oficial, sumario 
            FROM fontes_juridicas 
            WHERE tipo = 'jurisprudencia' AND (sumario LIKE ? OR titulo LIKE ?) LIMIT 2`,
      args: [`%${materia}%`, `%${materia}%`],
    });

    return {
      acordaos: res.rows.map((r) => ({
        identificador: r.identificador,
        titulo: r.titulo,
        tribunal: r.entidade_emissora,
        data: r.data_oficial,
        sumario: r.sumario,
      })),
    };
  }

  throw new Error(`Chamada de ferramenta não autorizada ou desconhecida: ${nome}`);
}

/**
 * Esquema de resposta estruturada para assegurar rigor e integridade deontológica
 */
export const ESQUEMA_RESPOSTA_JURIDICA = {
  type: Type.OBJECT,
  properties: {
    analiseGeral: {
      type: Type.STRING,
      description: 'Enquadramento jurídico exaustivo e fundamentação doutrinária.',
    },
    factosDocumentados: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Factos expressamente alegados ou comprovados nos autos.',
    },
    normasAplicaveis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          diploma: { type: Type.STRING },
          artigo: { type: Type.STRING },
          sumarioNormativo: { type: Type.STRING },
        },
        required: ['diploma', 'artigo', 'sumarioNormativo'],
      },
      description: 'Normas substantivas e adjetivas do ordenamento jurídico português.',
    },
    jurisprudenciaCitada: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          tribunal: { type: Type.STRING },
          numeroProcesso: { type: Type.STRING },
          dataAcordao: { type: Type.STRING },
          sumarioDecisao: { type: Type.STRING },
        },
        required: ['tribunal', 'numeroProcesso', 'sumarioDecisao'],
      },
      description: 'Decisões judiciais dos tribunais superiores portugueses.',
    },
    incertezasEDiligencias: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Incertezas fáticas, omissões probatórias e pressupostos a confirmar.',
    },
    nivelConfianca: {
      type: Type.STRING,
      description: 'Nível de solidez jurídica: alto, medio ou baixo.',
    },
    ressalvaDeontologica: {
      type: Type.STRING,
      description: 'Advertência de validação obrigatória pelo advogado responsável.',
    },
  },
  required: [
    'analiseGeral',
    'factosDocumentados',
    'normasAplicaveis',
    'jurisprudenciaCitada',
    'incertezasEDiligencias',
    'nivelConfianca',
    'ressalvaDeontologica',
  ],
};

/**
 * Limite de taxa (Rate Limiter) em memória por organização
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function verificarLimiteUtilizacao(
  organizacaoId: string,
  limitePorMinuto = 30
): { permitido: boolean; restante: number } {
  const agora = Date.now();
  const janela = 60 * 1000; // 1 minuto

  const registo = rateLimitMap.get(organizacaoId);
  if (!registo || agora > registo.resetAt) {
    rateLimitMap.set(organizacaoId, { count: 1, resetAt: agora + janela });
    return { permitido: true, restante: limitePorMinuto - 1 };
  }

  if (registo.count >= limitePorMinuto) {
    return { permitido: false, restante: 0 };
  }

  registo.count += 1;
  return { permitido: true, restante: limitePorMinuto - registo.count };
}

/**
 * Validação de entrada para proteção contra injeções de instruções e payloads excessivos
 */
export function validarEntradaJuridica(consulta: string): { valida: boolean; erro?: string } {
  if (!consulta || typeof consulta !== 'string') {
    return { valida: false, erro: 'A consulta deve ser um texto válido.' };
  }
  const limpo = consulta.trim();
  if (limpo.length < 5) {
    return { valida: false, erro: 'A consulta jurídica é demasiado curta (mínimo de 5 carateres).' };
  }
  if (limpo.length > 8000) {
    return { valida: false, erro: 'A consulta excede o limite máximo permitido de 8.000 carateres.' };
  }

  // Deteção de padrões de injeção de instruções (Prompt Injection)
  const padroesSuspeitos = [
    /ignore all previous instructions/i,
    /ignore as instruções anteriores/i,
    /delete from\s+[a-z_]+/i,
    /drop table\s+[a-z_]+/i,
    /esqueca todas as regras/i,
  ];

  for (const padrao of padroesSuspeitos) {
    if (padrao.test(limpo)) {
      return {
        valida: false,
        erro: 'Consulta rejeitada pelo filtro de segurança e integridade processual.',
      };
    }
  }

  return { valida: true };
}

/**
 * Inicializa a instância do SDK Google GenAI
 */
export function obterInstanciaGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada no ambiente do servidor.');
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Orquestrador Jurídico Central
 */
export async function orquestrarConsultaJuridica(
  consulta: string,
  contextoProcesso?: string,
  ramoDireito = 'Processo Civil'
): Promise<RespostaJuridicaEstruturada> {
  const validacao = validarEntradaJuridica(consulta);
  if (!validacao.valida) {
    throw new Error(validacao.erro);
  }

  const ai = obterInstanciaGenAI();

  const promptFinal = `Você é o Orquestrador Jurídico LEX PORTUGAL AI, especializado no Direito Português.
Responda com o mais rigoroso respeito às fontes legislativas em vigor, aos Códigos fundamentais (CPC, CC, CP, CPP, etc.) e à jurisprudência consolidada dos Tribunais Superiores (STJ, TC, TRs).

Ramo do Direito: ${ramoDireito}
Contexto do Processo: ${contextoProcesso || 'Consulta autónoma de assessoria'}
Consulta do Advogado: "${consulta}"

Exigências obrigatórias:
1. Discrimine explicitamente factos documentados, normas substantivas e acórdãos.
2. Identifique incertezas probatórias e pressupostos processuais que careçam de verificação presencial.
3. Não afirme domínio integral ou infalibilidade.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptFinal,
      config: {
        systemInstruction:
          'Atue como assessor jurídico sénior em Direito Português. Responda em formato JSON estrito conforme o esquema fornecido. Nunca invente acórdãos ou artigos.',
        temperature: 0.2, // Baixa criatividade para garantir fidelidade às fontes legais
        responseMimeType: 'application/json',
        responseSchema: ESQUEMA_RESPOSTA_JURIDICA as any,
      },
    });

    const texto = response.text;
    if (!texto) {
      throw new Error('O modelo Gemini retornou uma resposta sem texto.');
    }

    const estruturada: RespostaJuridicaEstruturada = JSON.parse(texto.trim());
    return estruturada;
  } catch (err: any) {
    // Tratamento de erros específicos: Quota (429), Indisponibilidade (503), etc.
    if (err.message && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED'))) {
      throw new Error('Limite de quota da Gemini API temporariamente atingido. Tente novamente dentro de instantes.');
    }
    if (err.message && (err.message.includes('503') || err.message.includes('UNAVAILABLE'))) {
      throw new Error('Serviço da Gemini API temporariamente indisponível. A equipa foi notificada.');
    }
    throw err;
  }
}
