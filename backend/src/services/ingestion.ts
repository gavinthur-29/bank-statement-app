import fs from "fs";
import path from "path";
import crypto from "crypto";
import { parseCsvFile } from "../parsers/csv";
import { parsePdfFile } from "../parsers/pdf";
import { ParsedRowResult } from "../parsers/types";

export async function ingestFile(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
  businessName: string,
  periodSegment: string
): Promise<{
  file: {
    storedFilename: string;
    storedPath: string;
    checksum: string;
    accountKey: string;
  };
  parseResult: ParsedRowResult;
}> {
  const safeBusiness = businessName.replace(/\s+/g, "_");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const storedFilename = `${timestamp}_${originalName}`;

  const baseDir = path.join(
    process.cwd(),
    "..",
    "user_data",
    safeBusiness,
    periodSegment,
    "raw"
  );

  fs.mkdirSync(baseDir, { recursive: true });

  const storedPath = path.join(baseDir, storedFilename);
  fs.writeFileSync(storedPath, buffer);

  const checksum = crypto
    .createHash("sha256")
    .update(buffer)
    .digest("hex");

  /**
   * IMPORTANT — v1 INGESTION CONTRACT
   *
   * accountKey is intentionally UNIQUE PER UPLOAD.
   * We do NOT attempt to link uploads to the same bank account.
   * Cross-upload account reconciliation is a future, explicit feature.
   */
  const accountKey = crypto.randomUUID();

  // Defensive guardrails — fail fast if this contract is broken
  if (!accountKey || typeof accountKey !== "string") {
    throw new Error("Invalid accountKey generated during ingestion");
  }

  if (accountKey.length < 16) {
    throw new Error("accountKey is unexpectedly short");
  }

  let parseResult: ParsedRowResult;

  if (mimeType === "text/csv" || originalName.endsWith(".csv")) {
    parseResult = await parseCsvFile(storedPath);
  } else if (mimeType === "application/pdf" || originalName.endsWith(".pdf")) {
    parseResult = await parsePdfFile(storedPath);
  } else {
    throw new Error("Unsupported file type");
  }

  // Inject accountKey into parsed rows (request-scoped only)
  parseResult.rows = parseResult.rows.map(row => ({
    ...row,
    accountKey
  }));

  return {
    file: {
      storedFilename,
      storedPath,
      checksum,
      accountKey
    },
    parseResult
  };
}
