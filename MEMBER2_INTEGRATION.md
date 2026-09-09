# Member 2 ↔ Member 3 Integration

## Member 3

- JSON-RPC: `http://127.0.0.1:8545`
- HTTP blockchain service: `http://localhost:8002`

Required endpoints:

- `POST /blockchain/donation`
- `POST /blockchain/expense`
- `POST /blockchain/batch`
- `POST /blockchain/distribution`

All successful endpoints return exactly these proof fields:

```json
{
  "transactionHash": "0x...",
  "blockNumber": 15,
  "contractAddress": "0x...",
  "network": "localhost"
}
```

Donation does not accept or store `donorAddress`.

## Member 2

`backend/.env`:

```env
BLOCKCHAIN_SERVICE_URL=http://localhost:8002
BLOCKCHAIN_SERVICE_API_KEY=
BLOCKCHAIN_CONTRACT_ADDRESS=<deployed-address>
BLOCKCHAIN_NETWORK=localhost
```

The four Member 2 payloads are:

### Donation
```json
{
  "donationId": "DONATION_ID",
  "campaignId": "CAMPAIGN_ID",
  "amount": 10000,
  "timestamp": "2026-09-09T12:00:00Z"
}
```

### Expense
```json
{
  "expenseId": "EXPENSE_ID",
  "campaignId": "CAMPAIGN_ID",
  "evidenceHash": "HASH"
}
```

### Batch
```json
{
  "batchId": "BATCH_ID",
  "campaignId": "CAMPAIGN_ID",
  "batchCode": "RC-KERALA-FOOD-001",
  "item": "Food Packets",
  "quantity": 500,
  "timestamp": "2026-09-09T12:00:00Z"
}
```

### Distribution
```json
{
  "distributionId": "DISTRIBUTION_ID",
  "beneficiaryId": "BENEFICIARY_ID",
  "batchId": "BATCH_ID",
  "item": "Food Packets",
  "quantity": 5,
  "timestamp": "2026-09-09T12:00:00Z"
}
```

Member 3 hashes `beneficiaryId` before writing it on-chain. Member 2 stores the returned proof in its `BlockchainTransaction` table.
