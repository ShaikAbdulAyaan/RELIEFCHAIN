# RELIEFCHAIN Member 3 — Blockchain Service

## Ports and architecture

- Hardhat JSON-RPC: `http://127.0.0.1:8545`
- Blockchain HTTP service: `http://localhost:8002`
- Member 2 Node backend: `http://localhost:5000`

Member 2 calls Member 3:

- `POST /blockchain/donation`
- `POST /blockchain/expense`
- `POST /blockchain/batch`
- `POST /blockchain/distribution`

## Setup

1. Copy `.env.example` to `.env`.
2. Fill the three private keys and contract address.
3. Start a local Hardhat node.
4. Deploy the contract and copy the deployed address into `.env`.
5. Start the blockchain HTTP service.

Example:

```powershell
npm install
npx hardhat node
```

In another terminal:

```powershell
npm run compile
npm run deploy:local
# copy the printed Contract address into .env
npm start
```

The deploy script uses Hardhat local accounts:
- account 0 = admin
- account 1 = system
- account 2 = auditor

For the HTTP service, the system private key must be the account that has `SYSTEM_ROLE`.

## Health check

`GET http://localhost:8002/health`

## API contract

### Donation

`POST /blockchain/donation`

```json
{
  "donationId": "DONATION_ID",
  "campaignId": "CAMPAIGN_ID",
  "amount": 10000,
  "timestamp": "2026-09-09T12:00:00Z"
}
```

Response:

```json
{
  "transactionHash": "0x...",
  "blockNumber": 15,
  "contractAddress": "0x...",
  "network": "localhost"
}
```

There is intentionally **no donorAddress**.

### Expense

`POST /blockchain/expense`

```json
{
  "expenseId": "EXPENSE_ID",
  "campaignId": "CAMPAIGN_ID",
  "evidenceHash": "HASH"
}
```

### Batch

`POST /blockchain/batch`

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

The Solidity batch record now stores `batchCode`, `item`, `quantity`, and the supplied `timestamp`.

### Distribution

`POST /blockchain/distribution`

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

The beneficiary ID is converted to a bytes32 hash before it reaches the contract.

## Important flow

Member 2 currently creates campaigns in PostgreSQL but does not expose a blockchain campaign endpoint. The four required proof endpoints therefore ensure that the referenced campaign exists on-chain and is verified before recording donation, expense, or batch proofs.

A newly created batch starts at `WAREHOUSE`. Because Member 2's required API surface does not include physical batch-transfer endpoints, the distribution endpoint automatically advances a batch through `TRUCK` to `CAMP` when necessary, then records the distribution proof. No beneficiary PII is stored on-chain; `beneficiaryId` is hashed to bytes32.

This service returns the mined transaction hash and block number to Member 2. Member 2 is responsible for persisting that blockchain result in its database.


## Member 2 connection

Member 2 must have these values in `backend/.env`:

```env
BLOCKCHAIN_SERVICE_URL=http://localhost:8002
BLOCKCHAIN_SERVICE_API_KEY=
BLOCKCHAIN_CONTRACT_ADDRESS=<the deployed contract address>
BLOCKCHAIN_NETWORK=localhost
```

Member 2's existing controllers already call the four required endpoints and persist `transactionHash`, `blockNumber`, `contractAddress`, and `network` in `BlockchainTransaction`. The blockchain service accepts extra JSON fields such as `entityId` but does not require them.

## Important local-network rule

Use one persistent Hardhat node for the HTTP service:

```powershell
npx hardhat node
```

Then deploy with:

```powershell
npm run compile
npm run deploy:local
```

Do not run the blockchain HTTP service against a different chain or a stale deployment. If you restart `npx hardhat node`, deploy again and update the contract address in `.env`.

## API smoke test

After the service is running on port 8002:

```powershell
npm run smoke
```

The smoke test creates unique IDs, so it can be run repeatedly on the same local chain. It verifies donation, expense, batch and distribution transactions and prints the transaction hashes and block numbers.
