# Member 3 Blockchain Integration — Completed

The blockchain side is aligned with Member 2's HTTP contract.

## Required service

`http://localhost:8002`

Endpoints:

- `POST /blockchain/donation`
- `POST /blockchain/expense`
- `POST /blockchain/batch`
- `POST /blockchain/distribution`
- `GET /health`

## Donation

`donorAddress` has been removed from the Solidity contract, blockchain service, adapter and tests.

Accepted payload:

```json
{
  "donationId": "DONATION_ID",
  "campaignId": "CAMPAIGN_ID",
  "amount": 10000,
  "timestamp": "2026-09-09T12:00:00Z"
}
```

## Batch

The Solidity `ReliefBatch` record now stores:

- batchId
- campaignId
- batchCode
- item
- quantity
- timestamp
- location
- exists

The HTTP API accepts the complete Member 2 batch payload.

## Distribution

The HTTP API accepts the complete Member 2 distribution payload. `beneficiaryId` is hashed to bytes32 before being stored.

## Response

Successful transaction endpoints return:

```json
{
  "transactionHash": "0x...",
  "blockNumber": 15,
  "contractAddress": "0x...",
  "network": "localhost"
}
```

## Local startup

```powershell
cd blockchain
npm install
npx hardhat node
```

In a second terminal:

```powershell
cd blockchain
copy .env.example .env
# fill .env
npm run compile
npm run deploy:local
# copy the deployed contract address into .env
npm start
```

`npm run compile` must be run after pulling this version because the Solidity contract ABI/bytecode changed.

Then verify:

```powershell
Invoke-RestMethod http://localhost:8002/health
```

Member 2 can now use its existing `BLOCKCHAIN_SERVICE_URL=http://localhost:8002`.
