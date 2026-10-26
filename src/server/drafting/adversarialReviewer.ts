/**
 * LEX PORTUGAL AI — Motor de Revisão Adversarial e Deteção de Afirmações Sem Suporte
 * Avalia riscos processuais, contradições e simula os contra-argumentos da parte contrária.
 */

import { AfirmacaoSemSuporte, PontoVulneravel, RevisaoAdversarial, SeveridadeRisco, TipoPecaJuridica } from './types';
import { verificarCitacoesNoTexto } from './citationVerifier';

export interface FactoProcessualContexto {
  id: string;
  classificacao: 'facto_comprovado' | 'alegacao_parte' | 'facto_controvertido';
  descricao: string;
  dataEvento?: string;
  folioOrigem?: string;
  meioProva?: string;
}

/**
 * Divide o texto da peça nos seus articulados ou parágrafos formais numerados
 */
export function extrairArticuladosTexto(texto: string): { numero: number; texto: string }[] {
  const linhas = texto.split('\n');
  const articulados: { numero: number; texto: string }[] = [];
  let contador = 1;

  for (const linha of linhas) {
    const limpa = linha.trim();
    if (!limpa) continue;

    // Reconhece articulados numerados como "1.º", "2.º", "1 -", "1.", etc.
    const matchNum = limpa.match(/^([0-9]+)(?:[ºo\.-]|\s*–)\s*(.+)$/i);
    if (matchNum) {
      const num = parseInt(matchNum[1], 10);
      articulados.push({ numero: num, texto: matchNum[2].trim() });
      contador = num + 1;
    } else if (
      limpa.length > 30 &&
      !limpa.startsWith('EXMO') &&
      !limpa.startsWith('TRIBUNAL') &&
      !limpa.startsWith('PROCESSO') &&
      !limpa.startsWith('AUTOR') &&
      !limpa.startsWith('RÉU') &&
      !limpa.startsWith('DO DIREITO') &&
      !limpa.startsWith('DOS FACTOS') &&
      !limpa.startsWith('PEDIDO')
    ) {
      articulados.push({ numero: contador++, texto: limpa });
    }
  }

  return articulados;
}

/**
 * Deteção de afirmações sem suporte factual ou probatório no processo
 */
export function detetarAfirmacoesSemSuporte(
  articulados: { numero: number; texto: string }[],
  factosProcesso: FactoProcessualContexto[]
): AfirmacaoSemSuporte[] {
  const alertas: AfirmacaoSemSuporte[] = [];

  for (const art of articulados) {
    const t = art.texto.toLowerCase();

    // Palavras-chave indicativas de afirmações fácticas perentórias que carecem de suporte
    const eAfirmacaoPerentoria =
      t.includes('transferiu') ||
      t.includes('pagou') ||
      t.includes('danificou') ||
      t.includes('destruiu') ||
      t.includes('confessou') ||
      t.includes('assinou') ||
      t.includes('recusou') ||
      t.includes('ocasionou um prejuízo de') ||
      t.includes('valor de €') ||
      t.includes('euros');

    if (!eAfirmacaoPerentoria) continue;

    // Verificar se existe algum facto comprovado no processo que dê suporte a esta afirmação
    const factoComprovadoCorrespondente = factosProcesso.find((f) => {
      if (f.classificacao !== 'facto_comprovado') return false;
      const palavrasDescricao = f.descricao
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 4);
      return palavrasDescricao.some((w) => t.includes(w));
    });

    if (!factoComprovadoCorrespondente) {
      // Verificar se é apenas uma mera alegação não provada
      const alegacaoCorrespondente = factosProcesso.find((f) => {
        const palavrasDescricao = f.descricao
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 4);
        return palavrasDescricao.some((w) => t.includes(w));
      });

      if (alegacaoCorrespondente) {
        alertas.push({
          articuladoNumero: art.numero,
          texto: art.texto,
          motivo: `O articulado afirma um facto que consta nos autos apenas como mera "${alegacaoCorrespondente.classificacao}" sem fólio documental de suporte.`,
          severidade: 'medio',
          sugestaoRemediacao: 'Juntar meio de prova documental ou requerer prova pericial/testemunhal específica para sustentar o facto.',
          faltaProvaDocumental: true,
        });
      } else {
        alertas.push({
          articuladoNumero: art.numero,
          texto: art.texto,
          motivo: 'Afirmação fáctica perentória sem correspondência em nenhum facto extraído dos autos processuais (Risco de Alucinação / Falta de Objeto Fáctico).',
          severidade: 'alto',
          sugestaoRemediacao: 'Verificar a proveniência documental ou reformular como alegação sob reserva de prova.',
          faltaProvaDocumental: true,
        });
      }
    }
  }

  return alertas;
}

/**
 * Simulação adversarial de contra-argumentos da parte contrária
 */
export function simularPontosVulneraveis(
  tipoPeca: TipoPecaJuridica,
  textoMinuta: string,
  factosProcesso: FactoProcessualContexto[]
): PontoVulneravel[] {
  const pontos: PontoVulneravel[] = [];
  const t = textoMinuta.toLowerCase();

  if (tipoPeca === 'peticao_inicial') {
    // 1. Verificação de Prescrição / Caducidade
    if (t.includes('responsabilidade civil') || t.includes('483')) {
      pontos.push({
        titulo: 'Risco de Exceção Perentória de Prescrição (Art. 498.º CC)',
        descricao: 'A contraparte poderá alegar o decurso do prazo prescricional trienal de 3 anos para responsabilidade extracontratual.',
        contraArgumentoProvavel: 'Arguição de prescrição do direito à indemnização caso os factos lesivos tenham ocorrido há mais de 3 anos sem interpelação interruptiva.',
        baseLegalOponente: 'Art. 498.º, n.º 1 e Art. 323.º do Código Civil',
        sugestaoReforco: 'Aditar articulado fáctico comprovando a notificação judicial avulsa ou ato que interrompeu a prescrição.',
      });
    }

    // 2. Nexo de Causalidade entre Facto e Dano
    if (t.includes('danos') && !t.includes('nexo de causalidade') && !t.includes('563')) {
      pontos.push({
        titulo: 'Vulnerabilidade no Nexo de Causalidade Adequada (Art. 563.º CC)',
        descricao: 'Não se encontra expressamente explicitado o nexo de causalidade na sua formulação negativa/positiva entre a conduta e os prejuízos.',
        contraArgumentoProvavel: 'A contraparte arguirá que os danos invocados decorrem de causa externa, caso fortuito ou culpa do próprio lesado (Art. 570.º CC).',
        baseLegalOponente: 'Art. 563.º e Art. 570.º do Código Civil',
        sugestaoReforco: 'Delinear expressamente como a conduta do Réu foi condição sine qua non e causa adequada dos danos patrimoniais e não patrimoniais.',
      });
    }

    // 3. Exceção Dilatória de Ineptidão por Falta de Causa de Pedir (Art. 186.º CPC)
    if (factosProcesso.length === 0) {
      pontos.push({
        titulo: 'Risco de Ineptidão da Petição Inicial (Art. 186.º, n.º 2, al. a) CPC)',
        descricao: 'Ausência de elenco suficiente de factos concretos geradores do direito alegado.',
        contraArgumentoProvavel: 'A contraparte deduzirá exceção dilatória de ineptidão por omissão da causa de pedir, com vista à absolvição da instância.',
        baseLegalOponente: 'Art. 186.º, n.º 2, al. a) e Art. 577.º, al. b) do Código de Processo Civil',
        sugestaoReforco: 'Preencher a secção "Dos Factos" com articulados circunstanciados de tempo, modo e lugar.',
      });
    }
  }

  if (tipoPeca === 'contestacao') {
    // 1. Ónus de Impugnação Especificada (Art. 574.º n.º 2 CPC)
    if (t.includes('impugna genericamente') || t.includes('impugna-se tudo')) {
      pontos.push({
        titulo: 'Admissão Tácita por Falta de Impugnação Especificada (Art. 574.º CPC)',
        descricao: 'A impugnação por mera negação genérica é ineficaz para factos pessoais ou constantes de documentos autênticos.',
        contraArgumentoProvavel: 'O Autor arguirá em réplica que os factos articulados na Petição Inicial devem ter-se por plenamente confessados e provados por acordo nos termos do Art. 574.º n.º 2 do CPC.',
        baseLegalOponente: 'Art. 574.º, n.º 1 e 2 do Código de Processo Civil',
        sugestaoReforco: 'Impugnar individualmente cada um dos artigos da Petição Inicial, articulando a versão factual positiva alternativa.',
      });
    }

    // 2. Junção Obrigatória de Rol de Testemunhas e Documentos
    if (!t.includes('prova testemunhal') && !t.includes('documentos') && !t.includes('rol')) {
      pontos.push({
        titulo: 'Preclusão Probatória (Art. 572.º al. d) CPC)',
        descricao: 'Não consta do articulado de contestação o rol de testemunhas nem requerimento probatório.',
        contraArgumentoProvavel: 'O Autor suscitará a preclusão do direito de arrolar prova testemunhal por caducidade do momento processual próprio da contestação.',
        baseLegalOponente: 'Art. 572.º, alínea d) do Código de Processo Civil',
        sugestaoReforco: 'Adicionar a secção "Requerimento Probatório" com o Rol de Testemunhas (máximo 10) e documentos em anexo.',
      });
    }
  }

  return pontos;
}

/**
 * Executa a revisão adversarial completa de uma minuta jurídica
 */
export function executarRevisaoAdversarial(
  minutaId: string,
  versaoNum: number,
  tipoPeca: TipoPecaJuridica,
  conteudoMinuta: string,
  factosProcesso: FactoProcessualContexto[]
): RevisaoAdversarial {
  // 1. Extração dos articulados
  const articulados = extrairArticuladosTexto(conteudoMinuta);

  // 2. Deteção de afirmações sem suporte probatório
  const afirmacoesSemSuporte = detetarAfirmacoesSemSuporte(articulados, factosProcesso);

  // 3. Verificação sistemática de citações legais e jurisprudenciais
  const citacoesCheque = verificarCitacoesNoTexto(conteudoMinuta);

  // 4. Simulação de pontos vulneráveis da contraparte
  const pontosVulneraveis = simularPontosVulneraveis(tipoPeca, conteudoMinuta, factosProcesso);

  // 5. Cálculo do risco global
  let riscoGlobal: SeveridadeRisco = 'baixo';
  const temCitacaoInvalida = citacoesCheque.invalidas.length > 0;
  const temAfirmacaoGrave = afirmacoesSemSuporte.some((a) => a.severidade === 'alto');
  const totalAlertas = afirmacoesSemSuporte.length + pontosVulneraveis.length + citacoesCheque.invalidas.length;

  if (temCitacaoInvalida || temAfirmacaoGrave || totalAlertas >= 4) {
    riscoGlobal = 'alto';
  } else if (totalAlertas >= 1) {
    riscoGlobal = 'medio';
  }

  // 6. Sugestões de reforço
  const sugestoesReforco: string[] = [];
  if (temCitacaoInvalida) {
    sugestoesReforco.push('Substituir urgentemente as normas revogadas ou inexistentes pelas disposições legais em vigor.');
  }
  if (afirmacoesSemSuporte.length > 0) {
    sugestoesReforco.push('Conectar cada articulado fáctico a um documento ou fólio dos autos para evitar impugnação vitoriosa.');
  }
  for (const p of pontosVulneraveis) {
    sugestoesReforco.push(p.sugestaoReforco);
  }

  const resumoDeontologico =
    riscoGlobal === 'alto'
      ? 'A minuta apresenta vulnerabilidades críticas (citações inválidas ou afirmações sem suporte) que requerem intervenção antes da submissão no Citius.'
      : riscoGlobal === 'medio'
        ? 'A minuta apresenta coerência geral, mas contém pontos de fricção probatória passíveis de exploração pela contraparte.'
        : 'Minuta com sólida ancoragem probatória e citações legais em vigor.';

  return {
    id: `rev-${Date.now()}`,
    minutaId,
    versaoNum,
    riscoGlobal,
    afirmacoesSemSuporte,
    pontosVulneraveis,
    citacoesInvalidas: citacoesCheque.invalidas,
    sugestoesReforco,
    resumoDeontologico,
    dataRevisao: new Date().toISOString(),
  };
}
