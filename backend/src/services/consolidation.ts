import { TransactionRow } from "../parsers/types";

export type ConsolidatedRow = {
  date: string; // ISO YYYY-MM-DD
  description: string;
  amount: number;
  balance: number;
  accountKey: string;

  /**
   * Required by ledger export
   * Defaulted to BANK unless upstream overrides
   */
  path: "BANK" | "INVOICE";

  /**
   * Forwarded from parser (if available)
   */
  analysisAccountBank?: string;
  analysisAccountInvoice?: string;
};

export type ConsolidationResult = {
  accountKey: string;
  rows: ConsolidatedRow[];
  balanceDiscrepancies: {
    date: string;
    expected: number;
    actual: number;
  }[];
};

export function consolidateTransactions(
  rows: TransactionRow[],
  accountKey: string,
  openingBalance: number
): ConsolidationResult {
  const accountRows = rows
    .filter(row => row.accountKey === accountKey)
    .sort((a, b) => a.date.localeCompare(b.date));

  let runningBalance = openingBalance;
  const consolidated: ConsolidatedRow[] = [];
  const discrepancies: ConsolidationResult["balanceDiscrepancies"] = [];

  for (const row of accountRows) {
    runningBalance = round2(runningBalance + row.amount);

    if (
      typeof row.balance === "number" &&
      round2(row.balance) !== runningBalance
    ) {
      discrepancies.push({
        date: row.date,
        expected: runningBalance,
        actual: round2(row.balance)
      });
    }

    consolidated.push({
      date: row.date,
      description: row.description,
      amount: round2(row.amount),
      balance: runningBalance,
      accountKey,

      // Ledger compatibility additions
      path: "BANK", // default path (can evolve later)

      analysisAccountBank:
        (row as any).analysisAccountBank ?? undefined,
      analysisAccountInvoice:
        (row as any).analysisAccountInvoice ?? undefined
    });
  }

  return {
    accountKey,
    rows: consolidated,
    balanceDiscrepancies: discrepancies
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
