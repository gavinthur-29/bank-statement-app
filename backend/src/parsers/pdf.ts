import fs from "fs";
// @ts-ignore
import * as pdf from "pdf-parse";

import OpenAI from "openai";
import { ParsedRowResult } from "./types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parsePdfFile(
  filePath: string
): Promise<ParsedRowResult> {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await (pdf as any)(buffer);

    const text = data.text;

console.log("🔥 PDF PARSER HIT 🔥");
console.log("PDF TEXT LENGTH:", text?.length ?? "NO TEXT");
console.log("First 300 chars:", text?.slice(0, 300));


    const prompt = `
You are extracting bank transactions from a bank statement PDF.

Return strictly valid JSON in this format:

{
  "rows": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "amount": number,
      "balance": number | null
    }
  ]
}

Rules:
- Include ALL transactions.
- Debits must be negative numbers.
- Credits must be positive numbers.
- Convert dates to ISO format YYYY-MM-DD.
- If balance is unavailable, use null.
- Return ONLY JSON.
- Do not include explanations.
    
Bank statement text:
"""
${text.slice(0, 15000)}
"""
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
      throw new Error("PDF AI parsing failed: empty response");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("PDF AI parsing failed: invalid JSON");
    }

    return {
      rows: parsed.rows ?? [],
      errors: [],
      warnings: [],
    };
  } catch (err: any) {
    return {
      rows: [],
      errors: [err.message ?? "Unknown PDF parsing error"],
      warnings: [],
    };
  }
}
