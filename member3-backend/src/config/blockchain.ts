import "dotenv/config";
import { JsonRpcProvider, Wallet, Contract } from "ethers";

import reliefChainArtifact from "./abi/ReliefChain.json";

const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
const contractAddress = process.env.RELIEFCHAIN_CONTRACT_ADDRESS;

const systemPrivateKey =
    process.env.BLOCKCHAIN_SYSTEM_PRIVATE_KEY;

const adminPrivateKey =
    process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY;

const auditorPrivateKey =
    process.env.BLOCKCHAIN_AUDITOR_PRIVATE_KEY;

if (!rpcUrl) {
    throw new Error(
        "BLOCKCHAIN_RPC_URL is not defined in backend/.env"
    );
}

if (!contractAddress) {
    throw new Error(
        "RELIEFCHAIN_CONTRACT_ADDRESS is not defined in backend/.env"
    );
}

if (!systemPrivateKey) {
    throw new Error(
        "BLOCKCHAIN_SYSTEM_PRIVATE_KEY is not defined in backend/.env"
    );
}

if (!adminPrivateKey) {
    throw new Error(
        "BLOCKCHAIN_ADMIN_PRIVATE_KEY is not defined in backend/.env"
    );
}

if (!auditorPrivateKey) {
    throw new Error(
        "BLOCKCHAIN_AUDITOR_PRIVATE_KEY is not defined in backend/.env"
    );
}

const abi = reliefChainArtifact;

export const blockchainProvider =
    new JsonRpcProvider(rpcUrl);

export const systemWallet =
    new Wallet(
        systemPrivateKey,
        blockchainProvider
    );

export const adminWallet =
    new Wallet(
        adminPrivateKey,
        blockchainProvider
    );

export const auditorWallet =
    new Wallet(
        auditorPrivateKey,
        blockchainProvider
    );

export const systemContract =
    new Contract(
        contractAddress,
        abi,
        systemWallet
    );

export const adminContract =
    new Contract(
        contractAddress,
        abi,
        adminWallet
    );

export const auditorContract =
    new Contract(
        contractAddress,
        abi,
        auditorWallet
    );

export const readOnlyContract =
    new Contract(
        contractAddress,
        abi,
        blockchainProvider
    );

export const reliefChainAddress =
    contractAddress;

export const blockchainNetwork =
    process.env.BLOCKCHAIN_NETWORK ||
    "unknown";