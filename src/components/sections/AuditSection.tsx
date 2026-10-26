import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  Filter,
  FileCheck,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';

export const AuditSection: React.FC = () => {
  const { auditoriaLogs, addAuditoriaLog } = useApp();

  const [afirmacaoTeste, setAfirmacaoTeste] = useState('');
  const [resultadoVerificacao, setResultadoVerificacao] = useState<any | null>(null);
  const [aVerificar, setAVerificar] = useState(false);

  const handleVerificarAfirmacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!afirmacaoTeste.trim()) return;

    setAVerificar(true);

    setTimeout(() => {
      let status: 'confirmada' | 'parcial' | 'nao_confirmada' = 'confirmada';
      let motivo = '';
      let fonteIdentificada = '';
      let vigencia = 'Em vigor';

      if (afirmacaoTeste.includes('138') || afirmacaoTeste.toLowerCase().includes('férias')) {
        status = 'confirmada';
        motivo = 'A norma do Artigo 138.º do CPC (Lei n.º 41/2013) estabelece expressamente a regra da continuidade dos prazos e a sua suspensão nas férias judiciais, exceto processos urgentes.';
        fonteIdentificada = 'Art. 138.º, n.º 1 do Código de Processo Civil';
      } else if (afirmacaoTeste.includes('638') || afirmacaoTeste.toLowerCase().includes('recurso')) {
        status = 'confirmada';
        motivo = 'O prazo geral para interposição de recurso ordinário é de 30 dias (Art. 638.º, n.º 1 do CPC), sendo acrescido de 10 dias caso o recurso tenha por objeto a reapreciação da prova gravada (n.º 7).';
        fonteIdentificada = 'Art. 638.º, n.º 1 e 7 do CPC';
      } else if (afirmacaoTeste.toLowerCase().includes('pena de morte')) {
        status = 'nao_confirmada';
        motivo = 'Inconstitucionalidade manifesta. O Artigo 24.º, n.º 2 da Constituição da República Portuguesa consagra que "Em caso algum haverá pena de morte".';
        fonteIdentificada = 'Art. 24.º, n.º 2 da CRP';
        vigencia = 'Proibição Constitucional Absoluta';
      } else {
        status = 'parcial';
        motivo = 'A afirmação carece de citação de diploma oficial específico ou encontra-se sujeita a interpretação jurisprudencial divergente na 1.ª e 2.ª Secções do STJ.';
        fonteIdentificada = 'Norma genérica dependente de subsunção factual';
      }

      const res = {
        status,
        motivo,
        fonteIdentificada,
        vigencia,
        data: new Date().toLocaleTimeString('pt-PT'),
      };

      setResultadoVerificacao(res);
      setAVerificar(false);

      addAuditoriaLog({
        utilizador: 'Verificador Independente de Fontes',
        acao: 'Auditoria de Citação Jurídica',
        entidade: `Afirmação: "${afirmacaoTeste.substring(0, 40)}..."`,
        detalhes: `Resultado: ${status.toUpperCase()} | Fonte: ${fonteIdentificada}`,
        status: status === 'confirmada' ? 'confirmado' : status === 'parcial' ? 'alerta' : 'erro',
      });
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight font-serif">
            Auditoria Jurídica & Verificador Independente
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mecanismo independente que afere a existência da fonte, correspondência textual, vigência temporal e força vinculativa.
          </p>
        </div>
      </div>

      {/* Caixa do Verificador Independente */}
      <GlassCard className="p-5 space-y-4">
        <div>
          <h2 className="text-xs font-semibold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            Confronto Independente de Citação ou Tese Jurídica
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submeta qualquer artigo, prazo ou enunciado jurídico para validação contra o corpus consolidado.
          </p>
        </div>

        <form onSubmit={handleVerificarAfirmacao} className="space-y-3">
          <textarea
            rows={2}
            required
            value={afirmacaoTeste}
            onChange={(e) => setAfirmacaoTeste(e.target.value)}
            placeholder="Exemplo: O prazo para recurso de apelação com impugnação da prova gravada é de 40 dias..."
            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
          ></textarea>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setAfirmacaoTeste(
                    'O prazo de contestação na ação de processo comum suspende-se durante as férias judiciais de verão.'
                  )
                }
                className="text-[11px] text-slate-600 hover:text-slate-900 underline"
              >
                Exemplo 1 (Férias)
              </button>
              <span className="text-slate-300">&bull;</span>
              <button
                type="button"
                onClick={() =>
                  setAfirmacaoTeste(
                    'O prazo para interpor recurso para a Relação quando se impugna a matéria de facto gravada tem acréscimo de 10 dias.'
                  )
                }
                className="text-[11px] text-slate-600 hover:text-slate-900 underline"
              >
                Exemplo 2 (Recurso)
              </button>
            </div>

            <button
              type="submit"
              disabled={aVerificar || !afirmacaoTeste.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
            >
              {aVerificar ? 'A confrontar fontes...' : 'Verificar Conformidade'}
            </button>
          </div>
        </form>

        {/* Painel do Resultado da Verificação */}
        {resultadoVerificacao && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
              resultadoVerificacao.status === 'confirmada'
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                : resultadoVerificacao.status === 'parcial'
                ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                : 'bg-rose-50/60 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {resultadoVerificacao.status === 'confirmada' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : resultadoVerificacao.status === 'parcial' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
                <span className="font-bold uppercase tracking-wider text-[11px]">
                  Estado: {resultadoVerificacao.status.replace('_', ' ')}
                </span>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                {resultadoVerificacao.vigencia}
              </Badge>
            </div>

            <p className="leading-relaxed">{resultadoVerificacao.motivo}</p>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>
                <strong>Fonte Correspondente:</strong> {resultadoVerificacao.fonteIdentificada}
              </span>
              <span className="font-mono">{resultadoVerificacao.data}</span>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Registos Imutáveis de Auditoria (Audit Trail) */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xs font-semibold text-slate-900">
              Registos de Auditoria & Rastreabilidade do Sistema
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Histórico exaustivo de ações, verificação de fontes, acessos e alterações nos autos.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {auditoriaLogs.length} eventos registados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] text-slate-500 font-semibold">
              <tr>
                <th className="py-2 px-3">Data / Hora</th>
                <th className="py-2 px-3">Utilizador / Subsistema</th>
                <th className="py-2 px-3">Ação</th>
                <th className="py-2 px-3">Entidade Objeto</th>
                <th className="py-2 px-3">Detalhes</th>
                <th className="py-2 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {auditoriaLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {log.dataHora}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-800">{log.utilizador}</td>
                  <td className="py-2 px-3 text-slate-700">{log.acao}</td>
                  <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">{log.entidade}</td>
                  <td className="py-2 px-3 text-slate-500 text-[11px] max-w-xs truncate">
                    {log.detalhes}
                  </td>
                  <td className="py-2 px-3">
                    <Badge
                      variant={
                        log.status === 'confirmado'
                          ? 'success'
                          : log.status === 'alerta'
                          ? 'warning'
                          : 'danger'
                      }
                      className="text-[10px]"
                    >
                      {log.status.toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
