import React, { useState } from 'react';
import {
  Scale,
  Search,
  Bell,
  Clock,
  Briefcase,
  RotateCcw,
  PlusCircle,
  Menu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

interface HeaderProps {
  onOpenNewCaseModal: () => void;
  onOpenNewClientModal: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewCaseModal,
  onOpenNewClientModal,
  onToggleMobileMenu,
}) => {
  const {
    processos,
    selectedProcessoId,
    setSelectedProcessoId,
    prazos,
    configuracao,
    globalSearch,
    setGlobalSearch,
    setCurrentSection,
    resetDataToDemo,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const prazosUrgentes = prazos.filter((p) => !p.cumprido && (p.urgente || (p.diasRestantes !== undefined && p.diasRestantes <= 5)));
  const processoAtivo = processos.find((p) => p.id === selectedProcessoId);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Marca e Identidade */}
        <div className="flex items-center gap-2.5">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 text-white shadow-xs shrink-0">
            <Scale className="w-5 h-5 text-slate-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 tracking-tight text-base font-serif">
                LEX PORTUGAL AI
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                PT-LAW v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-none mt-0.5">
              Direito Português &bull; RAG Híbrido &bull; Jurisprudência
            </p>
          </div>
        </div>

        {/* Barra Central: Pesquisa Global & Seletor de Processo Ativo */}
        <div className="flex items-center gap-3 max-w-xl w-full mx-6">
          <div className="relative flex-1">
            <label htmlFor="global-search-input" className="sr-only">
              Pesquisar diplomas, acórdãos ou processos
            </label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="global-search-input"
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Pesquisar diplomas, acórdãos, artigos (ex: Art. 138 CPC)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none transition-all"
            />
          </div>

          {/* Seletor de Processo Ativo */}
          <div className="relative flex items-center gap-1.5 min-w-[220px]">
            <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
            <label htmlFor="active-case-select" className="sr-only">
              Processo de trabalho ativo
            </label>
            <select
              id="active-case-select"
              value={selectedProcessoId || ''}
              onChange={(e) => setSelectedProcessoId(e.target.value || null)}
              className="w-full text-xs font-medium py-1.5 px-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none truncate"
            >
              <option value="">Nenhum processo selecionado</option>
              {processos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.numeroProcessual} — {p.clienteNome.substring(0, 24)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ações Rápidas & Notificações de Prazos */}
        <div className="flex items-center gap-2">
          {/* Botão Novo Registo */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Novo</span>
            </button>
            {showQuickMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border border-slate-200 shadow-lg py-1 z-50 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenNewCaseModal();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  + Novo Processo Judicial
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenNewClientModal();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium border-t border-slate-100"
                >
                  + Nova Ficha de Cliente
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickMenu(false);
                    setCurrentSection('drafting');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium border-t border-slate-100"
                >
                  + Redigir Nova Minuta
                </button>
              </div>
            )}
          </div>

          {/* Notificação de Prazos */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={`Prazos urgentes: ${prazosUrgentes.length}`}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            >
              <Bell className="w-4 h-4" />
              {prazosUrgentes.length > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200/90 shadow-xl p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Prazos Iminentes (art. 138 CPC)
                  </span>
                  <Badge variant={prazosUrgentes.length > 0 ? 'warning' : 'neutral'}>
                    {prazosUrgentes.length}
                  </Badge>
                </div>
                {prazosUrgentes.length === 0 ? (
                  <p className="text-slate-500 py-3 text-center">Nenhum prazo urgente pendente.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {prazosUrgentes.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 rounded bg-amber-50/40 border border-amber-200/60"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900">{p.numeroProcesso}</span>
                          <span className="text-[10px] font-mono text-amber-700 bg-amber-100/60 px-1 rounded">
                            {p.dataLimite}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{p.titulo}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{p.baseLegal}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications(false);
                      setCurrentSection('dashboard');
                    }}
                    className="text-[11px] text-slate-700 hover:text-slate-900 font-medium"
                  >
                    Ver todos os prazos no Painel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Identificação do Advogado / Escritório */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 text-right">
            <div>
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                {configuracao.cedulaProfissional.split(' ')[0]}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[150px]">
                {configuracao.nomeEscritorio.split(',')[0]}
              </p>
            </div>
            <button
              type="button"
              title="Repor dados demonstrativos de teste"
              onClick={resetDataToDemo}
              aria-label="Repor dados demonstrativos de teste"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
