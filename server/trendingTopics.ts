import { invokeLLM } from "./_core/llm";

export interface TrendingTopic {
  topic: string;
  description: string;
  relevance: string;
}

/**
 * Searches for trending topics using AI analysis
 * This uses LLM to suggest current popular themes based on general knowledge
 */
export async function findTrendingTopics(category?: string, count: number = 5): Promise<TrendingTopic[]> {
  const categoryPrompt = category ? `na categoria "${category}"` : "em geral";
  
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em tendências de mercado e marketing digital. Identifique temas populares e relevantes para criação de eBooks.",
      },
      {
        role: "user",
        content: `Liste ${count} temas em alta ${categoryPrompt} que seriam excelentes para criar eBooks lucrativos. Considere tendências atuais, demanda de mercado e potencial de monetização.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "trending_topics",
        strict: true,
        schema: {
          type: "object",
          properties: {
            topics: {
              type: "array",
              description: "Lista de temas em alta",
              items: {
                type: "object",
                properties: {
                  topic: {
                    type: "string",
                    description: "Nome do tema/tópico",
                  },
                  description: {
                    type: "string",
                    description: "Breve descrição do tema e por que está em alta",
                  },
                  relevance: {
                    type: "string",
                    description: "Por que este tema é relevante agora",
                  },
                },
                required: ["topic", "description", "relevance"],
                additionalProperties: false,
              },
            },
          },
          required: ["topics"],
          additionalProperties: false,
        },
      },
    },
  });

  const contentStr = typeof response.choices[0].message.content === 'string' 
    ? response.choices[0].message.content 
    : '{"topics":[]}';
  const result = JSON.parse(contentStr);
  return result.topics || [];
}

/**
 * Gets a single trending topic for automatic ebook generation
 */
export async function getNextTrendingTopic(category?: string): Promise<string> {
  const topics = await findTrendingTopics(category, 1);
  return topics.length > 0 ? topics[0].topic : "Marketing Digital para Iniciantes";
}

