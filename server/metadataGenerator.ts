import { invokeLLM } from "./_core/llm";

export interface OptimizedMetadata {
  optimizedTitle: string;
  shortDescription: string;
  longDescription: string;
  keywords: string[];
  categories: string[];
  suggestedPrice: string;
  targetAudience: string;
}

/**
 * Generates SEO-optimized metadata for ebook publishing
 * Tailored for Amazon KDP, Hotmart, Eduzz, and Monetizze
 */
export async function generateEbookMetadata(
  originalTitle: string,
  theme: string,
  content: string
): Promise<OptimizedMetadata> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em marketing digital e SEO para eBooks. Crie metadados otimizados que maximizem vendas e visibilidade.",
      },
      {
        role: "user",
        content: `Crie metadados otimizados para um eBook com as seguintes informações:

Título original: ${originalTitle}
Tema: ${theme}
Prévia do conteúdo: ${content.substring(0, 500)}...

Gere:
1. Título otimizado (máx 200 caracteres, com palavras-chave)
2. Descrição curta (máx 200 caracteres, persuasiva)
3. Descrição longa (máx 4000 caracteres, detalhada e persuasiva com benefícios)
4. 7 palavras-chave relevantes (para Amazon KDP)
5. 3 categorias principais
6. Preço sugerido em reais (considere valor percebido)
7. Público-alvo detalhado`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "ebook_metadata",
        strict: true,
        schema: {
          type: "object",
          properties: {
            optimizedTitle: {
              type: "string",
              description: "Título otimizado com palavras-chave",
            },
            shortDescription: {
              type: "string",
              description: "Descrição curta e persuasiva",
            },
            longDescription: {
              type: "string",
              description: "Descrição longa detalhada com benefícios",
            },
            keywords: {
              type: "array",
              description: "Lista de 7 palavras-chave",
              items: {
                type: "string",
              },
            },
            categories: {
              type: "array",
              description: "Lista de 3 categorias",
              items: {
                type: "string",
              },
            },
            suggestedPrice: {
              type: "string",
              description: "Preço sugerido em reais (ex: R$ 27,00)",
            },
            targetAudience: {
              type: "string",
              description: "Descrição detalhada do público-alvo",
            },
          },
          required: [
            "optimizedTitle",
            "shortDescription",
            "longDescription",
            "keywords",
            "categories",
            "suggestedPrice",
            "targetAudience",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const contentStr = typeof response.choices[0].message.content === 'string' 
    ? response.choices[0].message.content 
    : '{}';
  const metadata = JSON.parse(contentStr);

  return {
    optimizedTitle: metadata.optimizedTitle || originalTitle,
    shortDescription: metadata.shortDescription || "",
    longDescription: metadata.longDescription || "",
    keywords: metadata.keywords || [],
    categories: metadata.categories || [],
    suggestedPrice: metadata.suggestedPrice || "R$ 27,00",
    targetAudience: metadata.targetAudience || "",
  };
}

/**
 * Formats metadata specifically for each platform
 */
export function formatMetadataForPlatform(
  metadata: OptimizedMetadata,
  platform: "amazon_kdp" | "hotmart" | "eduzz" | "monetizze"
) {
  const base = {
    title: metadata.optimizedTitle,
    description: metadata.longDescription,
    price: metadata.suggestedPrice,
    keywords: metadata.keywords.join(", "),
    categories: metadata.categories.join(", "),
  };

  switch (platform) {
    case "amazon_kdp":
      return {
        ...base,
        subtitle: metadata.shortDescription,
        keywords: metadata.keywords, // Amazon accepts array
        primaryCategory: metadata.categories[0],
        secondaryCategory: metadata.categories[1],
      };

    case "hotmart":
      return {
        ...base,
        productName: metadata.optimizedTitle,
        salesPageDescription: metadata.longDescription,
        tags: metadata.keywords.join(", "),
      };

    case "eduzz":
      return {
        ...base,
        productTitle: metadata.optimizedTitle,
        salesDescription: metadata.longDescription,
      };

    case "monetizze":
      return {
        ...base,
        productName: metadata.optimizedTitle,
        description: metadata.longDescription,
      };

    default:
      return base;
  }
}

