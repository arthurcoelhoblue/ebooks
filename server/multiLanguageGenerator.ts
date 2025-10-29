import { translateContent } from "./translator";
import { generateEbookContent, compileToHTML, generateCoverPrompt } from "./ebookGenerator";
import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";

export interface LanguageFile {
  languageCode: string;
  epubUrl: string;
  pdfUrl: string;
  coverUrl: string;
  title: string;
}

/**
 * Generate eBook files for multiple languages
 */
export async function generateMultiLanguageEbook(
  theme: string,
  author: string,
  numChapters: number,
  languages: string[], // ["pt", "en", "es"]
  userId: number,
  ebookId: number
): Promise<LanguageFile[]> {
  const results: LanguageFile[] = [];

  // Generate base content in Portuguese
  const baseBook = await generateEbookContent(theme, numChapters);

  for (const langCode of languages) {
    try {
      let title = baseBook.title;
      let chapters = baseBook.chapters;

      // Translate if not Portuguese
      if (langCode !== "pt") {
        // Translate title
        title = await translateContent(baseBook.title, langCode);

        // Translate each chapter
        chapters = await Promise.all(
          baseBook.chapters.map(async (chapter) => ({
            title: await translateContent(chapter.title, langCode),
            content: await translateContent(chapter.content, langCode),
          }))
        );
      }

      // Compile to HTML
      const htmlContent = compileToHTML(title, author, chapters);
      const htmlBuffer = Buffer.from(htmlContent, "utf-8");

      // Upload HTML as PDF (in production, convert to actual PDF)
      const { url: pdfUrl } = await storagePut(
        `ebooks/${userId}/${ebookId}/${langCode}/ebook.html`,
        htmlBuffer,
        "text/html"
      );

      // Upload EPUB (same HTML for now)
      const { url: epubUrl } = await storagePut(
        `ebooks/${userId}/${ebookId}/${langCode}/ebook-preview.html`,
        htmlBuffer,
        "text/html"
      );

      // Generate cover with translated title
      const coverPrompt = generateCoverPrompt(title, theme);
      const { url: coverUrl } = await generateImage({ prompt: coverPrompt });

      results.push({
        languageCode: langCode,
        epubUrl: epubUrl || "",
        pdfUrl: pdfUrl || "",
        coverUrl: coverUrl || "",
        title,
      });
    } catch (error) {
      console.error(`Failed to generate eBook for language ${langCode}:`, error);
      // Continue with other languages even if one fails
    }
  }

  return results;
}

