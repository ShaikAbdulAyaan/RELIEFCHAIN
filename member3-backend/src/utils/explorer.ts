const BASE: Record<string, string> = {
  sepolia: "https://sepolia.etherscan.io",
  mainnet: "https://etherscan.io",
  polygon: "https://polygonscan.com",
  amoy: "https://amoy.polygonscan.com",
};

export function transactionExplorerUrl(network: string, txHash: string): string | null {
  if (!txHash) throw new Error("txHash is required");
  const base = BASE[network.toLowerCase()];
  return base ? `${base}/tx/${txHash}` : null;
}

export function addressExplorerUrl(network: string, address: string): string | null {
  if (!address) throw new Error("address is required");
  const base = BASE[network.toLowerCase()];
  return base ? `${base}/address/${address}` : null;
}
