/**
 * LEX PORTUGAL AI — Tipos de Domínio do Direito Português
 */

export type NavigationSection =
  | 'dashboard'
  | 'assistant'
  | 'research'
  | 'library'
  | 'document-analysis'
  | 'drafting'
  | 'clients'
  | 'cases'
  | 'memory'
  | 'audit'
  | 'admin';

export type RamoDireito =
  | 'Direito Constitucional'
  | 'Direito Civil'
  | 'Processo Civil'
  | 'Direito Penal'
  | 'Processo Penal'
  | 'Direito Administrativo'
  | 'Processo Administrativo'
  | 'Direito Fiscal'
  | 'Direito Laboral'
  | 'Direito Comercial e Societário'
  | 'Insolvência e Recuperação'
  | 'Família e Sucessões'
  | 'Contraordenações'
  | 'Registos e Notariado'
  | 'Propriedade Intelectual'
  | 'Proteção de Dados'
  | 'Direito da União Europeia'
  | 'Outro';

export interface Cliente {
  id: string;
  nome: string;
  tipo: 'singular' | 'coletivo';
  nif: string;
  email: string;
  telefone: string;
  morada: string;
  ativo: boolean;
  dataCriacao: string;
  observacoes?: string;
}

export type EstadoProcesso = 'ativo' | 'suspenso' | 'em_recurso' | 'findo' | 'arquivado';

export interface Interveniente {
  nome: string;
  papel: 'autor' | 'reu' | 'assistente' | 'testemunha' | 'perito' | 'contrainteressado' | 'outro';
  nif?: string;
  representanteAdvogado?: string;
}

export interface Processo {
  id: string;
  numeroProcessual: string; // ex: "1245/24.3T8PRT" (formato Citius)
  tribunal: string; // ex: "Tribunal Judicial da Comarca do Porto - Juízo Central Cível"
  especie: string; // ex: "Ação de Processo Comum", "Execução de Título Extrajudicial"
  ramo: RamoDireito;
  clienteId: string;
  clienteNome: string;
  partesContrarias: string[];
  intervenientes: Interveniente[];
  juizRelator?: string;
  valorCausa: number;
  estado: EstadoProcesso;
  faseProcessual: string;
  dataEntrada: string;
  descricao: string;
}

export type TipoPrazo = 'prazo_legal' | 'audiencia' | 'diligencia_judicial' | 'notificacao_citius' | 'pagamento_taxa';

export interface PrazoEvento {
  id: string;
  processoId: string;
  numeroProcesso: string;
  titulo: string;
  dataLimite: string; // YYYY-MM-DD
  tipo: TipoPrazo;
  urgente: boolean;
  cumprido: boolean;
  baseLegal: string; // ex: "Art. 569.º do CPC (Contestação - 30 dias)"
  diasRestantes?: number;
}

export type TipoFonte = 'legislacao' | 'jurisprudencia' | 'doutrina' | 'parecer_oficial';
export type EstadoVigencia = 'em_vigor' | 'revogado' | 'alterado' | 'vigencia_parcial' | 'transitorio';

export interface FonteJuridica {
  id: string;
  identificador: string; // ex: "Lei n.º 62/2013", "Acórdão do STJ Proc. 142/21.6"
  titulo: string;
  tipo: TipoFonte;
  ramo: RamoDireito;
  entidadeEmissora: string; // "Assembleia da República", "Supremo Tribunal de Justiça", etc.
  data: string;
  urlOficial: string;
  versao: string;
  estadoVigencia: EstadoVigencia;
  artigosRelevantes: string[];
  sumario: string;
  textoIntegral?: string;
}

export type EstadoMinuta = 'rascunho' | 'em_revisao' | 'verificada' | 'pronta_assinatura';

export interface MinutaJuridica {
  id: string;
  processoId: string;
  numeroProcessual: string;
  titulo: string;
  tipoPeca: string; // "Contestação", "Petição Inicial", "Recurso de Apelação", "Requerimento Probatório"
  versao: number;
  estado: EstadoMinuta;
  conteudo: string;
  fundamentacaoLegal: string[];
  jurisprudenciaCitada: string[];
  dataCriacao: string;
  dataAtualizacao: string;
}

export type TipoMemoria = 'operacional' | 'semantica' | 'melhoria';

export interface MemoriaRegisto {
  id: string;
  tipo: TipoMemoria;
  processoId?: string;
  clienteId?: string;
  titulo: string;
  conteudo: string;
  proveniencia: string; // ex: "Despacho Saneador fls. 84", "Conferência de Clientes 12/04"
  dataRegisto: string;
  valido: boolean;
}

export interface RegistoAuditoria {
  id: string;
  dataHora: string;
  utilizador: string;
  acao: string;
  entidade: string;
  detalhes: string;
  status: 'confirmado' | 'alerta' | 'erro';
}

export interface DocumentoAnalisado {
  id: string;
  processoId: string;
  nomeFicheiro: string;
  tamanhoBytes: number;
  tipoMime: string;
  dataCarregamento: string;
  tipoDocumental: 'peticao' | 'contestacao' | 'sentenca' | 'despacho' | 'prova_documental' | 'fatura' | 'outro';
  formato?: 'pdf_nativo' | 'pdf_digitalizado' | 'docx' | 'imagem_scan';
  confiancaOcr?: number;
  necessitaOcr?: boolean;
  avisosOcr?: string[];
  deverDeontologicoAviso?: string;
  partesIdentificadas: string[];
  datasRelevantes: { data: string; descricao: string }[];
  pedidosEFundamentos: string[];
  possiveisContradicoes: string[];
  estadoExtracao: 'processado' | 'em_analise' | 'erro';
  factos?: {
    id: string;
    classificacao: 'facto_comprovado' | 'alegacao_parte' | 'facto_controvertido';
    descricao: string;
    dataEvento?: string;
    ordemCronologica: number;
    excertoOrigem: string;
    paginaOrigem: number;
    folioOrigem?: string;
    meioProva?: string;
    confiancaClassificacao: number;
  }[];
}

export interface ConfiguracaoSistema {
  nomeEscritorio: string;
  cedulaProfissional: string;
  comarcaSede: string;
  modeloGeminiPadrao: string;
  temperatura: number;
  verificacaoRigorosaFontes: boolean;
  notificacoesPrazosDias: number;
  diasRetencaoLogs: number;
}
