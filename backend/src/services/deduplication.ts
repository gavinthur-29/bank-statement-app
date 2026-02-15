import crypto from "crypto";
import { TransactionRow } from "../parsers/types";


/**
 * Create a stable fingerprint for a transaction.
 * Assumes accountNumber is always present.
 */
export function fingerprintTransaction(
  row: TransactionRow
): string {
  const key = [
    row.accountKey,
    row.date,
    row.description.trim().toLowerCase(),
    row.amount.toFixed(2)
  ].join("|");

  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Remove duplicate transactions within the same account.
 */
export function deduplicateTransactions(
  rows: TransactionRow[]
): TransactionRow[] {
  const seen = new Set<string>();
  const deduped: TransactionRow[] = [];

  for (const row of rows) {
    const fp = fingerprintTransaction(row);
    if (seen.has(fp)) continue;

    seen.add(fp);
    deduped.push(row);
  }

  return deduped;
}
