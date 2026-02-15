import { ParsedRowResult } from "./types";

export async function parsePdfFile(
  filePath: string
): Promise<ParsedRowResult> {

  return {
    rows: [],
    errors: [],
    warnings: ["PDF parsing not implemented yet"]
  };
}
