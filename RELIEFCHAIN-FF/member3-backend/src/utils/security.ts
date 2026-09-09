import { timingSafeEqual } from "crypto";

export function requireEnvironment(names: string[]): void {
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
}

export function constantTimeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a ?? "");
  const right = Buffer.from(b ?? "");
  return left.length === right.length && timingSafeEqual(left, right);
}
