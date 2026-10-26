/**
 * LEX PORTUGAL AI — Tipos para Redação de Minutas Jurídicas,
 * Verificação de Citações, Versões, Revisão Adversarial e Feedback Supervisionado (Fase 7)
 */

export type TipoPecaJuridica =
  | 'peticao_inicial'
  | 'contestacao'
  | 'alegacoes_recurso'
  | 'requerimento_prova'
  | 'reclamacao'
  | 'resposta_excecoes'
  | 'parecer';

export type EstadoMinuta = 'rascunho' | 'em_revisao' | 'aprovado' | 'rejeitado';

export type SeveridadeRisco = 'baixo' | 'medio' | 'alto';

export type DecisaoSupervisao = 'aprovado' | 'rejeitado' | 'ajustes_solicitados';

export type TipoInvalicacaoCitacao =
  | 'norma_revogada'
  | 'inexistente'
  | 'sem_suporte_dogmatico'
  | 'jurisprudencia_ultrapassada';

export interface CitacaoVerificada {
  citacaoOriginal: string;
  artigo?: string;
  diploma?: string;
  valida: boolean;
  estadoVigencia: 'em_vigor' | 'revogado' | 'inexistente' | 'desconhecido';
  tipoInvalicacao?: TipoInvalicacaoCitacao;
  detalhe: string;
  normaAlternativaSugerida?: string;
  urlOficial?: string;
}

export interface AfirmacaoSemSuporte {
  articuladoNumero: number;
  texto: string;
  motivo: string;
  severidade: SeveridadeRisco;
  sugestaoRemediacao: string;
  faltaProvaDocumental: boolean;
}

export interface PontoVulneravel {
  titulo: string;
  descricao: string;
  contraArgumentoProvavel: string;
  baseLegalOponente: string;
  sugestaoReforco: string;
}

export interface RevisaoAdversarial {
  id: string;
  minutaId: string;
  versaoNum: number;
  riscoGlobal: SeveridadeRisco;
  afirmacoesSemSuporte: AfirmacaoSemSuporte[];
  pontosVulneraveis: PontoVulneravel[];
  citacoesInvalidas: CitacaoVerificada[];
  sugestoesReforco: string[];
  resumoDeontologico: string;
  dataRevisao: string;
}

export interface MemoriaProveniencia {
  id: string;
  organizacaoId: string;
  processoId: string;
  minutaId?: string;
  chaveConceito: string;
  factosUtilizados: {
    id: string;
    classificacao: 'facto_comprovado' | 'alegacao_parte' | 'facto_controvertido';
    folio?: string;
    excerto: string;
  }[];
  fontesRagUtilizadas: {
    artigo?: string;
    diploma: string;
    vigencia: string;
    grauVinculacao: string;
  }[];
  confidencialNaoTreinar: boolean;
  createdAt: string;
}

export interface FeedbackSupervisionado {
  id: string;
  minutaId: string;
  advogadoId: string;
  advogadoNome?: string;
  decisao: DecisaoSupervisao;
  notasDeontologicas: string;
  motivoRejeicao?: string;
  conformidadeOrdem: boolean;
  createdAt: string;
}

export interface VersaoMinuta {
  id: string;
  minutaId: string;
  numeroVersao: number;
  conteudo: string;
  diferencasResumo: string;
  motivoAlteracao?: string;
  criadoPor: string;
  createdAt: string;
}

export interface MinutaJuridica {
  id: string;
  organizacaoId: string;
  processoId: string;
  tipoPeca: TipoPecaJuridica;
  titulo: string;
  tribunal?: string;
  juizo?: string;
  conteudoAtual: string;
  versaoAtual: number;
  estado: EstadoMinuta;
  criadoPor: string;
  createdAt: string;
  updatedAt: string;
  revisaoAdversarial?: RevisaoAdversarial;
  feedbacks?: FeedbackSupervisionado[];
  versoes?: VersaoMinuta[];
  memoriasProveniencia?: MemoriaProveniencia[];
}

export interface OpcoesGeracaoMinuta {
  processoId: string;
  tipoPeca: TipoPecaJuridica;
  titulo?: string;
  tribunal?: string;
  juizo?: string;
  autorNome?: string;
  reuNome?: string;
  instrucoesEspecificas?: string;
  factosIdsSelecionados?: string[];
  apenasFactosProvados?: boolean;
}

export interface ExportacaoPecaFormal {
  minutaId: string;
  tipoPeca: TipoPecaJuridica;
  titulo: string;
  cabecalhoForense: string;
  articuladosNumerados: { numero: string; texto: string }[];
  conclusoesEPedido: string[];
  rolProvas: { tipo: string; descricao: string }[];
  declaracaoDeontologicaAssinatura: string;
  textoCompletoFormatado: string;
  metadadosExportacao: {
    dataExportacao: string;
    versao: number;
    sigiloProfissional: string;
    formato: 'Citius_Formatado' | 'DOCX_Payload' | 'PDF_Forense';
  };
}
