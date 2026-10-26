/**
 * LEX PORTUGAL AI — Módulo de Análise Documental, OCR Especializado,
 * Extração de Factos (Provados vs. Alegações) e Confronto de Articulados
 */

import React, { useState } from 'react';
import {
  Upload,
  FileText,
  AlertTriangle,
  Calendar,
  Users,
  CheckCircle2,
  Trash2,
  Eye,
  FileCheck,
  Scale,
  GitCompare,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  FileSearch,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { DocumentoAnalisado } from '../../types';

export const DocumentAnalysisSection: React.FC = () => {
  const { documentos, addDocumento, deleteDocumento, selectedProcessoId } = useApp();

  const [documentoAtivo, setDocumentoAtivo] = useState<DocumentoAnalisado | null>(
    documentos.length > 0 ? documentos[0] : null
  );
  const [tabAtiva, setTabAtiva] = useState<'pecas_ocr' | 'factos_cronologia' | 'confronto'>('pecas_ocr');
  const [filtroFactos, setFiltroFactos] = useState<'todos' | 'facto_comprovado' | 'alegacao_parte' | 'facto_controvertido'>('todos');
  const [excertoModal, setExcertoModal] = useState<{ texto: string; folio: string; docNome: string; meioProva: string } | null>(null);

  // Estados do formulário de ingestão
  const [aProcessar, setAProcessar] = useState(false);
  const [nomeFicheiroInput, setNomeFicheiroInput] = useState('');
  const [tipoDocInput, setTipoDocInput] = useState<'contestacao' | 'peticao' | 'sentenca' | 'prova_documental' | 'despacho'>('contestacao');
  const [formatoInput, setFormatoInput] = useState<'pdf_nativo' | 'pdf_digitalizado' | 'imagem_scan' | 'docx'>('pdf_digitalizado');

  // Estados de confronto
  const [docAId, setDocAId] = useState<string>(documentos[2]?.id || documentos[0]?.id || '');
  const [docBId, setDocBId] = useState<string>(documentos[0]?.id || '');

  const docA = documentos.find((d) => d.id === docAId) || documentos[0];
  const docB = documentos.find((d) => d.id === docBId) || documentos[1] || documentos[0];

  const handleSimularUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeFicheiroInput.trim()) return;

    setAProcessar(true);

    setTimeout(() => {
      const eScan = formatoInput === 'imagem_scan' || formatoInput === 'pdf_digitalizado';
      const confianca = formatoInput === 'imagem_scan' ? 0.78 : formatoInput === 'pdf_digitalizado' ? 0.88 : 1.0;

      const factosSimulados = [
        {
          id: `fct-${Date.now()}-1`,
          classificacao: 'facto_comprovado' as const,
          descricao: `Registo oficial e formalidades certificadas na peça "${nomeFicheiroInput}".`,
          dataEvento: '2026-01-20',
          ordemCronologica: 1,
          excertoOrigem: 'Verificou-se a tempestividade da entrega do articulado e o pagamento regular da taxa de justiça devida.',
          paginaOrigem: 2,
          folioOrigem: 'fls. 4 dos autos',
          meioProva: 'Carimbo Citius e DUC comprovativo de pagamento',
          confiancaClassificacao: 0.98,
        },
        {
          id: `fct-${Date.now()}-2`,
          classificacao: 'alegacao_parte' as const,
          descricao: 'Alegações formuladas quanto a prejuízos e mora na prestação contratual.',
          dataEvento: '2026-02-01',
          ordemCronologica: 2,
          excertoOrigem: 'Sustenta a parte que os atrasos reiterados desrespeitaram o cronograma acordado entre as administrações.',
          paginaOrigem: 3,
          folioOrigem: 'fls. 5 verso',
          meioProva: 'Alegações unilaterais da parte (carece de instrução)',
          confiancaClassificacao: 0.89,
        },
        {
          id: `fct-${Date.now()}-3`,
          classificacao: 'facto_controvertido' as const,
          descricao: 'Impugnação quanto à imputação de culpa na cessação das obrigações.',
          dataEvento: '2026-02-14',
          ordemCronologica: 3,
          excertoOrigem: 'Nega-se frontalmente qualquer mora imputável aos seus colaboradores, invocando greve portuária.',
          paginaOrigem: 5,
          folioOrigem: 'fls. 8',
          meioProva: 'Impugnação formal e requisição de ofício à administração do Porto de Leixões',
          confiancaClassificacao: 0.94,
        },
      ];

      const novo = addDocumento({
        processoId: selectedProcessoId || 'proc-1',
        nomeFicheiro: nomeFicheiroInput.includes('.') ? nomeFicheiroInput : `${nomeFicheiroInput}.${formatoInput === 'imagem_scan' ? 'jpg' : 'pdf'}`,
        tamanhoBytes: formatoInput === 'imagem_scan' ? 3200000 : 1850400,
        tipoMime: formatoInput === 'imagem_scan' ? 'image/jpeg' : 'application/pdf',
        tipoDocumental: tipoDocInput,
        formato: formatoInput,
        confiancaOcr: confianca,
        necessitaOcr: eScan,
        avisosOcr: eScan
          ? [
              'Processamento ótico de alta resolução com motor jurídico Tesseract calibrado.',
              'Atenção às margens inferiores nos fólios 4 e 5: rúbricas manuais com texto degradado.',
            ]
          : undefined,
        deverDeontologicoAviso: eScan
          ? 'Aviso Deontológico: A transcrição OCR de digitalizações pode apresentar imprecisões nas notas de rodapé e carimbos. É obrigatória a conferência visual com os autos físicos.'
          : undefined,
        partesIdentificadas: [
          'Vanguard Frotas & Equipamentos, Lda. (Ré)',
          'Lusitânia Logística & Distribuição, S.A. (Autora)',
        ],
        datasRelevantes: [
          { data: '2026-01-20', descricao: 'Data de junção da peça aos autos no Citius' },
          { data: '2026-02-14', descricao: 'Notificação do mandatário judicial da contraparte' },
        ],
        pedidosEFundamentos: [
          'Apresentação de meio probatório documental com requerimento pericial',
          'Alegação de força maior nos termos do art. 790.º do Código Civil',
        ],
        possiveisContradicoes: [],
        estadoExtracao: 'processado',
        factos: factosSimulados,
      });

      setDocumentoAtivo(novo);
      setNomeFicheiroInput('');
      setAProcessar(false);
    }, 600);
  };

  // Factos filtrados do documento ativo
  const factosDoDocumento = documentoAtivo?.factos || [];
  const factosFiltrados = factosDoDocumento.filter((f) => {
    if (filtroFactos === 'todos') return true;
    return f.classificacao === filtroFactos;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Secção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight font-serif">
              Análise Documental & OCR Especializado
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
              FASE 6 &bull; AUTOS CITIUS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ingestão documental com OCR, distinção entre factos comprovados e alegações das partes, excertos de origem e confronto de peças processuais.
          </p>
        </div>

        {/* Seletor de Abas */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
          <button
            onClick={() => setTabAtiva('pecas_ocr')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              tabAtiva === 'pecas_ocr'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Peças & OCR
          </button>
          <button
            onClick={() => setTabAtiva('factos_cronologia')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              tabAtiva === 'factos_cronologia'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Factos & Cronologia
          </button>
          <button
            onClick={() => setTabAtiva('confronto')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              tabAtiva === 'confronto'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Confronto de Peças
          </button>
        </div>
      </div>

      {/* ABA 1: Peças & OCR */}
      {tabAtiva === 'pecas_ocr' && (
        <div className="space-y-6">
          {/* Formulário de Ingestão */}
          <GlassCard className="p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-700" />
              Ingerir Peça Processual ou Meio de Prova (PDF / DOCX / Imagem)
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              O motor jurídico avalia a pesquisabilidade do ficheiro, aplica OCR com modelo treinado para caligrafia e carimbos forenses portugueses e extrai automaticamente os factos e excertos vinculados ao fólio.
            </p>

            <form onSubmit={handleSimularUpload} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Nome do Documento / Identificação
                </label>
                <input
                  type="text"
                  required
                  value={nomeFicheiroInput}
                  onChange={(e) => setNomeFicheiroInput(e.target.value)}
                  placeholder="ex: Requerimento_de_Prova_fls140.pdf"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Formato do Ficheiro
                </label>
                <select
                  value={formatoInput}
                  onChange={(e) => setFormatoInput(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
                >
                  <option value="pdf_nativo">PDF Nativo (Digital/Vetorial)</option>
                  <option value="pdf_digitalizado">PDF Digitalizado (Requer OCR)</option>
                  <option value="imagem_scan">Imagem / Digitalização (Scan JPG/PNG)</option>
                  <option value="docx">Microsoft Word (DOCX)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Tipo de Peça
                </label>
                <select
                  value={tipoDocInput}
                  onChange={(e) => setTipoDocInput(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
                >
                  <option value="contestacao">Contestação</option>
                  <option value="peticao">Petição Inicial</option>
                  <option value="sentenca">Sentença</option>
                  <option value="despacho">Despacho</option>
                  <option value="prova_documental">Prova Documental</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={aProcessar || !nomeFicheiroInput.trim()}
                  className="w-full py-2 px-3 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {aProcessar ? 'A processar...' : 'Processar & OCR'}
                </button>
              </div>
            </form>
          </GlassCard>

          {/* Grid de Documentos e Painel de Inspecção */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Documentos Ingeridos */}
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-slate-800 px-1 uppercase tracking-wider flex items-center justify-between">
                <span>Peças nos Autos ({documentos.length})</span>
                <span className="text-[10px] text-slate-500 font-normal">Autos: 1420/24.8T8PRT</span>
              </h2>

              {documentos.map((doc) => {
                const eAtivo = documentoAtivo?.id === doc.id;
                const eScan = doc.necessitaOcr || doc.formato === 'imagem_scan' || doc.formato === 'pdf_digitalizado';

                return (
                  <GlassCard
                    key={doc.id}
                    hoverable
                    onClick={() => setDocumentoAtivo(doc)}
                    className={`p-4 transition-all cursor-pointer ${
                      eAtivo ? 'border-slate-900 ring-1 ring-slate-900 bg-slate-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                        <span className="text-xs font-semibold text-slate-900 truncate max-w-[170px]" title={doc.nomeFicheiro}>
                          {doc.nomeFicheiro}
                        </span>
                      </div>
                      {eScan ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          OCR {Math.round((doc.confiancaOcr || 0.8) * 100)}%
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          NATIVO
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="capitalize font-medium text-slate-700">{doc.tipoDocumental}</span>
                      <span className="font-mono">{doc.dataCarregamento}</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">
                        {doc.factos?.length || 0} factos extraídos
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocumento(doc.id);
                          if (documentoAtivo?.id === doc.id) setDocumentoAtivo(null);
                        }}
                        title="Remover documento"
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            {/* Inspecção do Documento Selecionado */}
            <div className="lg:col-span-2">
              {documentoAtivo ? (
                <GlassCard className="p-6 space-y-6">
                  {/* Cabeçalho do Documento */}
                  <div className="border-b border-slate-200 pb-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded">
                          {documentoAtivo.tipoDocumental}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {(documentoAtivo.tamanhoBytes / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-500">
                        Carregado a {documentoAtivo.dataCarregamento}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-2 font-serif">
                      {documentoAtivo.nomeFicheiro}
                    </h2>
                  </div>

                  {/* BANNER DE AVISO DEONTOLÓGICO OBRIGATÓRIO PARA DIGITALIZAÇÕES / OCR */}
                  {documentoAtivo.deverDeontologicoAviso && (
                    <div className="p-4 rounded-lg bg-amber-50/90 border border-amber-300 text-amber-950 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                            Dever Deontológico & Limitações de OCR
                          </h4>
                          <p className="text-xs text-amber-900 leading-relaxed font-serif mt-1">
                            {documentoAtivo.deverDeontologicoAviso}
                          </p>
                        </div>
                      </div>

                      {documentoAtivo.avisosOcr && (
                        <div className="mt-2 pt-2 border-t border-amber-200/80 text-[11px] text-amber-800 space-y-1">
                          <span className="font-semibold">Notas Técnicas do Motor de Extração:</span>
                          <ul className="list-disc list-inside space-y-0.5 pl-1">
                            {documentoAtivo.avisosOcr.map((aviso, idx) => (
                              <li key={idx}>{aviso}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Partes Identificadas */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
                      <Users className="w-3.5 h-3.5 text-slate-600" />
                      Partes Identificadas na Peça
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {documentoAtivo.partesIdentificadas.map((parte, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                        >
                          {parte}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumo de Factos Extraídos com Atalho para a Aba */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-slate-600" />
                        Factos Juridicamente Relevantes ({documentoAtivo.factos?.length || 0})
                      </h3>
                      <button
                        onClick={() => setTabAtiva('factos_cronologia')}
                        className="text-xs text-slate-700 hover:text-slate-900 font-medium underline flex items-center gap-1"
                      >
                        Ver Cronologia Completa &rarr;
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(documentoAtivo.factos || []).slice(0, 3).map((f) => (
                        <div
                          key={f.id}
                          className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                f.classificacao === 'facto_comprovado'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : f.classificacao === 'facto_controvertido'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              {f.classificacao === 'facto_comprovado'
                                ? 'FACTO COMPROVADO'
                                : f.classificacao === 'facto_controvertido'
                                ? 'FACTO CONTROVERTIDO'
                                : 'ALEGAÇÃO DA PARTE'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              {f.folioOrigem || `Pág. ${f.paginaOrigem}`}
                            </span>
                          </div>
                          <p className="text-slate-800 font-medium leading-relaxed">{f.descricao}</p>
                          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                            <span className="truncate max-w-[340px]">
                              Prova: <span className="text-slate-700">{f.meioProva || 'Articulado'}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setExcertoModal({
                                  texto: f.excertoOrigem,
                                  folio: f.folioOrigem || `Pág. ${f.paginaOrigem}`,
                                  docNome: documentoAtivo.nomeFicheiro,
                                  meioProva: f.meioProva || 'N/A',
                                })
                              }
                              className="text-slate-900 hover:underline flex items-center gap-1 font-medium shrink-0 ml-2"
                            >
                              <ExternalLink className="w-3 h-3" /> Excerto de Origem
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pedidos e Fundamentos */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
                      <FileCheck className="w-3.5 h-3.5 text-slate-600" />
                      Pedidos e Fundamentos Deduzidos
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 bg-slate-50/70 p-3 rounded-lg border border-slate-200">
                      {documentoAtivo.pedidosEFundamentos.map((ped, i) => (
                        <li key={i}>{ped}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Contradições / Pontos de Alerta */}
                  {documentoAtivo.possiveisContradicoes.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950">
                      <h3 className="text-xs font-semibold flex items-center gap-1.5 text-amber-800 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Ponto de Atenção Probatório (Aparente Contradição Factual)
                      </h3>
                      {documentoAtivo.possiveisContradicoes.map((contra, i) => (
                        <p key={i} className="text-xs leading-relaxed text-amber-900 mt-1 font-serif">
                          {contra}
                        </p>
                      ))}
                    </div>
                  )}
                </GlassCard>
              ) : (
                <GlassCard className="p-12 text-center text-xs text-slate-400">
                  Selecione uma peça na lista lateral para inspecionar os resultados de extração e OCR.
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: Factos & Cronologia */}
      {tabAtiva === 'factos_cronologia' && (
        <div className="space-y-6">
          {/* Barra de Filtros por Classificação Jurídica */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Ledger de Factos & Cronologia Processual
              </h2>
              <p className="text-xs text-slate-500">
                Distinção dogmática entre factos documentados, alegações por provar e matéria controvertida com ligações ao fólio de origem.
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setFiltroFactos('todos')}
                className={`px-3 py-1 text-xs rounded-md border transition-all ${
                  filtroFactos === 'todos'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Todos ({factosDoDocumento.length})
              </button>
              <button
                onClick={() => setFiltroFactos('facto_comprovado')}
                className={`px-3 py-1 text-xs rounded-md border transition-all flex items-center gap-1 ${
                  filtroFactos === 'facto_comprovado'
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Comprovados ({factosDoDocumento.filter((f) => f.classificacao === 'facto_comprovado').length})
              </button>
              <button
                onClick={() => setFiltroFactos('alegacao_parte')}
                className={`px-3 py-1 text-xs rounded-md border transition-all flex items-center gap-1 ${
                  filtroFactos === 'alegacao_parte'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <HelpCircle className="w-3 h-3" />
                Alegações ({factosDoDocumento.filter((f) => f.classificacao === 'alegacao_parte').length})
              </button>
              <button
                onClick={() => setFiltroFactos('facto_controvertido')}
                className={`px-3 py-1 text-xs rounded-md border transition-all flex items-center gap-1 ${
                  filtroFactos === 'facto_controvertido'
                    ? 'bg-rose-800 text-white border-rose-800'
                    : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                Controvertidos ({factosDoDocumento.filter((f) => f.classificacao === 'facto_controvertido').length})
              </button>
            </div>
          </div>

          {/* Timeline de Factos */}
          <div className="space-y-3">
            {factosFiltrados.length === 0 ? (
              <GlassCard className="p-8 text-center text-xs text-slate-400">
                Nenhum facto registado com o filtro selecionado no documento ativo.
              </GlassCard>
            ) : (
              factosFiltrados.map((facto, idx) => (
                <GlassCard key={facto.id} className="p-4 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {facto.dataEvento || 'Data a determinar'}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            facto.classificacao === 'facto_comprovado'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : facto.classificacao === 'facto_controvertido'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {facto.classificacao === 'facto_comprovado'
                            ? 'FACTO COMPROVADO'
                            : facto.classificacao === 'facto_controvertido'
                            ? 'FACTO CONTROVERTIDO (IMPUGNADO)'
                            : 'ALEGAÇÃO DA PARTE (SEM PROVA PLENA)'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {facto.folioOrigem || `Página ${facto.paginaOrigem}`}
                        </span>
                      </div>

                      <p className="text-xs text-slate-900 font-medium leading-relaxed font-serif pt-1">
                        {facto.descricao}
                      </p>

                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-700">Meio de Prova / Articulado: </span>
                        {facto.meioProva || 'Sem indicação de meio de prova específico'}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center sm:flex-col sm:items-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExcertoModal({
                            texto: facto.excertoOrigem,
                            folio: facto.folioOrigem || `Página ${facto.paginaOrigem}`,
                            docNome: documentoAtivo?.nomeFicheiro || 'Documento dos Autos',
                            meioProva: facto.meioProva || 'Articulado',
                          })
                        }
                        className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-2xs flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                        Inspecionar Excerto
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Confiança {Math.round(facto.confiancaClassificacao * 100)}%
                      </span>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </div>
      )}

      {/* ABA 3: Confronto de Peças (Contraditório) */}
      {tabAtiva === 'confronto' && (
        <div className="space-y-6">
          <GlassCard className="p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-slate-700" />
              Confronto de Peças Processuais (Mapa do Contraditório)
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Compara dois articulados dos autos (ex: Petição Inicial vs. Contestação), destacando factos admitidos por acordo (Art. 574.º n.º 2 do CPC), matéria impugnada e contradições probatórias.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Peça A (ex: Petição Inicial da Autora)
                </label>
                <select
                  value={docAId}
                  onChange={(e) => setDocAId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                >
                  {documentos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nomeFicheiro} ({d.tipoDocumental})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Peça B (ex: Contestação da Ré)
                </label>
                <select
                  value={docBId}
                  onChange={(e) => setDocBId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                >
                  {documentos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nomeFicheiro} ({d.tipoDocumental})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Painel Comparativo */}
          <div className="space-y-6">
            {/* Factos Admitidos por Acordo */}
            <GlassCard className="p-5 space-y-3 border-emerald-200 bg-emerald-50/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  Factos Assentes / Admitidos por Acordo (Art. 574.º n.º 2 do CPC)
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Factos alegados pela Autora que a Ré não impugnou especificadamente, considerando-se admitidos por acordo probatório:
              </p>

              <div className="space-y-2">
                <div className="p-3 bg-white rounded border border-emerald-200 text-xs space-y-1">
                  <span className="font-semibold text-slate-900">
                    Celebração do contrato n.º LF-2024/099 e data de início de vigência em 15/03/2024.
                  </span>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>Autora: Artigo 4.º da P.I. (fls. 3)</span>
                    <span>Ré: Artigo 6.º da Contestação (fls. 11 verso)</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded border border-emerald-200 text-xs space-y-1">
                  <span className="font-semibold text-slate-900">
                    A viatura pesada de matrícula AA-00-ZZ foi acolhida na oficina da Maia no dia 16/01/2026.
                  </span>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>Autora: Artigo 22.º da P.I. (fls. 4 verso)</span>
                    <span>Ré: Artigo 14.º da Contestação (fls. 12)</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Matéria Controvertida */}
            <GlassCard className="p-5 space-y-3 border-rose-200 bg-rose-50/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700" />
                <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wide">
                  Matéria Controvertida Sujeita a Instrução e Prova (Temas da Prova)
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-white rounded border border-rose-200 text-xs space-y-2">
                  <div className="font-semibold text-slate-900">
                    Tema 1: Causa geradora da imobilização mecânica das viaturas
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-0.5">Posição da Autora:</span>
                      Defeito estrutural oculto de conceção no módulo de injeção eletrónica dos veículos fornecidos.
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-0.5">Posição da Ré:</span>
                      Contaminação do circuito de alimentação por abastecimento de gasóleo agrícola não homologado.
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    Ónus da prova: Artigo 342.º do Código Civil &bull; Requerimento de Perícia Técnica Colegial.
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded border border-rose-200 text-xs space-y-2">
                  <div className="font-semibold text-slate-900">
                    Tema 2: Existência e quantificação dos lucros cessantes (64.500,00 €)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-0.5">Posição da Autora:</span>
                      Cancelamento irrevogável de 14 transportes internacionais já contratualizados com clientes.
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-0.5">Posição da Ré:</span>
                      Impugnação formal: a Autora possuía veículos sobressalentes e não comprovou cancelamentos reais.
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Contradição Probatória e Resumo Dogmático */}
            <GlassCard className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-slate-700" />
                Resumo Analítico do Contraditório
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-serif">
                Existe concordância entre as partes quanto à vigência do contrato e à entrega das viaturas. O litígio reconduz-se à imputabilidade da anomalia mecânica e à prova de nexo causal quanto aos danos indiretos. A junção de certidões químicas pela Ré impõe à Autora a solicitação de perícia judicial para ilidir a presunção de culpa na manutenção.
              </p>
            </GlassCard>
          </div>
        </div>
      )}

      {/* MODAL DE INSPEÇÃO DO EXCERTO DE ORIGEM */}
      {excertoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xs font-bold text-slate-900 font-serif">
                  Excerto de Origem &bull; {excertoModal.folio}
                </h3>
                <span className="text-[11px] font-mono text-slate-500">{excertoModal.docNome}</span>
              </div>
              <button
                type="button"
                onClick={() => setExcertoModal(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Citação Verbatim Extraída dos Autos:
                </span>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-serif italic border-l-4 border-l-slate-900">
                  &ldquo;{excertoModal.texto}&rdquo;
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800">Meio Probatório Associado:</span>
                <p className="text-slate-700">{excertoModal.meioProva}</p>
              </div>

              <div className="p-3 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                <strong>Verificação Deontológica:</strong> O mandatário judicial deve sempre conferir a integridade da citação com o duplicado físico ou eletrónico dos autos no Citius antes da submissão da peça.
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setExcertoModal(null)}
                className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
              >
                Fechar Inspecção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
