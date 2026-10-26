import React, { useState } from 'react';
import {
  Users,
  Plus,
  ShieldAlert,
  Search,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Trash2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Cliente } from '../../types';
import { verificarConflitoInteresses, validarNIFPortugues } from '../../utils/legal';

interface ClientsSectionProps {
  modalNovoClienteAberto: boolean;
  setModalNovoClienteAberto: (aberto: boolean) => void;
}

export const ClientsSection: React.FC<ClientsSectionProps> = ({
  modalNovoClienteAberto,
  setModalNovoClienteAberto,
}) => {
  const { clientes, addCliente, deleteCliente, processos } = useApp();

  const [busca, setBusca] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    clientes.length > 0 ? clientes[0] : null
  );

  // Form State para novo cliente
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'singular' | 'coletivo'>('singular');
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [morada, setMorada] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [nifErro, setNifErro] = useState<string | null>(null);

  // Verificador Interativo de Conflitos de Interesses
  const [pesquisaConflitoNome, setPesquisaConflitoNome] = useState('');
  const [pesquisaConflitoNif, setPesquisaConflitoNif] = useState('');

  const conflitosDetectados = verificarConflitoInteresses(
    pesquisaConflitoNome,
    pesquisaConflitoNif,
    clientes,
    processos
  );

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.nif.includes(busca) ||
      c.email.toLowerCase().includes(busca.toLowerCase())
  );

  const handleSubmeterNovoCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !nif.trim()) return;

    if (!validarNIFPortugues(nif)) {
      setNifErro('O NIF introduzido não obedece ao algoritmo de verificação módulo 11 português.');
      return;
    }
    setNifErro(null);

    const novo = addCliente({
      nome,
      tipo,
      nif: nif.trim(),
      email,
      telefone,
      morada,
      ativo: true,
      observacoes,
    });

    setClienteSelecionado(novo);
    setModalNovoClienteAberto(false);
    setNome('');
    setNif('');
    setEmail('');
    setTelefone('');
    setMorada('');
    setObservacoes('');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight font-serif">
            Gestão de Clientes & Prevenção de Conflitos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registo de pessoas singulares e coletivas, verificação prévia de impedimentos (art. 99.º do EOA).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalNovoClienteAberto(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Novo Cliente</span>
        </button>
      </div>

      {/* Caixa Interativa de Deteção Preventiva de Conflitos */}
      <GlassCard className="p-4 bg-slate-50/70 border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <h2 className="text-xs font-semibold text-slate-900">
            Aferição Preventiva de Conflito de Interesses (Art. 99.º do Estatuto da Ordem dos Advogados)
          </h2>
        </div>
        <p className="text-[11px] text-slate-500 mb-3">
          Introduza o nome ou NIF de um novo cliente proposto ou contraparte para verificar se figura como parte contrária em processos ativos ou cliente da sociedade.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={pesquisaConflitoNome}
            onChange={(e) => setPesquisaConflitoNome(e.target.value)}
            placeholder="Nome da entidade ou contraparte a analisar..."
            className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
          />
          <input
            type="text"
            value={pesquisaConflitoNif}
            onChange={(e) => setPesquisaConflitoNif(e.target.value)}
            placeholder="NIF / NIPC da entidade..."
            className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
          />
        </div>

        {/* Resultados da Pesquisa de Conflitos */}
        {(pesquisaConflitoNome || pesquisaConflitoNif) && (
          <div className="mt-3 pt-3 border-t border-slate-200/60">
            {conflitosDetectados.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200/70">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Nenhum impedimento aparente ou coincidência com partes contrárias ativas registado no sistema.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {conflitosDetectados.map((conf, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-rose-900 bg-rose-50/80 p-2.5 rounded-lg border border-rose-200/80"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-950 block">{conf.motivo}</span>
                      <span className="text-[11px] leading-relaxed block mt-0.5">{conf.detalhe}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Grid de Clientes e Ficha Detalhada */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Lista de Clientes */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por nome, NIF ou e-mail..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            />
          </div>

          <div className="space-y-2">
            {clientesFiltrados.map((cliente) => (
              <GlassCard
                key={cliente.id}
                hoverable
                onClick={() => setClienteSelecionado(cliente)}
                className={`p-3 transition-all ${
                  clienteSelecionado?.id === cliente.id
                    ? 'border-slate-900 ring-1 ring-slate-900'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {cliente.nome}
                  </span>
                  <Badge variant={cliente.tipo === 'coletivo' ? 'default' : 'neutral'}>
                    {cliente.tipo === 'coletivo' ? 'COLETIVA' : 'SINGULAR'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span className="font-mono">NIF: {cliente.nif}</span>
                  <span>{cliente.telefone}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Coluna Direita: Ficha Completa do Cliente */}
        <div className="lg:col-span-2">
          {clienteSelecionado ? (
            <GlassCard className="p-6 space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={clienteSelecionado.tipo === 'coletivo' ? 'default' : 'neutral'}>
                      Pessoa {clienteSelecionado.tipo === 'coletivo' ? 'Coletiva' : 'Singular'}
                    </Badge>
                    <Badge variant="success">ATIVO</Badge>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    {clienteSelecionado.nome}
                  </h2>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    NIF / NIPC: {clienteSelecionado.nif}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    deleteCliente(clienteSelecionado.id);
                    setClienteSelecionado(null);
                  }}
                  title="Eliminar cliente"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Informações de Contacto e Morada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{clienteSelecionado.email}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{clienteSelecionado.telefone}</span>
                </div>

                <div className="sm:col-span-2 flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{clienteSelecionado.morada}</span>
                </div>
              </div>

              {/* Notas e Observações Confidenciais */}
              {clienteSelecionado.observacoes && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Notas Internas do Mandato:
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                    {clienteSelecionado.observacoes}
                  </p>
                </div>
              )}

              {/* Processos Vinculados ao Cliente */}
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  Autos e Processos Judiciais Ativos
                </h3>
                <div className="space-y-2">
                  {processos
                    .filter((p) => p.clienteId === clienteSelecionado.id)
                    .map((proc) => (
                      <div
                        key={proc.id}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-900 block">
                            {proc.numeroProcessual}
                          </span>
                          <span className="text-[11px] text-slate-500">{proc.tribunal}</span>
                        </div>
                        <Badge variant="outline">{proc.estado.toUpperCase()}</Badge>
                      </div>
                    ))}
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-12 text-center text-xs text-slate-400">
              Selecione um cliente para visualizar os contactos e os respetivos processos judiciais.
            </GlassCard>
          )}
        </div>
      </div>

      {/* Modal de Registo de Novo Cliente */}
      <Modal
        isOpen={modalNovoClienteAberto}
        onClose={() => setModalNovoClienteAberto(false)}
        title="Registar Nova Ficha de Cliente"
        subtitle="Identificação de acordo com o regime de prevenção do branqueamento de capitais e deontologia forense."
      >
        <form onSubmit={handleSubmeterNovoCliente} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Nome Completo ou Denominação Social *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="ex: Transportadora Portuense, Lda."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tipo de Entidade</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              >
                <option value="singular">Pessoa Singular</option>
                <option value="coletivo">Pessoa Coletiva</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                NIF / NIPC Português (9 dígitos) *
              </label>
              <input
                type="text"
                required
                maxLength={9}
                value={nif}
                onChange={(e) => {
                  setNif(e.target.value);
                  setNifErro(null);
                }}
                placeholder="ex: 502011475"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              />
              {nifErro && <p className="text-[10px] text-rose-600 mt-1">{nifErro}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Endereço de E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@dominio.pt"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Contacto Telefónico</label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="+351 912 000 000"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Morada Fiscal Completa</label>
            <input
              type="text"
              value={morada}
              onChange={(e) => setMorada(e.target.value)}
              placeholder="Rua, número, código postal e localidade"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Observações e Objeto do Mandato
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Indicações sobre o litígio ou histórico da relação profissional..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalNovoClienteAberto(false)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
            >
              Registar Cliente
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
