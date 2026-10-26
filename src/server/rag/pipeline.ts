/**
 * LEX PORTUGAL AI — Pipeline de Ingestão e Segmentação com Preservação de Articulados
 */

import { MetadadosJuridicos, FragmentoJuridico } from './types';

/**
 * Normaliza o texto jurídico removendo caracteres espúrios sem alterar a redação legal
 */
export function normalizarTextoJuridico(texto: string): string {
  return texto
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((linha) => linha.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extrai número de artigo formal (ex: "Artigo 138.º", "Art. 569.º")
 */
export function extrairNumeroArtigo(linha: string): { numero: string; epigrafe?: string } | null {
  const regex = /^(?:Artigo|Art\.)\s*(\d+[\w.-]*\.?º?)(?:\s*[-–—]\s*(.*)|\s*\((.*)\))?$/i;
  const match = linha.trim().match(regex);
  if (!match) return null;

  const numero = match[1].replace(/º$/, '').replace(/\.$/, '');
  const epigrafe = match[2] || match[3] || undefined;

  return {
    numero: `Art. ${numero}.º`,
    epigrafe: epigrafe ? epigrafe.trim() : undefined,
  };
}

/**
 * Segmenta um diploma ou texto legislativo preservando a integridade dos artigos,
 * números e alíneas, vinculando cada fragmento aos respetivos metadados oficiais.
 */
export function segmentarDiploma(
  textoIntegral: string,
  metadados: MetadadosJuridicos
): FragmentoJuridico[] {
  const textoLimpo = normalizarTextoJuridico(textoIntegral);
  const linhas = textoLimpo.split('\n');

  const fragmentos: FragmentoJuridico[] = [];
  let artigoAtual: { numero: string; epigrafe?: string } | null = null;
  let linhasArtigoAtual: string[] = [];
  let contadorFragmento = 1;

  const flushArtigo = () => {
    if (artigoAtual && linhasArtigoAtual.length > 0) {
      const corpo = linhasArtigoAtual.join('\n').trim();
      if (corpo.length > 0) {
        fragmentos.push({
          id: `${metadados.identificador}-frag-${contadorFragmento++}`,
          fonteId: metadados.identificador,
          identificadorFonte: metadados.identificador,
          tituloFonte: metadados.titulo,
          artigoNumero: artigoAtual.numero,
          epigrafe: artigoAtual.epigrafe,
          texto: corpo,
          urlOficial: metadados.urlOficial,
          metadados,
        });
      }
      linhasArtigoAtual = [];
    }
  };

  for (const linha of linhas) {
    const infoArtigo = extrairNumeroArtigo(linha);
    if (infoArtigo) {
      flushArtigo();
      artigoAtual = infoArtigo;
    } else if (artigoAtual) {
      linhasArtigoAtual.push(linha);
    } else {
      // Preâmbulo ou texto introdutório antes do primeiro artigo
      if (linha.trim().length > 0) {
        linhasArtigoAtual.push(linha);
      }
    }
  }

  // Descarregar o último artigo processado
  flushArtigo();

  // Caso o texto não contenha divisão formal de artigos (ex: acórdão com sumário e fundamentação)
  if (fragmentos.length === 0 && textoLimpo.length > 0) {
    fragmentos.push({
      id: `${metadados.identificador}-frag-integral`,
      fonteId: metadados.identificador,
      identificadorFonte: metadados.identificador,
      tituloFonte: metadados.titulo,
      texto: textoLimpo,
      urlOficial: metadados.urlOficial,
      metadados,
    });
  }

  return fragmentos;
}

/**
 * Tokenização lexical para pontuação e pesquisa exata
 */
export function extrairTokensLexicais(texto: string): string[] {
  const comOrdinais = texto.replace(/(\d+)\.º/g, '$1º $1');
  return comOrdinais
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\dº]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}
