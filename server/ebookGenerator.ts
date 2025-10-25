import { invokeLLM } from "./_core/llm";
import { v4 as uuidv4 } from "uuid";

export interface EbookChapter {
  title: string;
  content: string;
}

export interface GeneratedEbook {
  title: string;
  chapters: EbookChapter[];
}

/**
 * Generates ebook content using OpenAI Function Calling technique
 * This allows generating long-form content (12,000+ tokens) in a single request
 */
export async function generateEbookContent(
  theme: string,
  numChapters: number = 5
): Promise<GeneratedEbook> {
  // Step 1: Generate book structure (title and chapter titles)
  const structureResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em criação de eBooks. Crie estruturas de livros profissionais e atraentes.",
      },
      {
        role: "user",
        content: `Crie a estrutura de um eBook sobre "${theme}". Gere um título atraente e ${numChapters} títulos de capítulos que cubram o tema de forma completa e didática.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "ebook_structure",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Título atraente e profissional do eBook",
            },
            chapters: {
              type: "array",
              description: "Lista de títulos dos capítulos",
              items: {
                type: "string",
              },
            },
          },
          required: ["title", "chapters"],
          additionalProperties: false,
        },
      },
    },
  });

  const contentStr = typeof structureResponse.choices[0].message.content === 'string' 
    ? structureResponse.choices[0].message.content 
    : '{}';
  const structure = JSON.parse(contentStr);
  const bookTitle = structure.title;
  const chapterTitles = structure.chapters.slice(0, numChapters);

  // Step 2: Generate content for all chapters using Function Calling
  const parameters: Record<string, any> = {};
  const sections = ["Introdução", "Desenvolvimento", "Exemplos Práticos", "Conclusão"];

  chapterTitles.forEach((chapterTitle: string, index: number) => {
    sections.forEach((section) => {
      const paramName = `capitulo_${index + 1}_${section.toLowerCase().replace(/ /g, "_")}`;
      parameters[paramName] = {
        type: "string",
        description: `Escreva o conteúdo da seção "${section}" do capítulo "${chapterTitle}" sobre ${theme}. Seja detalhado, didático e profissional. Mínimo 300 palavras.`,
      };
    });
  });

  const functionDefinition = {
    name: "generate_ebook_content",
    description: `Gera o conteúdo completo de um eBook sobre ${theme}`,
    parameters: {
      type: "object",
      properties: parameters,
      required: Object.keys(parameters),
    },
  };

  const contentResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um autor especializado em criar eBooks profissionais e didáticos. Escreva conteúdo detalhado, bem estruturado e envolvente.",
      },
      {
        role: "user",
        content: `Escreva o conteúdo completo de um eBook sobre "${theme}" com o título "${bookTitle}". Cada capítulo deve ter introdução, desenvolvimento, exemplos práticos e conclusão.`,
      },
    ],
    tools: [{ type: "function", function: functionDefinition }],
    tool_choice: { type: "function", function: { name: "generate_ebook_content" } },
  });

  const functionCall = contentResponse.choices[0].message.tool_calls?.[0];
  if (!functionCall) {
    throw new Error("Failed to generate ebook content");
  }

  const generatedContent = JSON.parse(functionCall.function.arguments);

  // Step 3: Organize content into chapters
  const chapters: EbookChapter[] = chapterTitles.map((chapterTitle: string, index: number) => {
    const chapterContent = sections
      .map((section) => {
        const paramName = `capitulo_${index + 1}_${section.toLowerCase().replace(/ /g, "_")}`;
        const content = generatedContent[paramName] || "";
        return `<h2>${section}</h2>\n<p>${content}</p>`;
      })
      .join("\n\n");

    return {
      title: chapterTitle,
      content: chapterContent,
    };
  });

  return {
    title: bookTitle,
    chapters,
  };
}

/**
 * Generates a book cover description for AI image generation
 */
export function generateCoverPrompt(title: string, theme: string): string {
  return `Professional ebook cover design for "${title}". Modern, clean, and eye-catching design. Theme: ${theme}. High quality, commercial style, 3D elements, gradient background, professional typography.`;
}

/**
 * Compiles chapters into HTML format for EPUB/PDF generation
 */
export function compileToHTML(title: string, author: string, chapters: EbookChapter[]): string {
  const chaptersHTML = chapters
    .map(
      (chapter, index) => `
    <div class="chapter">
      <h1>Capítulo ${index + 1}: ${chapter.title}</h1>
      ${chapter.content}
    </div>
  `
    )
    .join("\n");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: Georgia, serif;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 {
      font-size: 2em;
      margin-top: 2em;
      margin-bottom: 0.5em;
      page-break-before: always;
    }
    h2 {
      font-size: 1.5em;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: #555;
    }
    p {
      margin-bottom: 1em;
      text-align: justify;
    }
    .chapter {
      margin-bottom: 3em;
    }
    .cover {
      text-align: center;
      padding: 4em 2em;
    }
    .cover h1 {
      font-size: 3em;
      margin-bottom: 0.5em;
    }
    .cover p {
      font-size: 1.2em;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>${title}</h1>
    <p>por ${author}</p>
  </div>
  ${chaptersHTML}
</body>
</html>
  `;
}

