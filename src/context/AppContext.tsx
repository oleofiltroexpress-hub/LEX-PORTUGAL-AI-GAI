/**
 * LEX PORTUGAL AI — Contexto Central de Estado e Persistência
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  NavigationSection,
  Cliente,
  Processo,
  PrazoEvento,
  FonteJuridica,
  MinutaJuridica,
  MemoriaRegisto,
  RegistoAuditoria,
  DocumentoAnalisado,
  ConfiguracaoSistema,
} from '../types';

interface AppContextType {
  currentSection: NavigationSection;
  setCurrentSection: (section: NavigationSection) => void;
  selectedProcessoId: string | null;
  setSelectedProcessoId: (id: string | null) => void;
  clientes: Cliente[];
  addCliente: (c: Omit<Cliente, 'id' | 'dataCriacao'>) => Cliente;
  updateCliente: (id: string, c: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  processos: Processo[];
  addProcesso: (p: Omit<Processo, 'id' | 'dataEntrada'>) => Processo;
  updateProcesso: (id: string, p: Partial<Processo>) => void;
  deleteProcesso: (id: string) => void;
  prazos: PrazoEvento[];
  addPrazo: (p: Omit<PrazoEvento, 'id'>) => PrazoEvento;
  togglePrazoCumprido: (id: string) => void;
  deletePrazo: (id: string) => void;
  fontes: FonteJuridica[];
  addFonte: (f: Omit<FonteJuridica, 'id'>) => FonteJuridica;
  minutas: MinutaJuridica[];
  addMinuta: (m: Omit<MinutaJuridica, 'id' | 'dataCriacao' | 'dataAtualizacao'>) => MinutaJuridica;
  updateMinuta: (id: string, m: Partial<MinutaJuridica>) => void;
  deleteMinuta: (id: string) => void;
  memorias: MemoriaRegisto[];
  addMemoria: (m: Omit<MemoriaRegisto, 'id' | 'dataRegisto'>) => MemoriaRegisto;
  deleteMemoria: (id: string) => void;
  auditoriaLogs: RegistoAuditoria[];
  addAuditoriaLog: (log: Omit<RegistoAuditoria, 'id' | 'dataHora'>) => void;
  documentos: DocumentoAnalisado[];
  addDocumento: (doc: Omit<DocumentoAnalisado, 'id' | 'dataCarregamento'>) => DocumentoAnalisado;
  deleteDocumento: (id: string) => void;
  configuracao: ConfiguracaoSistema;
  updateConfiguracao: (cfg: Partial<ConfiguracaoSistema>) => void;
  globalSearch: string;
  setGlobalSearch: (term: string) => void;
  quickActionTarget: string | null;
  setQuickActionTarget: (target: string | null) => void;
  resetDataToDemo: () => void;
  clearAllData: () => void;
}

const STORAGE_KEY_PREFIX = 'lex_portugal_ai_';

// Dados iniciais estruturados com base no Direito Português
const DEMO_CONFIG: ConfiguracaoSistema = {
  nomeEscritorio: 'Sociedade de Advogados Silva, Santos & Associados, RL',
  cedulaProfissional: '14820P (Ordem dos Advogados - Conselho Regional do Porto)',
  comarcaSede: 'Tribunal Judicial da Comarca do Porto',
  modeloGeminiPadrao: 'gemini-2.5-flash',
  temperatura: 0.2,
  verificacaoRigorosaFontes: true,
  notificacoesPrazosDias: 5,
  diasRetencaoLogs: 365,
};

const DEMO_CLIENTES: Cliente[] = [
  {
    id: 'cli-1',
    nome: 'Lusitânia Logística & Distribuição, S.A.',
    tipo: 'coletivo',
    nif: '509823145',
    email: 'juridico@lusitanialog.pt',
    telefone: '+351 229 400 120',
    morada: 'Avenida da Boavista, n.º 2450, 4.º Dto, 4100-118 Porto',
    ativo: true,
    dataCriacao: '2026-01-15',
    observacoes: 'Cliente corporate regular desde 2024. Contratos de transporte e contencioso comercial.',
  },
  {
    id: 'cli-2',
    nome: 'Dr. Manuel Antunes Ribeiro',
    tipo: 'singular',
    nif: '214890321',
    email: 'm.antunes.ribeiro@gmail.com',
    telefone: '+351 912 345 678',
    morada: 'Rua de Santa Catarina, n.º 812, 4000-442 Porto',
    ativo: true,
    dataCriacao: '2026-02-03',
    observacoes: 'Litígio relativo a partilha de herança e impugnação de doações.',
  },
  {
    id: 'cli-3',
    nome: 'InovaTech Soluções de Software, Lda.',
    tipo: 'coletivo',
    nif: '514209871',
    email: 'contact@inovatech.pt',
    telefone: '+351 210 987 654',
    morada: 'Avenida da Liberdade, n.º 110, 1250-146 Lisboa',
    ativo: true,
    dataCriacao: '2026-03-12',
    observacoes: 'Propriedade intelectual, segredo de negócio e contratos de trabalho.',
  },
];

const DEMO_PROCESSOS: Processo[] = [
  {
    id: 'proc-1',
    numeroProcessual: '1420/24.8T8PRT',
    tribunal: 'Tribunal Judicial da Comarca do Porto - Juízo Central Cível - Juiz 3',
    especie: 'Ação de Processo Comum',
    ramo: 'Direito Comercial e Societário',
    clienteId: 'cli-1',
    clienteNome: 'Lusitânia Logística & Distribuição, S.A.',
    partesContrarias: ['Vanguard Frotas & Equipamentos, Lda.'],
    intervenientes: [
      { nome: 'Lusitânia Logística & Distribuição, S.A.', papel: 'autor', nif: '509823145' },
      { nome: 'Vanguard Frotas & Equipamentos, Lda.', papel: 'reu', nif: '502391844', representanteAdvogado: 'Dr. Fernando Lemos (C.P. 8920L)' },
    ],
    juizRelator: 'Dra. Maria do Carmo Esteves',
    valorCausa: 148500.0,
    estado: 'ativo',
    faseProcessual: 'Fase de Articulados (Réplica)',
    dataEntrada: '2026-02-18',
    descricao: 'Resolução contratual por incumprimento culposo e indemnização por lucros cessantes no fornecimento de frotas industriais.',
  },
  {
    id: 'proc-2',
    numeroProcessual: '892/25.2T8MTS',
    tribunal: 'Tribunal Judicial da Comarca do Porto - Juízo de Família e Menores de Matosinhos',
    especie: 'Inventário Judicial',
    ramo: 'Família e Sucessões',
    clienteId: 'cli-2',
    clienteNome: 'Dr. Manuel Antunes Ribeiro',
    partesContrarias: ['Beatriz Ribeiro Vasconcelos', 'Carlos Alberto Ribeiro'],
    intervenientes: [
      { nome: 'Dr. Manuel Antunes Ribeiro', papel: 'autor' },
      { nome: 'Beatriz Ribeiro Vasconcelos', papel: 'reu' },
      { nome: 'Carlos Alberto Ribeiro', papel: 'contrainteressado' },
    ],
    valorCausa: 320000.0,
    estado: 'ativo',
    faseProcessual: 'Reclamação à Relação de Bens',
    dataEntrada: '2026-04-10',
    descricao: 'Partilha judicial de herança aberta por óbito de António Ribeiro, com alegação de sonegação de bens.',
  },
  {
    id: 'proc-3',
    numeroProcessual: '310/26.0T8LSB',
    tribunal: 'Tribunal Judicial da Comarca de Lisboa - Juízo do Trabalho - Juiz 2',
    especie: 'Impugnação Judicial da Regularidade e Licitude do Despedimento',
    ramo: 'Direito Laboral',
    clienteId: 'cli-3',
    clienteNome: 'InovaTech Soluções de Software, Lda.',
    partesContrarias: ['Jorge Miguel Santos Ferreira'],
    intervenientes: [
      { nome: 'Jorge Miguel Santos Ferreira', papel: 'autor' },
      { nome: 'InovaTech Soluções de Software, Lda.', papel: 'reu', nif: '514209871' },
    ],
    valorCausa: 38400.0,
    estado: 'ativo',
    faseProcessual: 'Audiência de Partes (Art. 54.º CPT)',
    dataEntrada: '2026-08-20',
    descricao: 'Ação laboral na sequência de despedimento com justa causa por violação de dever de confidencialidade e segredo industrial.',
  },
];

const DEMO_PRAZOS: PrazoEvento[] = [
  {
    id: 'prz-1',
    processoId: 'proc-1',
    numeroProcesso: '1420/24.8T8PRT',
    titulo: 'Apresentar Resposta à Exceção / Réplica',
    dataLimite: '2026-10-30',
    tipo: 'prazo_legal',
    urgente: true,
    cumprido: false,
    baseLegal: 'Art. 584.º do CPC (Prazos para articulados subsequentes)',
    diasRestantes: 4,
  },
  {
    id: 'prz-2',
    processoId: 'proc-2',
    numeroProcesso: '892/25.2T8MTS',
    titulo: 'Resposta à Oposição à Relação de Bens',
    dataLimite: '2026-11-06',
    tipo: 'prazo_legal',
    urgente: false,
    cumprido: false,
    baseLegal: 'Art. 1104.º do CPC (Impugnação da relação de bens)',
    diasRestantes: 11,
  },
  {
    id: 'prz-3',
    processoId: 'proc-3',
    numeroProcesso: '310/26.0T8LSB',
    titulo: 'Audiência de Partes Presencial',
    dataLimite: '2026-11-12',
    tipo: 'audiencia',
    urgente: false,
    cumprido: false,
    baseLegal: 'Art. 54.º do Código de Processo do Trabalho',
    diasRestantes: 17,
  },
];

const DEMO_FONTES: FonteJuridica[] = [
  {
    id: 'fnt-1',
    identificador: 'Lei n.º 41/2013, de 26 de junho',
    titulo: 'Código de Processo Civil (CPC)',
    tipo: 'legislacao',
    ramo: 'Processo Civil',
    entidadeEmissora: 'Assembleia da República',
    data: '2013-06-26',
    urlOficial: 'https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2013-34509075',
    versao: 'Versão consolidada 2026',
    estadoVigencia: 'em_vigor',
    artigosRelevantes: ['Art. 138.º (Regra da continuidade dos prazos)', 'Art. 569.º (Prazo para a contestação)', 'Art. 584.º (Réplica)'],
    sumario: 'Aprova o novo Código de Processo Civil, definindo a tramitação declarativa e executiva dos tribunais judiciais portugueses.',
  },
  {
    id: 'fnt-2',
    identificador: 'Decreto-Lei n.º 47344/66, de 25 de novembro',
    titulo: 'Código Civil Português',
    tipo: 'legislacao',
    ramo: 'Direito Civil',
    entidadeEmissora: 'Governo / Ministério da Justiça',
    data: '1966-11-25',
    urlOficial: 'https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/1966-34509075',
    versao: 'Versão consolidada 2026',
    estadoVigencia: 'em_vigor',
    artigosRelevantes: ['Art. 279.º (Cômputo do termo)', 'Art. 483.º (Princípio geral da responsabilidade civil)', 'Art. 798.º (Responsabilidade do devedor)'],
    sumario: 'Aprova o Código Civil regulador das relações jurídicas civis, contratos, obrigações, direitos reais, família e sucessões.',
  },
  {
    id: 'fnt-3',
    identificador: 'Acórdão do STJ Proc. 142/21.6T8OVR.P1.S1',
    titulo: 'Resolução Contratual — Impossibilidade Culposa e Lucros Cessantes',
    tipo: 'jurisprudencia',
    ramo: 'Direito Comercial e Societário',
    entidadeEmissora: 'Supremo Tribunal de Justiça (1.ª Secção Cível)',
    data: '2024-03-14',
    urlOficial: 'http://www.dgsi.pt/jstj.nsf/',
    versao: 'Texto Integral Homologado',
    estadoVigencia: 'em_vigor',
    artigosRelevantes: ['Art. 801.º, n.º 2 do CC', 'Art. 564.º do CC'],
    sumario: 'A parte que resolve o contrato com fundamento em incumprimento definitivo culposo da contraparte tem direito a ser indemnizada pelo interesse contratual positivo, incluindo os lucros cessantes previsíveis.',
  },
  {
    id: 'fnt-4',
    identificador: 'Acórdão do TC n.º 421/2023',
    titulo: 'Não Inconstitucionalidade da Contagem de Prazos em Férias Judiciais para Processos Urgentes',
    tipo: 'jurisprudencia',
    ramo: 'Direito Constitucional',
    entidadeEmissora: 'Tribunal Constitucional (Plenário)',
    data: '2023-07-12',
    urlOficial: 'https://www.tribunalconstitucional.pt/tc/acordaos/',
    versao: 'Publicação em DR 1.ª Série',
    estadoVigencia: 'em_vigor',
    artigosRelevantes: ['Art. 20.º da CRP', 'Art. 138.º, n.º 1 do CPC'],
    sumario: 'Não viola o princípio do acesso ao direito e à tutela jurisdicional efetiva a norma que estabelece que os prazos em processos de natureza urgente correm sem suspensão em férias judiciais.',
  },
];

const DEMO_MINUTAS: MinutaJuridica[] = [
  {
    id: 'mnt-1',
    processoId: 'proc-1',
    numeroProcessual: '1420/24.8T8PRT',
    titulo: 'Réplica e Resposta às Exceções Dilatórias',
    tipoPeca: 'Réplica (Processo Civil Comum)',
    versao: 1,
    estado: 'em_revisao',
    conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) JUIZ(A) DE DIREITO
DO JUÍZO CENTRAL CÍVEL DO PORTO — JUIZ 3

Processo n.º 1420/24.8T8PRT
Ação de Processo Comum

LUSITÂNIA LOGÍSTICA & DISTRIBUIÇÃO, S.A., Autora nos autos à margem referenciados em que é Ré VANGUARD FROTAS & EQUIPAMENTOS, LDA., notificada do teor da Contestação e das exceções aí deduzidas, vem, nos termos e para os efeitos do disposto no artigo 584.º do Código de Processo Civil, apresentar a seguinte:

RÉPLICA E RESPOSTA ÀS EXCEÇÕES

I. DA INEPCIA DA PETIÇÃO INICIAL INVOCADA PELA RÉ
1.º Alega a Ré que a Petição Inicial padece de inépcia por pretensa contradição entre a causa de pedir e o pedido formulado.
2.º Tal alegação não tem qualquer acolhimento de facto ou de direito.
3.º Com efeito, a Autora discriminou com rigor temporal e documental cada uma das avarias reiteradas dos veículos pesados fornecidos, juntando os relatórios periciais de fls. 24 a 58.
4.º O pedido indemnizatório deduzido funda-se expressamente no incumprimento culposo e definitivo (artigos 798.º e 801.º, n.º 2 do Código Civil), sendo a causa de pedir líquida, inteligível e consentânea com o efeito jurídico peticionado.
5.º Pelo que deve a invocada exceção dilatória ser julgada manifestamente improcedente, com as legais consequências.

II. DA VALIDADE DA RESOLUÇÃO CONTRATUAL
6.º Não assiste razão à Ré quando sustenta que não foi interpelada admonitoriamente com fixação de prazo razoável.
7.º Conforme resulta da carta registada com aviso de receção datada de 12 de janeiro de 2026 (Doc. n.º 7 da P.I.), foi concedido o prazo de 15 dias úteis para a substituição dos três tratores defeituosos.
8.º A Ré declarou por escrito a sua expressa recusa em cumprir, operando a resolução de pleno direito ex vi artigo 808.º, n.º 1 do Código Civil.

TERMOS EM QUE SE REQUER A V. EXA.:
a) A improcedência total das exceções deduzidas na contestação;
b) O prosseguimento dos autos para a fase de saneamento e condensação, nos termos gerais.

Junta: 2 Documentos e Comprovativo do pagamento da taxa de justiça devida.

O Advogado,
(Assinatura eletrónica qualificada)`,
    fundamentacaoLegal: ['Art. 584.º do CPC', 'Art. 801.º do CC', 'Art. 808.º do CC'],
    jurisprudenciaCitada: ['Ac. do STJ de 14-03-2024 (Proc. 142/21.6)'],
    dataCriacao: '2026-10-22',
    dataAtualizacao: '2026-10-25',
  },
];

const DEMO_MEMORIAS: MemoriaRegisto[] = [
  {
    id: 'mem-1',
    tipo: 'operacional',
    processoId: 'proc-1',
    clienteId: 'cli-1',
    titulo: 'Ponto prévio acordado: Não aceitação de acordo sem reposição integral de lucros cessantes',
    conteudo: 'Na reunião de direção da Lusitânia Logística realizada em 10/02/2026, ficou expressamente determinado que qualquer proposta da Ré inferior a 120.000 € não será aceite para transação judicial.',
    proveniencia: 'Ata de Reunião com Direção de Operações da Lusitânia Logística',
    dataRegisto: '2026-02-12',
    valido: true,
  },
  {
    id: 'mem-2',
    tipo: 'semantica',
    processoId: 'proc-2',
    clienteId: 'cli-2',
    titulo: 'Contas bancárias no estrangeiro — Documentação bancária suíça',
    conteudo: 'Foram obtidos extratos bancários de conta titulada pelo de cujus no Banque Cantonale de Genève no valor de 85.000 CHF, que não constam da relação de bens apresentada pela cabeça de casal.',
    proveniencia: 'Comunicação do banco suíço remetida ao inventariante',
    dataRegisto: '2026-05-18',
    valido: true,
  },
  {
    id: 'mem-3',
    tipo: 'melhoria',
    titulo: 'Norma de estilo processual: Indicação expressa de tribunal e juízo no cabeçalho dos articulados',
    conteudo: 'Registo de melhoria na redação de articulados para a Comarca do Porto: especificar sempre a secção/juiz especializado no cabeçalho inicial para acelerar a distribuição no Citius.',
    proveniencia: 'Auditoria Interna de Eficiência Processual',
    dataRegisto: '2026-09-01',
    valido: true,
  },
];

const DEMO_AUDITORIA: RegistoAuditoria[] = [
  {
    id: 'aud-1',
    dataHora: '2026-10-26 09:15:30',
    utilizador: 'Dr. Fernando Silva (C.P. 14820P)',
    acao: 'Verificação de Fontes Jurídicas',
    entidade: 'Fonte: Art. 138.º do CPC',
    detalhes: 'Confronto com Diário da República consolidado — Norma plenamente em vigor com redação da Lei 41/2013.',
    status: 'confirmado',
  },
  {
    id: 'aud-2',
    dataHora: '2026-10-26 08:30:12',
    utilizador: 'Sistema de Segurança Lex Portugal',
    acao: 'Deteção Preventiva de Conflito de Interesses',
    entidade: 'Cliente: Lusitânia Logística / Vanguard Frotas',
    detalhes: 'Consulta efetuada com sucesso: sem impedimentos na representação do Autor.',
    status: 'confirmado',
  },
  {
    id: 'aud-3',
    dataHora: '2026-10-25 17:42:05',
    utilizador: 'Dr. Fernando Silva (C.P. 14820P)',
    acao: 'Atualização de Minuta',
    entidade: 'Minuta: Réplica Proc. 1420/24.8T8PRT',
    detalhes: 'Revisão do capítulo I (Inépcia da petição inicial) e aditamento de citação do Acórdão do STJ.',
    status: 'confirmado',
  },
];

const DEMO_DOCUMENTOS: DocumentoAnalisado[] = [
  {
    id: 'doc-1',
    processoId: 'proc-1',
    nomeFicheiro: 'Contestacao_Vanguard_Frotas_fls84.pdf',
    tamanhoBytes: 2450800,
    tipoMime: 'application/pdf',
    dataCarregamento: '2026-10-20',
    tipoDocumental: 'contestacao',
    formato: 'pdf_nativo',
    confiancaOcr: 1.0,
    necessitaOcr: false,
    partesIdentificadas: ['Vanguard Frotas & Equipamentos, Lda. (Ré)', 'Lusitânia Logística & Distribuição, S.A. (Autora)'],
    datasRelevantes: [
      { data: '2025-11-15', descricao: 'Data alegada da entrega dos tratores de tração pesada' },
      { data: '2026-01-12', descricao: 'Receção da carta de interpelação e recusa expressa de garantia' },
      { data: '2026-01-16', descricao: 'Entrada da viatura AA-00-ZZ na oficina credenciada da Ré' },
    ],
    pedidosEFundamentos: [
      'Invocação de inépcia da petição inicial por cumulação indevida de pedidos (art. 186.º CPC)',
      'Impugnação motivada da avaria: contaminação de combustível por gasóleo agrícola não conforme',
      'Impugnação do cômputo de lucros cessantes no montante de 64.500,00 €',
    ],
    possiveisContradicoes: [
      'A fls. 6 a Ré reconhece defeito de fabrico nos módulos eletrónicos em garantia, mas a fls. 14 imputa a responsabilidade exclusiva ao operador.',
    ],
    estadoExtracao: 'processado',
    factos: [
      {
        id: 'fct-1-1',
        classificacao: 'facto_comprovado',
        descricao: 'A Ré procedeu à substituição do sensor eletrónico em garantia na oficina oficial da Maia em 16/01/2026.',
        dataEvento: '2026-01-16',
        ordemCronologica: 1,
        excertoOrigem: 'Logo no dia 16 de janeiro de 2026, a viatura matrícula AA-00-ZZ deu entrada nas instalações credenciadas da Ré, tendo sido efetuada a substituição do módulo sem qualquer custo.',
        paginaOrigem: 3,
        folioOrigem: 'fls. 12 da Contestação',
        meioProva: 'Ordem de Reparação n.º 9081 e Folha de Obra chancelada (Doc. n.º 1 da Contestação)',
        confiancaClassificacao: 0.96,
      },
      {
        id: 'fct-1-2',
        classificacao: 'facto_controvertido',
        descricao: 'A Ré impugna expressamente vício oculto de fabrico, imputando a paragem ao uso de gasóleo agrícola não conforme.',
        dataEvento: '2026-01-14',
        ordemCronologica: 2,
        excertoOrigem: 'Impugna-se expressamente o alegado no art. 18.º da P.I.: a viatura não possuía qualquer vício de fabrico; a paragem decorreu da contaminação severa dos injetores por combustível não certificado.',
        paginaOrigem: 4,
        folioOrigem: 'fls. 13 verso',
        meioProva: 'Relatório de Análise Química do Combustível (Doc. n.º 3 da Contestação)',
        confiancaClassificacao: 0.94,
      },
      {
        id: 'fct-1-3',
        classificacao: 'facto_controvertido',
        descricao: 'A Ré impugna a quantificação de lucros cessantes formulada pela Autora por carência de prova de cancelamento de fretes.',
        dataEvento: '2026-02-05',
        ordemCronologica: 3,
        excertoOrigem: 'Impugna-se com veemência o valor abstrato de 64.500,00 €, não tendo a Autora comprovado o cancelamento irrevogável de quaisquer encomendas de clientes.',
        paginaOrigem: 6,
        folioOrigem: 'fls. 15 da Contestação',
        meioProva: 'Impugnação formal nos termos do Art. 574.º n.º 1 do CPC',
        confiancaClassificacao: 0.95,
      },
    ],
  },
  {
    id: 'doc-2',
    processoId: 'proc-1',
    nomeFicheiro: 'Digitalizacao_Auto_Penhora_e_Despacho_fls112.jpg',
    tamanhoBytes: 3120000,
    tipoMime: 'image/jpeg',
    dataCarregamento: '2026-10-24',
    tipoDocumental: 'despacho',
    formato: 'imagem_scan',
    confiancaOcr: 0.78,
    necessitaOcr: true,
    avisosOcr: [
      'Digitalização ótica processada com motor Tesseract/Vision calibrado para grafia jurídica portuguesa.',
      'Carimbos de entrada do Tribunal e rúbricas nos fólio 3 e 4 com legibilidade comprometida.',
      'Notas de rodapé em tamanho reduzido (6pt) sujeitas a revisão ortográfica obrigatória.',
    ],
    deverDeontologicoAviso: 'Aviso Deontológico: A transcrição OCR de digitalizações pode apresentar imprecisões nas notas de rodapé e carimbos. É obrigatória a conferência visual com os autos físicos.',
    partesIdentificadas: ['Tribunal Judicial da Comarca do Porto', 'Agente de Execução António Mota'],
    datasRelevantes: [
      { data: '2026-10-18', descricao: 'Data aparente do despacho liminar exarado pelo Juiz de Execução' },
      { data: '2026-10-22', descricao: 'Carimbo de notificação eletrónica postal' },
    ],
    pedidosEFundamentos: [
      'Determinação de penhora de créditos bancários',
      'Fixação de caução para efeito de efeito suspensivo de embargos',
    ],
    possiveisContradicoes: [
      'O carimbo mecânico do fólio 112 indica 18/10/2026 mas a certificação eletrónica no Citius indica 21/10/2026.',
    ],
    estadoExtracao: 'processado',
    factos: [
      {
        id: 'fct-2-1',
        classificacao: 'facto_comprovado',
        descricao: 'Despacho judicial determinando a penhora preventiva de saldos até ao limite de 48.000,00 €.',
        dataEvento: '2026-10-18',
        ordemCronologica: 1,
        excertoOrigem: 'Nestes termos, determino a imediata penhora dos saldos bancários até ao montante exequendo provisório de 48.000,00 €.',
        paginaOrigem: 1,
        folioOrigem: 'fls. 112 dos autos',
        meioProva: 'Despacho assinado eletronicamente pelo Magistrado',
        confiancaClassificacao: 0.91,
      },
      {
        id: 'fct-2-2',
        classificacao: 'alegacao_parte',
        descricao: 'Alegação constante da cota do Oficial de Justiça de que o depositário não foi localizado na morada registada.',
        dataEvento: '2026-10-21',
        ordemCronologica: 2,
        excertoOrigem: 'Certifico que me desloquei ao local e não obtive atendimento por parte de representante legal.',
        paginaOrigem: 2,
        folioOrigem: 'fls. 112 verso',
        meioProva: 'Certidão negativa de diligência (zona com baixa resolução ótica)',
        confiancaClassificacao: 0.82,
      },
    ],
  },
  {
    id: 'doc-3',
    processoId: 'proc-1',
    nomeFicheiro: 'Peticao_Inicial_1420_24.pdf',
    tamanhoBytes: 1980000,
    tipoMime: 'application/pdf',
    dataCarregamento: '2026-10-15',
    tipoDocumental: 'peticao',
    formato: 'pdf_nativo',
    confiancaOcr: 1.0,
    necessitaOcr: false,
    partesIdentificadas: ['Lusitânia Logística & Distribuição, S.A. (Autora)', 'Vanguard Frotas & Equipamentos, Lda. (Ré)'],
    datasRelevantes: [
      { data: '2024-03-15', descricao: 'Assinatura do contrato de locação financeira LF-2024/099' },
      { data: '2026-01-12', descricao: 'Imobilização forçada dos veículos por falha eletrónica' },
    ],
    pedidosEFundamentos: [
      'Declaração de resolução do contrato de fornecimento por incumprimento culposo',
      'Condenação da Ré no pagamento de indemnização de 64.500,00 € por lucros cessantes',
      'Devolução das prestações adiantadas no valor de 28.000,00 €',
    ],
    possiveisContradicoes: [],
    estadoExtracao: 'processado',
    factos: [
      {
        id: 'fct-3-1',
        classificacao: 'facto_comprovado',
        descricao: 'A Autora é uma sociedade comercial matriculada na Conservatória do Porto sob o NIPC 502987111.',
        dataEvento: '2018-04-10',
        ordemCronologica: 1,
        excertoOrigem: 'A Autora é uma sociedade comercial devidamente constituída e matriculada na Conservatória do Registo Comercial do Porto sob o NIPC 502987111.',
        paginaOrigem: 2,
        folioOrigem: 'fls. 2',
        meioProva: 'Certidão Comercial Permanente (Doc. n.º 1)',
        confiancaClassificacao: 0.99,
      },
      {
        id: 'fct-3-2',
        classificacao: 'facto_comprovado',
        descricao: 'Celebração de contrato de locação financeira n.º LF-2024/099 relativo a três veículos pesados em 15/03/2024.',
        dataEvento: '2024-03-15',
        ordemCronologica: 2,
        excertoOrigem: 'No dia 15 de Março de 2024, Autora e Ré outorgaram o contrato de locação financeira imobiliária e mobiliária n.º LF-2024/099.',
        paginaOrigem: 3,
        folioOrigem: 'fls. 3 verso',
        meioProva: 'Contrato original assinado digitalmente (Doc. n.º 2)',
        confiancaClassificacao: 0.98,
      },
      {
        id: 'fct-3-3',
        classificacao: 'alegacao_parte',
        descricao: 'A Autora alega vício oculto de fabrico concebido pela Ré que originou paragem súbita.',
        dataEvento: '2026-01-12',
        ordemCronologica: 3,
        excertoOrigem: 'Sucede que, por causas exclusivamente imputáveis ao defeito estrutural oculto do sistema de gestão eletrónica concebido pela Ré, as viaturas imobilizaram-se.',
        paginaOrigem: 4,
        folioOrigem: 'fls. 4',
        meioProva: 'Articulado 18.º da P.I. (carece de perícia técnica)',
        confiancaClassificacao: 0.89,
      },
      {
        id: 'fct-3-4',
        classificacao: 'alegacao_parte',
        descricao: 'A Autora alega danos emergentes e lucros cessantes no montante de 64.500,00 €.',
        dataEvento: '2026-01-30',
        ordemCronologica: 4,
        excertoOrigem: 'Em consequência direta e necessária de tal paragem, a Autora sofreu danos emergentes e lucros cessantes nunca inferiores a 64.500,00 €.',
        paginaOrigem: 5,
        folioOrigem: 'fls. 5 verso',
        meioProva: 'Planilha elaborada unilateralmente (Doc. n.º 6)',
        confiancaClassificacao: 0.87,
      },
    ],
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSection, setCurrentSection] = useState<NavigationSection>('dashboard');
  const [selectedProcessoId, setSelectedProcessoId] = useState<string | null>('proc-1');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [quickActionTarget, setQuickActionTarget] = useState<string | null>(null);

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}clientes`);
    return saved ? JSON.parse(saved) : DEMO_CLIENTES;
  });

  const [processos, setProcessos] = useState<Processo[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}processos`);
    return saved ? JSON.parse(saved) : DEMO_PROCESSOS;
  });

  const [prazos, setPrazos] = useState<PrazoEvento[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}prazos`);
    return saved ? JSON.parse(saved) : DEMO_PRAZOS;
  });

  const [fontes, setFontes] = useState<FonteJuridica[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}fontes`);
    return saved ? JSON.parse(saved) : DEMO_FONTES;
  });

  const [minutas, setMinutas] = useState<MinutaJuridica[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}minutas`);
    return saved ? JSON.parse(saved) : DEMO_MINUTAS;
  });

  const [memorias, setMemorias] = useState<MemoriaRegisto[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}memorias`);
    return saved ? JSON.parse(saved) : DEMO_MEMORIAS;
  });

  const [auditoriaLogs, setAuditoriaLogs] = useState<RegistoAuditoria[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}auditoria`);
    return saved ? JSON.parse(saved) : DEMO_AUDITORIA;
  });

  const [documentos, setDocumentos] = useState<DocumentoAnalisado[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}documentos`);
    return saved ? JSON.parse(saved) : DEMO_DOCUMENTOS;
  });

  const [configuracao, setConfiguracao] = useState<ConfiguracaoSistema>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}configuracao`);
    return saved ? JSON.parse(saved) : DEMO_CONFIG;
  });

  // Guardar alterações no localStorage para persistência real entre reloads
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}clientes`, JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}processos`, JSON.stringify(processos));
  }, [processos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}prazos`, JSON.stringify(prazos));
  }, [prazos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}fontes`, JSON.stringify(fontes));
  }, [fontes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}minutas`, JSON.stringify(minutas));
  }, [minutas]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}memorias`, JSON.stringify(memorias));
  }, [memorias]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}auditoria`, JSON.stringify(auditoriaLogs));
  }, [auditoriaLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}documentos`, JSON.stringify(documentos));
  }, [documentos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}configuracao`, JSON.stringify(configuracao));
  }, [configuracao]);

  const addCliente = (c: Omit<Cliente, 'id' | 'dataCriacao'>): Cliente => {
    const novo: Cliente = {
      ...c,
      id: `cli-${Date.now()}`,
      dataCriacao: new Date().toISOString().split('T')[0],
    };
    setClientes((prev) => [novo, ...prev]);
    addAuditoriaLog({
      utilizador: configuracao.nomeEscritorio.split(',')[0],
      acao: 'Registo de Cliente',
      entidade: `Cliente: ${novo.nome}`,
      detalhes: `Novo cliente registado com NIF ${novo.nif}.`,
      status: 'confirmado',
    });
    return novo;
  };

  const updateCliente = (id: string, c: Partial<Cliente>) => {
    setClientes((prev) => prev.map((item) => (item.id === id ? { ...item, ...c } : item)));
  };

  const deleteCliente = (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    setClientes((prev) => prev.filter((item) => item.id !== id));
    if (cliente) {
      addAuditoriaLog({
        utilizador: configuracao.nomeEscritorio.split(',')[0],
        acao: 'Eliminação de Cliente',
        entidade: `Cliente: ${cliente.nome}`,
        detalhes: `Ficha de cliente removida da base de dados ativa.`,
        status: 'alerta',
      });
    }
  };

  const addProcesso = (p: Omit<Processo, 'id' | 'dataEntrada'>): Processo => {
    const novo: Processo = {
      ...p,
      id: `proc-${Date.now()}`,
      dataEntrada: new Date().toISOString().split('T')[0],
    };
    setProcessos((prev) => [novo, ...prev]);
    addAuditoriaLog({
      utilizador: configuracao.nomeEscritorio.split(',')[0],
      acao: 'Abertura de Processo',
      entidade: `Processo: ${novo.numeroProcessual}`,
      detalhes: `Autos abertos no ${novo.tribunal} com valor de ${novo.valorCausa.toLocaleString('pt-PT')} €.`,
      status: 'confirmado',
    });
    return novo;
  };

  const updateProcesso = (id: string, p: Partial<Processo>) => {
    setProcessos((prev) => prev.map((item) => (item.id === id ? { ...item, ...p } : item)));
  };

  const deleteProcesso = (id: string) => {
    const proc = processos.find((p) => p.id === id);
    setProcessos((prev) => prev.filter((item) => item.id !== id));
    if (proc) {
      addAuditoriaLog({
        utilizador: configuracao.nomeEscritorio.split(',')[0],
        acao: 'Arquivo de Processo',
        entidade: `Processo: ${proc.numeroProcessual}`,
        detalhes: `Processo arquivado ou removido da vista operacional.`,
        status: 'alerta',
      });
    }
  };

  const addPrazo = (p: Omit<PrazoEvento, 'id'>): PrazoEvento => {
    const novo: PrazoEvento = {
      ...p,
      id: `prz-${Date.now()}`,
    };
    setPrazos((prev) => [novo, ...prev]);
    return novo;
  };

  const togglePrazoCumprido = (id: string) => {
    setPrazos((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const novoEstado = !item.cumprido;
          addAuditoriaLog({
            utilizador: configuracao.nomeEscritorio.split(',')[0],
            acao: 'Alteração de Prazo',
            entidade: `Prazo: ${item.titulo}`,
            detalhes: `Prazo marcado como ${novoEstado ? 'CUMPRIDO' : 'PENDENTE'} (Processo: ${item.numeroProcesso}).`,
            status: 'confirmado',
          });
          return { ...item, cumprido: novoEstado };
        }
        return item;
      })
    );
  };

  const deletePrazo = (id: string) => {
    setPrazos((prev) => prev.filter((item) => item.id !== id));
  };

  const addFonte = (f: Omit<FonteJuridica, 'id'>): FonteJuridica => {
    const novo: FonteJuridica = {
      ...f,
      id: `fnt-${Date.now()}`,
    };
    setFontes((prev) => [novo, ...prev]);
    addAuditoriaLog({
      utilizador: 'Auditor Jurídico',
      acao: 'Indexação de Fonte',
      entidade: `Fonte: ${novo.identificador}`,
      detalhes: `Fonte jurídica indexada no ramo ${novo.ramo}.`,
      status: 'confirmado',
    });
    return novo;
  };

  const addMinuta = (m: Omit<MinutaJuridica, 'id' | 'dataCriacao' | 'dataAtualizacao'>): MinutaJuridica => {
    const agora = new Date().toISOString().split('T')[0];
    const nova: MinutaJuridica = {
      ...m,
      id: `mnt-${Date.now()}`,
      dataCriacao: agora,
      dataAtualizacao: agora,
    };
    setMinutas((prev) => [nova, ...prev]);
    return nova;
  };

  const updateMinuta = (id: string, m: Partial<MinutaJuridica>) => {
    const agora = new Date().toISOString().split('T')[0];
    setMinutas((prev) => prev.map((item) => (item.id === id ? { ...item, ...m, dataAtualizacao: agora } : item)));
  };

  const deleteMinuta = (id: string) => {
    setMinutas((prev) => prev.filter((item) => item.id !== id));
  };

  const addMemoria = (m: Omit<MemoriaRegisto, 'id' | 'dataRegisto'>): MemoriaRegisto => {
    const nova: MemoriaRegisto = {
      ...m,
      id: `mem-${Date.now()}`,
      dataRegisto: new Date().toISOString().split('T')[0],
    };
    setMemorias((prev) => [nova, ...prev]);
    return nova;
  };

  const deleteMemoria = (id: string) => {
    setMemorias((prev) => prev.filter((item) => item.id !== id));
  };

  const addAuditoriaLog = (log: Omit<RegistoAuditoria, 'id' | 'dataHora'>) => {
    const dataHora = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const novo: RegistoAuditoria = {
      ...log,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dataHora,
    };
    setAuditoriaLogs((prev) => [novo, ...prev]);
  };

  const addDocumento = (doc: Omit<DocumentoAnalisado, 'id' | 'dataCarregamento'>): DocumentoAnalisado => {
    const novo: DocumentoAnalisado = {
      ...doc,
      id: `doc-${Date.now()}`,
      dataCarregamento: new Date().toISOString().split('T')[0],
    };
    setDocumentos((prev) => [novo, ...prev]);
    addAuditoriaLog({
      utilizador: configuracao.nomeEscritorio.split(',')[0],
      acao: 'Extração Documental / OCR',
      entidade: `Ficheiro: ${novo.nomeFicheiro}`,
      detalhes: `Documento processado: ${novo.partesIdentificadas.length} partes e ${novo.pedidosEFundamentos.length} fundamentos extraídos.`,
      status: 'confirmado',
    });
    return novo;
  };

  const deleteDocumento = (id: string) => {
    setDocumentos((prev) => prev.filter((item) => item.id !== id));
  };

  const updateConfiguracao = (cfg: Partial<ConfiguracaoSistema>) => {
    setConfiguracao((prev) => ({ ...prev, ...cfg }));
  };

  const resetDataToDemo = () => {
    setClientes(DEMO_CLIENTES);
    setProcessos(DEMO_PROCESSOS);
    setPrazos(DEMO_PRAZOS);
    setFontes(DEMO_FONTES);
    setMinutas(DEMO_MINUTAS);
    setMemorias(DEMO_MEMORIAS);
    setAuditoriaLogs(DEMO_AUDITORIA);
    setDocumentos(DEMO_DOCUMENTOS);
    setConfiguracao(DEMO_CONFIG);
  };

  const clearAllData = () => {
    setClientes([]);
    setProcessos([]);
    setPrazos([]);
    setFontes([]);
    setMinutas([]);
    setMemorias([]);
    setDocumentos([]);
  };

  return (
    <AppContext.Provider
      value={{
        currentSection,
        setCurrentSection,
        selectedProcessoId,
        setSelectedProcessoId,
        clientes,
        addCliente,
        updateCliente,
        deleteCliente,
        processos,
        addProcesso,
        updateProcesso,
        deleteProcesso,
        prazos,
        addPrazo,
        togglePrazoCumprido,
        deletePrazo,
        fontes,
        addFonte,
        minutas,
        addMinuta,
        updateMinuta,
        deleteMinuta,
        memorias,
        addMemoria,
        deleteMemoria,
        auditoriaLogs,
        addAuditoriaLog,
        documentos,
        addDocumento,
        deleteDocumento,
        configuracao,
        updateConfiguracao,
        globalSearch,
        setGlobalSearch,
        quickActionTarget,
        setQuickActionTarget,
        resetDataToDemo,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser utilizado dentro de um AppProvider');
  }
  return context;
};
