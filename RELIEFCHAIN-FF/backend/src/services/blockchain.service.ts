import axios from "axios";

type BlockchainAction =
  | "campaign"
  | "donation"
  | "expense"
  | "batch"
  | "batch/transfer"
  | "distribution";

interface BlockchainResult {
  transactionHash: string;
  blockNumber?: number;
  contractAddress?: string;
  network?: string;
}

const serviceUrl = process.env.BLOCKCHAIN_SERVICE_URL;
const apiKey = process.env.BLOCKCHAIN_SERVICE_API_KEY;

function mockHash(action: string, id: string): string {
  const seed = `${action}-${id}-${Date.now()}`;
  let hash = 0n;
  for (const char of seed) {
    hash = (hash * 31n + BigInt(char.charCodeAt(0))) & ((1n << 256n) - 1n);
  }
  return `0x${hash.toString(16).padStart(64, "0")}`;
}

async function callBlockchain(
  action: BlockchainAction,
  payload: Record<string, unknown>
): Promise<BlockchainResult> {
  if (!serviceUrl) {
    return {
      transactionHash: mockHash(action, String(payload.entityId ?? "unknown")),
      blockNumber: undefined,
      contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS,
      network: process.env.BLOCKCHAIN_NETWORK ?? "MOCK",
    };
  }

  const response = await axios.post(
    `${serviceUrl.replace(/\/$/, "")}/blockchain/${action}`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "X-API-KEY": apiKey } : {}),
      },
      timeout: 10000,
    }
  );

  const data = response.data?.data ?? response.data;

  if (!data?.transactionHash) {
    throw new Error(`Blockchain service returned no transactionHash for ${action}`);
  }

  return {
    transactionHash: String(data.transactionHash),
    blockNumber:
      data.blockNumber !== undefined ? Number(data.blockNumber) : undefined,
    contractAddress: data.contractAddress
      ? String(data.contractAddress)
      : process.env.BLOCKCHAIN_CONTRACT_ADDRESS,
    network: data.network
      ? String(data.network)
      : process.env.BLOCKCHAIN_NETWORK,
  };
}

export const blockchainService = {
  createCampaign(payload: {
    campaignId: string;
    metadataHash: string;
  }) {
    return callBlockchain("campaign", {
      entityId: payload.campaignId,
      ...payload,
    });
  },

  recordDonation(payload: {
    donationId: string;
    campaignId: string;
    amount: number;
    timestamp: string;
  }) {
    return callBlockchain("donation", {
      entityId: payload.donationId,
      ...payload,
    });
  },

  recordExpenseProof(payload: {
    expenseId: string;
    campaignId: string;
    evidenceHash: string;
  }) {
    return callBlockchain("expense", {
      entityId: payload.expenseId,
      ...payload,
    });
  },

  createReliefBatch(payload: {
    batchId: string;
    campaignId: string;
    batchCode: string;
    item: string;
    quantity: number;
    timestamp: string;
  }) {
    return callBlockchain("batch", {
      entityId: payload.batchId,
      ...payload,
    });
  },

  transferReliefBatch(payload: {
    batchId: string;
    toLocation: number;
  }) {
    return callBlockchain("batch/transfer", {
      entityId: payload.batchId,
      ...payload,
    });
  },

  recordDistribution(payload: {
    distributionId: string;
    beneficiaryId: string;
    batchId?: string;
    item: string;
    quantity: number;
    timestamp: string;
  }) {
    return callBlockchain("distribution", {
      entityId: payload.distributionId,
      ...payload,
    });
  },
};
