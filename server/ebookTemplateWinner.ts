/**
 * Template de eBook Vencedor
 * Baseado em pesquisa de best-sellers e melhores práticas de não-ficção transformacional
 */

export interface WinnerEbookStructure {
  frontMatter: {
    cover: boolean;
    rights: boolean;
    toc: boolean;
    readerLetter: boolean;
  };
  chapters: WinnerChapter[];
  backMatter: {
    bonus: boolean;
    aboutAuthor: boolean;
    ctaNext: boolean;
  };
  formatting: {
    format: string;
    chapterWordsMin: number;
    chapterWordsMax: number;
    hookEachEnd: boolean;
    tocLinks: boolean;
    pageBreaks: string;
    bodyIndentEm: number;
    lineHeight: number;
    h1Format: string;
    h2Format: string;
  };
}

export interface WinnerChapter {
  number: number;
  type: 'big_promise' | 'new_model' | 'pillar' | 'action_plan' | 'cases_faq' | 'conclusion';
  title: string;
  sections: ChapterSection[];
  hook: string; // Gancho no final do capítulo
  wordTarget: number; // 1200-2500 palavras
}

export interface ChapterSection {
  type: 'story' | 'concept' | 'checklist' | 'common_error' | 'micro_challenge' | 'table';
  content: string;
}

/**
 * Estrutura padrão de 10 capítulos (não-ficção transformacional)
 */
export const WINNER_STRUCTURE_TEMPLATE: WinnerEbookStructure = {
  frontMatter: {
    cover: true,
    rights: true,
    toc: true,
    readerLetter: true,
  },
  chapters: [
    {
      number: 1,
      type: 'big_promise',
      title: 'Big Promise & Gap',
      sections: [
        { type: 'story', content: 'História curta que ilustra o problema' },
        { type: 'concept', content: 'O objetivo claro que o leitor vai alcançar' },
        { type: 'concept', content: 'O que hoje impede de alcançar esse objetivo' },
      ],
      hook: 'Pergunta provocativa ou promessa do próximo capítulo',
      wordTarget: 2000,
    },
    {
      number: 2,
      type: 'new_model',
      title: 'Novo Modelo Mental',
      sections: [
        { type: 'concept', content: 'Por que o método padrão falha' },
        { type: 'concept', content: 'Apresentação do novo framework' },
        { type: 'concept', content: 'Benefícios mensuráveis do novo modelo' },
      ],
      hook: 'Transição para os pilares práticos',
      wordTarget: 2200,
    },
    {
      number: 3,
      type: 'pillar',
      title: 'Pilar 1',
      sections: [
        { type: 'story', content: 'Mini-história ou estudo de caso (1-2 páginas)' },
        { type: 'concept', content: 'Conceito essencial 1' },
        { type: 'concept', content: 'Conceito essencial 2' },
        { type: 'concept', content: 'Conceito essencial 3' },
        { type: 'checklist', content: 'Checklist executável' },
        { type: 'common_error', content: 'Erro comum + Como evitar' },
        { type: 'micro_challenge', content: 'Micro-desafio de 15 minutos' },
      ],
      hook: 'Promessa do próximo pilar',
      wordTarget: 2400,
    },
    {
      number: 4,
      type: 'pillar',
      title: 'Pilar 2',
      sections: [
        { type: 'story', content: 'Mini-história ou estudo de caso' },
        { type: 'concept', content: 'Conceito essencial 1' },
        { type: 'concept', content: 'Conceito essencial 2' },
        { type: 'concept', content: 'Conceito essencial 3' },
        { type: 'checklist', content: 'Checklist executável' },
        { type: 'common_error', content: 'Erro comum + Como evitar' },
        { type: 'micro_challenge', content: 'Micro-desafio de 15 minutos' },
      ],
      hook: 'Conexão com o próximo pilar',
      wordTarget: 2400,
    },
    {
      number: 5,
      type: 'pillar',
      title: 'Pilar 3',
      sections: [
        { type: 'story', content: 'Mini-história ou estudo de caso' },
        { type: 'concept', content: 'Conceito essencial 1' },
        { type: 'concept', content: 'Conceito essencial 2' },
        { type: 'concept', content: 'Conceito essencial 3' },
        { type: 'checklist', content: 'Checklist executável' },
        { type: 'common_error', content: 'Erro comum + Como evitar' },
        { type: 'micro_challenge', content: 'Micro-desafio de 15 minutos' },
      ],
      hook: 'Preparação para próximo pilar',
      wordTarget: 2400,
    },
    {
      number: 6,
      type: 'pillar',
      title: 'Pilar 4',
      sections: [
        { type: 'story', content: 'Mini-história ou estudo de caso' },
        { type: 'concept', content: 'Conceito essencial 1' },
        { type: 'concept', content: 'Conceito essencial 2' },
        { type: 'concept', content: 'Conceito essencial 3' },
        { type: 'checklist', content: 'Checklist executável' },
        { type: 'common_error', content: 'Erro comum + Como evitar' },
        { type: 'micro_challenge', content: 'Micro-desafio de 15 minutos' },
      ],
      hook: 'Último pilar chegando',
      wordTarget: 2400,
    },
    {
      number: 7,
      type: 'pillar',
      title: 'Pilar 5',
      sections: [
        { type: 'story', content: 'Mini-história ou estudo de caso' },
        { type: 'concept', content: 'Conceito essencial 1' },
        { type: 'concept', content: 'Conceito essencial 2' },
        { type: 'concept', content: 'Conceito essencial 3' },
        { type: 'checklist', content: 'Checklist executável' },
        { type: 'common_error', content: 'Erro comum + Como evitar' },
        { type: 'micro_challenge', content: 'Micro-desafio de 15 minutos' },
      ],
      hook: 'Agora vamos ao plano de ação',
      wordTarget: 2400,
    },
    {
      number: 8,
      type: 'action_plan',
      title: 'Plano de 30 Dias',
      sections: [
        { type: 'table', content: 'Tabela simples reflowable com ações diárias/semanais' },
        { type: 'concept', content: 'Como acompanhar progresso' },
        { type: 'concept', content: 'Ajustes conforme necessário' },
      ],
      hook: 'Veja casos reais de sucesso',
      wordTarget: 1800,
    },
    {
      number: 9,
      type: 'cases_faq',
      title: 'Casos de Uso e FAQs',
      sections: [
        { type: 'story', content: 'Caso de uso 1' },
        { type: 'story', content: 'Caso de uso 2' },
        { type: 'story', content: 'Caso de uso 3' },
        { type: 'concept', content: 'FAQs mais comuns' },
      ],
      hook: 'Seu compromisso final',
      wordTarget: 2000,
    },
    {
      number: 10,
      type: 'conclusion',
      title: 'Conclusão e Compromisso',
      sections: [
        { type: 'concept', content: 'Recapitulação da jornada' },
        { type: 'concept', content: 'Carta de compromisso pessoal' },
        { type: 'concept', content: 'Próximos passos imediatos' },
      ],
      hook: 'Confira os bônus exclusivos',
      wordTarget: 1500,
    },
  ],
  backMatter: {
    bonus: true,
    aboutAuthor: true,
    ctaNext: true,
  },
  formatting: {
    format: 'EPUB reflowable',
    chapterWordsMin: 1200,
    chapterWordsMax: 2500,
    hookEachEnd: true,
    tocLinks: true,
    pageBreaks: 'before_each_H1',
    bodyIndentEm: 0.9,
    lineHeight: 1.3,
    h1Format: 'CAPÍTULO {n} — {promise_title}',
    h2Format: '{benefit_subtitle}',
  },
};

/**
 * Prompts otimizados para cada tipo de seção
 */
export const SECTION_PROMPTS = {
  story: 'Escreva uma mini-história envolvente (1-2 páginas) que ilustre o conceito de forma prática e memorável. Use personagens reais ou fictícios, mostre o problema e a transformação.',
  
  concept: 'Explique o conceito de forma clara e direta. Use analogias, exemplos do dia a dia e linguagem acessível. Máximo 3 ideias principais por seção.',
  
  checklist: 'Crie uma checklist executável com 5-7 itens práticos que o leitor pode implementar imediatamente. Seja específico e acionável.',
  
  common_error: 'Identifique o erro mais comum que as pessoas cometem neste pilar e explique exatamente como evitá-lo. Use exemplos concretos.',
  
  micro_challenge: 'Proponha um desafio de 15 minutos que o leitor pode fazer AGORA para aplicar o conceito. Seja ultra-específico sobre o que fazer.',
  
  table: 'Crie uma tabela simples em formato HTML reflowable com o plano de ação organizado por semanas ou dias. Mantenha células curtas e legíveis em mobile.',
};

/**
 * Prompts para ganchos (hooks) no final de cada capítulo
 */
export const HOOK_PROMPTS = {
  question: 'Termine com uma pergunta provocativa que faça o leitor querer descobrir a resposta no próximo capítulo.',
  
  promise: 'Faça uma promessa específica e mensurável do que o leitor vai aprender no próximo capítulo.',
  
  cliffhanger: 'Crie um micro-cliffhanger revelando parcialmente uma informação surpreendente que será completada no próximo capítulo.',
  
  challenge: 'Lance um desafio direto ao leitor que será respondido ou resolvido no próximo capítulo.',
};

