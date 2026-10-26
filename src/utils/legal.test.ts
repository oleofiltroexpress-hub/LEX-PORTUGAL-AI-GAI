import test from 'node:test';
import assert from 'node:assert/strict';
import { validarNIFPortugues, verificarConflitoInteresses, normalizarTexto } from './legal';
import { Cliente, Processo } from '../types';

test('normalizarTexto remove acentos e converte para minúsculas', () => {
  assert.equal(normalizarTexto('Acórdão da Relação do Porto'), 'acordao da relacao do porto');
});

test('validarNIFPortugues valida NIFs válidos e inválidos', () => {
  // NIFs válidos conhecidos (algoritmo módulo 11 português):
  // 502011475 (NIPC genérico de teste / entidade pública)
  // 220023450 (Singular fictício com checksum correto)
  assert.equal(validarNIFPortugues('123'), false); // Curto
  assert.equal(validarNIFPortugues('123456788'), false); // Checksum incorreto (deveria ser 9)
  assert.equal(validarNIFPortugues('502011475'), true); // NIPC válido
});

test('verificarConflitoInteresses deteta parte contrária em processo ativo', () => {
  const clientesMock: Cliente[] = [
    {
      id: 'c1',
      nome: 'Sociedade de Construções Norte, Lda.',
      tipo: 'coletivo',
      nif: '501234567',
      email: 'geral@norte.pt',
      telefone: '+351 220 000 000',
      morada: 'Porto',
      ativo: true,
      dataCriacao: '2026-01-10',
    },
  ];

  const processosMock: Processo[] = [
    {
      id: 'p1',
      numeroProcessual: '450/24.1T8PRT',
      tribunal: 'Tribunal Judicial da Comarca do Porto',
      especie: 'Ação de Processo Comum',
      ramo: 'Direito Civil',
      clienteId: 'c1',
      clienteNome: 'Sociedade de Construções Norte, Lda.',
      partesContrarias: ['Empreiteiros do Douro, S.A.'],
      intervenientes: [],
      valorCausa: 45000,
      estado: 'ativo',
      faseProcessual: 'Articulados',
      dataEntrada: '2026-02-01',
      descricao: 'Cobrança de dívida',
    },
  ];

  const conflitos = verificarConflitoInteresses(
    'Empreiteiros do Douro',
    '509999999',
    clientesMock,
    processosMock
  );

  assert.equal(conflitos.length >= 1, true);
  assert.equal(conflitos[0].nivel, 'alto');
  assert.match(conflitos[0].detalhe, /450\/24\.1T8PRT/);
});
