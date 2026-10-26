/**
 * LEX PORTUGAL AI — Tipos para Ingestão Documental, OCR e Extração de Factos
 */

export type FormatoDocumento = 'pdf_nativo' | 'pdf_digitalizado' | 'docx' | 'imagem_scan';

export type TipoDocumentoProcessual =
  | 'peticao'
  | 'contestacao'
  | 'replica'
  | 'treplica'
  | 'sentenca'
  | 'despacho'
  | 'recurso'
  | 'parecer_pericial'
  | 'prova_documental'
  | 'contrato'
  | 'fatura'
  | 'outro';

export type ClassificacaoFacto = 'facto_comprovado' | 'alegacao_parte' | 'facto_controvertido';

export interface ExcerptOrigem {
  documentoId: string;
  nomeDocumento: string;
  pagina: number;
  folio?: string; // ex: "fls. 24 verso"
  textoExato: string;
  contextoAnterior?: string;
  contextoPosterior?: string;
}

export interface FactoExtraido {
  id: string;
  processoId: string;
  documentoId: string;
  classificacao: ClassificacaoFacto;
  descricao: string;
  dataEvento?: string; // Formato YYYY-MM-DD ou data aproximada
  ordemCronologica: number;
  excertoOrigem: string;
  paginaOrigem: number;
  folioOrigem?: string;
  meioProva?: string;
  relevanciaProcessual: 'alta' | 'media' | 'baixa';
  confiancaClassificacao: number; // 0.0 a 1.0
}

export interface RelatorioOCR {
  necessitaOcr: boolean;
  confiancaMedia: number; // ex: 0.88
  paginasComLimitaes: number[];
  avisos: string[];
  deverDeontologicoAviso: string;
  zonasIlegiveis: {
    pagina: number;
    posicao: string;
    motivo: string;
  }[];
}

export interface DocumentoProcessado {
  id: string;
  processoId: string;
  organizacaoId: string;
  nomeFicheiro: string;
  tipoDocumento: TipoDocumentoProcessual;
  formato: FormatoDocumento;
  tamanhoBytes: number;
  numeroPaginas: number;
  conteudoTexto: string;
  relatorioOcr: RelatorioOCR;
  estadoProcessamento: 'pendente' | 'em_processamento' | 'concluido' | 'erro';
  factos: FactoExtraido[];
  createdAt: string;
}

export interface ConfrontoDocumental {
  id: string;
  processoId: string;
  docAId: string;
  docBId: string;
  nomeDocA: string;
  nomeDocB: string;
  titulo: string;
  factosConcordantes: {
    facto: string;
    articuladoA: string;
    articuladoB: string;
    admitidoPorAcordo: boolean;
  }[];
  factosControvertidos: {
    facto: string;
    posicaoAutor: string;
    posicaoReu: string;
    meioProvaOferecido?: string;
  }[];
  contradicoesDiretas: {
    tema: string;
    afirmacaoA: string;
    afirmacaoB: string;
    impactoProbatorio: string;
  }[];
  resumoContraditorio: string;
  createdAt: string;
}
