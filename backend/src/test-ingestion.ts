import fs from "fs";
import path from "path";
import { ingestFile } from "./services/ingestion";

async function run() {
  const filePath = path.join(process.cwd(), "sample.csv");

  const buffer = fs.readFileSync(filePath);

  const result = await ingestFile(
    buffer,
    "text/csv",
    "sample.csv",
    "Test Business",
    "01-01-2025_to_31-01-2025"
  );

  console.log("INGEST RESULT:");
  console.dir(result, { depth: null });
}

run().catch(console.error);
