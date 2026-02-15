// Canonical transaction shape used across the app

export type Transaction = {
    id: string;                 // deterministic hash or UUID
    date: string;               // ISO date: YYYY-MM-DD
    description: string;        // cleaned merchant / narrative
    amount: number;             // signed, base currency
    currency: string;           // e.g. GBP
    source: {
      filename: string;
      checksum: string;
      rowIndex?: number;        // CSV row or PDF line (optional)
    };
    metadata?: {
      originalDescription?: string;
      warnings?: string[];
    };
  };
  