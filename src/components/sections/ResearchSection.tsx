import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  FileText,
  RotateCcw,
  Activity,
  PlusCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { FonteJuridica } from '../../types';

interface ResultadoRAG {
  fragmento: {
    id: string;
    fonteId: string;
    identificadorFonte: string;
    tituloFonte: string;
    artigoNumero?: string;
    epigrafe?: string;
    texto: string;
    urlOficial: string;
    metadados: {
      identificador: string;
      titulo: string;
      tipo: string;
      ramo: string;
      entidadeEmissora: string;
      dataPublicacaoDR?: string;
      dataDecisaoJudicial?: string;
      dataEntradaEmVigor?: string;
      estadoVigencia: string;
      diplomaRevogatorio?: string;
      grauVinculacao: string;
      verificacaoIndependente: string;
    };
  };
  pontuacaoLexical: number;
  pontuacaoSemantica: number;
  pontuacaoFinal: number;
  correspondenciaExata: boolean;
  alertaVigencia?: string;
}

interface RespostaRAGBackend {
  consulta: string;
  totalEncontrado: number;
  resultados: ResultadoRAG[];
  fontesInsuficientes: boolean;
  avisoRigor?: string;
}

interface LogAtualizacao {
  id: string;
  identificador: string;
  dataVerificacao: string;
  status: string;
  detalhes: string;
}

export const ResearchSection: React.FC = () => {
  const { fontes, addAuditoriaLog } = useApp();

  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [tipoPesquisa, setTipoPesquisa] = useState<'hibrida' | 'lexical' | 'semantica'>('hibrida');
  const [ramoFiltro, setRamoFiltro] = useState<string>('todos');
  const [tipoFonteFiltro, setTipoFonteFiltro] = useState<string>('todos');
  const [apenasEmVigor, setApenasEmVigor] = useState<boolean>(false);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [respostaRAG, setRespostaRAG] = useState<RespostaRAGBackend | null>(null);
  const [resultadoSelecionado, setResultadoSelecionado] = useState<ResultadoRAG | null>(null);
  const [mostrarMonitorizacao, setMostrarMonitorizacao] = useState<boolean>(false);
  const [logsMonitorizacao, setLogsMonitorizacao] = useState<LogAtualizacao[]>([]);
  const [mostrarModalIngestao, setMostrarModalIngestao] = useState<boolean>(false);

  // Formulário de ingestão autorizada
  const [formIngestao, setFormIngestao] = useState({
    identificador: '',
    titulo: '',
    tipo: 'legislacao',
    ramo: 'Processo Civil',
    entidadeEmissora: 'Assembleia da República',
    dataPublicacaoDR: '',
    dataEntradaEmVigor: '',
    urlOficial: 'https://diariodarepublica.pt',
    sumario: '',
    artigos: '',
  });
  const [mensagemIngestao, setMensagemIngestao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Executa pesquisa no RAG backend
  const executarPesquisa = async (termo: string, modo: 'hibrida' | 'lexical' | 'semantica') => {
    if (!termo.trim()) {
      setRespostaRAG(null);
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch('/api/rag/pesquisar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-utilizador-id': 'usr-admin-1',
          'x-organizacao-id': 'org-porto-1',
          'x-utilizador-role': 'advogado',
        },
        body: JSON.stringify({
          termo: termo.trim(),
          modo,
          ramo: ramoFiltro !== 'todos' ? ramoFiltro : undefined,
          tipoFonte: tipoFonteFiltro !== 'todos' ? tipoFonteFiltro : undefined,
          apenasEmVigor,
        }),
      });

      if (!res.ok) {
        throw new Error(`Erro ${res.status} ao comunicar com o motor RAG`);
      }

      const data: RespostaRAGBackend = await res.json();
      setRespostaRAG(data);
      if (data.resultados.length > 0) {
        setResultadoSelecionado(data.resultados[0]);
      } else {
        setResultadoSelecionado(null);
      }
    } catch (err: any) {
      console.warn('Fallback para pesquisa no acervo local:', err.message);
      // Fallback local se o servidor offline
      setRespostaRAG(null);
    } finally {
      setCarregando(false);
    }
  };

  const handlePesquisar = (e: React.FormEvent) => {
    e.preventDefault();
    if (termoPesquisa.trim()) {
      executarPesquisa(termoPesquisa, tipoPesquisa);
      addAuditoriaLog({
        utilizador: 'Dr. Fernando Silva (C.P. 14820P)',
        acao: 'Pesquisa Jurídica RAG Híbrida',
        entidade: `Termo: "${termoPesquisa}"`,
        detalhes: `Modo: ${tipoPesquisa.toUpperCase()} | Filtro vigência: ${apenasEmVigor ? 'Apenas em vigor' : 'Integral'}`,
        status: 'confirmado',
      });
    }
  };

  // Carrega status de monitorização de fontes
  const carregarStatusAtualizacoes = async () => {
    try {
      const res = await fetch('/api/rag/status-atualizacoes', {
        headers: {
          'x-utilizador-id': 'usr-admin-1',
          'x-organizacao-id': 'org-porto-1',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setLogsMonitorizacao(data.logs || []);
      }
    } catch (e) {
      console.warn('Falha ao obter logs de atualização');
    }
  };

  const handleSubmeterIngestao = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemIngestao(null);

    try {
      const res = await fetch('/api/rag/ingerir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-utilizador-id': 'usr-admin-1',
          'x-organizacao-id': 'org-porto-1',
          'x-utilizador-role': 'advogado',
        },
        body: JSON.stringify({
          fonte: {
            identificador: formIngestao.identificador,
            titulo: formIngestao.titulo,
            tipo: formIngestao.tipo,
            ramo: formIngestao.ramo,
            entidadeEmissora: formIngestao.entidadeEmissora,
            dataPublicacaoDR: formIngestao.dataPublicacaoDR || undefined,
            dataEntradaEmVigor: formIngestao.dataEntradaEmVigor || undefined,
            urlOficial: formIngestao.urlOficial,
            versao: '1.0',
            estadoVigencia: 'em_vigor',
            grauVinculacao: 'vinculativo_erga_omnes',
            verificacaoIndependente: 'confirmada',
          },
          sumario: formIngestao.sumario,
          artigos: formIngestao.artigos ? formIngestao.artigos.split('\n').filter(Boolean) : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMensagemIngestao({ tipo: 'erro', texto: data.error || 'Erro na ingestão.' });
      } else {
        setMensagemIngestao({ tipo: 'sucesso', texto: data.mensagem });
        setFormIngestao({
          identificador: '',
          titulo: '',
          tipo: 'legislacao',
          ramo: 'Processo Civil',
          entidadeEmissora: 'Assembleia da República',
          dataPublicacaoDR: '',
          dataEntradaEmVigor: '',
          urlOficial: 'https://diariodarepublica.pt',
          sumario: '',
          artigos: '',
        });
      }
    } catch (err: any) {
      setMensagemIngestao({ tipo: 'erro', texto: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight font-serif">
            Biblioteca Jurídica, RAG Híbrido & Prova de Fontes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Recuperação lexical para normas e artigos exatos; recuperação semântica para teses e conceitos dogmáticos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              carregarStatusAtualizacoes();
              setMostrarMonitorizacao(!mostrarMonitorizacao);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span>Integridade & DRE</span>
          </button>
          <button
            type="button"
            onClick={() => setMostrarModalIngestao(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Ingerir Diploma</span>
          </button>
        </div>
      </div>

      {/* Painel de Monitorização do Serviço de Atualizações */}
      {mostrarMonitorizacao && (
        <GlassCard className="p-4 border-slate-300 bg-slate-50/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Monitorização do Serviço de Atualização de Fontes Oficiais
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Protocolo: DRE.pt / DGSI.pt / TC.pt
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            O serviço verifica a vigência formal, datas de publicação e diplomas revogatórios para garantir que nenhuma minuta ou análise utiliza normas caducadas sem aviso expresso.
          </p>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {logsMonitorizacao.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">Sem falhas ou ocorrências anómalas recentes no serviço de sincronização.</p>
            ) : (
              logsMonitorizacao.map((log) => (
                <div key={log.id} className="text-[11px] bg-white p-2 rounded border border-slate-200 flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-800">{log.identificador}</span>
                    <p className="text-slate-600 mt-0.5">{log.detalhes}</p>
                  </div>
                  <Badge variant={log.status === 'atualizado' ? 'success' : log.status === 'falha_conexao' ? 'danger' : 'warning'}>
                    {log.status.toUpperCase()}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      )}

      {/* Caixa de Pesquisa e Filtros */}
      <GlassCard className="p-4 space-y-3">
        <form onSubmit={handlePesquisar} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={termoPesquisa}
              onChange={(e) => setTermoPesquisa(e.target.value)}
              placeholder="Pesquisar por diploma, artigo (ex: Art. 138 CPC), acórdão ou matéria..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={carregando}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none disabled:opacity-50"
          >
            {carregando ? (
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>Investigar</span>
          </button>
        </form>

        {/* Linha de Filtros */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Filter className="w-3.5 h-3.5" />
            <span>Modo RAG:</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            {(['hibrida', 'lexical', 'semantica'] as const).map((modo) => (
              <button
                key={modo}
                type="button"
                onClick={() => {
                  setTipoPesquisa(modo);
                  if (termoPesquisa.trim()) {
                    executarPesquisa(termoPesquisa, modo);
                  }
                }}
                className={`px-2 py-1 text-[11px] rounded-md font-medium capitalize transition-all ${
                  tipoPesquisa === modo
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {modo}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <select
              value={ramoFiltro}
              onChange={(e) => setRamoFiltro(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700"
            >
              <option value="todos">Todos os Ramos</option>
              <option value="Processo Civil">Processo Civil</option>
              <option value="Direito Civil">Direito Civil</option>
              <option value="Direito Comercial e Societário">Direito Comercial</option>
              <option value="Direito Constitucional">Direito Constitucional</option>
            </select>

            <select
              value={tipoFonteFiltro}
              onChange={(e) => setTipoFonteFiltro(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700"
            >
              <option value="todos">Todas as Fontes</option>
              <option value="legislacao">Legislação Consolidada</option>
              <option value="jurisprudencia">Jurisprudência Superior</option>
              <option value="doutrina">Doutrina & Pareceres</option>
            </select>

            <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={apenasEmVigor}
                onChange={(e) => setApenasEmVigor(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span>Apenas em vigor</span>
            </label>

            {(termoPesquisa || ramoFiltro !== 'todos' || tipoFonteFiltro !== 'todos' || apenasEmVigor) && (
              <button
                type="button"
                onClick={() => {
                  setTermoPesquisa('');
                  setRamoFiltro('todos');
                  setTipoFonteFiltro('todos');
                  setApenasEmVigor(false);
                  setRespostaRAG(null);
                }}
                title="Limpar todos os filtros"
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Aviso de Rigor / Fontes Insuficientes quando aplicável */}
      {respostaRAG?.fontesInsuficientes && (
        <div className="p-3.5 bg-amber-50/90 border border-amber-300/80 rounded-xl flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-amber-900 block mb-0.5">
              Aviso Deontológico de Fontes Insuficientes
            </span>
            <p className="text-amber-800 leading-relaxed">
              {respostaRAG.avisoRigor ||
                'Não foram encontradas fontes oficiais ou consolidadas suficientes no acervo para fundamentar uma resposta com certeza jurídica. A plataforma abstém-se de conjecturar respostas sem suporte documental oficial.'}
            </p>
          </div>
        </div>
      )}

      {/* Resultados da Investigação */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Resultados */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              {respostaRAG
                ? `${respostaRAG.totalEncontrado} resultados recuperados no motor RAG`
                : `${fontes.length} fontes consolidadas no acervo local`}
            </span>
            <span className="text-[11px] font-mono">
              Modo ativo: {tipoPesquisa}
            </span>
          </div>

          {respostaRAG ? (
            respostaRAG.resultados.length === 0 ? (
              <GlassCard className="p-8 text-center text-slate-500 text-xs">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-700">Nenhuma fonte com índice de relevância suficiente.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Verifique se o artigo ou matéria existe no Direito Português ou consulte diretamente o Diário da República Eletrónico.
                </p>
              </GlassCard>
            ) : (
              respostaRAG.resultados.map((item) => {
                const frag = item.fragmento;
                const scorePercent = Math.round(item.pontuacaoFinal * 100);

                return (
                  <GlassCard
                    key={frag.id}
                    hoverable
                    onClick={() => setResultadoSelecionado(item)}
                    className={`p-4 transition-all ${
                      resultadoSelecionado?.fragmento.id === frag.id
                        ? 'border-slate-900 ring-1 ring-slate-900'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {frag.metadados.tipo.toUpperCase()}
                          </Badge>
                          <Badge
                            variant={
                              frag.metadados.estadoVigencia === 'em_vigor'
                                ? 'success'
                                : frag.metadados.estadoVigencia === 'alterado'
                                ? 'warning'
                                : 'neutral'
                            }
                          >
                            {frag.metadados.estadoVigencia.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-[11px] text-slate-500 font-medium">{frag.metadados.ramo}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mt-1.5">
                          {frag.artigoNumero ? `${frag.artigoNumero} ${frag.epigrafe ? `— ${frag.epigrafe}` : ''}` : frag.tituloFonte}
                        </h3>
                        <p className="text-xs font-mono text-slate-500 mt-0.5">{frag.identificadorFonte}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          RAG {scorePercent}%
                        </span>
                        {item.correspondenciaExata && (
                          <span className="block text-[10px] text-emerald-700 font-medium mt-0.5">
                            Exato
                          </span>
                        )}
                      </div>
                    </div>

                    {item.alertaVigencia && (
                      <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                        <span>{item.alertaVigencia}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-700 mt-2 line-clamp-3 leading-relaxed whitespace-pre-line font-serif">
                      {frag.texto}
                    </p>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>Lexical: {Math.round(item.pontuacaoLexical * 100)}% | Semântica: {Math.round(item.pontuacaoSemantica * 100)}%</span>
                      <span className="font-mono">{frag.metadados.entidadeEmissora}</span>
                    </div>
                  </GlassCard>
                );
              })
            )
          ) : (
            // Lista Inicial do Corpus Local
            fontes.map((fonte) => (
              <GlassCard
                key={fonte.id}
                hoverable
                className="p-4 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {fonte.tipo.toUpperCase()}
                      </Badge>
                      <Badge
                        variant={
                          fonte.estadoVigencia === 'em_vigor'
                            ? 'success'
                            : fonte.estadoVigencia === 'alterado'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {fonte.estadoVigencia.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-[11px] text-slate-500 font-medium">{fonte.ramo}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mt-1.5">{fonte.titulo}</h3>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{fonte.identificador}</p>
                  </div>
                  <span className="text-xs font-mono text-slate-400 shrink-0">{fonte.data}</span>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {fonte.sumario}
                </p>

                {fonte.artigosRelevantes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                    {fonte.artigosRelevantes.map((art, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                      >
                        {art}
                      </span>
                    ))}
                  </div>
                )}
              </GlassCard>
            ))
          )}
        </div>

        {/* Painel Lateral de Detalhes da Fonte */}
        <div>
          {resultadoSelecionado ? (
            <GlassCard className="p-5 space-y-4 sticky top-20">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Ficha do Fragmento / Prova Oficial
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {resultadoSelecionado.fragmento.artigoNumero
                    ? `${resultadoSelecionado.fragmento.artigoNumero} ${resultadoSelecionado.fragmento.epigrafe || ''}`
                    : resultadoSelecionado.fragmento.tituloFonte}
                </h3>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  {resultadoSelecionado.fragmento.identificadorFonte}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Entidade Emissora / Tribunal:</span>
                  <span className="font-medium text-slate-800">
                    {resultadoSelecionado.fragmento.metadados.entidadeEmissora}
                  </span>
                </div>
                {resultadoSelecionado.fragmento.metadados.dataPublicacaoDR && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Publicação no Diário da República:</span>
                    <span className="font-mono text-slate-800">
                      {resultadoSelecionado.fragmento.metadados.dataPublicacaoDR}
                    </span>
                  </div>
                )}
                {resultadoSelecionado.fragmento.metadados.dataEntradaEmVigor && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Início de Vigência Efetiva:</span>
                    <span className="font-mono text-slate-800">
                      {resultadoSelecionado.fragmento.metadados.dataEntradaEmVigor}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block text-[10px]">Estado de Vigência:</span>
                  <Badge
                    variant={
                      resultadoSelecionado.fragmento.metadados.estadoVigencia === 'em_vigor'
                        ? 'success'
                        : resultadoSelecionado.fragmento.metadados.estadoVigencia === 'alterado'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {resultadoSelecionado.fragmento.metadados.estadoVigencia.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Grau de Vinculação:</span>
                  <span className="font-medium text-slate-700 capitalize">
                    {resultadoSelecionado.fragmento.metadados.grauVinculacao.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Texto Integral Homologado:</span>
                  <div className="text-slate-800 leading-relaxed mt-1 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-serif whitespace-pre-line max-h-64 overflow-y-auto">
                    {resultadoSelecionado.fragmento.texto}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <a
                  href={resultadoSelecionado.fragmento.urlOficial}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-900 hover:underline font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Consultar no Diário da República / DGSI
                </a>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-6 text-center text-xs text-slate-400">
              <FileText className="w-6 h-6 mx-auto mb-2 text-slate-300" />
              Pesquise ou selecione uma norma ou acórdão na lista ao lado para inspecionar os fragmentos, a data de vigência e o link oficial.
            </GlassCard>
          )}
        </div>
      </div>

      {/* Modal de Ingestão Autorizada */}
      {mostrarModalIngestao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Ingerir Diploma ou Jurisprudência no Acervo</h3>
                <p className="text-[11px] text-slate-500">Validação rigorosa de proveniência e datas de vigência no servidor.</p>
              </div>
              <button
                type="button"
                onClick={() => setMostrarModalIngestao(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {mensagemIngestao && (
              <div
                className={`p-3 rounded-lg text-xs ${
                  mensagemIngestao.tipo === 'sucesso'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {mensagemIngestao.texto}
              </div>
            )}

            <form onSubmit={handleSubmeterIngestao} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Identificador Oficial *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lei n.º 41/2013, de 26 de junho"
                  value={formIngestao.identificador}
                  onChange={(e) => setFormIngestao({ ...formIngestao, identificador: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Título do Diploma / Acórdão *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Código de Processo Civil"
                  value={formIngestao.titulo}
                  onChange={(e) => setFormIngestao({ ...formIngestao, titulo: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Data Publicação DRE</label>
                  <input
                    type="date"
                    value={formIngestao.dataPublicacaoDR}
                    onChange={(e) => setFormIngestao({ ...formIngestao, dataPublicacaoDR: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Data Entrada em Vigor</label>
                  <input
                    type="date"
                    value={formIngestao.dataEntradaEmVigor}
                    onChange={(e) => setFormIngestao({ ...formIngestao, dataEntradaEmVigor: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">URL Oficial de Proveniência (DRE / DGSI)</label>
                <input
                  type="url"
                  required
                  value={formIngestao.urlOficial}
                  onChange={(e) => setFormIngestao({ ...formIngestao, urlOficial: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Sumário Oficial *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Sumário oficial do diploma legislativo ou decisão judicial..."
                  value={formIngestao.sumario}
                  onChange={(e) => setFormIngestao({ ...formIngestao, sumario: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 bg-slate-50 font-serif"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMostrarModalIngestao(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Validar & Indexar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
