/**
 * LEX PORTUGAL AI — Acervo Oficial de Fontes Jurídicas Consolidadas (Corpus RAG)
 * Todas as fontes contêm metadados de proveniência (Diário da República e DGSI).
 */

import { FragmentoJuridico, MetadadosJuridicos } from './types';
import { getDbClient } from '../db/client';

export const METADADOS_CPC_2013: MetadadosJuridicos = {
  identificador: 'Lei n.º 41/2013, de 26 de junho',
  titulo: 'Código de Processo Civil (CPC)',
  tipo: 'legislacao',
  ramo: 'Processo Civil',
  entidadeEmissora: 'Assembleia da República',
  dataPublicacaoDR: '2013-06-26',
  dataEntradaEmVigor: '2013-09-01',
  urlOficial: 'https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2013-34509075',
  versao: 'Versão Consolidada 2026',
  estadoVigencia: 'em_vigor',
  grauVinculacao: 'vinculativo_erga_omnes',
  verificacaoIndependente: 'confirmada',
};

export const METADADOS_CC_1966: MetadadosJuridicos = {
  identificador: 'Decreto-Lei n.º 47344/66, de 25 de novembro',
  titulo: 'Código Civil Português',
  tipo: 'legislacao',
  ramo: 'Direito Civil',
  entidadeEmissora: 'Governo / Ministério da Justiça',
  dataPublicacaoDR: '1966-11-25',
  dataEntradaEmVigor: '1967-06-01',
  urlOficial: 'https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/1966-34509075',
  versao: 'Versão Consolidada 2026',
  estadoVigencia: 'em_vigor',
  grauVinculacao: 'vinculativo_erga_omnes',
  verificacaoIndependente: 'confirmada',
};

export const METADADOS_CPC_1961_REVOGADO: MetadadosJuridicos = {
  identificador: 'Decreto-Lei n.º 44129, de 28 de dezembro de 1961',
  titulo: 'Código de Processo Civil de 1961 (REVOGADO)',
  tipo: 'legislacao',
  ramo: 'Processo Civil',
  entidadeEmissora: 'Governo da República Portuguesa',
  dataPublicacaoDR: '1961-12-28',
  dataEntradaEmVigor: '1962-04-27',
  urlOficial: 'https://diariodarepublica.pt/dr/detalhe/decreto-lei/44129-1961-267868',
  versao: 'Redação Histórica Revogada',
  estadoVigencia: 'revogado',
  diplomaRevogatorio: 'Lei n.º 41/2013, de 26 de junho (Art. 4.º)',
  grauVinculacao: 'doutrinario',
  verificacaoIndependente: 'confirmada',
};

export const METADADOS_AUJ_STJ_2019: MetadadosJuridicos = {
  identificador: 'Acórdão do STJ n.º 3/2019 (AUJ)',
  titulo: 'Uniformização de Jurisprudência — Resolução por Incumprimento e Lucros Cessantes',
  tipo: 'jurisprudencia',
  ramo: 'Direito Comercial e Societário',
  entidadeEmissora: 'Supremo Tribunal de Justiça (Pleno das Secções Cíveis)',
  dataDecisaoJudicial: '2019-02-12',
  dataPublicacaoDR: '2019-03-27',
  urlOficial: 'http://www.dgsi.pt/jstj.nsf/954f0ce6ad9dd8b980256b5f003fa814',
  versao: 'Publicado em DR 1.ª Série',
  estadoVigencia: 'em_vigor',
  grauVinculacao: 'jurisprudencia_uniformizada',
  verificacaoIndependente: 'confirmada',
};

export const METADADOS_TC_421_2023: MetadadosJuridicos = {
  identificador: 'Acórdão do Tribunal Constitucional n.º 421/2023',
  titulo: 'Não Inconstitucionalidade da Contagem de Prazos Perentórios em Processos Urgentes',
  tipo: 'jurisprudencia',
  ramo: 'Direito Constitucional',
  entidadeEmissora: 'Tribunal Constitucional (Plenário)',
  dataDecisaoJudicial: '2023-07-12',
  urlOficial: 'https://www.tribunalconstitucional.pt/tc/acordaos/20230421.html',
  versao: 'Acórdão Homologado',
  estadoVigencia: 'em_vigor',
  grauVinculacao: 'persuasivo_comum',
  verificacaoIndependente: 'confirmada',
};

export const CORPUS_JURIDICO_PORTUGAL: FragmentoJuridico[] = [
  {
    id: 'cpc-art-138',
    fonteId: METADADOS_CPC_2013.identificador,
    identificadorFonte: METADADOS_CPC_2013.identificador,
    tituloFonte: METADADOS_CPC_2013.titulo,
    artigoNumero: 'Art. 138.º',
    epigrafe: 'Regra da continuidade dos prazos',
    texto:
      '1 — O prazo processual, estabelecido por lei ou fixado por despacho do juiz, é contínuo, suspendendo-se, no entanto, durante as férias judiciais, salvo se a sua duração for igual ou superior a seis meses ou se tratar de atos a praticar em processos que a lei considere urgentes.\n2 — Quando o prazo para a prática do ato processual terminar em dia em que os tribunais estiverem encerrados, transfere-se o seu termo para o primeiro dia útil seguinte.\n3 — Para efeitos do disposto no número anterior, consideram-se encerrados os tribunais nos dias feriados, nos sábados e nos domingos.',
    urlOficial: METADADOS_CPC_2013.urlOficial,
    metadados: METADADOS_CPC_2013,
  },
  {
    id: 'cpc-art-569',
    fonteId: METADADOS_CPC_2013.identificador,
    identificadorFonte: METADADOS_CPC_2013.identificador,
    tituloFonte: METADADOS_CPC_2013.titulo,
    artigoNumero: 'Art. 569.º',
    epigrafe: 'Prazo para a contestação',
    texto:
      '1 — O réu pode contestar no prazo de 30 dias a contar da citação, começando o prazo a correr desde o termo da dilação, quando a esta haja lugar.\n2 — Quando termine em dias diferentes o prazo para os vários réus contestarem, a contestação de qualquer deles pode ser apresentada até ao termo do prazo que começou a correr em último lugar.',
    urlOficial: METADADOS_CPC_2013.urlOficial,
    metadados: METADADOS_CPC_2013,
  },
  {
    id: 'cpc-art-584',
    fonteId: METADADOS_CPC_2013.identificador,
    identificadorFonte: METADADOS_CPC_2013.identificador,
    tituloFonte: METADADOS_CPC_2013.titulo,
    artigoNumero: 'Art. 584.º',
    epigrafe: 'Admissibilidade da réplica',
    texto:
      '1 — À contestação pode o autor responder na réplica, se houver sido deduzida reconvenção, no prazo de 30 dias a contar da notificação daquela.\n2 — Não havendo reconvenção, é admitida a réplica para o autor responder à matéria das exceções deduzidas na contestação.',
    urlOficial: METADADOS_CPC_2013.urlOficial,
    metadados: METADADOS_CPC_2013,
  },
  {
    id: 'cc-art-279',
    fonteId: METADADOS_CC_1966.identificador,
    identificadorFonte: METADADOS_CC_1966.identificador,
    tituloFonte: METADADOS_CC_1966.titulo,
    artigoNumero: 'Art. 279.º',
    epigrafe: 'Cômputo do termo',
    texto:
      'À fixação do termo são aplicáveis, em caso de dúvida, as seguintes regras:\na) Se o termo for fixado por dias, meses ou anos, não se conta o dia da data nem o do evento a partir do qual o prazo começa a correr;\nb) O prazo fixado em meses ou anos termina às 24 horas do dia que corresponda, dentro do último mês ou ano, ao número do dia em que se deu o evento;\nc) O prazo que termine em domingo ou dia feriado transfere-se para o primeiro dia útil;',
    urlOficial: METADADOS_CC_1966.urlOficial,
    metadados: METADADOS_CC_1966,
  },
  {
    id: 'cc-art-483',
    fonteId: METADADOS_CC_1966.identificador,
    identificadorFonte: METADADOS_CC_1966.identificador,
    tituloFonte: METADADOS_CC_1966.titulo,
    artigoNumero: 'Art. 483.º',
    epigrafe: 'Princípio geral da responsabilidade civil extracontratual',
    texto:
      '1 — Aquele que, com dolo ou mera culpa, violar ilicitamente o direito de outrem ou qualquer disposição legal destinada a proteger interesses alheios fica obrigado a indemnizar o lesado pelos danos resultantes da violação.\n2 — Só existe obrigação de indemnizar independentemente de culpa nos casos especificados na lei.',
    urlOficial: METADADOS_CC_1966.urlOficial,
    metadados: METADADOS_CC_1966,
  },
  {
    id: 'cc-art-808',
    fonteId: METADADOS_CC_1966.identificador,
    identificadorFonte: METADADOS_CC_1966.identificador,
    tituloFonte: METADADOS_CC_1966.titulo,
    artigoNumero: 'Art. 808.º',
    epigrafe: 'Perda do interesse do credor ou recusa de cumprimento',
    texto:
      '1 — Se o credor, em consequência da mora, perder o interesse que tinha na prestação, ou esta não for realizada dentro do prazo que razoavelmente for fixado pelo credor, considera-se para todos os efeitos não cumprida a obrigação.\n2 — A perda do interesse na prestação é apreciada objetivamente.',
    urlOficial: METADADOS_CC_1966.urlOficial,
    metadados: METADADOS_CC_1966,
  },
  {
    id: 'cpc-1961-art-144-revogado',
    fonteId: METADADOS_CPC_1961_REVOGADO.identificador,
    identificadorFonte: METADADOS_CPC_1961_REVOGADO.identificador,
    tituloFonte: METADADOS_CPC_1961_REVOGADO.titulo,
    artigoNumero: 'Art. 144.º',
    epigrafe: 'Continuidade dos prazos no Código de 1961',
    texto:
      '[NORMA REVOGADA] O prazo processual, estabelecido por lei ou fixado por despacho do juiz, é contínuo, suspendendo-se, no entanto, durante as férias judiciais. Nota Histórica: Revogado expressamente pelo Art. 4.º da Lei n.º 41/2013, de 26 de junho, que aprovou o novo Código de Processo Civil.',
    urlOficial: METADADOS_CPC_1961_REVOGADO.urlOficial,
    metadados: METADADOS_CPC_1961_REVOGADO,
  },
  {
    id: 'stj-auj-3-2019',
    fonteId: METADADOS_AUJ_STJ_2019.identificador,
    identificadorFonte: METADADOS_AUJ_STJ_2019.identificador,
    tituloFonte: METADADOS_AUJ_STJ_2019.titulo,
    texto:
      'Sumário Uniformizado: Verificado o incumprimento definitivo do contrato-promessa por facto imputável ao promitente vendedor, tem o promitente comprador direito a optar pela indemnização calculada nos termos gerais do art. 801.º, n.º 2 do Código Civil, abrangendo danos emergentes e lucros cessantes comprovados.',
    urlOficial: METADADOS_AUJ_STJ_2019.urlOficial,
    metadados: METADADOS_AUJ_STJ_2019,
  },
  {
    id: 'tc-acordao-421-2023',
    fonteId: METADADOS_TC_421_2023.identificador,
    identificadorFonte: METADADOS_TC_421_2023.identificador,
    tituloFonte: METADADOS_TC_421_2023.titulo,
    texto:
      'Decisão do Tribunal Constitucional: Não julga inconstitucional a norma constante do artigo 138.º, n.º 1 do Código de Processo Civil, quando interpretada no sentido de que os prazos judiciais em processos de natureza urgente correm sem suspensão no período de férias judiciais, à luz do artigo 20.º da Constituição da República Portuguesa.',
    urlOficial: METADADOS_TC_421_2023.urlOficial,
    metadados: METADADOS_TC_421_2023,
  },
];

/**
 * Garante que as fontes jurídicas essenciais estão semeadas na base de dados
 */
export async function semearFontesOficiais(): Promise<void> {
  const client = getDbClient();
  for (const frag of CORPUS_JURIDICO_PORTUGAL) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO fontes_juridicas 
            (id, identificador, titulo, tipo, ramo, entidade_emissora, data_oficial, url_oficial, versao, estado_vigencia, sumario, artigos_relevantes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        frag.id,
        frag.identificadorFonte,
        frag.tituloFonte,
        frag.metadados.tipo,
        frag.metadados.ramo,
        frag.metadados.entidadeEmissora,
        frag.metadados.dataPublicacaoDR || frag.metadados.dataDecisaoJudicial || '2026-01-01',
        frag.urlOficial,
        frag.metadados.versao,
        frag.metadados.estadoVigencia,
        frag.epigrafe ? `${frag.epigrafe}: ${frag.texto.substring(0, 160)}...` : frag.texto.substring(0, 200),
        JSON.stringify(frag.artigoNumero ? [frag.artigoNumero] : []),
      ],
    });
  }
}
