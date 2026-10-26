import React, { useState } from 'react';
import {
  PenTool,
  CheckSquare,
  FileText,
  Save,
  Copy,
  Plus,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { MinutaJuridica, EstadoMinuta } from '../../types';

export const DraftingSection: React.FC = () => {
  const { minutas, addMinuta, updateMinuta, processos, selectedProcessoId } = useApp();

  const [minutaSelecionada, setMinutaSelecionada] = useState<MinutaJuridica>(
    minutas.length > 0 ? minutas[0] : ({} as any)
  );

  const [modoEdicao, setModoEdicao] = useState(false);
  const [conteudoEditado, setConteudoEditado] = useState(minutaSelecionada.conteudo || '');
  const [copiado, setCopiado] = useState(false);

  // Plano Pré-Redação (Checklist de Pressupostos Formais)
  const [checklist, setChecklist] = useState({
    competenciaTribunal: true,
    legitimidadePartes: true,
    prazoVerificado: true,
    taxaJusticaLiquidada: false,
    procuracaoForenseJunta: true,
  });

  const handleSalvarEdicao = () => {
    if (minutaSelecionada && minutaSelecionada.id) {
      updateMinuta(minutaSelecionada.id, {
        conteudo: conteudoEditado,
        versao: (minutaSelecionada.versao || 1) + 1,
      });
      setMinutaSelecionada((prev) => ({
        ...prev,
        conteudo: conteudoEditado,
        versao: (prev.versao || 1) + 1,
      }));
      setModoEdicao(false);
    }
  };

  const handleCopiar = () => {
    if (minutaSelecionada?.conteudo) {
      navigator.clipboard.writeText(minutaSelecionada.conteudo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const handleCriarNovaMinuta = () => {
    const nova = addMinuta({
      processoId: selectedProcessoId || 'proc-1',
      numeroProcessual: '1420/24.8T8PRT',
      titulo: 'Requerimento Probatório e Junção de Parecer',
      tipoPeca: 'Requerimento Geral (Processo Civil)',
      versao: 1,
      estado: 'rascunho',
      conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) JUIZ(A) DE DIREITO
DO JUÍZO CENTRAL CÍVEL DO PORTO

Processo n.º 1420/24.8T8PRT

A Autora LUSITÂNIA LOGÍSTICA & DISTRIBUIÇÃO, S.A., vem mui respeitosamente requerer a V. Exa. se digne admitir a junção aos autos do parecer técnico pericial anexo, ao abrigo do disposto no artigo 423.º, n.º 2 do Código de Processo Civil.

Junta: 1 Parecer Técnico.

O Advogado,
(Assinatura eletrónica)`,
      fundamentacaoLegal: ['Art. 423.º, n.º 2 do CPC', 'Art. 425.º do CPC'],
      jurisprudenciaCitada: [],
    });
    setMinutaSelecionada(nova);
    setConteudoEditado(nova.conteudo);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight font-serif">
            Redação Jurídica Assistida
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Elaboração de articulados, requerimentos e recursos precedidos de validação dos pressupostos processuais formais.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCriarNovaMinuta}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Nova Minuta Processual</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Lista de Minutas e Checklist Pré-Redação */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
              Minutas Registadas ({minutas.length})
            </h2>
            <div className="space-y-2">
              {minutas.map((m) => (
                <GlassCard
                  key={m.id}
                  hoverable
                  onClick={() => {
                    setMinutaSelecionada(m);
                    setConteudoEditado(m.conteudo);
                    setModoEdicao(false);
                  }}
                  className={`p-3 transition-all ${
                    minutaSelecionada?.id === m.id ? 'border-slate-900 ring-1 ring-slate-900' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {m.titulo}
                    </span>
                    <Badge variant={m.estado === 'em_revisao' ? 'warning' : 'neutral'}>
                      v{m.versao}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{m.tipoPeca}</p>
                  <span className="text-[10px] font-mono text-slate-400 block mt-1">
                    {m.numeroProcessual}
                  </span>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Checklist Obrigatória de Pressupostos Processuais */}
          <GlassCard className="p-4 bg-slate-50/70 border-slate-200">
            <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
              <CheckSquare className="w-3.5 h-3.5 text-slate-700" />
              Plano e Pressupostos Adjetivos (art. 147.º CPC)
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Verificação obrigatória antes da apresentação eletrónica em juízo no sistema Citius.
            </p>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.competenciaTribunal}
                  onChange={(e) =>
                    setChecklist({ ...checklist, competenciaTribunal: e.target.checked })
                  }
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-slate-700">Competência absoluta e relativa confirmada</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.legitimidadePartes}
                  onChange={(e) =>
                    setChecklist({ ...checklist, legitimidadePartes: e.target.checked })
                  }
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-slate-700">Legitimidade ativa e passiva aferida (art. 30 CPC)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.prazoVerificado}
                  onChange={(e) =>
                    setChecklist({ ...checklist, prazoVerificado: e.target.checked })
                  }
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-slate-700">Tempestividade e dilação computada (art. 138 CPC)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.procuracaoForenseJunta}
                  onChange={(e) =>
                    setChecklist({ ...checklist, procuracaoForenseJunta: e.target.checked })
                  }
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-slate-700">Mandato forense e poderes especiais conferidos</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.taxaJusticaLiquidada}
                  onChange={(e) =>
                    setChecklist({ ...checklist, taxaJusticaLiquidada: e.target.checked })
                  }
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-slate-700">Liquidação da taxa de justiça (art. 145 CPC)</span>
              </label>
            </div>
          </GlassCard>
        </div>

        {/* Coluna Central e Direita: Editor e Visualizador da Minuta */}
        <div className="lg:col-span-2">
          {minutaSelecionada?.id ? (
            <GlassCard className="p-6 flex flex-col h-full space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{minutaSelecionada.tipoPeca}</Badge>
                    <Badge variant="warning">
                      {minutaSelecionada.estado.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">
                    {minutaSelecionada.titulo}
                  </h2>
                  <span className="text-xs font-mono text-slate-500">
                    Processo: {minutaSelecionada.numeroProcessual}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopiar}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiado ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (modoEdicao) {
                        handleSalvarEdicao();
                      } else {
                        setModoEdicao(true);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
                  >
                    {modoEdicao ? (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar Versão</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar Peça</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Fundamentação Legal Anexa */}
              {minutaSelecionada.fundamentacaoLegal && minutaSelecionada.fundamentacaoLegal.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Dispositivos Legais Invocados:
                  </span>
                  {minutaSelecionada.fundamentacaoLegal.map((f, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}

              {/* Área de Texto da Minuta */}
              <div className="flex-1 min-h-[380px]">
                {modoEdicao ? (
                  <textarea
                    rows={18}
                    value={conteudoEditado}
                    onChange={(e) => setConteudoEditado(e.target.value)}
                    className="w-full h-full p-4 font-mono text-xs text-slate-900 bg-slate-50/50 border border-slate-300 rounded-lg focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none leading-relaxed"
                  ></textarea>
                ) : (
                  <div className="p-4 bg-slate-50/40 border border-slate-200/80 rounded-lg h-full overflow-y-auto whitespace-pre-wrap font-serif text-xs text-slate-900 leading-relaxed">
                    {minutaSelecionada.conteudo}
                  </div>
                )}
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-12 text-center text-xs text-slate-400">
              Selecione ou crie uma minuta para visualização e edição.
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
