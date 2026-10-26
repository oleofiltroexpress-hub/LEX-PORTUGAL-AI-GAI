import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  ExternalLink,
  Search,
  BookmarkCheck,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { FonteJuridica, RamoDireito, TipoFonte, EstadoVigencia } from '../../types';

export const LibrarySection: React.FC = () => {
  const { fontes, addFonte } = useApp();

  const [busca, setBusca] = useState('');
  const [modalNovaFonteAberto, setModalNovaFonteAberto] = useState(false);

  // Form State para nova fonte
  const [identificador, setIdentificador] = useState('');
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<TipoFonte>('legislacao');
  const [ramo, setRamo] = useState<RamoDireito>('Processo Civil');
  const [entidade, setEntidade] = useState('Assembleia da República');
  const [urlOficial, setUrlOficial] = useState('');
  const [sumario, setSumario] = useState('');
  const [artigosTexto, setArtigosTexto] = useState('');

  const fontesFiltradas = fontes.filter(
    (f) =>
      f.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      f.identificador.toLowerCase().includes(busca.toLowerCase()) ||
      f.ramo.toLowerCase().includes(busca.toLowerCase())
  );

  const handleSubmitNovaFonte = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identificador.trim() || !titulo.trim()) return;

    const artigosArray = artigosTexto
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    addFonte({
      identificador,
      titulo,
      tipo,
      ramo,
      entidadeEmissora: entidade,
      data: new Date().toISOString().split('T')[0],
      urlOficial: urlOficial || 'https://diariodarepublica.pt',
      versao: 'Versão em vigor (adicionada manualmente)',
      estadoVigencia: 'em_vigor',
      artigosRelevantes: artigosArray.length > 0 ? artigosArray : ['Artigo 1.º'],
      sumario: sumario || 'Fonte indexada manualmente para o acervo do escritório.',
    });

    setModalNovaFonteAberto(false);
    setIdentificador('');
    setTitulo('');
    setSumario('');
    setArtigosTexto('');
    setUrlOficial('');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight font-serif">
            Biblioteca Legislativa & Jurisprudencial
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Corpus oficial consolidado do Direito Português: Códigos, Leis Avulsas e Acórdãos dos Tribunais Superiores.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalNovaFonteAberto(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Indexar Nova Fonte / Diploma</span>
        </button>
      </div>

      {/* Barra de Pesquisa Rápida */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Filtrar por nome do diploma ou ramo..."
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none transition-all"
        />
      </div>

      {/* Catálogo de Códigos e Diplomas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fontesFiltradas.map((fonte) => (
          <GlassCard key={fonte.id} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <Badge variant={fonte.tipo === 'legislacao' ? 'default' : 'info'}>
                  {fonte.tipo === 'legislacao' ? 'LEGISLAÇÃO CONSOLIDADA' : 'JURISPRUDÊNCIA'}
                </Badge>
                <Badge variant="success">EM VIGOR</Badge>
              </div>

              <h2 className="text-sm font-bold text-slate-900 mt-2">{fonte.titulo}</h2>
              <p className="text-xs font-mono text-slate-500 mt-0.5">{fonte.identificador}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                {fonte.entidadeEmissora} &bull; {fonte.ramo}
              </p>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {fonte.sumario}
              </p>

              {fonte.artigosRelevantes.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {fonte.artigosRelevantes.map((art, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono bg-slate-50 text-slate-700 border border-slate-200/80 px-2 py-0.5 rounded"
                    >
                      {art}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400 font-mono">
                Versão: {fonte.versao}
              </span>
              <a
                href={fonte.urlOficial}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-slate-900 hover:underline font-medium text-[11px]"
              >
                <ExternalLink className="w-3 h-3" />
                Diário da República / DGSI
              </a>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Modal para Indexar Nova Fonte */}
      <Modal
        isOpen={modalNovaFonteAberto}
        onClose={() => setModalNovaFonteAberto(false)}
        title="Indexar Nova Fonte Normativa ou Jurisprudencial"
        subtitle="Registe diplomas ou acórdãos oficiais com garantia de proveniência e integridade."
      >
        <form onSubmit={handleSubmitNovaFonte} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Identificador Oficial * (ex: Lei n.º 62/2013 ou Ac. STJ Proc. 142/21)
            </label>
            <input
              type="text"
              required
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              placeholder="ex: Lei n.º 41/2013, de 26 de junho"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Título do Diploma ou Assunto do Acórdão *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="ex: Código de Processo Civil"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tipo de Fonte</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoFonte)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              >
                <option value="legislacao">Legislação Consolidada</option>
                <option value="jurisprudencia">Jurisprudência Superior</option>
                <option value="doutrina">Doutrina & Parecer</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Ramo do Direito</label>
              <select
                value={ramo}
                onChange={(e) => setRamo(e.target.value as RamoDireito)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              >
                <option value="Processo Civil">Processo Civil</option>
                <option value="Direito Civil">Direito Civil</option>
                <option value="Direito Comercial e Societário">Direito Comercial</option>
                <option value="Direito do Trabalho">Direito do Trabalho</option>
                <option value="Direito Constitucional">Direito Constitucional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Entidade Emissora ou Tribunal
            </label>
            <input
              type="text"
              value={entidade}
              onChange={(e) => setEntidade(e.target.value)}
              placeholder="ex: Supremo Tribunal de Justiça"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              URL Oficial (Diário da República ou DGSI)
            </label>
            <input
              type="url"
              value={urlOficial}
              onChange={(e) => setUrlOficial(e.target.value)}
              placeholder="https://diariodarepublica.pt/..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Artigos Relevantes (separados por vírgula)
            </label>
            <input
              type="text"
              value={artigosTexto}
              onChange={(e) => setArtigosTexto(e.target.value)}
              placeholder="ex: Art. 138.º CPC, Art. 569.º CPC, Art. 584.º CPC"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Sumário Normativo / Doutrinário
            </label>
            <textarea
              rows={3}
              value={sumario}
              onChange={(e) => setSumario(e.target.value)}
              placeholder="Descreva o princípio geral ou a tese jurídica uniformizada..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalNovaFonteAberto(false)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
            >
              Indexar Fonte
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
