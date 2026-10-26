/**
 * LEX PORTUGAL AI — Cálculo e Verificação de Prazos Processuais
 * Normas de referência: Art. 279.º do Código Civil e Art. 138.º do CPC (Lei n.º 41/2013)
 */

/**
 * Feriados nacionais fixos em Portugal
 */
export const FERIADOS_NACIONAIS_FIXOS = [
  '01-01', // Ano Novo
  '04-25', // Dia da Liberdade
  '05-01', // Dia do Trabalhador
  '06-10', // Dia de Portugal, de Camões e das Comunidades
  '08-15', // Assunção de Nossa Senhora
  '10-05', // Implantação da República
  '11-01', // Dia de Todos os Santos
  '12-01', // Restauração da Independência
  '12-08', // Imaculada Conceição
  '12-25', // Natal
];

/**
 * Verifica se uma data calha em fim de semana (Sábado ou Domingo)
 */
export function eFimDeSemana(data: Date): boolean {
  const dia = data.getDay();
  return dia === 0 || dia === 6; // 0 = Domingo, 6 = Sábado
}

/**
 * Formata data para YYYY-MM-DD
 */
export function formatarDataISO(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Verifica se a data é feriado nacional fixo
 */
export function eFeriadoNacionalFixo(data: Date): boolean {
  const mesDia = `${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
  return FERIADOS_NACIONAIS_FIXOS.includes(mesDia);
}

/**
 * Verifica se uma data é dia útil
 */
export function eDiaUtil(data: Date): boolean {
  if (eFimDeSemana(data)) return false;
  if (eFeriadoNacionalFixo(data)) return false;
  return true;
}

/**
 * Verifica se a data coincide com o período de férias judiciais (Art. 28.º da Lei n.º 62/2013 - LOSJ):
 * - Verão: 16 de julho a 31 de agosto
 * - Natal: 22 de dezembro a 3 de janeiro
 */
export function estaEmFeriasJudiciais(data: Date): boolean {
  const mes = data.getMonth() + 1; // 1 a 12
  const dia = data.getDate();

  // Férias de Verão: 16 de julho a 31 de agosto
  if ((mes === 7 && dia >= 16) || mes === 8) {
    return true;
  }
  // Férias de Natal: 22 de dezembro a 3 de janeiro
  if ((mes === 12 && dia >= 22) || (mes === 1 && dia <= 3)) {
    return true;
  }

  return false;
}

/**
 * Calcula o termo do prazo processual nos termos do Art. 138.º, n.º 2 do CPC:
 * Se o prazo terminar em dia em que o tribunal esteja encerrado (fim de semana ou feriado),
 * transfere-se o seu termo para o 1.º dia útil seguinte.
 */
export function ajustarTermoParaDiaUtil(dataTermo: Date): Date {
  const ajustada = new Date(dataTermo.getTime());
  while (!eDiaUtil(ajustada)) {
    ajustada.setDate(ajustada.getDate() + 1);
  }
  return ajustada;
}

/**
 * Calcula a diferença de dias entre hoje (ou data base) e a data limite
 */
export function calcularDiasRestantes(dataLimiteStr: string, dataReferenciaStr?: string): number {
  const [ano, mes, dia] = dataLimiteStr.split('-').map(Number);
  const dataTermo = new Date(ano, mes - 1, dia);

  let dataRef: Date;
  if (dataReferenciaStr) {
    const [anoR, mesR, diaR] = dataReferenciaStr.split('-').map(Number);
    dataRef = new Date(anoR, mesR - 1, diaR);
  } else {
    const hoje = new Date();
    dataRef = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  }

  const diffMs = dataTermo.getTime() - dataRef.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
