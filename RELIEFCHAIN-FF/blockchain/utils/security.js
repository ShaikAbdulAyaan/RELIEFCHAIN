import { timingSafeEqual } from "node:crypto";

export function requireEnv(names) {
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

export function safeCompare(a, b) {
  const left = Buffer.from(String(a ?? ""));
  const right = Buffer.from(String(b ?? ""));
  return left.length === right.length && timingSafeEqual(left, right);
}

export function validateUpload({ mimetype, sizeBytes, allowedMimeTypes, maxBytes }) {
  if (!allowedMimeTypes.includes(mimetype)) throw new Error("Unsupported file type");
  if (!Number.isInteger(sizeBytes) || sizeBytes <= 0 || sizeBytes > maxBytes) throw new Error("Invalid or oversized file");
  return true;
}
