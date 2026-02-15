import OpenAI from "openai";
import {
  EnrichmentInput,
  EnrichmentResult,
} from "./enrichment.schema";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Enrich a bank transaction using AI classification
 */
export async function enrichTransaction(
  input: EnrichmentInput
): Promise<EnrichmentResult> {
  const prompt = `
You are enriching a bank transaction.

Return a single JSON object with:
- category: short category name
- merchant: inferred merchant name or null
- confidence: number between 0 and 1

Transaction:
Description: "${input.description}"
Amount: ${input.amount}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "You return strictly valid JSON and nothing else.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI enrichment failed: empty response");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI enrichment failed: invalid JSON");
  }

  return {
    category: parsed.category ?? "unknown",
    merchant: parsed.merchant ?? null,
    confidence:
      typeof parsed.confidence === "number"
        ? parsed.confidence
        : 0,
  };
}
