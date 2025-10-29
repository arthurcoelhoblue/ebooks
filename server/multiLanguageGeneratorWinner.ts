import { generateWinnerEbook } from "./ebookGeneratorWinner";
import { compileWinnerToHTML } from "./ebookCompilerWinner";
import { generateCoverPrompt } from "./ebookGenerator";
import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";

export interface LanguageFile {
  languageCode: string;
  epubUrl: string;
  pdfUrl: string;
  coverUrl: string;
  title: string;
}

/**
 * Gera eBook vencedor em múltiplos idiomas
 */
export async function generateMultiLanguageWinnerEbook(
  theme: string,
  author: string,
  languages: string[], // ["pt", "en", "es"]
  userId: number,
  ebookId: number
): Promise<LanguageFile[]> {
  const results: LanguageFile[] = [];

  console.log(`[Multi-Language Winner] Gerando eBook base em português...`);
  
  // Gera conteúdo base em português usando estrutura vencedora
  const baseBook = await generateWinnerEbook(theme, author);

  for (const langCode of languages) {
    try {
      console.log(`[Multi-Language Winner] Processando idioma: ${langCode}`);
      
      let ebookContent = baseBook;

      // Traduz se não for português
      if (langCode !== "pt") {
        console.log(`[Multi-Language Winner] Traduzindo para ${langCode}...`);
        ebookContent = await translateWinnerEbook(baseBook, langCode);
      }

      // Compila para HTML com formatação profissional
      const htmlContent = compileWinnerToHTML(ebookContent);
      const htmlBuffer = Buffer.from(htmlContent, "utf-8");

      // Upload HTML como PDF (em produção, converter para PDF real)
      const { url: pdfUrl } = await storagePut(
        `ebooks/${userId}/${ebookId}/${langCode}/ebook.html`,
        htmlBuffer,
        "text/html"
      );

      // Upload EPUB (mesmo HTML por enquanto)
      const { url: epubUrl } = await storagePut(
        `ebooks/${userId}/${ebookId}/${langCode}/ebook-preview.html`,
        htmlBuffer,
        "text/html"
      );

      // Gera capa com título traduzido
      const coverPrompt = generateCoverPrompt(ebookContent.title, theme);
      const { url: coverUrl } = await generateImage({ prompt: coverPrompt });

      results.push({
        languageCode: langCode,
        epubUrl: epubUrl || "",
        pdfUrl: pdfUrl || "",
        coverUrl: coverUrl || "",
        title: ebookContent.title,
      });

      console.log(`[Multi-Language Winner] ✓ ${langCode} concluído`);
    } catch (error) {
      console.error(`[Multi-Language Winner] Erro ao gerar eBook para ${langCode}:`, error);
      // Continua com outros idiomas mesmo se um falhar
    }
  }

  return results;
}

/**
 * Traduz eBook completo para outro idioma
 */
async function translateWinnerEbook(
  ebook: any,
  targetLang: string
): Promise<any> {
  
  const langNames: Record<string, string> = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    it: "Italiano",
    pt: "Português",
  };

  const targetLanguage = langNames[targetLang] || targetLang;

  // Traduz título e subtítulo
  const titleResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a professional translator specializing in book titles and marketing copy. Translate to ${targetLanguage}.`,
      },
      {
        role: "user",
        content: `Translate this eBook title and subtitle to ${targetLanguage}:

Title: ${ebook.title}
Subtitle: ${ebook.subtitle}

Keep the same impact and promise. Use native expressions.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "translated_title",
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

  const translatedTitle = JSON.parse(titleResponse.choices[0].message.content as string);

  // Traduz front matter
  const frontMatterResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate to ${targetLanguage} maintaining tone and emotion.`,
      },
      {
        role: "user",
        content: `Translate this reader letter to ${targetLanguage}:\n\n${ebook.frontMatter.readerLetter}`,
      },
    ],
  });

  // Traduz capítulos (em lote para eficiência)
  const translatedChapters = await Promise.all(
    ebook.chapters.map(async (chapter: any) => {
      const chapterResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a professional translator specializing in non-fiction transformational books. Translate to ${targetLanguage}.`,
          },
          {
            role: "user",
            content: `Translate this chapter to ${targetLanguage}:

Title: ${chapter.title}

Content:
${chapter.content}

Maintain the structure, tone, and impact. Use natural expressions in ${targetLanguage}.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "translated_chapter",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" },
              },
              required: ["title", "content"],
              additionalProperties: false,
            },
          },
        },
      });

      const translated = JSON.parse(chapterResponse.choices[0].message.content as string);
      
      return {
        ...chapter,
        title: translated.title,
        fullTitle: `CHAPTER ${chapter.number} — ${translated.title}`,
        content: translated.content,
      };
    })
  );

  // Traduz back matter
  const backMatterResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate to ${targetLanguage}.`,
      },
      {
        role: "user",
        content: `Translate these sections to ${targetLanguage}:

BONUS:
${ebook.backMatter.bonus}

ABOUT AUTHOR:
${ebook.backMatter.aboutAuthor}

CALL TO ACTION:
${ebook.backMatter.ctaNext}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "translated_backmatter",
        strict: true,
        schema: {
          type: "object",
          properties: {
            bonus: { type: "string" },
            aboutAuthor: { type: "string" },
            ctaNext: { type: "string" },
          },
          required: ["bonus", "aboutAuthor", "ctaNext"],
          additionalProperties: false,
        },
      },
    },
  });

  const translatedBackMatter = JSON.parse(backMatterResponse.choices[0].message.content as string);

  return {
    title: translatedTitle.title,
    subtitle: translatedTitle.subtitle,
    author: ebook.author,
    frontMatter: {
      readerLetter: frontMatterResponse.choices[0].message.content as string,
    },
    chapters: translatedChapters,
    backMatter: translatedBackMatter,
  };
}

