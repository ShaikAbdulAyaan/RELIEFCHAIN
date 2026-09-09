export const ALLOWED_EVIDENCE_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;

export function validateEvidenceUpload(mimetype: string, size: number): void {
  if (!ALLOWED_EVIDENCE_TYPES.includes(mimetype as any)) throw new Error("Unsupported evidence file type");
  if (!Number.isInteger(size) || size <= 0 || size > MAX_EVIDENCE_BYTES) throw new Error("Invalid or oversized evidence file");
}
