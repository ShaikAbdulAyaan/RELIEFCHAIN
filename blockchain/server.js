import "dotenv/config";
import http from "node:http";
import {
  recordDonation,
  recordExpenseProof,
  createReliefBatch,
  recordDistribution,
} from "./services/blockchainService.js";

const HOST = process.env.BLOCKCHAIN_SERVICE_HOST || "0.0.0.0";
const PORT = Number(process.env.BLOCKCHAIN_SERVICE_PORT || 8002);
const API_KEY = process.env.BLOCKCHAIN_SERVICE_API_KEY || "";

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(body));
}

function errorMessage(error) {
  if (error && typeof error === "object" && "shortMessage" in error) {
    return error.shortMessage || error.message || "Blockchain transaction failed";
  }
  return error instanceof Error ? error.message : String(error);
}

function requireString(body, field) {
  if (typeof body[field] !== "string" || !body[field].trim()) {
    throw new Error(`${field} is required`);
  }
  return body[field].trim();
}

function parsePositiveInteger(body, field) {
  const value = body[field];
  if (value === undefined || value === null || value === "") {
    throw new Error(`${field} is required`);
  }
  if (!/^\d+$/.test(String(value))) {
    throw new Error(`${field} must be a positive integer`);
  }
  const n = BigInt(String(value));
  if (n <= 0n) throw new Error(`${field} must be greater than zero`);
  return n;
}

function parseTimestamp(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("timestamp is required");
  }
  const ms = Date.parse(value);
  if (!Number.isFinite(ms) || ms <= 0) {
    throw new Error("timestamp must be a valid ISO-8601 timestamp");
  }
  return BigInt(Math.floor(ms / 1000));
}

function standardResult(result) {
  return {
    transactionHash: result.transactionHash,
    blockNumber: result.blockNumber,
    contractAddress: result.contractAddress,
    network: result.network,
  };
}

async function readJson(req) {
  let data = "";
  for await (const chunk of req) data += chunk;
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    throw new Error("Request body must be valid JSON");
  }
}

async function handle(path, body) {
  if (path === "/blockchain/donation") {
    const donationId = requireString(body, "donationId");
    const campaignId = requireString(body, "campaignId");
    const amount = parsePositiveInteger(body, "amount");
    const timestamp = parseTimestamp(body.timestamp);

    return standardResult(await import("./integration/blockchainAdapter.js").then(({ recordDonationProof }) =>
      recordDonationProof({ donationId, campaignId, amount, timestamp })
    ));
  }

  if (path === "/blockchain/expense") {
    const expenseId = requireString(body, "expenseId");
    const campaignId = requireString(body, "campaignId");
    const evidenceHash = requireString(body, "evidenceHash");

    return standardResult(await import("./integration/blockchainAdapter.js").then(({ recordExpenseProofOnChain }) =>
      recordExpenseProofOnChain({ expenseId, campaignId, evidenceHash })
    ));
  }

  if (path === "/blockchain/batch") {
    const batchId = requireString(body, "batchId");
    const campaignId = requireString(body, "campaignId");
    const batchCode = requireString(body, "batchCode");
    const item = requireString(body, "item");
    const quantity = parsePositiveInteger(body, "quantity");
    const timestamp = parseTimestamp(body.timestamp);

    return standardResult(await import("./integration/blockchainAdapter.js").then(({ createReliefBatchProof }) =>
      createReliefBatchProof({ batchId, campaignId, batchCode, item, quantity, timestamp })
    ));
  }

  if (path === "/blockchain/distribution") {
    const distributionId = requireString(body, "distributionId");
    const beneficiaryId = requireString(body, "beneficiaryId");
    const batchId = requireString(body, "batchId");
    const item = requireString(body, "item");
    const quantity = parsePositiveInteger(body, "quantity");
    const timestamp = parseTimestamp(body.timestamp);

    return standardResult(await import("./integration/blockchainAdapter.js").then(({ recordDistributionProof }) =>
      recordDistributionProof({ distributionId, beneficiaryId, batchId, item, quantity, timestamp })
    ));
  }

  throw Object.assign(new Error("Not found"), { status: 404 });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    });
    return res.end();
  }

  if (req.method === "GET" && req.url === "/health") {
    return send(res, 200, {
      status: "ok",
      service: "RELIEFCHAIN blockchain service",
      network: process.env.BLOCKCHAIN_NETWORK || "localhost",
      contractAddress: process.env.RELIEFCHAIN_CONTRACT_ADDRESS || null,
    });
  }

  if (req.method !== "POST") {
    return send(res, 405, { error: "Method not allowed" });
  }

  const pathname = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;
  if (!pathname.startsWith("/blockchain/")) {
    return send(res, 404, { error: "Not found" });
  }

  if (API_KEY && req.headers["x-api-key"] !== API_KEY) {
    return send(res, 401, { error: "Invalid blockchain service API key" });
  }

  try {
    const body = await readJson(req);
    const result = await handle(pathname, body);
    return send(res, 200, result);
  } catch (error) {
    const status = error?.status || 400;
    console.error(`[${pathname}]`, errorMessage(error));
    return send(res, status, { error: errorMessage(error) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`RELIEFCHAIN blockchain service listening on http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
});
