/**
 * LEX PORTUGAL AI — Testes Unitários e de Integração: RAG Híbrido, Integridade Temporal e Vigência
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizarTextoJuridico,
  extrairNumeroArtigo,
  segmentarDiploma,
  extrairTokensLexicais,
} from './pipeline';
import {
  calcularPontuacaoLexical,
  calcularPontuacaoSemantica,
  executarPesquisaHibrida,
} from './hybridSearch';
import { ServicoAtualizacaoFontes } from './updateService';
import {
  CORPUS_JURIDICO_PORTUGAL,
  METADADOS_CPC_2013,
  METADADOS_CPC_1961_REVOGADO,
} from './corpus';
import { MetadadosJuridicos } from './types';

describe('RAG Jurídico — Pipeline de Normalização e Segmentação', () => {
  test('deve normalizar texto jurídico preservando numeração e parágrafos', () => {
    const textoBruto = 'Artigo  138.º   \r\n\r\n\r\n 1  —  O prazo processual é contínuo.   ';
    const normalizado = normalizarTextoJuridico(textoBruto);
    assert.equal(normalizado, 'Artigo 138.º\n\n1 — O prazo processual é contínuo.');
  });

  test('deve extrair com precisão a epígrafe e número de artigo formal português', () => {
    const res1 = extrairNumeroArtigo('Artigo 138.º - Regra da continuidade dos prazos');
    assert.ok(res1);
    assert.equal(res1?.numero, 'Art. 138.º');
    assert.equal(res1?.epigrafe, 'Regra da continuidade dos prazos');

    const res2 = extrairNumeroArtigo('Art. 569.º (Prazo para a contestação)');
    assert.ok(res2);
    assert.equal(res2?.numero, 'Art. 569.º');
    assert.equal(res2?.epigrafe, 'Prazo para a contestação');

    const naoArtigo = extrairNumeroArtigo('Este texto é apenas considerações gerais.');
    assert.equal(naoArtigo, null);
  });

  test('deve segmentar diploma legal vinculando cada fragmento aos metadados', () => {
    const textoDiploma = `
Preâmbulo
Aprova o regime legal dos prazos processuais.

Artigo 1.º - Objeto
O presente diploma regula o processo civil.

Artigo 2.º - Âmbito de aplicação
Aplica-se a todos os tribunais judiciais.
`;
    const fragmentos = segmentarDiploma(textoDiploma, METADADOS_CPC_2013);
    assert.equal(fragmentos.length, 2);
    assert.equal(fragmentos[0].artigoNumero, 'Art. 1.º');
    assert.equal(fragmentos[0].epigrafe, 'Objeto');
    assert.equal(fragmentos[0].metadados.identificador, METADADOS_CPC_2013.identificador);
    assert.equal(fragmentos[1].artigoNumero, 'Art. 2.º');
  });

  test('deve extrair tokens lexicais removendo pontuação e diacríticos', () => {
    const tokens = extrairTokensLexicais('Artigo 138.º: Prazos contínuos e férias judiciais!');
    assert.ok(tokens.includes('artigo'));
    assert.ok(tokens.includes('138º'));
    assert.ok(tokens.includes('prazos'));
    assert.ok(tokens.includes('ferias'));
  });
});

describe('RAG Jurídico — Pesquisa Híbrida e Reordenação por Vigência', () => {
  test('deve priorizar e pontuar correspondência exata de artigo com score elevado', () => {
    const frag138 = CORPUS_JURIDICO_PORTUGAL.find((f) => f.id === 'cpc-art-138')!;
    const pontuacao = calcularPontuacaoLexical('artigo 138 cpc', frag138);

    assert.ok(pontuacao.correspondenciaExata, 'Deveria reconhecer correspondência exata do Art. 138');
    assert.ok(pontuacao.score >= 0.9, 'Pontuação de correspondência exata deve ser >= 0.9');
  });

  test('deve calcular pontuação semântica para conceitos dogmáticos (ex: lucros cessantes)', () => {
    const fragSTJ = CORPUS_JURIDICO_PORTUGAL.find((f) => f.id === 'stj-auj-3-2019')!;
    const scoreSemantico = calcularPontuacaoSemantica('incumprimento e lucros cessantes contrato promessa', fragSTJ);

    assert.ok(scoreSemantico > 0.5, 'Conceito de responsabilidade e lucros cessantes deve pontuar');
  });

  test('deve detetar fontes inexistentes e retornar "fontes insuficientes" para impedir alucinações', () => {
    // Consulta sem respaldo normativo no acervo jurídico português
    const resultado = executarPesquisaHibrida(CORPUS_JURIDICO_PORTUGAL, {
      termo: 'mineração espacial e extração de minerais em asteroides lunares suborbitais',
    });

    assert.equal(resultado.fontesInsuficientes, true);
    assert.ok(resultado.avisoRigor, 'Deveria incluir aviso explícito de insuficiência documental');
    assert.equal(resultado.totalEncontrado, 0);
  });

  test('deve sinalizar expressamente normas revogadas com alerta e despenalização de ranking', () => {
    const resultado = executarPesquisaHibrida(CORPUS_JURIDICO_PORTUGAL, {
      termo: 'prazo processual contínuo suspensão férias judiciais',
    });

    // Encontra o Art. 138.º (em vigor) e o antigo Art. 144.º do CPC de 1961 (revogado)
    const fragRevogado = resultado.resultados.find((r) => r.fragmento.metadados.estadoVigencia === 'revogado');
    const fragEmVigor = resultado.resultados.find((r) => r.fragmento.id === 'cpc-art-138');

    assert.ok(fragEmVigor, 'Deveria conter a norma em vigor');
    if (fragRevogado) {
      assert.ok(fragRevogado.alertaVigencia?.includes('REVOGADA'), 'Deve conter alerta explícito de revogação');
      assert.ok(fragEmVigor.pontuacaoFinal > fragRevogado.pontuacaoFinal, 'Norma em vigor deve ter ranking superior');
    }
  });

  test('filtro apenasEmVigor deve excluir estritamente normas revogadas', () => {
    const resultado = executarPesquisaHibrida(CORPUS_JURIDICO_PORTUGAL, {
      termo: 'prazos processuais',
      apenasEmVigor: true,
    });

    for (const res of resultado.resultados) {
      assert.notEqual(res.fragmento.metadados.estadoVigencia, 'revogado');
    }
  });
});

describe('RAG Jurídico — Integridade Temporal, Fontes Incompletas e Monitorização', () => {
  test('deve rejeitar fonte incompleta sem identificador ou título oficial', () => {
    const fonteIncompleta: MetadadosJuridicos = {
      identificador: '',
      titulo: '',
      tipo: 'legislacao',
      ramo: 'Direito Civil',
      entidadeEmissora: 'Assembleia da República',
      urlOficial: '',
      versao: '1',
      estadoVigencia: 'em_vigor',
      grauVinculacao: 'vinculativo_erga_omnes',
      verificacaoIndependente: 'pendente',
    };

    const avaliacao = ServicoAtualizacaoFontes.avaliarIntegridadeTemporal(fonteIncompleta);
    assert.equal(avaliacao.valida, false);
    assert.ok(avaliacao.motivo?.includes('Fonte incompleta'));
  });

  test('deve rejeitar diploma legislativo sem data de publicação no DR ou de entrada em vigor', () => {
    const legislacaoSemDatas: MetadadosJuridicos = {
      identificador: 'Lei n.º 999/2026',
      titulo: 'Lei Fictícia sem Diário da República',
      tipo: 'legislacao',
      ramo: 'Processo Civil',
      entidadeEmissora: 'Assembleia da República',
      urlOficial: 'https://diariodarepublica.pt',
      versao: '1',
      estadoVigencia: 'em_vigor',
      grauVinculacao: 'vinculativo_erga_omnes',
      verificacaoIndependente: 'pendente',
    };

    const avaliacao = ServicoAtualizacaoFontes.avaliarIntegridadeTemporal(legislacaoSemDatas);
    assert.equal(avaliacao.valida, false);
    assert.ok(avaliacao.motivo?.includes('Inexistência de data de publicação'));
  });

  test('deve sinalizar norma revogada como desatualizada com referência ao diploma revogatório', () => {
    const avaliacao = ServicoAtualizacaoFontes.avaliarIntegridadeTemporal(METADADOS_CPC_1961_REVOGADO);
    assert.equal(avaliacao.valida, true);
    assert.equal(avaliacao.desatualizada, true);
    assert.ok(avaliacao.motivo?.includes('Lei n.º 41/2013'));
  });

  test('deve registar e auditar falhas e sincronizações no serviço de atualização', () => {
    const registo = ServicoAtualizacaoFontes.registarResultadoVerificacao(
      'fnt-teste-dr',
      'Portaria n.º 100/2026',
      'falha_conexao',
      'Tempo de resposta do endpoint oficial do DRE excedeu 5000ms.'
    );

    assert.equal(registo.status, 'falha_conexao');
    assert.ok(registo.detalhes.includes('DRE'));

    const historico = ServicoAtualizacaoFontes.obterHistoricoAtualizacoes();
    assert.ok(historico.some((h) => h.identificador === 'Portaria n.º 100/2026'));
  });
});
