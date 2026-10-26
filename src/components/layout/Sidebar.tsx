import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Search,
  BookOpen,
  FileSearch,
  PenTool,
  Users,
  Briefcase,
  Brain,
  ShieldCheck,
  Settings,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationSection } from '../../types';

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeType?: 'neutral' | 'urgent';
}

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { currentSection, setCurrentSection, processos, prazos, minutas, clientes } = useApp();

  const prazosPendentes = prazos.filter((p) => !p.cumprido).length;
  const processosAtivos = processos.filter((p) => p.estado === 'ativo').length;
  const minutasEmRevisao = minutas.filter((m) => m.estado === 'em_revisao').length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Painel de Controlo',
      icon: LayoutDashboard,
    },
    {
      id: 'assistant',
      label: 'Assistente Jurídico',
      icon: Bot,
      badge: 'IA',
      badgeType: 'neutral',
    },
    {
      id: 'research',
      label: 'Investigação Jurídica',
      icon: Search,
    },
    {
      id: 'library',
      label: 'Biblioteca & Jurisprudência',
      icon: BookOpen,
    },
    {
      id: 'document-analysis',
      label: 'Análise Documental & OCR',
      icon: FileSearch,
    },
    {
      id: 'drafting',
      label: 'Redação Jurídica',
      icon: PenTool,
      badge: minutasEmRevisao > 0 ? minutasEmRevisao : undefined,
    },
    {
      id: 'clients',
      label: 'Clientes & Conflitos',
      icon: Users,
      badge: clientes.length,
      badgeType: 'neutral',
    },
    {
      id: 'cases',
      label: 'Processos Judiciais',
      icon: Briefcase,
      badge: processosAtivos,
      badgeType: 'neutral',
    },
    {
      id: 'memory',
      label: 'Memória & Conhecimento',
      icon: Brain,
    },
    {
      id: 'audit',
      label: 'Auditoria & Segurança',
      icon: ShieldCheck,
      badge: prazosPendentes > 0 ? `${prazosPendentes} Prazos` : undefined,
      badgeType: prazosPendentes > 0 ? 'urgent' : 'neutral',
    },
    {
      id: 'admin',
      label: 'Administração & Sistema',
      icon: Settings,
    },
  ];

  const handleSelectSection = (id: NavigationSection) => {
    setCurrentSection(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Backdrop para mobile */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-2xs md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-50/95 md:bg-slate-50/60 backdrop-blur-md border-r border-slate-200/90 flex flex-col justify-between h-full md:h-[calc(100vh-57px)] shrink-0 select-none transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3 space-y-1 overflow-y-auto">
          <div className="flex items-center justify-between px-3 py-1.5 md:block">
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
              Módulos Principais
            </span>
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1 text-slate-400 hover:text-slate-700"
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav aria-label="Navegação da aplicação" className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSection(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  } focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeType === 'urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-3 border-t border-slate-200/80 bg-white/60">
          <div className="rounded-lg bg-slate-100/70 p-2.5 border border-slate-200/60 text-[11px] text-slate-600">
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Direito Português Ativo
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
              Jurisprudência STJ/TR/TC e Legislação consolidada em Diário da República.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
