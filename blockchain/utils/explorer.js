const EXPLORERS = {
  hardhat: "",
  localhost: "",
  sepolia: "https://sepolia.etherscan.io",
  mainnet: "https://etherscan.io",
  polygon: "https://polygonscan.com",
  amoy: "https://amoy.polygonscan.com",
  mumbai: "https://mumbai.polygonscan.com",
};

export function getExplorerBaseUrl(network = process.env.BLOCKCHAIN_NETWORK) {
  return EXPLORERS[String(network || "").toLowerCase()] || "";
}

export function getTransactionExplorerUrl(txHash, network = process.env.BLOCKCHAIN_NETWORK) {
  if (!txHash) throw new Error("Transaction hash is required");
  const base = getExplorerBaseUrl(network);
  return base ? `${base}/tx/${txHash}` : null;
}

export function getAddressExplorerUrl(address, network = process.env.BLOCKCHAIN_NETWORK) {
  if (!address) throw new Error("Address is required");
  const base = getExplorerBaseUrl(network);
  return base ? `${base}/address/${address}` : null;
}
