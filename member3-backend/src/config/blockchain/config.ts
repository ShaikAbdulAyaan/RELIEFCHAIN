import "dotenv/config";

export const blockchainConfig = {
  rpcUrl: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545",

  contractAddress:
    process.env.RELIEFCHAIN_CONTRACT_ADDRESS || "",

  systemPrivateKey:
    process.env.BLOCKCHAIN_SYSTEM_PRIVATE_KEY || "",

  adminPrivateKey:
    process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY || "",

  auditorPrivateKey:
    process.env.BLOCKCHAIN_AUDITOR_PRIVATE_KEY || "",

  network:
    process.env.BLOCKCHAIN_NETWORK || "hardhat",
};