import fs from "fs";
import path from "path";

/**
 * Input row coming from consolidation engine.
 *
 * IMPORTANT CONTRACT:
 * - Rows are already scoped to a single accountKey upstream.
 * - Ledger export does NOT perform account grouping or categorisation.
 * - Analysis accounts are resolved upstream from the ledger database.
 */
export type ConsolidatedRow = {
  date: string; // ISO YYYY-MM-DD
  description: string;
  amount: number;
  accountKey: string;

  /**
   * Determines which ledger analysis account column is used
   */
  path: "BANK" | "INVOICE";

  /**
   * Values sourced from ledger database (admin-managed)
   */
  analysisAccountBank?: string;
  analysisAccountInvoice?: string;
};

/**
 * Ledger export result
 */
export type LedgerExportResult = {
  payCsv: string;
  recCsv: string;
};

const CSV_HEADER =
  "Type,Ref no,Date,Primary account,Details,Total,VAT,Analysis,Analysis account";

/**
 * Convert ISO date → UK format DD-MM-YYYY
 */
function toUkDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
}

/**
 * Resolve analysis account based on selected path.
 *
 * v1 rule:
 * - BANK path → analysisAccountBank
 * - INVOICE path → analysisAccountInvoice
 */
function resolveAnalysisAccount(row: ConsolidatedRow): string {
  if (row.path === "BANK") {
    return row.analysisAccountBank ?? "";
  }

  if (row.path === "INVOICE") {
    return row.analysisAccountInvoice ?? "";
  }

  // Defensive fallback (should never happen)
  return "";
}

/**
 * Generate PAY & REC CSV content
 *
 * v1 rules:
 * - PAY and REC are written to separate CSVs
 * - Primary account = business name (not bank account)
 * - Ledger export does not infer or mutate accounting logic
 */
export function generateLedgerCsv(
  rows: ConsolidatedRow[],
  primaryAccountName: string
): LedgerExportResult {
  let refCounter = 1;

  const payLines: string[] = [CSV_HEADER];
  const recLines: string[] = [CSV_HEADER];

  for (const row of rows) {
    if (row.amount === 0) continue;

    const isPayment = row.amount < 0;
    const type = isPayment ? "PAY" : "REC";

    const line = [
      type,
      refCounter.toString(),
      toUkDate(row.date),
      primaryAccountName,
      row.description,
      Math.abs(row.amount).toFixed(2),
      "", // VAT (future)
      "", // Analysis (future)
      resolveAnalysisAccount(row)
    ].join(",");

    if (isPayment) {
      payLines.push(line);
    } else {
      recLines.push(line);
    }

    refCounter++;
  }

  return {
    payCsv: payLines.join("\n"),
    recCsv: recLines.join("\n")
  };
}

/**
 * Optional helper — write CSVs to disk
 */
export function writeLedgerFiles(
  outputDir: string,
  result: LedgerExportResult
) {
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(
    path.join(outputDir, "PAY.csv"),
    result.payCsv,
    "utf-8"
  );

  fs.writeFileSync(
    path.join(outputDir, "REC.csv"),
    result.recCsv,
    "utf-8"
  );
}
