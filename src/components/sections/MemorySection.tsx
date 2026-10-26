import React, { useState } from 'react';
import {
  Brain,
  Plus,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { TipoMemoria, MemoriaRegisto } from '../../types';

export const MemorySection: React.FC = () => {
  const { memorias, addMemoria, deleteMemoria, processos } = useApp();

  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [modalNovaMemoriaAberto, setModalNovaMemoriaAberto] = useState(false);

  // Form State para nova memória
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tipo, setTipo] = useState<TipoMemoria>('operacional');
  const [proveniencia, setProveniencia] = useState('');
  const [processoId, setProcessoId] = useState('');

  const memoriasFiltradas = memorias.filter(
    (m) => filtroTipo === 'todos' || m.tipo === filtroTipo
  );

  const handleSubmitNovaMemoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !conteudo.trim()) return;

    addMemoria({
      tipo,
      titulo,
      conteudo,
      proveniencia: proveniencia || 'Registo manual autorizado pelo advogado',
      processoId: processoId || undefined,
      valido: true,
    });

    setModalNovaMemoriaAberto(false);
    setTitulo('');
    setConteudo('');
    setProveniencia('');
    setProcessoId('');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight font-serif">
            Memória Persistente & Acervo de Conhecimento
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão estruturada de memórias com preservação da proveniência, contexto processual e isolamento de segredo profissional.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalNovaMemoriaAberto(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Registar Memória</span>
        </button>
      </div>

      {/* Explicação dos Três Níveis de Memória */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 border-slate-200">
          <Badge variant="default" className="text-[10px] uppercase font-mono">
            A. Operacional
          </Badge>
          <h2 className="text-xs font-bold text-slate-900 mt-2">Dados & Decisões do Processo</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Instruções expressas de clientes, limites negociais e estratégias de articulados autorizadas pelo patrono.
          </p>
        </GlassCard>

        <GlassCard className="p-4 border-slate-200">
          <Badge variant="info" className="text-[10px] uppercase font-mono">
            B. Semântica
          </Badge>
          <h2 className="text-xs font-bold text-slate-900 mt-2">Fragmentos RAG & Proveniência</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Excertos de peças, acórdãos e relatórios probatórios recuperáveis por relevância jurídica e temporal.
          </p>
        </GlassCard>

        <GlassCard className="p-4 border-slate-200">
          <Badge variant="success" className="text-[10px] uppercase font-mono">
            C. Melhoria
          </Badge>
          <h2 className="text-xs font-bold text-slate-900 mt-2">Estilo & Casos Corrigidos</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Anotações de estilo e correções aprovadas pelo advogado para prevenir erros reiterados de redação.
          </p>
        </GlassCard>
      </div>

      {/* Filtros de Memória */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 text-xs">
        <span className="text-slate-400 text-[11px]">Filtrar acervo:</span>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
          {(['todos', 'operacional', 'semantica', 'melhoria'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFiltroTipo(t)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md capitalize transition-all ${
                filtroTipo === t
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Registos de Memória */}
      <div className="space-y-3">
        {memoriasFiltradas.length === 0 ? (
          <GlassCard className="p-8 text-center text-xs text-slate-400">
            Nenhuma memória encontrada para o filtro selecionado.
          </GlassCard>
        ) : (
          memoriasFiltradas.map((mem) => (
            <GlassCard key={mem.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      mem.tipo === 'operacional'
                        ? 'default'
                        : mem.tipo === 'semantica'
                        ? 'info'
                        : 'success'
                    }
                    className="text-[10px] uppercase font-mono"
                  >
                    {mem.tipo}
                  </Badge>
                  <h3 className="text-xs font-bold text-slate-900">{mem.titulo}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{mem.dataRegisto}</span>
                  <button
                    type="button"
                    onClick={() => deleteMemoria(mem.id)}
                    title="Invalidar ou remover memória"
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200/60">
                {mem.conteudo}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>
                  <strong>Proveniência:</strong> {mem.proveniencia}
                </span>
                {mem.processoId && (
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                    Processo: {processos.find((p) => p.id === mem.processoId)?.numeroProcessual || mem.processoId}
                  </span>
                )}
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Modal para Nova Memória */}
      <Modal
        isOpen={modalNovaMemoriaAberto}
        onClose={() => setModalNovaMemoriaAberto(false)}
        title="Registar Nova Memória de Escritório"
        subtitle="Adicione uma diretiva operacional, conhecimento semântico ou melhoria deontológica."
      >
        <form onSubmit={handleSubmitNovaMemoria} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Título ou Assunto da Memória *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="ex: Instrução de Cliente: Limite de Transação"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tipo de Memória</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoMemoria)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              >
                <option value="operacional">Operacional (Processo/Cliente)</option>
                <option value="semantica">Semântica (Conhecimento RAG)</option>
                <option value="melhoria">Melhoria de Estilo / Regra Interna</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Processo Vinculado</label>
              <select
                value={processoId}
                onChange={(e) => setProcessoId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              >
                <option value="">Nenhum (Âmbito Geral)</option>
                {processos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.numeroProcessual}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Proveniência / Fonte do Dado *
            </label>
            <input
              type="text"
              required
              value={proveniencia}
              onChange={(e) => setProveniencia(e.target.value)}
              placeholder="ex: Ata de Reunião com Cliente em 12/03 ou Despacho fls. 45"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Conteúdo da Memória *
            </label>
            <textarea
              rows={4}
              required
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Descreva o conteúdo factual, a regra jurídica ou o limite fixado..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalNovaMemoriaAberto(false)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
            >
              Guardar Memória
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
