/**
 * LEX PORTUGAL AI — Motor de Exportação Multiformato de Peças Forenses (Fase 7)
 * Gera articulados canónicos numerados, cabeçalho forense e metadados formais para Citius/DOCX.
 */

import { ExportacaoPecaFormal, MinutaJuridica, TipoPecaJuridica } from './types';
import { extrairArticuladosTexto } from './adversarialReviewer';

export const TITULOS_FORMAIS_PECAS: Record<TipoPecaJuridica, string> = {
  peticao_inicial: 'PETIÇÃO INICIAL (Art. 552.º do CPC)',
  contestacao: 'CONTESTAÇÃO (Art. 569.º do CPC)',
  alegacoes_recurso: 'ALEGAÇÕES DE RECURSO (Art. 637.º do CPC)',
  requerimento_prova: 'REQUERIMENTO PROBATÓRIO (Art. 410.º do CPC)',
  reclamacao: 'RECLAMAÇÃO PARA A CONFERÊNCIA (Art. 652.º do CPC)',
  resposta_excecoes: 'RESPOSTA À MATÉRIA DAS EXCEÇÕES (Art. 584.º do CPC)',
  parecer: 'PARECER JURÍDICO DEONTOLÓGICO',
};

/**
 * Converte a minuta num documento formal canónico pronto para submissão forense
 */
export function formatarPecaParaExportacao(
  minuta: MinutaJuridica,
  detalhesProcesso?: {
    numeroProcessual?: string;
    autorNome?: string;
    reuNome?: string;
    valorCausa?: number;
    advogadoNome?: string;
    cedulaProfissional?: string;
  }
): ExportacaoPecaFormal {
  const tribunal = minuta.tribunal || 'Tribunal Judicial da Comarca de Lisboa';
  const juizo = minuta.juizo || 'Juízo Central Cível — Juiz 1';
  const procNum = detalhesProcesso?.numeroProcessual || 'Proc. n.º 0000/26.0T8LSB';
  const autor = detalhesProcesso?.autorNome || 'Demandante / Autor';
  const reu = detalhesProcesso?.reuNome || 'Demandado / Réu';
  const tituloPeca = TITULOS_FORMAIS_PECAS[minuta.tipoPeca] || minuta.titulo.toUpperCase();

  const cabecalhoForense = [
    `EXCELENTÍSSIMO SENHOR JUIZ DE DIREITO`,
    `DO ${tribunal.toUpperCase()}`,
    `${juizo.toUpperCase()}`,
    ``,
    `Processo n.º: ${procNum}`,
    `AUTOR: ${autor}`,
    `RÉU: ${reu}`,
    ``,
    `──────────────────────────────────────────────────────────────────────────`,
    `                 ${tituloPeca}`,
    `──────────────────────────────────────────────────────────────────────────`,
  ].join('\n');

  // Extrair articulados numerados
  const articuladosRaw = extrairArticuladosTexto(minuta.conteudoAtual);
  const articuladosNumerados = articuladosRaw.map((a) => ({
    numero: `${a.numero}.º`,
    texto: a.texto,
  }));

  // Extrair pedidos ou formular pedido canónico
  const conclusoesEPedido = [
    `Termos em que, e nos melhores de Direito que Vossa Excelência doutamente suprirá, requer-se:`,
    `a) Seja a presente peça julgada totalmente procedente por provada;`,
    `b) Sejam acolhidos os factos e os fundamentos de Direito invocados;`,
    `c) Seja a parte contrária condenada nas respetivas custas e encargos judiciais.`,
  ];

  // Rol de provas
  const rolProvas = [
    { tipo: 'Prova Documental', descricao: 'Documentos n.ºs 1 a 4 juntos aos autos em anexo.' },
    { tipo: 'Prova Testemunhal', descricao: 'Rol de testemunhas a apresentar oportunamente nos termos da lei.' },
  ];

  const advogadoNome = detalhesProcesso?.advogadoNome || 'O Advogado';
  const cedula = detalhesProcesso?.cedulaProfissional ? ` — Cédula Profissional n.º ${detalhesProcesso.cedulaProfissional}` : '';

  const declaracaoDeontologicaAssinatura = [
    `Pede Deferimento,`,
    ``,
    `O Advogado subscritor,`,
    `${advogadoNome}${cedula}`,
    ``,
    `[Assinado digitalmente com certificado forense da Ordem dos Advogados Portugueses]`,
    `Garantia Deontológica: Zero Retenção / Proteção de Segredo Profissional (Art. 92.º EOA)`,
  ].join('\n');

  // Montagem do texto integral formatado
  const corpoArticulados = articuladosNumerados
    .map((a) => `${a.numero}\n${a.texto}\n`)
    .join('\n');

  const textoCompletoFormatado = [
    cabecalhoForense,
    ``,
    `I. DOS FACTOS E DA CAUSA DE PEDIR`,
    ``,
    corpoArticulados || minuta.conteudoAtual,
    ``,
    `II. DO PEDIDO`,
    ``,
    conclusoesEPedido.join('\n'),
    ``,
    `III. JUNÇÕES`,
    rolProvas.map((r) => `— ${r.tipo}: ${r.descricao}`).join('\n'),
    ``,
    detalhesProcesso?.valorCausa ? `VALOR DA CAUSA: € ${detalhesProcesso.valorCausa.toFixed(2)} (nos termos do Art. 296.º do CPC)\n` : '',
    declaracaoDeontologicaAssinatura,
  ].join('\n');

  return {
    minutaId: minuta.id,
    tipoPeca: minuta.tipoPeca,
    titulo: minuta.titulo,
    cabecalhoForense,
    articuladosNumerados,
    conclusoesEPedido,
    rolProvas,
    declaracaoDeontologicaAssinatura,
    textoCompletoFormatado,
    metadadosExportacao: {
      dataExportacao: new Date().toISOString(),
      versao: minuta.versaoAtual,
      sigiloProfissional: 'Art. 92.º EOA — Confidencialidade Absoluta',
      formato: 'Citius_Formatado',
    },
  };
}
