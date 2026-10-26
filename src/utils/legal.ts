/**
 * LEX PORTUGAL AI — Utilitários de Validação Jurídica e Deteção de Conflitos de Interesses
 * Estatuto da Ordem dos Advogados (Lei n.º 145/2015, Art. 99.º - Conflito de Interesses)
 */

import { Cliente, Processo } from '../types';

export interface AlertaConflito {
  nivel: 'alto' | 'medio' | 'baixo';
  motivo: string;
  detalhe: string;
  processoId?: string;
  clienteExistente?: string;
}

/**
 * Normaliza strings para comparação fonética/lexical sem diacríticos
 */
export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Deteção preliminar de potenciais conflitos de interesses
 * Verifica se um novo interveniente/cliente coincide com partes contrárias em processos ativos
 * ou com clientes existentes.
 */
export function verificarConflitoInteresses(
  nomePesquisa: string,
  nifPesquisa: string,
  clientes: Cliente[],
  processos: Processo[]
): AlertaConflito[] {
  const alertas: AlertaConflito[] = [];
  const nomeNorm = normalizarTexto(nomePesquisa);
  const nifNorm = nifPesquisa.trim().replace(/\s+/g, '');

  if (!nomeNorm && !nifNorm) {
    return alertas;
  }

  // 1. Verificar se o NIF já existe como cliente
  if (nifNorm) {
    const clienteNif = clientes.find((c) => c.nif.trim() === nifNorm);
    if (clienteNif) {
      alertas.push({
        nivel: 'medio',
        motivo: 'Identificação Fiscal Duplicada',
        detalhe: `O NIF ${nifNorm} já pertence ao cliente registado "${clienteNif.nome}" (ID: ${clienteNif.id}).`,
        clienteExistente: clienteNif.nome,
      });
    }
  }

  // 2. Verificar se o nome ou NIF consta como Parte Contrária em processo ativo
  for (const proc of processos) {
    if (proc.estado === 'findo' || proc.estado === 'arquivado') continue;

    for (const contraria of proc.partesContrarias) {
      const contrariaNorm = normalizarTexto(contraria);
      if (contrariaNorm.length > 3 && (nomeNorm.includes(contrariaNorm) || contrariaNorm.includes(nomeNorm))) {
        alertas.push({
          nivel: 'alto',
          motivo: 'Possível Conflito Direto (Parte Contrária Ativa)',
          detalhe: `"${nomePesquisa}" coincide ou é semelhante à parte contrária "${contraria}" no processo ativo ${proc.numeroProcessual} (Cliente: ${proc.clienteNome}).`,
          processoId: proc.id,
        });
      }
    }
  }

  // 3. Verificar se o nome coincide com intervenientes passivos
  for (const proc of processos) {
    for (const inter of proc.intervenientes) {
      if (inter.papel === 'reu' || inter.papel === 'contrainteressado') {
        const interNorm = normalizarTexto(inter.nome);
        if (interNorm.length > 3 && (nomeNorm.includes(interNorm) || interNorm.includes(nomeNorm))) {
          alertas.push({
            nivel: 'alto',
            motivo: 'Interveniente em Posição Desfavorável',
            detalhe: `Figura como ${inter.papel.toUpperCase()} no processo ${proc.numeroProcessual}.`,
            processoId: proc.id,
          });
        }
      }
    }
  }

  return alertas;
}

/**
 * Validação sintática preliminar de NIF/NIPC português (9 dígitos com dígito de controlo)
 */
export function validarNIFPortugues(nif: string): boolean {
  const nifLimpo = nif.replace(/\D/g, '');
  if (nifLimpo.length !== 9) return false;

  const primeiroDigito = nifLimpo[0];
  // 1, 2, 3: singular; 5: coletivo; 6: público; 8, 9: outros
  if (!['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(primeiroDigito)) {
    return false;
  }

  let soma = 0;
  for (let i = 0; i < 8; i++) {
    soma += parseInt(nifLimpo[i], 10) * (9 - i);
  }

  const resto = soma % 11;
  const digitoEsperado = resto === 0 || resto === 1 ? 0 : 11 - resto;

  return parseInt(nifLimpo[8], 10) === digitoEsperado;
}
