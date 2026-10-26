/**
 * LEX PORTUGAL AI — Serviço de Monitorização e Atualização Controlada de Fontes
 * Normas de referência: Diário da República Eletrónico e Bases Jurídicas Oficiais (DGSI / TC)
 */

import { MetadadosJuridicos, RegistoAtualizacaoFonte } from './types';
import { getDbClient } from '../db/client';

export class ServicoAtualizacaoFontes {
  private static registosFalhas: RegistoAtualizacaoFonte[] = [];

  /**
   * Avalia a integridade temporal de uma fonte jurídica:
   * Verifica se possui data de publicação, data de entrada em vigor e se está marcada como revogada.
   */
  public static avaliarIntegridadeTemporal(fonte: MetadadosJuridicos): {
    valida: boolean;
    motivo?: string;
    desatualizada: boolean;
  } {
    // 1. Deteção de fontes incompletas
    if (!fonte.identificador || !fonte.titulo) {
      return { valida: false, motivo: 'Fonte incompleta: Identificador ou título em falta.', desatualizada: false };
    }

    if (fonte.tipo === 'legislacao' && !fonte.dataEntradaEmVigor && !fonte.dataPublicacaoDR) {
      return {
        valida: false,
        motivo: 'Fonte legislativa incompleta: Inexistência de data de publicação ou entrada em vigor.',
        desatualizada: false,
      };
    }

    // 2. Deteção de normas revogadas
    if (fonte.estadoVigencia === 'revogado') {
      return {
        valida: true,
        motivo: `Norma formalmente revogada${fonte.diplomaRevogatorio ? ` por ${fonte.diplomaRevogatorio}` : ''}.`,
        desatualizada: true,
      };
    }

    return { valida: true, desatualizada: false };
  }

  /**
   * Regista uma tentativa de sincronização ou falha no serviço
   */
  public static registarResultadoVerificacao(
    fonteId: string,
    identificador: string,
    status: 'atualizado' | 'desatualizado' | 'falha_conexao' | 'alteracao_detetada',
    detalhes: string
  ): RegistoAtualizacaoFonte {
    const registo: RegistoAtualizacaoFonte = {
      id: `sync-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fonteId,
      identificador,
      dataVerificacao: new Date().toISOString(),
      status,
      detalhes,
      proximaVerificacao: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    };

    this.registosFalhas.unshift(registo);
    return registo;
  }

  /**
   * Obtém o histórico recente de verificações de fontes
   */
  public static obterHistoricoAtualizacoes(): RegistoAtualizacaoFonte[] {
    return this.registosFalhas.slice(0, 50);
  }

  /**
   * Sincroniza e insere diploma oficial no corpus local com garantia de proveniência
   */
  public static async ingerirFonteAutorizada(
    fonte: MetadadosJuridicos,
    sumario: string,
    artigos: string[]
  ): Promise<{ sucesso: boolean; id?: string; erro?: string }> {
    const avaliacao = this.avaliarIntegridadeTemporal(fonte);
    if (!avaliacao.valida) {
      this.registarResultadoVerificacao(
        fonte.identificador,
        fonte.identificador,
        'falha_conexao',
        avaliacao.motivo || 'Erro de validação temporal'
      );
      return { sucesso: false, erro: avaliacao.motivo };
    }

    try {
      const client = getDbClient();
      const id = `fnt-${Date.now()}`;

      await client.execute({
        sql: `INSERT OR REPLACE INTO fontes_juridicas 
              (id, identificador, titulo, tipo, ramo, entidade_emissora, data_oficial, url_oficial, versao, estado_vigencia, sumario, artigos_relevantes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          fonte.identificador,
          fonte.titulo,
          fonte.tipo,
          fonte.ramo,
          fonte.entidadeEmissora,
          fonte.dataPublicacaoDR || fonte.dataDecisaoJudicial || new Date().toISOString().split('T')[0],
          fonte.urlOficial,
          fonte.versao,
          fonte.estadoVigencia,
          sumario,
          JSON.stringify(artigos),
        ],
      });

      this.registarResultadoVerificacao(
        id,
        fonte.identificador,
        'atualizado',
        `Fonte "${fonte.identificador}" indexada com sucesso com proveniência de ${fonte.urlOficial}.`
      );

      return { sucesso: true, id };
    } catch (err: any) {
      this.registarResultadoVerificacao(
        fonte.identificador,
        fonte.identificador,
        'falha_conexao',
        `Erro ao persistir na base de dados: ${err.message}`
      );
      return { sucesso: false, erro: err.message };
    }
  }
}
