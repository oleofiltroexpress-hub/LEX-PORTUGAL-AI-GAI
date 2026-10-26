import React from 'react';
import {
  Briefcase,
  Clock,
  FileText,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';

interface DashboardSectionProps {
  onOpenNewCaseModal: () => void;
  onOpenNewClientModal: () => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  onOpenNewCaseModal,
  onOpenNewClientModal,
}) => {
  const {
    processos,
    prazos,
    minutas,
    fontes,
    togglePrazoCumprido,
    setCurrentSection,
    setSelectedProcessoId,
    auditoriaLogs,
  } = useApp();

  const processosAtivos = processos.filter((p) => p.estado === 'ativo');
  const prazosPendentes = prazos.filter((p) => !p.cumprido);
  const prazosUrgentes = prazosPendentes.filter(
    (p) => p.urgente || (p.diasRestantes !== undefined && p.diasRestantes <= 5)
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight font-serif">
            Painel de Controlo Processual
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Visão consolidada do escritório, prazos perentórios e acompanhamento de autos judiciais.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewClientModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
          >
            <Plus className="w-3.5 h-3.5" />
            + Cliente
          </button>
          <button
            type="button"
            onClick={onOpenNewCaseModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
          >
            <Plus className="w-3.5 h-3.5" />
            + Processo Judicial
          </button>
        </div>
      </div>

      {/* Cartões de Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-slate-100 text-slate-900">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Processos Ativos</p>
            <p className="text-2xl font-bold text-slate-900">{processosAtivos.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{processos.length} processos no total</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Prazos a Correr</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{prazosPendentes.length}</span>
              {prazosUrgentes.length > 0 && (
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                  {prazosUrgentes.length} urgentes
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Art. 138.º CPC</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-slate-100 text-slate-900">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Minutas em Elaboração</p>
            <p className="text-2xl font-bold text-slate-900">{minutas.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {minutas.filter((m) => m.estado === 'em_revisao').length} em revisão
            </p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-slate-100 text-slate-900">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Fontes e Jurisprudência</p>
            <p className="text-2xl font-bold text-slate-900">{fontes.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Corpus legal indexado</p>
          </div>
        </GlassCard>
      </div>

      {/* Secção Principal em 2 Colunas: Prazos Processuais e Processos Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Prazos Iminentes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Prazos Judiciais e Notificações Citius
            </h2>
            <button
              type="button"
              onClick={() => setCurrentSection('cases')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              Ver na pasta de processos <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <GlassCard className="p-0 overflow-hidden divide-y divide-slate-100">
            {prazos.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                Nenhum prazo registado de momento.
              </div>
            ) : (
              prazos.map((prazo) => {
                const dias = prazo.diasRestantes ?? 0;
                const eUrgente = !prazo.cumprido && (prazo.urgente || dias <= 5);

                return (
                  <div
                    key={prazo.id}
                    className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                      prazo.cumprido
                        ? 'bg-slate-50/40 opacity-70'
                        : eUrgente
                        ? 'bg-amber-50/30'
                        : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => togglePrazoCumprido(prazo.id)}
                        aria-label={prazo.cumprido ? 'Marcar prazo como pendente' : 'Marcar prazo como cumprido'}
                        className={`mt-0.5 p-1 rounded-md border transition-colors ${
                          prazo.cumprido
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 text-transparent hover:border-slate-400 bg-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold ${
                              prazo.cumprido ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {prazo.titulo}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            ({prazo.numeroProcesso})
                          </span>
                          {eUrgente && !prazo.cumprido && (
                            <Badge variant="danger" className="text-[10px]">
                              URGENTE
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{prazo.baseLegal}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-medium text-slate-800 block">
                        {prazo.dataLimite}
                      </span>
                      <span
                        className={`text-[10px] font-medium block mt-0.5 ${
                          prazo.cumprido
                            ? 'text-emerald-700'
                            : dias < 0
                            ? 'text-rose-600'
                            : dias <= 5
                            ? 'text-amber-700 font-semibold'
                            : 'text-slate-500'
                        }`}
                      >
                        {prazo.cumprido
                          ? 'Cumprido'
                          : dias === 0
                          ? 'Termina Hoje!'
                          : dias < 0
                          ? `Expirou há ${Math.abs(dias)} dias`
                          : `Faltam ${dias} dias`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </GlassCard>
        </div>

        {/* Coluna Direita: Processos em Destaque e Acesso Rápido */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-700" />
              Autos em Acompanhamento
            </h2>
            <button
              type="button"
              onClick={() => setCurrentSection('cases')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              Todos ({processos.length})
            </button>
          </div>

          <div className="space-y-3">
            {processos.map((proc) => (
              <GlassCard
                key={proc.id}
                hoverable
                onClick={() => {
                  setSelectedProcessoId(proc.id);
                  setCurrentSection('cases');
                }}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-900">
                    {proc.numeroProcessual}
                  </span>
                  <Badge variant={proc.estado === 'ativo' ? 'success' : 'neutral'}>
                    {proc.estado.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-slate-800 mt-1 truncate">
                  {proc.clienteNome}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {proc.tribunal}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{proc.ramo}</span>
                  <span className="font-medium text-slate-600">
                    {proc.valorCausa.toLocaleString('pt-PT')} €
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Histórico Recente de Verificações de Auditoria */}
          <GlassCard className="p-4 bg-slate-50/70 border-slate-200">
            <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Última Verificação Independente
            </h3>
            {auditoriaLogs.length > 0 ? (
              <div className="text-[11px] text-slate-600 space-y-1">
                <p className="font-medium text-slate-900">{auditoriaLogs[0].acao}</p>
                <p className="text-slate-500 text-[10px]">{auditoriaLogs[0].detalhes}</p>
                <span className="text-[10px] font-mono text-slate-400 block pt-1">
                  {auditoriaLogs[0].dataHora}
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">Sem registos de auditoria recentes.</p>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
