import fs from "fs";
import OpenAI from "openai";
import { ParsedRowResult } from "./types";

export async function parsePdfFile(
  filePath: string
): Promise<ParsedRowResult> {
  console.log("🔥 PDF PARSER STARTED 🔥");

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // 🔒 Dynamically load pdf-parse safely
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfModule = require("pdf-parse");

    const pdf =
      typeof pdfModule === "function"
        ? pdfModule
        : typeof pdfModule?.default === "function"
        ? pdfModule.default
        : null;

    console.log("pdf-parse module type:", typeof pdfModule);

    if (!pdf) {
      throw new Error("pdf-parse did not export a function");
    }

    // --- Read file ---
    const buffer = fs.readFileSync(filePath);
    console.log("PDF file loaded. Size:", buffer.length);

    // --- Extract text ---
    const data = await pdf(buffer);
    const text = data?.text ?? "";

    console.log("PDF TEXT LENGTH:", text.length);

    if (!text || text.trim().length < 20) {
      throw new Error("PDF contains insufficient extractable text");
    }

    // --- Prompt ---
    const prompt = `
Extract all bank transactions.

Return strictly valid JSON:

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
- Debits negative
- Credits positive
- ISO dates
- JSON only

Text:
"""
${text.slice(0, 15000)}
"""
`;

    console.log("Calling OpenAI...");

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: "Return only valid JSON." },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI returned empty response");
    }

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Invalid JSON:", content);
      throw new Error("OpenAI returned invalid JSON");
    }

    console.log("Parsed rows:", parsed.rows?.length ?? 0);

    return {
      rows: parsed.rows ?? [],
      errors: [],
      warnings: [],
    };
  } catch (err: any) {
    console.error("❌ PDF PARSER ERROR:", err);

    return {
      rows: [],
      errors: [err?.message ?? "Unknown PDF parsing error"],
      warnings: [],
    };
  }
}
