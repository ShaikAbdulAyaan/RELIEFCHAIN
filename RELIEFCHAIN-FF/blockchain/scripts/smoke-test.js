import "dotenv/config";

const baseUrl = `http://localhost:${process.env.BLOCKCHAIN_SERVICE_PORT || 8002}`;
const stamp = Date.now();

async function post(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.BLOCKCHAIN_SERVICE_API_KEY
        ? { "X-API-Key": process.env.BLOCKCHAIN_SERVICE_API_KEY }
        : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`${path} -> HTTP ${response.status}: ${JSON.stringify(data)}`);
  if (!data.transactionHash) throw new Error(`${path} returned no transactionHash`);
  return data;
}

const campaignId = `SMOKE-CAMPAIGN-${stamp}`;
const batchId = `SMOKE-BATCH-${stamp}`;

const results = {};
results.donation = await post("/blockchain/donation", {
  donationId: `SMOKE-DONATION-${stamp}`,
  campaignId,
  amount: 10000,
  timestamp: new Date().toISOString(),
});

results.expense = await post("/blockchain/expense", {
  expenseId: `SMOKE-EXPENSE-${stamp}`,
  campaignId,
  evidenceHash: `SMOKE-EVIDENCE-${stamp}`,
});

results.batch = await post("/blockchain/batch", {
  batchId,
  campaignId,
  batchCode: `RC-SMOKE-${stamp}`,
  item: "Food Packets",
  quantity: 500,
  timestamp: new Date().toISOString(),
});

results.distribution = await post("/blockchain/distribution", {
  distributionId: `SMOKE-DISTRIBUTION-${stamp}`,
  beneficiaryId: `SMOKE-BENEFICIARY-${stamp}`,
  batchId,
  item: "Food Packets",
  quantity: 5,
  timestamp: new Date().toISOString(),
});

console.log(JSON.stringify(results, null, 2));
console.log("Member 3 blockchain API smoke test passed.");
