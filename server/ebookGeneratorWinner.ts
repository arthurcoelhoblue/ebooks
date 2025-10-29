import { invokeLLM } from "./_core/llm";
import { WINNER_STRUCTURE_TEMPLATE, WinnerChapter, SECTION_PROMPTS, HOOK_PROMPTS } from "./ebookTemplateWinner";

export interface WinnerEbookContent {
  title: string;
  subtitle: string;
  author: string;
  frontMatter: {
    readerLetter: string;
  };
  chapters: GeneratedWinnerChapter[];
  backMatter: {
    bonus: string;
    aboutAuthor: string;
    ctaNext: string;
  };
}

export interface GeneratedWinnerChapter {
  number: number;
  title: string;
  fullTitle: string; // Formato: "CAPÍTULO {n} — {título}"
  content: string; // HTML completo do capítulo
  hook: string;
  wordCount: number;
}

/**
 * Gera eBook completo usando estrutura vencedora de não-ficção transformacional
 */
export async function generateWinnerEbook(
  theme: string,
  author: string
): Promise<WinnerEbookContent> {
  
  console.log(`[Winner eBook] Gerando estrutura para tema: ${theme}`);
  
  // Passo 1: Gerar título e subtítulo otimizados
  const titleResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em copywriting para eBooks best-sellers. Crie títulos que prometem transformação mensurável.",
      },
      {
        role: "user",
        content: `Crie um título e subtítulo poderosos para um eBook de não-ficção transformacional sobre "${theme}". 

REGRAS:
- Título: promessa clara + benefício mensurável
- Subtítulo: como alcançar + prazo ou método
- Use fórmulas comprovadas: "Como [resultado] em [prazo] sem [objeção]"
- Seja específico e promissor`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "ebook_title",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            subtitle: { type: "string" },
          },
          required: ["title", "subtitle"],
          additionalProperties: false,
        },
      },
    },
  });

  const titleData = JSON.parse(titleResponse.choices[0].message.content as string);
  const bookTitle = titleData.title;
  const bookSubtitle = titleData.subtitle;

  console.log(`[Winner eBook] Título gerado: ${bookTitle}`);

  // Passo 2: Gerar títulos específicos dos 5 pilares
  const pillarsResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em estruturação de conteúdo educacional transformacional.",
      },
      {
        role: "user",
        content: `Para um eBook sobre "${theme}" com título "${bookTitle}", crie títulos promissores para os 5 pilares principais.

Cada título deve:
- Prometer um benefício claro
- Ser específico e acionável
- Usar verbos de ação
- Ter no máximo 8 palavras

Exemplo: "Domine a Técnica X em 7 Dias"`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "pillar_titles",
        strict: true,
        schema: {
          type: "object",
          properties: {
            pillar1: { type: "string" },
            pillar2: { type: "string" },
            pillar3: { type: "string" },
            pillar4: { type: "string" },
            pillar5: { type: "string" },
          },
          required: ["pillar1", "pillar2", "pillar3", "pillar4", "pillar5"],
          additionalProperties: false,
        },
      },
    },
  });

  const pillarTitles = JSON.parse(pillarsResponse.choices[0].message.content as string);

  // Passo 3: Gerar Front Matter
  console.log(`[Winner eBook] Gerando front matter...`);
  const frontMatter = await generateFrontMatter(bookTitle, bookSubtitle, theme, author);

  // Passo 4: Gerar cada capítulo com estrutura otimizada
  const chapters: GeneratedWinnerChapter[] = [];
  
  const chapterConfigs = [
    { num: 1, title: "A Grande Promessa e o Obstáculo", type: "big_promise", wordTarget: 2000 },
    { num: 2, title: "O Novo Modelo Mental", type: "new_model", wordTarget: 2200 },
    { num: 3, title: pillarTitles.pillar1, type: "pillar", wordTarget: 2400 },
    { num: 4, title: pillarTitles.pillar2, type: "pillar", wordTarget: 2400 },
    { num: 5, title: pillarTitles.pillar3, type: "pillar", wordTarget: 2400 },
    { num: 6, title: pillarTitles.pillar4, type: "pillar", wordTarget: 2400 },
    { num: 7, title: pillarTitles.pillar5, type: "pillar", wordTarget: 2400 },
    { num: 8, title: "Seu Plano de 30 Dias", type: "action_plan", wordTarget: 1800 },
    { num: 9, title: "Casos Reais e Perguntas Frequentes", type: "cases_faq", wordTarget: 2000 },
    { num: 10, title: "Seu Compromisso com a Transformação", type: "conclusion", wordTarget: 1500 },
  ];

  for (const config of chapterConfigs) {
    console.log(`[Winner eBook] Gerando capítulo ${config.num}: ${config.title}`);
    const chapter = await generateWinnerChapter(
      config.num,
      config.title,
      config.type as any,
      theme,
      bookTitle,
      config.wordTarget
    );
    chapters.push(chapter);
  }

  // Passo 5: Gerar Back Matter
  console.log(`[Winner eBook] Gerando back matter...`);
  const backMatter = await generateBackMatter(bookTitle, theme, author);

  return {
    title: bookTitle,
    subtitle: bookSubtitle,
    author,
    frontMatter,
    chapters,
    backMatter,
  };
}

/**
 * Gera front matter profissional
 */
async function generateFrontMatter(
  title: string,
  subtitle: string,
  theme: string,
  author: string
): Promise<{ readerLetter: string }> {
  
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um autor best-seller escrevendo uma carta pessoal e inspiradora para seus leitores.",
      },
      {
        role: "user",
        content: `Escreva uma "Carta ao Leitor" para o eBook "${title}: ${subtitle}" sobre ${theme}.

A carta deve (1-2 páginas):
1. Conectar emocionalmente com o leitor
2. Prometer a transformação específica
3. Explicar como usar o livro
4. Criar expectativa e compromisso
5. Ser pessoal e autêntica

Tom: inspirador, direto, empático.
Assine como "${author}".`,
      },
    ],
  });

  return {
    readerLetter: response.choices[0].message.content as string,
  };
}

/**
 * Gera um capítulo completo com estrutura vencedora
 */
async function generateWinnerChapter(
  number: number,
  title: string,
  type: string,
  theme: string,
  bookTitle: string,
  wordTarget: number
): Promise<GeneratedWinnerChapter> {
  
  let prompt = "";
  
  // Prompts específicos por tipo de capítulo
  if (type === "big_promise") {
    prompt = `Escreva o Capítulo 1 "${title}" do eBook "${bookTitle}" sobre ${theme}.

ESTRUTURA OBRIGATÓRIA:
1. História Curta (500 palavras): Conte uma história real ou fictícia que ilustre o problema que o leitor enfrenta
2. O Objetivo Claro (400 palavras): Defina exatamente o que o leitor vai alcançar com este eBook
3. O Obstáculo Atual (400 palavras): Explique o que hoje impede o leitor de alcançar esse objetivo
4. Gancho Final (200 palavras): Termine com uma pergunta provocativa que faça o leitor querer ler o próximo capítulo

Total: ~${wordTarget} palavras
Tom: Inspirador, empático, direto`;
    
  } else if (type === "new_model") {
    prompt = `Escreva o Capítulo 2 "${title}" do eBook "${bookTitle}" sobre ${theme}.

ESTRUTURA OBRIGATÓRIA:
1. Por Que o Método Padrão Falha (700 palavras): Desmonte as crenças comuns e mostre por que não funcionam
2. O Novo Framework (800 palavras): Apresente seu método único com nome memorável
3. Benefícios Mensuráveis (500 palavras): Liste resultados específicos que o leitor vai alcançar
4. Gancho Final (200 palavras): Prometa os pilares práticos que vêm a seguir

Total: ~${wordTarget} palavras
Tom: Educativo, confiante, revelador`;
    
  } else if (type === "pillar") {
    prompt = `Escreva o capítulo "${title}" do eBook "${bookTitle}" sobre ${theme}.

ESTRUTURA OBRIGATÓRIA:
1. Mini-História (400 palavras): Estudo de caso ou exemplo prático que ilustra o pilar
2. Conceito Essencial 1 (300 palavras): Primeira ideia-chave explicada de forma clara
3. Conceito Essencial 2 (300 palavras): Segunda ideia-chave com exemplos
4. Conceito Essencial 3 (300 palavras): Terceira ideia-chave aplicável
5. Checklist Executável (400 palavras): 5-7 passos práticos que o leitor pode seguir
6. Erro Comum + Como Evitar (400 palavras): O erro #1 e a solução
7. Micro-Desafio de 15 Minutos (200 palavras): Ação específica para fazer AGORA
8. Gancho Final (100 palavras): Conexão com o próximo pilar

Total: ~${wordTarget} palavras
Tom: Prático, acionável, motivador`;
    
  } else if (type === "action_plan") {
    prompt = `Escreva o capítulo "${title}" do eBook "${bookTitle}" sobre ${theme}.

ESTRUTURA OBRIGATÓRIA:
1. Introdução ao Plano (300 palavras): Como usar o plano de 30 dias
2. Plano Semanal (1200 palavras): Organize em 4 semanas com ações diárias específicas
   - Semana 1: Fundação
   - Semana 2: Implementação
   - Semana 3: Otimização
   - Semana 4: Consolidação
3. Como Acompanhar Progresso (200 palavras): Métricas e indicadores
4. Gancho Final (100 palavras): Veja casos reais de sucesso

Total: ~${wordTarget} palavras
Formato: Use listas numeradas e organize claramente`;
    
  } else if (type === "cases_faq") {
    prompt = `Escreva o capítulo "${title}" do eBook "${bookTitle}" sobre ${theme}.

ESTRUTURA OBRIGATÓRIA:
1. Caso de Uso 1 (500 palavras): História real de transformação
2. Caso de Uso 2 (500 palavras): Outro exemplo inspirador
3. Caso de Uso 3 (500 palavras): Terceiro caso com lições
4. FAQs (400 palavras): 5-7 perguntas mais comuns com respostas diretas
5. Gancho Final (100 palavras): Prepare-se para o compromisso final

Total: ~${wordTarget} palavras
Tom: Inspirador, prova social, confiança`;
    
  } else if (type === "conclusion") {
    prompt = `Escreva o capítulo final "${title}" do eBook "${bookTitle}" sobre ${theme}.

ESTRUTURA OBRIGATÓRIA:
1. Recapitulação da Jornada (500 palavras): Revise os principais aprendizados
2. Carta de Compromisso (600 palavras): Convide o leitor a se comprometer com a transformação
3. Próximos Passos Imediatos (300 palavras): 3 ações para fazer hoje
4. Gancho Final (100 palavras): Confira os bônus exclusivos

Total: ~${wordTarget} palavras
Tom: Inspirador, empoderador, chamada à ação`;
  }

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um autor best-seller de não-ficção transformacional. Escreva conteúdo envolvente, prático e que mantém o leitor virando páginas.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content as string;
  const wordCount = content.split(/\s+/).length;

  return {
    number,
    title,
    fullTitle: `CAPÍTULO ${number} — ${title}`,
    content,
    hook: "", // Já incluído no conteúdo
    wordCount,
  };
}

/**
 * Gera back matter vendedor
 */
async function generateBackMatter(
  title: string,
  theme: string,
  author: string
): Promise<{ bonus: string; aboutAuthor: string; ctaNext: string }> {
  
  const bonusResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em criar ofertas irresistíveis de bônus.",
      },
      {
        role: "user",
        content: `Crie uma seção de BÔNUS EXCLUSIVOS para o eBook "${title}" sobre ${theme}.

Ofereça 3-4 recursos digitais valiosos:
- Templates/Checklists para download
- Planilhas ou ferramentas
- Guias complementares
- Acesso a comunidade ou conteúdo extra

Seja específico e crie senso de valor. Máximo 400 palavras.`,
      },
    ],
  });

  const aboutResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um ghostwriter especializado em biografias de autores.",
      },
      {
        role: "user",
        content: `Escreva uma seção "Sobre o Autor" para ${author}, autor do eBook "${title}" sobre ${theme}.

Inclua:
- Credenciais e experiência relevante
- Por que é autoridade no assunto
- Missão pessoal
- Como conectar (redes sociais/site)

Tom: profissional mas acessível. Máximo 300 palavras.`,
      },
    ],
  });

  const ctaResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em copywriting de conversão.",
      },
      {
        role: "user",
        content: `Crie uma seção final "PRÓXIMO PASSO" para o eBook "${title}" sobre ${theme}.

Convide o leitor a:
1. Deixar uma avaliação (prova social)
2. Compartilhar com quem precisa
3. Continuar a jornada (próximo eBook, curso, comunidade)

Seja persuasivo mas não agressivo. Máximo 300 palavras.`,
      },
    ],
  });

  return {
    bonus: bonusResponse.choices[0].message.content as string,
    aboutAuthor: aboutResponse.choices[0].message.content as string,
    ctaNext: ctaResponse.choices[0].message.content as string,
  };
}

