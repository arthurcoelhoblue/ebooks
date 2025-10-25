import { invokeLLM } from "./_core/llm";

export type PlatformPotential = "muito_alta" | "alta" | "media" | "baixa";

export interface PlatformRecommendation {
  platform: "amazon_kdp" | "hotmart" | "eduzz" | "monetizze";
  potential: PlatformPotential;
  reason: string;
}

/**
 * Analyze ebook theme and recommend best platforms
 */
export async function analyzePlatformRecommendations(
  theme: string,
  title?: string
): Promise<PlatformRecommendation[]> {
  const prompt = `Analise o tema "${theme}"${title ? ` com título "${title}"` : ""} e recomende as melhores plataformas para publicar este eBook.

Considere:
- Amazon KDP: Melhor para ficção, não-ficção geral, público amplo internacional
- Hotmart: Melhor para infoprodutos, cursos, desenvolvimento pessoal, marketing digital, negócios
- Eduzz: Similar ao Hotmart, forte no mercado brasileiro de infoprodutos
- Monetizze: Produtos digitais variados, forte em nicho de afiliados

Retorne uma análise para cada plataforma com potencial (muito_alta, alta, media, baixa) e razão.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em publicação e venda de eBooks. Analise temas e recomende plataformas.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "platform_recommendations",
        strict: true,
        schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: {
                    type: "string",
                    enum: ["amazon_kdp", "hotmart", "eduzz", "monetizze"],
                  },
                  potential: {
                    type: "string",
                    enum: ["muito_alta", "alta", "media", "baixa"],
                  },
                  reason: {
                    type: "string",
                    description: "Breve explicação do potencial (max 100 caracteres)",
                  },
                },
                required: ["platform", "potential", "reason"],
                additionalProperties: false,
              },
            },
          },
          required: ["recommendations"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error("No response from LLM");
  }

  const parsed = JSON.parse(content);
  return parsed.recommendations as PlatformRecommendation[];
}

