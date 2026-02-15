import fs from "fs";
import path from "path";
import crypto from "crypto";

// Root folder for runtime storage
export const USER_DATA_ROOT = path.join(process.cwd(), "..", "user_data");

// Ensure root exists
export function ensureUserDataRoot() {
  if (!fs.existsSync(USER_DATA_ROOT)) {
    fs.mkdirSync(USER_DATA_ROOT, { recursive: true });
  }
}

// Business folder path
export function getBusinessPath(businessName: string) {
  ensureUserDataRoot();

  const safeName = businessName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const businessPath = path.join(USER_DATA_ROOT, safeName);

  if (!fs.existsSync(businessPath)) {
    fs.mkdirSync(businessPath, { recursive: true });
  }

  return businessPath;
}

// Raw folder path (per period)
export function getRawDir(businessName: string, periodSegment: string) {
  const businessPath = getBusinessPath(businessName);

  const periodPath = path.join(businessPath, periodSegment);
  const rawPath = path.join(periodPath, "raw");

  if (!fs.existsSync(rawPath)) {
    fs.mkdirSync(rawPath, { recursive: true });
  }

  return rawPath;
}

// Write file + checksum
export async function writeRawFile(
  rawDir: string,
  buffer: Buffer,
  originalName: string
) {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const storedFilename = `${timestamp}_${safeName}`;
  const storedPath = path.join(rawDir, storedFilename);

  const hash = crypto.createHash("sha256");
  hash.update(buffer);
  const checksum = hash.digest("hex");

  await fs.promises.writeFile(storedPath, buffer);

  return {
    storedPath,
    storedFilename,
    checksum
  };
}



