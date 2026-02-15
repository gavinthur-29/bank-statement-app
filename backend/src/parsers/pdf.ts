import fs from "fs";
import OpenAI from "openai";
import { ParsedRowResult } from "./types";

// 🔒 Robust loader that handles ALL module export formats
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfModule = require("pdf-parse");

const pdf =
  typeof pdfModule === "function"
    ? pdfModule
    : typeof pdfModule?.default === "function"
    ? pdfModule.default
    : null;

if (!pdf) {
  throw new Error("Failed to load pdf-parse correctly");
}

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
    // --- Read file ---
    const buffer = fs.readFileSync(filePath);
    console.log("PDF file loaded. Size:", buffer.length);

    // --- Extract text ---
    const data = await pdf(buffer);
    const text = data?.text ?? "";

    console.log("PDF TEXT LENGTH:", text.length);
    console.log("First 300 chars:", text.slice(0, 300));

    if (!text || text.trim().length < 20) {
      throw new Error("PDF contains insufficient extractable text");
    }

    // --- Build prompt ---
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

    console.log("Calling OpenAI...");

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

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI returned empty response");
    }

    console.log("OpenAI response received. Length:", content.length);

    let parsed: any;

    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Invalid JSON from OpenAI:", content);
      throw new Error("OpenAI returned invalid JSON");
    }

    if (!Array.isArray(parsed.rows)) {
      throw new Error("OpenAI response missing 'rows' array");
    }

    console.log("Parsed rows:", parsed.rows.length);

    return {
      rows: parsed.rows,
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
