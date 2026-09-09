import { createHash } from "node:crypto";
import { ethers } from "ethers";

export function sha256Hex(input) {
  if (input === undefined || input === null) throw new Error("Input is required");
  return createHash("sha256").update(input).digest("hex");
}

export function sha256Bytes32(input) {
  return `0x${sha256Hex(input)}`;
}

export function keccakId(id) {
  if (typeof id !== "string" || !id.trim()) throw new Error("ID must be a non-empty string");
  return ethers.keccak256(ethers.toUtf8Bytes(id.trim()));
}

export function normalizeBytes32Hash(value, fieldName = "hash") {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${fieldName} is required`);
  const v = value.trim();
  if (/^0x[0-9a-fA-F]{64}$/.test(v)) return v.toLowerCase();
  if (/^[0-9a-fA-F]{64}$/.test(v)) return `0x${v.toLowerCase()}`;
  return sha256Bytes32(v);
}
