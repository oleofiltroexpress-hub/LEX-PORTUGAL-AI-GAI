/**
 * LEX PORTUGAL AI — Salvaguarda Deontológica e Garantia de Zero-Training
 * Conforme Art. 92.º do Estatuto da Ordem dos Advogados (Segredo Profissional)
 * 
 * Regra Estrita: Não treinar automaticamente modelos com dados confidenciais.
 */

export interface EnvelopePrivacidade {
  dados: any;
  confidencialNaoTreinar: true;
  politicaRetencaoZero: true;
  salvaguardaDeontologica: string;
  timestamp: string;
  assinaturaPrivacidade: string;
}

export const AVISO_SEGREDO_PROFISSIONAL =
  'AVISO LEGAL E DEONTOLÓGICO: Todos os elementos fácticos, minutas e notas deste processo estão cobertos pelo Segredo Profissional da Advocacia (Art. 92.º do EOA). É estritamente vedada a utilização destes dados para treino, afinação ou retenção secundária de modelos de inteligência artificial.';

/**
 * Envolve qualquer payload de processo numa salvaguarda inviolável de não-treino.
 */
export function envolverComSalvaguardaNaoTreino<T>(dados: T, contextoProcessoId: string): EnvelopePrivacidade {
  return {
    dados,
    confidencialNaoTreinar: true,
    politicaRetencaoZero: true,
    salvaguardaDeontologica: AVISO_SEGREDO_PROFISSIONAL,
    timestamp: new Date().toISOString(),
    assinaturaPrivacidade: `LEX-ZERO-TRAIN-${contextoProcessoId}-${Date.now()}`,
  };
}

/**
 * Valida se um objeto ou pedido cumpre o requisito obrigatório de não-treino.
 * Lança erro deontológico caso a flag não esteja explicitamente ativa.
 */
export function validarNaoTreinoObrigatorio(envelope: { confidencialNaoTreinar?: boolean | number }): void {
  const eValido =
    envelope.confidencialNaoTreinar === true ||
    envelope.confidencialNaoTreinar === 1;

  if (!eValido) {
    throw new Error(
      'Violação Deontológica (Art. 92.º EOA): Tentativa de processamento de minuta jurídica sem garantia expressa de NÃO-TREINO de modelos com dados confidenciais do cliente.'
    );
  }
}

/**
 * Sanitiza identificadores sensíveis (NIF, IBAN, Contactos) para consultas que precisem de anonimização.
 */
export function anonimizarDadosSensiveis(texto: string): string {
  if (!texto) return '';

  return texto
    // Sanitizar NIFs portugueses (9 dígitos)
    .replace(/\b\d{9}\b/g, '[NIF_PROTEGIDO]')
    // Sanitizar IBANs portugueses (PT50 + 21 dígitos)
    .replace(/\bPT50\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{1}\b/gi, '[IBAN_PROTEGIDO]')
    // Sanitizar emails
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_PROTEGIDO]')
    // Sanitizar telemóveis portugueses (iniciados por 91, 92, 93, 96 com 9 dígitos)
    .replace(/\b(?:9[1236]\d{7})\b/g, '[TELEFONE_PROTEGIDO]');
}
