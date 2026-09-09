# RELIEFCHAIN — One-pass local integration

## 1. Backend environment

Create `backend/.env` with:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/reliefchain
JWT_SECRET=replace-with-a-local-development-secret
BLOCKCHAIN_SERVICE_URL=http://localhost:8002
BLOCKCHAIN_SERVICE_API_KEY=
BLOCKCHAIN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
BLOCKCHAIN_NETWORK=localhost
```

URL-encode the PostgreSQL password if it contains characters such as `@`, `:`, `/`, `#`, or `%`.

## 2. Blockchain environment

Create `blockchain/.env` with the local Hardhat RPC, deployed contract address, and the three local Hardhat development private keys.

Never use those development keys on a real network and never commit `.env`.

## 3. Start the local blockchain

Terminal 1:

```powershell
cd "C:\Users\SHAIK ABDUL AYAAN\RELIEFCHAIN\blockchain"
npx hardhat node
```

Terminal 2:

```powershell
cd "C:\Users\SHAIK ABDUL AYAAN\RELIEFCHAIN\blockchain"
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
npm start
```

The contract is expected at:

```text
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## 4. Prepare PostgreSQL + seed integration records

Terminal 3:

```powershell
cd "C:\Users\SHAIK ABDUL AYAAN\RELIEFCHAIN\backend"
npm install
npm run setup:integration
```

`setup:integration` runs Prisma generate, synchronizes the database schema, and creates/updates the integration organization, disaster, warehouse, camp, beneficiary, and roles.

## 5. Start Member 2 backend

Terminal 3 or Terminal 4:

```powershell
cd "C:\Users\SHAIK ABDUL AYAAN\RELIEFCHAIN\backend"
npm run build
npm start
```

Backend: `http://localhost:5000`

Blockchain service: `http://localhost:8002`

Hardhat RPC: `http://127.0.0.1:8545`

## 6. Run the complete integration test

Terminal 5:

```powershell
cd "C:\Users\SHAIK ABDUL AYAAN\RELIEFCHAIN\backend"
powershell -ExecutionPolicy Bypass -File .\scripts\run-integration.ps1
```

The script creates a fresh donor, campaign, donation, expense, relief batch, batch movement, beneficiary, and aid distribution. It also checks that every blockchain proof returns a transaction hash.

## 7. Blockchain-only tests

In the blockchain directory:

```powershell
npm test
npm run test:external
npm run smoke
```

`test:external` and `smoke` require the local Hardhat node, deployment, blockchain service, and configured private keys.
