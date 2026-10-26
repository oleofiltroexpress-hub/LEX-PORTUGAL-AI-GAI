import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Users,
  Search,
  Trash2,
  Calendar,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Processo, RamoDireito, EstadoProcesso } from '../../types';
import { calcularDiasRestantes } from '../../utils/deadlines';

interface CasesSectionProps {
  modalNovoProcessoAberto: boolean;
  setModalNovoProcessoAberto: (aberto: boolean) => void;
}

export const CasesSection: React.FC<CasesSectionProps> = ({
  modalNovoProcessoAberto,
  setModalNovoProcessoAberto,
}) => {
  const {
    processos,
    addProcesso,
    deleteProcesso,
    selectedProcessoId,
    setSelectedProcessoId,
    clientes,
    prazos,
    addPrazo,
    togglePrazoCumprido,
  } = useApp();

  const [busca, setBusca] = useState('');
  const [modalNovoPrazoAberto, setModalNovoPrazoAberto] = useState(false);

  // Form State para novo Processo
  const [numeroProcessual, setNumeroProcessual] = useState('');
  const [tribunal, setTribunal] = useState('Tribunal Judicial da Comarca do Porto - Juízo Central Cível');
  const [especie, setEspecie] = useState('Ação de Processo Comum');
  const [ramo, setRamo] = useState<RamoDireito>('Processo Civil');
  const [clienteId, setClienteId] = useState(clientes.length > 0 ? clientes[0].id : '');
  const [partesContrariasTexto, setPartesContrariasTexto] = useState('');
  const [juizRelator, setJuizRelator] = useState('');
  const [valorCausa, setValorCausa] = useState('50000');
  const [faseProcessual, setFaseProcessual] = useState('Fase de Articulados');
  const [descricao, setDescricao] = useState('');

  // Form State para novo Prazo no processo selecionado
  const [tituloPrazo, setTituloPrazo] = useState('');
  const [dataLimitePrazo, setDataLimitePrazo] = useState('');
  const [baseLegalPrazo, setBaseLegalPrazo] = useState('Art. 569.º do CPC (Prazo de Contestação)');
  const [urgentePrazo, setUrgentePrazo] = useState(false);

  const processoAtivo = processos.find((p) => p.id === selectedProcessoId) || processos[0];

  const processosFiltrados = processos.filter(
    (p) =>
      p.numeroProcessual.toLowerCase().includes(busca.toLowerCase()) ||
      p.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
      p.tribunal.toLowerCase().includes(busca.toLowerCase())
  );

  const prazosDoProcesso = prazos.filter((prz) => prz.processoId === processoAtivo?.id);

  const handleSubmeterNovoProcesso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroProcessual.trim() || !clienteId) return;

    const clienteObj = clientes.find((c) => c.id === clienteId);
    const partesArray = partesContrariasTexto
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const novo = addProcesso({
      numeroProcessual: numeroProcessual.trim(),
      tribunal,
      especie,
      ramo,
      clienteId,
      clienteNome: clienteObj ? clienteObj.nome : 'Cliente Desconhecido',
      partesContrarias: partesArray.length > 0 ? partesArray : ['Parte Contrária Não Identificada'],
      intervenientes: [],
      juizRelator: juizRelator || undefined,
      valorCausa: parseFloat(valorCausa) || 0,
      estado: 'ativo',
      faseProcessual,
      descricao,
    });

    setSelectedProcessoId(novo.id);
    setModalNovoProcessoAberto(false);
    setNumeroProcessual('');
    setPartesContrariasTexto('');
    setDescricao('');
  };

  const handleSubmeterNovoPrazo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloPrazo.trim() || !dataLimitePrazo || !processoAtivo) return;

    const dias = calcularDiasRestantes(dataLimitePrazo);

    addPrazo({
      processoId: processoAtivo.id,
      numeroProcesso: processoAtivo.numeroProcessual,
      titulo: tituloPrazo,
      dataLimite: dataLimitePrazo,
      tipo: 'prazo_legal',
      urgente: urgentePrazo,
      cumprido: false,
      baseLegal: baseLegalPrazo,
      diasRestantes: dias,
    });

    setModalNovoPrazoAberto(false);
    setTituloPrazo('');
    setDataLimitePrazo('');
    setUrgentePrazo(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight font-serif">
            Gestão de Processos Judiciais
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhamento de autos em juízo (Citius), instâncias, fases processuais e prazos perentórios.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalNovoProcessoAberto(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Novo Processo Judicial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Lista de Processos */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por número Citius ou cliente..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            />
          </div>

          <div className="space-y-2">
            {processosFiltrados.map((proc) => (
              <GlassCard
                key={proc.id}
                hoverable
                onClick={() => setSelectedProcessoId(proc.id)}
                className={`p-3 transition-all ${
                  selectedProcessoId === proc.id
                    ? 'border-slate-900 ring-1 ring-slate-900'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {proc.numeroProcessual}
                  </span>
                  <Badge variant={proc.estado === 'ativo' ? 'success' : 'neutral'}>
                    {proc.estado.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-slate-800 mt-1 truncate">
                  {proc.clienteNome}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{proc.tribunal}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                  <span>{proc.ramo}</span>
                  <span className="font-medium text-slate-700">
                    {proc.valorCausa.toLocaleString('pt-PT')} €
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Coluna Direita: Detalhe do Processo e Prazos Associados */}
        <div className="lg:col-span-2">
          {processoAtivo ? (
            <div className="space-y-5">
              <GlassCard className="p-6 space-y-5">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{processoAtivo.especie}</Badge>
                      <Badge variant="success">EM ANDAMENTO</Badge>
                      <span className="text-xs text-slate-400 font-medium">
                        {processoAtivo.ramo}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold font-mono text-slate-900 mt-1.5">
                      {processoAtivo.numeroProcessual}
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">
                      {processoAtivo.tribunal}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteProcesso(processoAtivo.id)}
                    title="Arquivar ou eliminar processo"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Grelha de Informação Processual */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Cliente / Mandante:</span>
                    <span className="font-semibold text-slate-900">{processoAtivo.clienteNome}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Partes Contrárias:</span>
                    <span className="font-medium text-slate-800">
                      {processoAtivo.partesContrarias.join(', ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Fase Processual Atual:</span>
                    <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {processoAtivo.faseProcessual}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Valor da Causa:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {processoAtivo.valorCausa.toLocaleString('pt-PT')} €
                    </span>
                  </div>

                  {processoAtivo.juizRelator && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-[10px]">Juiz / Magistrado Relator:</span>
                      <span className="font-medium text-slate-800">{processoAtivo.juizRelator}</span>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[10px]">Objeto do Litígio:</span>
                    <p className="text-slate-700 leading-relaxed mt-0.5 bg-slate-50 p-2.5 rounded border border-slate-200/70">
                      {processoAtivo.descricao}
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Prazos Processuais Vinculados a este Processo */}
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Prazos Perentórios do Processo (art. 138.º CPC)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setModalNovoPrazoAberto(true)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-900 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Prazo
                  </button>
                </div>

                {prazosDoProcesso.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    Nenhum prazo judicial pendente registado para este processo.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {prazosDoProcesso.map((prazo) => (
                      <div
                        key={prazo.id}
                        className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs ${
                          prazo.cumprido
                            ? 'bg-slate-50/50 border-slate-200 opacity-60'
                            : 'bg-white border-slate-200/90'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => togglePrazoCumprido(prazo.id)}
                            className={`mt-0.5 p-1 rounded border ${
                              prazo.cumprido
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 text-transparent bg-white'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                          </button>
                          <div>
                            <span
                              className={`font-semibold block ${
                                prazo.cumprido ? 'line-through text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {prazo.titulo}
                            </span>
                            <span className="text-[11px] text-slate-500 block">{prazo.baseLegal}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-medium text-slate-800 block">
                            {prazo.dataLimite}
                          </span>
                          <span
                            className={`text-[10px] font-medium ${
                              prazo.cumprido ? 'text-emerald-600' : 'text-amber-700'
                            }`}
                          >
                            {prazo.cumprido ? 'Cumprido' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          ) : (
            <GlassCard className="p-12 text-center text-xs text-slate-400">
              Selecione um processo na lista à esquerda para inspecionar os detalhes e prazos.
            </GlassCard>
          )}
        </div>
      </div>

      {/* Modal para Novo Processo Judicial */}
      <Modal
        isOpen={modalNovoProcessoAberto}
        onClose={() => setModalNovoProcessoAberto(false)}
        title="Abertura de Processo Judicial"
        subtitle="Registo de novo dossier com número de distribuição Citius e identificação das partes."
      >
        <form onSubmit={handleSubmeterNovoProcesso} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Número Processual Citius * (ex: 1420/24.8T8PRT)
            </label>
            <input
              type="text"
              required
              value={numeroProcessual}
              onChange={(e) => setNumeroProcessual(e.target.value)}
              placeholder="ex: 1245/26.3T8PRT"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Cliente / Mandante *</label>
              <select
                required
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              >
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({c.nif})
                  </option>
                ))}
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
                <option value="Família e Sucessões">Família e Sucessões</option>
                <option value="Insolvência e Recuperação">Insolvência</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Tribunal e Juízo Competente *
            </label>
            <input
              type="text"
              required
              value={tribunal}
              onChange={(e) => setTribunal(e.target.value)}
              placeholder="ex: Tribunal Judicial da Comarca do Porto - Juízo Central Cível"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Partes Contrárias (separadas por vírgula) *
            </label>
            <input
              type="text"
              required
              value={partesContrariasTexto}
              onChange={(e) => setPartesContrariasTexto(e.target.value)}
              placeholder="ex: Construtora Alfa, S.A., Manuel Joaquim Antunes"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Espécie Processual</label>
              <input
                type="text"
                value={especie}
                onChange={(e) => setEspecie(e.target.value)}
                placeholder="ex: Ação de Processo Comum"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Valor da Causa (€)</label>
              <input
                type="number"
                value={valorCausa}
                onChange={(e) => setValorCausa(e.target.value)}
                placeholder="50000"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Descrição do Litígio</label>
            <textarea
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Resumo sumário da causa de pedir e pedidos..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalNovoProcessoAberto(false)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
            >
              Criar Processo
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal para Novo Prazo */}
      <Modal
        isOpen={modalNovoPrazoAberto}
        onClose={() => setModalNovoPrazoAberto(false)}
        title="Registo de Prazo Processual"
        subtitle={`Processo: ${processoAtivo?.numeroProcessual}`}
      >
        <form onSubmit={handleSubmeterNovoPrazo} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Descrição do Prazo *</label>
            <input
              type="text"
              required
              value={tituloPrazo}
              onChange={(e) => setTituloPrazo(e.target.value)}
              placeholder="ex: Apresentação da Réplica"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Data Termo (YYYY-MM-DD) *</label>
              <input
                type="date"
                required
                value={dataLimitePrazo}
                onChange={(e) => setDataLimitePrazo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Dispositivo Legal</label>
              <input
                type="text"
                value={baseLegalPrazo}
                onChange={(e) => setBaseLegalPrazo(e.target.value)}
                placeholder="ex: Art. 584.º do CPC (30 dias)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={urgentePrazo}
              onChange={(e) => setUrgentePrazo(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <span className="font-medium text-slate-800">
              Prazo de natureza urgente (não se suspende em férias judiciais)
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalNovoPrazoAberto(false)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
            >
              Registar Prazo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
