export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

export function validateFile(
  filename: string,
  mimeType: string
): ValidationResult {
  const allowedExtensions = [".csv", ".pdf"];

  const lower = filename.toLowerCase();

  const hasValidExtension = allowedExtensions.some(ext =>
    lower.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: "Unsupported file type"
    };
  }

  return {
    isValid: true
  };
}
