import test from 'node:test';
import assert from 'node:assert/strict';
import {
  eFimDeSemana,
  eFeriadoNacionalFixo,
  eDiaUtil,
  estaEmFeriasJudiciais,
  ajustarTermoParaDiaUtil,
  calcularDiasRestantes,
  formatarDataISO,
} from './deadlines';

test('eFimDeSemana deteta sábados e domingos corretamente', () => {
  const sabado = new Date(2026, 9, 24); // 24 de outubro de 2026 = Sábado
  const domingo = new Date(2026, 9, 25); // 25 de outubro de 2026 = Domingo
  const segunda = new Date(2026, 9, 26); // 26 de outubro de 2026 = Segunda

  assert.equal(eFimDeSemana(sabado), true);
  assert.equal(eFimDeSemana(domingo), true);
  assert.equal(eFimDeSemana(segunda), false);
});

test('eFeriadoNacionalFixo reconhece feriados obrigatórios em Portugal', () => {
  const diaLiberdade = new Date(2026, 3, 25); // 25 de abril
  const diaNormal = new Date(2026, 3, 24);

  assert.equal(eFeriadoNacionalFixo(diaLiberdade), true);
  assert.equal(eFeriadoNacionalFixo(diaNormal), false);
});

test('eDiaUtil rejeita fins de semana e feriados fixos', () => {
  const natal = new Date(2026, 11, 25); // 25 de dezembro
  const quartaUtil = new Date(2026, 9, 28); // 28 de outubro

  assert.equal(eDiaUtil(natal), false);
  assert.equal(eDiaUtil(quartaUtil), true);
});

test('estaEmFeriasJudiciais deteta férias de Verão e Natal (art. 28.º LOSJ)', () => {
  const julhoFerias = new Date(2026, 6, 20); // 20 de julho
  const agostoFerias = new Date(2026, 7, 10); // 10 de agosto
  const junhoNormal = new Date(2026, 5, 15); // 15 de junho
  const natalFerias = new Date(2026, 11, 24); // 24 de dezembro

  assert.equal(estaEmFeriasJudiciais(julhoFerias), true);
  assert.equal(estaEmFeriasJudiciais(agostoFerias), true);
  assert.equal(estaEmFeriasJudiciais(junhoNormal), false);
  assert.equal(estaEmFeriasJudiciais(natalFerias), true);
});

test('ajustarTermoParaDiaUtil prorroga para o 1.º dia útil seguinte (art. 138.º CPC)', () => {
  // Sábado, 24 de Outubro de 2026 -> deve transferir para Segunda, 26 de Outubro de 2026
  const sabado = new Date(2026, 9, 24);
  const ajustado = ajustarTermoParaDiaUtil(sabado);

  assert.equal(formatarDataISO(ajustado), '2026-10-26');
});

test('calcularDiasRestantes calcula a diferença exata de dias', () => {
  const diferenca = calcularDiasRestantes('2026-10-30', '2026-10-26');
  assert.equal(diferenca, 4);

  const hoje = calcularDiasRestantes('2026-10-26', '2026-10-26');
  assert.equal(hoje, 0);

  const passado = calcularDiasRestantes('2026-10-20', '2026-10-26');
  assert.equal(passado, -6);
});
