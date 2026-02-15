import { ingestFile } from "./ingestion";
import { consolidateTransactions } from "./consolidation";
import { detectMissingPeriods } from "./missingPeriods";
import { generateLedgerCsv } from "./ledgerExport";
import { enrichTransaction } from "../enrichment/enrichment";

export async function runPipeline(params: {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  businessName: string;
  periodStartISO: string;
  periodEndISO: string;
}) {
  // 1. Ingest + parse
  const ingestResult = await ingestFile(
    params.buffer,
    params.mimeType,
    params.originalName,
    params.businessName,
    `${params.periodStartISO}_to_${params.periodEndISO}`
  );

  const { accountKey } = ingestResult.file;
  const rows = ingestResult.parseResult.rows;

  // 2. AI Enrichment (v1: sequential, safe)
  for (const row of rows) {
    try {
      const enrichment = await enrichTransaction({
        description: row.description,
        amount: row.amount
      });

      // Map enrichment → ledger fields
      row.analysisAccountBank = enrichment.category;
      row.analysisAccountInvoice = enrichment.category;

      // Simple routing rule (can evolve later)
      row.path = row.amount < 0 ? "BANK" : "INVOICE";
    } catch (err) {
      console.error("Enrichment failed:", err);
    }
  }

  // 3. Consolidate (single-account v1)
  const consolidation = [
    consolidateTransactions(
      rows,
      accountKey,
      0 // opening balance (v1 assumption)
    )
  ];

  // 4. Missing period detection
  const missingPeriods = detectMissingPeriods(
    rows.map(r => ({
      date: r.date,
      accountKey
    })),
    params.periodStartISO,
    params.periodEndISO
  );

  // 5. Ledger export
  const ledger = generateLedgerCsv(
    consolidation[0].rows,
    params.businessName
  );

  return {
    file: ingestResult.file,
    consolidation,
    missingPeriods,
    ledger
  };
}
