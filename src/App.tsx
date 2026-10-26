/**
 * LEX PORTUGAL AI — Plataforma Jurídica Inteligente para o Direito Português
 * Sistema Visual: Branco, Cinzento-Escuro / Carvão, Glassmorphism Discreto
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardSection } from './components/sections/DashboardSection';
import { AssistantSection } from './components/sections/AssistantSection';
import { ResearchSection } from './components/sections/ResearchSection';
import { LibrarySection } from './components/sections/LibrarySection';
import { DocumentAnalysisSection } from './components/sections/DocumentAnalysisSection';
import { DraftingSection } from './components/sections/DraftingSection';
import { ClientsSection } from './components/sections/ClientsSection';
import { CasesSection } from './components/sections/CasesSection';
import { MemorySection } from './components/sections/MemorySection';
import { AuditSection } from './components/sections/AuditSection';
import { AdminSection } from './components/sections/AdminSection';

const MainContent: React.FC = () => {
  const { currentSection, setCurrentSection } = useApp();

  const [modalNovoProcessoAberto, setModalNovoProcessoAberto] = useState(false);
  const [modalNovoClienteAberto, setModalNovoClienteAberto] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenNewCase = () => {
    setCurrentSection('cases');
    setModalNovoProcessoAberto(true);
  };

  const handleOpenNewClient = () => {
    setCurrentSection('clients');
    setModalNovoClienteAberto(true);
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return (
          <DashboardSection
            onOpenNewCaseModal={handleOpenNewCase}
            onOpenNewClientModal={handleOpenNewClient}
          />
        );
      case 'assistant':
        return <AssistantSection />;
      case 'research':
        return <ResearchSection />;
      case 'library':
        return <LibrarySection />;
      case 'document-analysis':
        return <DocumentAnalysisSection />;
      case 'drafting':
        return <DraftingSection />;
      case 'clients':
        return (
          <ClientsSection
            modalNovoClienteAberto={modalNovoClienteAberto}
            setModalNovoClienteAberto={setModalNovoClienteAberto}
          />
        );
      case 'cases':
        return (
          <CasesSection
            modalNovoProcessoAberto={modalNovoProcessoAberto}
            setModalNovoProcessoAberto={setModalNovoProcessoAberto}
          />
        );
      case 'memory':
        return <MemorySection />;
      case 'audit':
        return <AuditSection />;
      case 'admin':
        return <AdminSection />;
      default:
        return (
          <DashboardSection
            onOpenNewCaseModal={handleOpenNewCase}
            onOpenNewClientModal={handleOpenNewClient}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white antialiased">
      <Header
        onOpenNewCaseModal={handleOpenNewCase}
        onOpenNewClientModal={handleOpenNewClient}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-slate-50/50 to-white/80">
          <div className="max-w-7xl mx-auto">{renderSection()}</div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
