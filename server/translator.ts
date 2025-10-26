import { invokeLLM } from "./_core/llm";

export const SUPPORTED_LANGUAGES = {
  pt: { name: "Português", flag: "🇧🇷" },
  en: { name: "English", flag: "🇬🇧" },
  es: { name: "Español", flag: "🇪🇸" },
  zh: { name: "中文 (Chinês)", flag: "🇨🇳" },
  hi: { name: "हिन्दी (Hindi)", flag: "🇮🇳" },
  ar: { name: "العربية (Árabe)", flag: "🇸🇦" },
  bn: { name: "বাংলা (Bengali)", flag: "🇧🇩" },
  ru: { name: "Русский (Russo)", flag: "🇷🇺" },
  ja: { name: "日本語 (Japonês)", flag: "🇯🇵" },
  de: { name: "Deutsch (Alemão)", flag: "🇩🇪" },
  fr: { name: "Français (Francês)", flag: "🇫🇷" },
};

export async function translateContent(
  content: string,
  targetLanguage: string
): Promise<string> {
  const langInfo = SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES];
  
  if (!langInfo) {
    throw new Error(`Unsupported language: ${targetLanguage}`);
  }

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate the following content to ${langInfo.name}. 
Maintain the original formatting, structure, and tone. 
For technical terms, use the most appropriate translation in the target language.
Do not add any comments or explanations, just provide the translation.`,
      },
      {
        role: "user",
        content: content,
      },
    ],
  });

  const translated = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : content;
  return translated;
}

export async function translateEbookChapters(
  chapters: Array<{ title: string; content: string }>,
  targetLanguage: string
): Promise<Array<{ title: string; content: string }>> {
  const translatedChapters = [];

  for (const chapter of chapters) {
    const translatedTitle = await translateContent(chapter.title, targetLanguage);
    const translatedContent = await translateContent(chapter.content, targetLanguage);

    translatedChapters.push({
      title: translatedTitle,
      content: translatedContent,
    });
  }

  return translatedChapters;
}

