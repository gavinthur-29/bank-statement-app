/**
 * Canonical transaction row used throughout the pipeline
 * v1 production rule: accountKey is the only account identifier
 */
export type TransactionRow = {
  date: string;            // ISO YYYY-MM-DD
  description: string;
  amount: number;
  balance?: number;
  accountKey: string;      // REQUIRED

  /**
   * Enrichment layer (optional, injected post-parse)
   */
  analysisAccountBank?: string;
  analysisAccountInvoice?: string;
  path?: "BANK" | "INVOICE";
};

export type ParsedRowResult = {
  rows: TransactionRow[];
  errors: string[];
  warnings: string[];
};
