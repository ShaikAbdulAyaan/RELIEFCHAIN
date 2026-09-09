import { ethers } from "ethers";

export async function connectMetaMask() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return {
    provider,
    signer,
    address: await signer.getAddress(),
    chainId: Number((await provider.getNetwork()).chainId),
  };
}

export async function getMetaMaskAddress() {
  if (typeof window === "undefined" || !window.ethereum) return null;
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_accounts", []);
  return accounts[0] || null;
}

export async function switchOrAddChain(chain) {
  if (typeof window === "undefined" || !window.ethereum) throw new Error("MetaMask is not installed");
  if (!chain?.chainId) throw new Error("chainId is required");
  try {
    await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chain.chainId }] });
  } catch (error) {
    if (error?.code !== 4902 || !chain.rpcUrl) throw error;
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{ chainId: chain.chainId, chainName: chain.chainName, rpcUrls: [chain.rpcUrl], nativeCurrency: chain.nativeCurrency, blockExplorerUrls: chain.blockExplorerUrls || [] }],
    });
  }
}
