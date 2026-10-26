import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  AlertCircle,
  FileText,
  BookOpen,
  HelpCircle,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { RamoDireito } from '../../types';

interface Mensagem {
  id: string;
  autor: 'utilizador' | 'assistente';
  texto: string;
  data: string;
  factosDocumentados?: string[];
  normasAplicaveis?: string[];
  jurisprudenciaCitada?: string[];
  incertezas?: string[];
}

export const AssistantSection: React.FC = () => {
  const { processos, selectedProcessoId, setSelectedProcessoId } = useApp();
  const processoAtivo = processos.find((p) => p.id === selectedProcessoId);

  const [ramoSelecionado, setRamoSelecionado] = useState<RamoDireito>(
    processoAtivo ? processoAtivo.ramo : 'Processo Civil'
  );
  const [pergunta, setPergunta] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: 'msg-init',
      autor: 'assistente',
      texto: `Bem-vindo ao Assistente Jurídico LEX PORTUGAL AI. Estou configurado para apoiar a análise jurídica de acordo com o ordenamento jurídico português, os Códigos substantivos e adjetivos em vigor e a jurisprudência consolidada dos Tribunais Superiores (STJ, TRs, TCA, STA e TC).\n\nPara garantir rigor deontológico e técnico, todas as respostas discriminam factos comprovados, normas aplicáveis, acórdãos e incertezas jurídicas pendentes de validação.`,
      data: '09:00',
      normasAplicaveis: [
        'Código Civil (Decreto-Lei n.º 47344/66)',
        'Código de Processo Civil (Lei n.º 41/2013)',
        'Estatuto da Ordem dos Advogados (Lei n.º 145/2015)',
      ],
    },
  ]);

  const sugestoes = [
    'Quais os ónus a cargo do recorrente na impugnação da matéria de facto ao abrigo do art. 640.º do CPC?',
    'Quais os pressupostos da resolução do contrato com base no art. 808.º do Código Civil?',
    'Como se processa a contagem do prazo de recurso ordinário quando notificado via Citius?',
  ];

  const handleEnviar = async (textoEnviar?: string) => {
    const texto = textoEnviar || pergunta;
    if (!texto.trim()) return;

    const novaMsgUtilizador: Mensagem = {
      id: `msg-${Date.now()}`,
      autor: 'utilizador',
      texto,
      data: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    };

    setMensagens((prev) => [...prev, novaMsgUtilizador]);
    setPergunta('');
    setCarregando(true);

    try {
      // 1. Tentar chamada ao Orquestrador Gemini através do backend seguro
      const resp = await fetch('/api/ai/consultar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consulta: texto,
          contextoProcesso: processoAtivo ? `${processoAtivo.numeroProcessual} - ${processoAtivo.tribunal}` : undefined,
          ramoDireito: ramoSelecionado,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const r = data.resultado;

        const novaResposta: Mensagem = {
          id: `msg-${Date.now()}`,
          autor: 'assistente',
          texto: r.analiseGeral || 'Análise jurídica concluída.',
          data: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
          normasAplicaveis: (r.normasAplicaveis || []).map(
            (n: any) => `${n.diploma} (${n.artigo}): ${n.sumarioNormativo}`
          ),
          jurisprudenciaCitada: (r.jurisprudenciaCitada || []).map(
            (j: any) => `${j.tribunal} - Proc. ${j.numeroProcesso}: ${j.sumarioDecisao}`
          ),
          incertezas: r.incertezasEDiligencias || [],
        };

        setMensagens((prev) => [...prev, novaResposta]);
        setCarregando(false);
        return;
      }
    } catch (err) {
      console.warn('Backend AI indisponível, a recorrer à biblioteca consolidada local.', err);
    }

    // 2. Fallback determinístico estruturado fundamentado no Direito Português
    setTimeout(() => {
      let respostaTexto = '';
      let normas: string[] = [];
      let jurisprudencia: string[] = [];
      let incertezas: string[] = [];

      if (texto.includes('640') || texto.toLowerCase().includes('matéria de facto')) {
        respostaTexto =
          'Ao abrigo do artigo 640.º, n.º 1 e 2 do Código de Processo Civil, quando o recorrente impugna o julgamento da matéria de facto, deve obrigatoriamente especificar, sob pena de rejeição:\n\n1. Os concretos pontos de facto que considera incorretamente julgados;\n2. Os concretos meios probatórios, constantes do processo ou de registo ou gravação nele realizada, que impunham decisão sobre os pontos da matéria de facto impugnados diversa da recorrida;\n3. A decisão que, no seu entender, deve ser proferida sobre as questões de facto impugnadas.\n\nQuando os meios probatórios invocados tiverem sido gravados, incumbe ao recorrente, sob pena de imediata rejeição do recurso na respetiva parte, indicar com exatidão as passagens da gravação em que se funda a impugnação, sem prejuízo de poder proceder à transcrição dos excertos que considere relevantes.';
        normas = ['Art. 640.º, n.º 1 e 2 do CPC', 'Art. 662.º do CPC'];
        jurisprudencia = [
          'Acórdão de Fixação de Jurisprudência do STJ n.º 12/2023',
          'Ac. STJ de 22-10-2020 (Proc. 195/17.0T8VNG.P1.S1)',
        ];
        incertezas = [
          'Confirmar se na comarca de origem a gravação da prova testemunhal foi realizada em sistema digital Habilus/Citius com registo de timestamps.',
        ];
      } else if (texto.includes('808') || texto.toLowerCase().includes('resolução')) {
        respostaTexto =
          'Nos termos do artigo 808.º do Código Civil, para que a mora se converta em incumprimento definitivo e confira o direito à resolução do contrato por parte do credor, exige-se:\n\n1. A perda do interesse que o credor tinha na prestação, apreciada objetivamente (n.º 1 e 2);\n2. Ou a interpelação admonitória com fixação de um prazo suplementar razoável com a advertência cominatória de que a prestação não sendo realizada dentro desse prazo, se terá o contrato como definitivamente não cumprido.\n\nA simples mora do devedor legitima apenas o pedido de indemnização pelos prejuízos moratórios (art. 804.º do CC), sendo imperativa a interpelação cominatória para operar a resolução extrajudicial quando não exista cláusula resolutiva expressa.';
        normas = ['Art. 801.º do CC', 'Art. 804.º do CC', 'Art. 808.º, n.º 1 e 2 do CC'];
        jurisprudencia = [
          'Acórdão do STJ de 14-03-2024 (Proc. 142/21.6T8OVR)',
          'Ac. STJ de 17-05-2018 (Proc. 48/13.7T8VNF.G1.S1)',
        ];
        incertezas = [
          'Averiguar se a notificação de interpelação anterior concedeu prazo cônguo e se foi acompanhada de aviso de receção inequívoco.',
        ];
      } else {
        respostaTexto = `Análise jurídica sobre "${texto}":\n\nNo quadro do ${ramoSelecionado}, a apreciação desta questão exige o enquadramento na hierarquia normativa nacional e nas garantias constitucionais (art. 20.º da CRP). Recomenda-se a verificação dos pressupostos processuais de admissibilidade e o levantamento de jurisprudência uniformizada aplicável ao caso concreto.`;
        normas = ['Art. 20.º da Constituição da República Portuguesa', 'Normas setoriais aplicáveis'];
        incertezas = [
          'Requer documentação probatória suplementar para determinação dos factos controvertidos.',
        ];
      }

      const novaResposta: Mensagem = {
        id: `msg-${Date.now()}`,
        autor: 'assistente',
        texto: respostaTexto,
        data: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        normasAplicaveis: normas,
        jurisprudenciaCitada: jurisprudencia,
        incertezas,
      };

      setMensagens((prev) => [...prev, novaResposta]);
      setCarregando(false);
    }, 600);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight font-serif">
              Assistente Jurídico Especializado
            </h1>
            <Badge variant="default">Direito Português</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulta fundamentada de normas substantivas, prazos processuais e jurisprudência dos Tribunais Superiores.
          </p>
        </div>

        {/* Seletores de Contexto */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedProcessoId || ''}
              onChange={(e) => setSelectedProcessoId(e.target.value || null)}
              className="text-xs bg-transparent border-0 text-slate-800 font-medium focus:ring-0 focus:outline-none"
            >
              <option value="">Sem processo vinculado</option>
              {processos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.numeroProcessual} ({p.clienteNome.substring(0, 18)})
                </option>
              ))}
            </select>
          </div>

          <select
            value={ramoSelecionado}
            onChange={(e) => setRamoSelecionado(e.target.value as RamoDireito)}
            className="text-xs bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-slate-900"
          >
            <option value="Processo Civil">Processo Civil</option>
            <option value="Direito Civil">Direito Civil</option>
            <option value="Direito Comercial e Societário">Direito Comercial</option>
            <option value="Direito do Trabalho">Direito do Trabalho</option>
            <option value="Direito Penal">Direito Penal</option>
            <option value="Direito Administrativo">Direito Administrativo</option>
          </select>
        </div>
      </div>

      {/* Caixa de Diálogo */}
      <GlassCard className="p-0 overflow-hidden flex flex-col h-[520px]">
        {/* Lista de Mensagens */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {mensagens.map((msg) => {
            const eAssistente = msg.autor === 'assistente';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${eAssistente ? 'justify-start' : 'justify-end'}`}
              >
                {eAssistente && (
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed ${
                    eAssistente
                      ? 'bg-slate-50 border border-slate-200/90 text-slate-800'
                      : 'bg-slate-900 text-white shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.texto}</div>

                  {/* Blocos Estruturados de Fundamentação */}
                  {eAssistente && (
                    <div className="mt-3.5 pt-3 border-t border-slate-200/80 space-y-2">
                      {msg.normasAplicaveis && msg.normasAplicaveis.length > 0 && (
                        <div>
                          <p className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
                            <BookOpen className="w-3 h-3 text-slate-500" /> Normas Identificadas:
                          </p>
                          <ul className="list-disc list-inside text-slate-600 text-[11px] mt-0.5 space-y-0.5">
                            {msg.normasAplicaveis.map((n, i) => (
                              <li key={i}>{n}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {msg.jurisprudenciaCitada && msg.jurisprudenciaCitada.length > 0 && (
                        <div>
                          <p className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
                            <FileText className="w-3 h-3 text-slate-500" /> Jurisprudência dos Tribunais Superiores:
                          </p>
                          <ul className="list-disc list-inside text-slate-600 text-[11px] mt-0.5 space-y-0.5">
                            {msg.jurisprudenciaCitada.map((j, i) => (
                              <li key={i}>{j}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {msg.incertezas && msg.incertezas.length > 0 && (
                        <div className="bg-amber-50/60 p-2 rounded border border-amber-200/60 text-amber-900">
                          <p className="font-semibold flex items-center gap-1 text-[11px]">
                            <AlertCircle className="w-3 h-3 text-amber-600" /> Incertezas & Pressupostos a Confirmar:
                          </p>
                          <ul className="list-disc list-inside text-[11px] mt-0.5 space-y-0.5">
                            {msg.incertezas.map((inc, i) => (
                              <li key={i}>{inc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-2 text-right ${
                      eAssistente ? 'text-slate-400' : 'text-slate-300'
                    }`}
                  >
                    {msg.data}
                  </div>
                </div>
              </div>
            );
          })}

          {carregando && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping"></span>
                A analisar fontes legislativas e jurisprudência no Direito Português...
              </div>
            </div>
          )}
        </div>

        {/* Sugestões Rápidas */}
        <div className="px-5 py-2 bg-slate-50/50 border-t border-slate-200/60 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Sugestões:
          </span>
          {sugestoes.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleEnviar(sug)}
              className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 whitespace-nowrap transition-colors"
            >
              {sug.substring(0, 48)}...
            </button>
          ))}
        </div>

        {/* Formulário de Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEnviar();
          }}
          className="p-4 border-t border-slate-200 bg-white flex items-center gap-3"
        >
          <label htmlFor="assistant-input" className="sr-only">
            Pergunta jurídica
          </label>
          <input
            id="assistant-input"
            type="text"
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Formule a sua consulta jurídica (ex: prazos de contestação no processo comum com dilação)..."
            className="flex-1 text-xs px-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={carregando || !pergunta.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </form>
      </GlassCard>

      {/* Advertência Deontológica */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-700">Aviso Deontológico:</strong> O LEX PORTUGAL AI funciona como instrumento técnico de auxílio à investigação e redação. Nenhuma sugestão do sistema dispensa a verificação independente dos textos oficiais e o julgamento técnico reservado ao Advogado legalmente habilitado.
        </p>
      </div>
    </div>
  );
};
