# RELIEFCHAIN — Member 3 Blockchain Integration

This package is the Member 3 blockchain side of RELIEFCHAIN.

The blockchain HTTP service runs on port **8002** and is designed to be called by the Member 2 Node backend on port **5000**.

## Service endpoints

- `POST /blockchain/donation`
- `POST /blockchain/expense`
- `POST /blockchain/batch`
- `POST /blockchain/distribution`
- `GET /health`

See `blockchain/README.md` for setup and API examples.

### Key changes

- `donorAddress` has been completely removed from donation.
- Relief batches now store `batchCode`, `item`, `quantity`, and supplied `timestamp` on-chain.
- Distribution accepts `beneficiaryId`, `batchId`, `item`, `quantity`, and `timestamp`; beneficiaryId is hashed before storage.
- Successful HTTP transactions return transaction hash, block number, contract address, and `network: "localhost"`.

**Important:** Run `npm install` and `npm run compile` inside `blockchain` before deploying because the Solidity contract changed.
