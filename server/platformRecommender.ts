import { invokeLLM } from "./_core/llm";

/**
 * Analisa o tema/nicho do eBook e recomenda as melhores plataformas
 * com base em características do conteúdo e público-alvo
 */
export async function analyzePlatformRecommendations(
  theme: string,
  title: string,
  description?: string
): Promise<PlatformRecommendation[]> {
  const prompt = `Você é um especialista em marketing digital e venda de infoprodutos no Brasil.

Analise o seguinte eBook e recomende as 3 melhores plataformas para publicação, considerando:
- Tema: ${theme}
- Título: ${title}
${description ? `- Descrição: ${description}` : ""}

Plataformas disponíveis:
1. **Amazon KDP** - Maior alcance global, royalties 35-70%, ideal para ficção e não-ficção geral
2. **Hotmart** - Líder no Brasil, programa de afiliados forte, ideal para nichos de desenvolvimento pessoal, negócios, saúde
3. **Eduzz** - Checkout próprio, recuperação de carrinho, ideal para infoprodutos e marketing digital
4. **Monetizze** - Sistema de afiliados robusto, ideal para nichos lucrativos (emagrecimento, finanças, relacionamentos)
5. **Kiwify** - Moderna e intuitiva, ideal para iniciantes, boa para todos os nichos
6. **Voomp** - Foco em educação, parte da Cogna, ideal para cursos e conteúdo educacional profundo

Para cada plataforma recomendada, forneça:
- Nome da plataforma
- Score de adequação (0-100)
- Motivo da recomendação (1 frase)
- Público-alvo esperado
- Potencial de vendas (baixo/médio/alto/muito alto)

Retorne APENAS um JSON válido no seguinte formato:
{
  "recommendations": [
    {
      "platform": "nome da plataforma",
      "score": 95,
      "reason": "motivo específico",
      "targetAudience": "descrição do público",
      "salesPotential": "muito alto"
    }
  ]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em análise de mercado digital e recomendação de plataformas de venda de eBooks.",
        },
        {
          role: "user",
          content: prompt,
        },
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
                    platform: { type: "string" },
                    score: { type: "number" },
                    reason: { type: "string" },
                    targetAudience: { type: "string" },
                    salesPotential: {
                      type: "string",
                      enum: ["baixo", "médio", "alto", "muito alto"],
                    },
                  },
                  required: ["platform", "score", "reason", "targetAudience", "salesPotential"],
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

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') {
      throw new Error("Empty or invalid response from LLM");
    }

    const parsed = JSON.parse(content);
    return parsed.recommendations;
  } catch (error) {
    console.error("[Platform Recommender] Error:", error);
    // Fallback: retorna recomendações genéricas
    return [
      {
        platform: "Hotmart",
        score: 85,
        reason: "Plataforma líder no Brasil com grande alcance",
        targetAudience: "Público brasileiro interessado em desenvolvimento pessoal e negócios",
        salesPotential: "alto",
      },
      {
        platform: "Amazon KDP",
        score: 80,
        reason: "Maior alcance global e credibilidade",
        targetAudience: "Leitores globais de diversos nichos",
        salesPotential: "alto",
      },
      {
        platform: "Kiwify",
        score: 75,
        reason: "Plataforma moderna e fácil de usar",
        targetAudience: "Público brasileiro buscando infoprodutos",
        salesPotential: "médio",
      },
    ];
  }
}

export interface PlatformRecommendation {
  platform: string;
  score: number;
  reason: string;
  targetAudience: string;
  salesPotential: "baixo" | "médio" | "alto" | "muito alto";
}

