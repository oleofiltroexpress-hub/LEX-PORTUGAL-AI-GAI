import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Trash2,
  ShieldAlert,
  Sliders,
  Cpu,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';

export const AdminSection: React.FC = () => {
  const { configuracao, updateConfiguracao, resetDataToDemo, clearAllData } = useApp();

  const [nomeEscritorio, setNomeEscritorio] = useState(configuracao.nomeEscritorio);
  const [cedulaProfissional, setCedulaProfissional] = useState(configuracao.cedulaProfissional);
  const [comarcaSede, setComarcaSede] = useState(configuracao.comarcaSede);
  const [modeloGemini, setModeloGemini] = useState(configuracao.modeloGeminiPadrao);
  const [temperatura, setTemperatura] = useState(configuracao.temperatura);
  const [verificacaoRigorosa, setVerificacaoRigorosa] = useState(configuracao.verificacaoRigorosaFontes);
  const [notificacoesDias, setNotificacoesDias] = useState(configuracao.notificacoesPrazosDias);
  const [diasRetencao, setDiasRetencao] = useState(configuracao.diasRetencaoLogs);
  const [salvo, setSalvo] = useState(false);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfiguracao({
      nomeEscritorio,
      cedulaProfissional,
      comarcaSede,
      modeloGeminiPadrao: modeloGemini,
      temperatura,
      verificacaoRigorosaFontes: verificacaoRigorosa,
      notificacoesPrazosDias: notificacoesDias,
      diasRetencaoLogs: diasRetencao,
    });
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight font-serif">
            Administração & Parâmetros do Sistema
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuração institucional do escritório, modelo Gemini API, conformidade RGPD e retenção de dados.
          </p>
        </div>
      </div>

      <form onSubmit={handleSalvar} className="space-y-6">
        {/* Identificação Institucional */}
        <GlassCard className="p-5 space-y-4">
          <h2 className="text-xs font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building className="w-4 h-4 text-slate-700" />
            Dados Institucionais do Escritório / Patrono
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Denominação da Sociedade ou Advogado
              </label>
              <input
                type="text"
                required
                value={nomeEscritorio}
                onChange={(e) => setNomeEscritorio(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Cédula Profissional / Conselho Regional
                </label>
                <input
                  type="text"
                  required
                  value={cedulaProfissional}
                  onChange={(e) => setCedulaProfissional(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Comarca Sede de Intervenção Principal
                </label>
                <input
                  type="text"
                  required
                  value={comarcaSede}
                  onChange={(e) => setComarcaSede(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Parâmetros do Motor Gemini API */}
        <GlassCard className="p-5 space-y-4">
          <h2 className="text-xs font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Cpu className="w-4 h-4 text-slate-700" />
            Configuração do Motor Google Gemini & RAG
          </h2>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Modelo Gemini Predefinido
                </label>
                <select
                  value={modeloGemini}
                  onChange={(e) => setModeloGemini(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none font-mono"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Recomendado / Rápido & Rigoroso)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (Raciocínio Jurídico Complexo)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  A chave da API encontra-se protegida no servidor e nunca é transferida para o cliente.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-medium text-slate-700">
                    Temperatura do Modelo: <span className="font-mono font-bold">{temperatura}</span>
                  </label>
                  <span className="text-[10px] text-slate-400">0.0 (determinístico) a 1.0</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={temperatura}
                  onChange={(e) => setTemperatura(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-slate-900"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Valores baixos (0.1 a 0.3) garantem fidelidade estrita às fontes legislativas e minimizam criatividade especulativa.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={verificacaoRigorosa}
                onChange={(e) => setVerificacaoRigorosa(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="font-medium text-slate-800">
                Ativar modo estrito de citação (rejeitar respostas que citem acórdãos ou artigos não confirmados)
              </span>
            </label>
          </div>
        </GlassCard>

        {/* Políticas de Retenção e Prazos */}
        <GlassCard className="p-5 space-y-4">
          <h2 className="text-xs font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Sliders className="w-4 h-4 text-slate-700" />
            Alertas de Prazos & Retenção de Dados (RGPD)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Antecedência de Alerta para Prazos Perentórios (Dias)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={notificacoesDias}
                onChange={(e) => setNotificacoesDias(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Período de Retenção de Logs de Auditoria (Dias)
              </label>
              <input
                type="number"
                min={30}
                max={3650}
                value={diasRetencao}
                onChange={(e) => setDiasRetencao(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
              />
            </div>
          </div>
        </GlassCard>

        {/* Botão de Guardar */}
        <div className="flex items-center justify-between pt-2">
          {salvo ? (
            <span className="text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Configurações atualizadas com sucesso!
            </span>
          ) : (
            <span></span>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Parâmetros</span>
          </button>
        </div>
      </form>

      {/* Zona de Gestão de Dados e Reposição */}
      <GlassCard className="p-5 border-rose-200 bg-rose-50/20">
        <h2 className="text-xs font-semibold text-rose-900 flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          Operações de Base de Dados e Dados Demonstrativos
        </h2>
        <p className="text-xs text-slate-600 mb-4">
          Pode repor o conjunto inicial de clientes, processos e acórdãos portugueses para demonstração ou limpar integralmente o armazenamento local.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={resetDataToDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Repor Dados Demonstrativos Iniciais</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Tem a certeza que deseja limpar todos os clientes e processos?')) {
                clearAllData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Todos os Dados</span>
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
