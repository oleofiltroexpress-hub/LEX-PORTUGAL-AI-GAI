/**
 * LEX PORTUGAL AI — Tipos do Pipeline RAG e Atualização de Fontes
 */

import { RamoDireito, EstadoVigencia, TipoFonte } from '../../types';

export interface MetadadosJuridicos {
  identificador: string; // ex: "Lei n.º 41/2013", "Acórdão do STJ Proc. 142/21.6"
  titulo: string;
  tipo: TipoFonte;
  ramo: RamoDireito;
  entidadeEmissora: string; // "Assembleia da República", "STJ", etc.
  dataPublicacaoDR?: string; // Data de publicação no Diário da República
  dataDecisaoJudicial?: string; // Data do acórdão
  dataEntradaEmVigor?: string; // Data efetiva de início de vigência
  disposicoesTransitorias?: string;
  urlOficial: string;
  versao: string;
  estadoVigencia: EstadoVigencia;
  diplomaRevogatorio?: string; // Se revogado, qual a lei revogatória
  alteracoesConhecidas?: string[];
  grauVinculacao: 'vinculativo_erga_omnes' | 'jurisprudencia_uniformizada' | 'persuasivo_comum' | 'doutrinario';
  verificacaoIndependente: 'confirmada' | 'parcialmente_confirmada' | 'nao_confirmada' | 'pendente';
}

export interface FragmentoJuridico {
  id: string;
  fonteId: string;
  identificadorFonte: string;
  tituloFonte: string;
  artigoNumero?: string; // ex: "Art. 138.º"
  epigrafe?: string; // ex: "Regra da continuidade dos prazos"
  texto: string;
  urlOficial: string;
  metadados: MetadadosJuridicos;
}

export interface OpcoesPesquisaHibrida {
  termo: string;
  modo?: 'hibrida' | 'lexical' | 'semantica';
  ramo?: string;
  tipoFonte?: string;
  apenasEmVigor?: boolean;
  tribunal?: string;
  limite?: number;
}

export interface ResultadoRecuperacao {
  fragmento: FragmentoJuridico;
  pontuacaoLexical: number;
  pontuacaoSemantica: number;
  pontuacaoFinal: number;
  correspondenciaExata: boolean;
  alertaVigencia?: string;
}

export interface RespostaPesquisaRAG {
  consulta: string;
  totalEncontrado: number;
  resultados: ResultadoRecuperacao[];
  fontesInsuficientes: boolean;
  avisoRigor?: string;
}

export interface RegistoAtualizacaoFonte {
  id: string;
  fonteId: string;
  identificador: string;
  dataVerificacao: string;
  status: 'atualizado' | 'desatualizado' | 'falha_conexao' | 'alteracao_detetada';
  detalhes: string;
  proximaVerificacao?: string;
}
