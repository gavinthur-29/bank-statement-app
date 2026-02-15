import fs from "fs";
import readline from "readline";
import path from "path";
import { ParsedRowResult, TransactionRow } from "./types";

/**
 * Convert supported date formats to ISO YYYY-MM-DD
 */
function toIsoDate(input: string): string | null {
  const trimmed = input.trim();

  const dmy = trimmed.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
  if (dmy) {
    const [, dd, mm, yyyy] = dmy;
    return `${yyyy}-${mm}-${dd}`;
  }

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    return trimmed;
  }

  return null;
}

export async function parseCsvFile(
  filePath: string
): Promise<ParsedRowResult> {
  const rows: TransactionRow[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // 👇 account identity = filename (stable & deterministic)
  const accountKey = path.basename(filePath, path.extname(filePath));

  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  });

  let isHeader = true;

  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }

    if (!line.trim()) continue;

    const parts = line.split(",");

    if (parts.length < 3) {
      errors.push(`Invalid row format: ${line}`);
      continue;
    }

    const rawDate = parts[0].trim();
    const description = parts[1].trim();
    const amount = Number(parts[2].trim());

    const date = toIsoDate(rawDate);
    if (!date) {
      errors.push(`Invalid date: ${line}`);
      continue;
    }

    if (Number.isNaN(amount)) {
      errors.push(`Invalid amount: ${line}`);
      continue;
    }

    rows.push({
      date,
      description,
      amount,
      accountKey
    });
  }

  return { rows, errors, warnings };
}
