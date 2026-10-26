/**
 * LEX PORTUGAL AI — Motor de Pesquisa e Recuperação Híbrida (Lexical + Semântica)
 */

import {
  FragmentoJuridico,
  OpcoesPesquisaHibrida,
  ResultadoRecuperacao,
  RespostaPesquisaRAG,
} from './types';
import { extrairTokensLexicais } from './pipeline';

/**
 * Calcula a pontuação lexical (sobreposição de tokens e termos exatos)
 */
export function calcularPontuacaoLexical(
  termoPesquisa: string,
  fragmento: FragmentoJuridico
): { score: number; correspondenciaExata: boolean } {
  const tokensBusca = extrairTokensLexicais(termoPesquisa);
  if (tokensBusca.length === 0) return { score: 0, correspondenciaExata: false };

  const textoCompleto = `${fragmento.identificadorFonte} ${fragmento.tituloFonte} ${fragmento.artigoNumero || ''} ${fragmento.epigrafe || ''} ${fragmento.texto}`;
  const tokensTexto = new Set(extrairTokensLexicais(textoCompleto));

  let tokensEncontrados = 0;
  for (const token of tokensBusca) {
    if (tokensTexto.has(token)) {
      tokensEncontrados++;
    }
  }

  const overlap = tokensEncontrados / tokensBusca.length;

  // Verificação de correspondência exata de número de artigo ou identificador
  let correspondenciaExata = false;
  const termoLower = termoPesquisa.toLowerCase();

  if (fragmento.artigoNumero) {
    const artNumLimpo = fragmento.artigoNumero.replace(/\D/g, '');
    const buscaNumLimpa = termoPesquisa.replace(/\D/g, '');
    if (buscaNumLimpa && artNumLimpo === buscaNumLimpa) {
      correspondenciaExata = true;
    }
  }

  if (fragmento.identificadorFonte.toLowerCase().includes(termoLower)) {
    correspondenciaExata = true;
  }

  const scoreFinal = correspondenciaExata ? Math.max(overlap, 0.95) : overlap;
  return { score: scoreFinal, correspondenciaExata };
}

/**
 * Calcula pontuação semântica conceitual
 */
export function calcularPontuacaoSemantica(
  termoPesquisa: string,
  fragmento: FragmentoJuridico
): number {
  const termoNorm = termoPesquisa.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const textoNorm = fragmento.texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let score = 0;

  // Ramo do direito alinhado
  if (fragmento.metadados.ramo.toLowerCase().includes(termoNorm)) {
    score += 0.3;
  }

  // Palavras-chave dogmáticas e conceituais
  const palavrasChave = termoNorm.split(/\s+/).filter((p) => p.length > 3);
  let matches = 0;
  for (const palavra of palavrasChave) {
    if (textoNorm.includes(palavra)) {
      matches++;
    }
  }

  if (palavrasChave.length > 0) {
    score += (matches / palavrasChave.length) * 0.7;
  }

  return Math.min(score, 1.0);
}

/**
 * Executa a recuperação híbrida com reordenação por vigência, força jurídica e proveniência
 */
export function executarPesquisaHibrida(
  corpus: FragmentoJuridico[],
  opcoes: OpcoesPesquisaHibrida
): RespostaPesquisaRAG {
  const {
    termo,
    modo = 'hibrida',
    ramo,
    tipoFonte,
    apenasEmVigor = false,
    tribunal,
    limite = 10,
  } = opcoes;

  const termoLimpo = termo.trim();
  if (!termoLimpo) {
    return {
      consulta: termo,
      totalEncontrado: 0,
      resultados: [],
      fontesInsuficientes: true,
      avisoRigor: 'Nenhum termo de pesquisa fornecido.',
    };
  }

  const resultadosCandidatos: ResultadoRecuperacao[] = [];

  for (const frag of corpus) {
    // 1. Filtragens preliminares
    if (ramo && ramo !== 'todos' && frag.metadados.ramo !== ramo) {
      continue;
    }
    if (tipoFonte && tipoFonte !== 'todos' && frag.metadados.tipo !== tipoFonte) {
      continue;
    }
    if (apenasEmVigor && frag.metadados.estadoVigencia !== 'em_vigor') {
      continue;
    }
    if (tribunal && tribunal !== 'todos' && !frag.metadados.entidadeEmissora.includes(tribunal)) {
      continue;
    }

    // 2. Pontuação
    const lexical = calcularPontuacaoLexical(termoLimpo, frag);
    const semantica = calcularPontuacaoSemantica(termoLimpo, frag);

    let pontuacaoFinal = 0;
    if (modo === 'lexical') {
      pontuacaoFinal = lexical.score;
    } else if (modo === 'semantica') {
      pontuacaoFinal = semantica;
    } else {
      // Híbrida ponderada (55% lexical para precisão exata de normas, 45% semântica)
      pontuacaoFinal = lexical.score * 0.55 + semantica * 0.45;
      if (lexical.correspondenciaExata) {
        pontuacaoFinal = Math.min(pontuacaoFinal + 0.3, 1.0);
      }
    }

    // 3. Ponderação por vigência (penaliza revogados sem os ocultar da consulta histórica)
    let alertaVigencia: string | undefined;
    if (frag.metadados.estadoVigencia === 'revogado') {
      pontuacaoFinal *= 0.4; // Penalização no ranking
      alertaVigencia = `ALERTA DE VIGÊNCIA: Esta norma encontra-se REVOGADA${
        frag.metadados.diplomaRevogatorio ? ` pela ${frag.metadados.diplomaRevogatorio}` : ''
      }. Não possui eficácia jurídica ativa.`;
    } else if (frag.metadados.estadoVigencia === 'alterado') {
      alertaVigencia = 'Norma com alterações legislativas consolidadas.';
    }

    // 4. Bonificação por vinculação jurisprudencial superior (STJ uniformizado) apenas se houver pertinência
    if (pontuacaoFinal >= 0.2 && frag.metadados.grauVinculacao === 'jurisprudencia_uniformizada') {
      pontuacaoFinal = Math.min(pontuacaoFinal + 0.1, 1.0);
    }

    if (pontuacaoFinal >= 0.2) {
      resultadosCandidatos.push({
        fragmento: frag,
        pontuacaoLexical: lexical.score,
        pontuacaoSemantica: semantica,
        pontuacaoFinal,
        correspondenciaExata: lexical.correspondenciaExata,
        alertaVigencia,
      });
    }
  }

  // 5. Reordenação por relevância final decrescente
  resultadosCandidatos.sort((a, b) => b.pontuacaoFinal - a.pontuacaoFinal);

  const topResultados = resultadosCandidatos.slice(0, limite);

  // 6. Deteção estrita de fontes insuficientes para impedir alucinação
  const fontesInsuficientes =
    topResultados.length === 0 || topResultados[0].pontuacaoFinal < 0.25;

  return {
    consulta: termo,
    totalEncontrado: topResultados.length,
    resultados: topResultados,
    fontesInsuficientes,
    avisoRigor: fontesInsuficientes
      ? 'Aviso de Rigor: Não foram encontradas fontes oficiais ou consolidadas suficientes no acervo para fundamentar uma resposta com certeza jurídica. Recomenda-se pesquisa complementar no Diário da República.'
      : undefined,
  };
}
