import fs from "fs";
import { runPipeline } from "./services/pipeline";

async function run() {
    const buffer = fs.readFileSync("/Users/admin/Desktop/sample.csv");


  const result = await runPipeline({
    buffer,
    mimeType: "text/csv",
    originalName: "sample.csv",
    businessName: "Test Business Ltd",
    periodStartISO: "2025-01-01",
    periodEndISO: "2025-03-31"
  });

  console.log(JSON.stringify(result, null, 2));
}

run();
