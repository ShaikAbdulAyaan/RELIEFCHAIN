import { ethers } from "ethers";
import { getTransactionExplorerUrl } from "../utils/explorer.js";

import {
    createCampaign,
    verifyCampaign,
    recordDonation,
    recordFundAllocation,
    createReliefBatch,
    transferReliefBatch,
    recordDistribution,
    recordExpenseProof,
    verifyExpense,
    recordVerification,
    provider,
    contract,
} from "../services/blockchainService.js";

// ============================================================
// RELIEFCHAIN BLOCKCHAIN ADAPTER
// ============================================================
//
// Member 2 Backend
//        ↓
// blockchainAdapter.js
//        ↓
// blockchainService.js
//        ↓
// ReliefChain.sol
//
// PostgreSQL IDs are deterministically converted into bytes32.
//
// The adapter returns standardized blockchain transaction
// information for Member 2's BlockchainTransaction table.
// ============================================================

// ============================================================
// ID CONVERSION
// ============================================================

/**
 * Convert an application/PostgreSQL ID into deterministic bytes32.
 */
export function toBytes32Id(id) {
    if (
        !id ||
        typeof id !== "string" ||
        !id.trim()
    ) {
        throw new Error(
            "Blockchain ID must be a non-empty string"
        );
    }

    return ethers.keccak256(
        ethers.toUtf8Bytes(
            id.trim()
        )
    );
}

/**
 * Convert an entity type into deterministic bytes32.
 */
export function toEntityTypeBytes32(entityType) {
    if (
        !entityType ||
        typeof entityType !== "string" ||
        !entityType.trim()
    ) {
        throw new Error(
            "Entity type must be a non-empty string"
        );
    }

    return ethers.keccak256(
        ethers.toUtf8Bytes(
            entityType
                .trim()
                .toUpperCase()
        )
    );
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

function requireString(
    value,
    fieldName
) {
    if (
        !value ||
        typeof value !== "string" ||
        !value.trim()
    ) {
        throw new Error(
            `${fieldName} must be a non-empty string`
        );
    }
}

function requirePositiveAmount(
    amount
) {
    if (
        amount === undefined ||
        amount === null
    ) {
        throw new Error(
            "Amount is required"
        );
    }

    const value =
        BigInt(amount);

    if (value <= 0n) {
        throw new Error(
            "Amount must be greater than zero"
        );
    }

    return value;
}

function requireTimestamp(
    timestamp
) {
    if (
        timestamp === undefined ||
        timestamp === null
    ) {
        return BigInt(
            Math.floor(
                Date.now() / 1000
            )
        );
    }

    const value =
        BigInt(timestamp);

    if (value <= 0n) {
        throw new Error(
            "Timestamp must be greater than zero"
        );
    }

    return value;
}


function requireBytes32Hash(value, fieldName) {
    requireString(value, fieldName);

    if (ethers.isHexString(value, 32)) {
        return value;
    }

    return ethers.keccak256(
        ethers.toUtf8Bytes(value.trim())
    );
}

// ============================================================
// STANDARD TRANSACTION RESULT
// ============================================================

async function buildTransactionResult(
    serviceResult,
    entityType,
    entityId,
    relations = {}
) {
    if (
        !serviceResult ||
        !serviceResult.transactionHash
    ) {
        throw new Error(
            "Blockchain transaction hash is missing"
        );
    }

    const transaction =
        await provider.getTransaction(
            serviceResult.transactionHash
        );

    if (!transaction) {
        throw new Error(
            "Blockchain transaction could not be found"
        );
    }

    const receipt =
        await provider.getTransactionReceipt(
            serviceResult.transactionHash
        );

    if (!receipt) {
        throw new Error(
            "Blockchain transaction receipt could not be found"
        );
    }

    const network =
        await provider.getNetwork();

    let blockTimestamp =
        Math.floor(
            Date.now() / 1000
        );

    if (
        receipt.blockNumber !== null &&
        receipt.blockNumber !== undefined
    ) {
        const block =
            await provider.getBlock(
                receipt.blockNumber
            );

        if (
            block &&
            block.timestamp !== undefined &&
            block.timestamp !== null
        ) {
            blockTimestamp =
                Number(block.timestamp);
        }
    }

    return {
        success: true,

        transactionHash:
            serviceResult.transactionHash,

        blockNumber:
            receipt.blockNumber,

        contractAddress:
            await contract.getAddress(),

        network:
            process.env.BLOCKCHAIN_NETWORK || network.name || "localhost",

        explorerUrl:
            getTransactionExplorerUrl(serviceResult.transactionHash, network.name),

        entityType,

        entityId,

        timestamp:
            new Date(
                blockTimestamp * 1000
            ),

        ...relations,
    };
}

// ============================================================
// CAMPAIGN
// ============================================================

export async function createCampaignProof({
    campaignId,
    metadataHash,
}) {
    requireString(
        campaignId,
        "campaignId"
    );

    requireString(
        metadataHash,
        "metadataHash"
    );

    const blockchainCampaignId =
        toBytes32Id(
            campaignId
        );

    const result =
        await createCampaign(
            blockchainCampaignId,
            metadataHash
        );

    return buildTransactionResult(
        result,
        "CAMPAIGN_CREATED",
        campaignId,
        {
            campaignId,
        }
    );
}

export async function verifyCampaignProof({
    campaignId,
}) {
    requireString(
        campaignId,
        "campaignId"
    );

    const blockchainCampaignId =
        toBytes32Id(
            campaignId
        );

    const result =
        await verifyCampaign(
            blockchainCampaignId
        );

    return buildTransactionResult(
        result,
        "CAMPAIGN_VERIFIED",
        campaignId,
        {
            campaignId,
        }
    );
}

// ============================================================
// DONATION
// ============================================================

/**
 * Record donation proof.
 *
 * No donor wallet address is accepted or stored on-chain.
 */
export async function recordDonationProof({
    campaignId,
    donationId,
    amount,
    timestamp,
}) {
    requireString(campaignId, "campaignId");
    requireString(donationId, "donationId");

    const donationAmount = requirePositiveAmount(amount);
    const donationTimestamp = requireTimestamp(timestamp);

    const blockchainCampaignId = toBytes32Id(campaignId);
    const blockchainDonationId = toBytes32Id(donationId);

    const result = await recordDonation(
        blockchainCampaignId,
        blockchainDonationId,
        donationAmount,
        donationTimestamp
    );

    return buildTransactionResult(
        result,
        "DONATION",
        donationId,
        { donationId, campaignId }
    );
}


// ============================================================
// FUND ALLOCATION
// ============================================================

export async function recordFundAllocationProof({
    campaignId,
    allocationId,
    amount,
}) {
    requireString(
        campaignId,
        "campaignId"
    );

    requireString(
        allocationId,
        "allocationId"
    );

    const allocationAmount =
        requirePositiveAmount(
            amount
        );

    const blockchainCampaignId =
        toBytes32Id(
            campaignId
        );

    const blockchainAllocationId =
        toBytes32Id(
            allocationId
        );

    const result =
        await recordFundAllocation(
            blockchainCampaignId,
            blockchainAllocationId,
            allocationAmount
        );

    return buildTransactionResult(
        result,
        "FUND_ALLOCATION",
        allocationId,
        {
            allocationId,
            campaignId,
        }
    );
}

// ============================================================
// RELIEF BATCH
// ============================================================

export async function createReliefBatchProof({
    batchId,
    campaignId,
    batchCode,
    item,
    quantity,
    timestamp,
}) {
    requireString(batchId, "batchId");
    requireString(campaignId, "campaignId");
    requireString(batchCode, "batchCode");
    requireString(item, "item");

    const batchQuantity = requirePositiveAmount(quantity);
    const batchTimestamp = requireTimestamp(timestamp);

    const blockchainBatchId = toBytes32Id(batchId);
    const blockchainCampaignId = toBytes32Id(campaignId);

    const result = await createReliefBatch(
        blockchainBatchId,
        blockchainCampaignId,
        batchCode.trim(),
        item.trim(),
        batchQuantity,
        batchTimestamp
    );

    return buildTransactionResult(
        result,
        "RELIEF_BATCH_CREATED",
        batchId,
        {
            batchId,
            campaignId,
            batchCode: batchCode.trim(),
            item: item.trim(),
            quantity: batchQuantity.toString(),
            timestamp: batchTimestamp.toString(),
        }
    );
}


export async function transferReliefBatchProof({
    batchId,
    toLocation,
}) {
    requireString(
        batchId,
        "batchId"
    );

    if (
        toLocation === undefined ||
        toLocation === null
    ) {
        throw new Error(
            "toLocation is required"
        );
    }

    if (
        !Number.isInteger(
            Number(toLocation)
        ) ||
        Number(toLocation) < 1 ||
        Number(toLocation) > 3
    ) {
        throw new Error(
            "toLocation must be 1=WAREHOUSE, 2=TRUCK, or 3=CAMP"
        );
    }

    const blockchainBatchId =
        toBytes32Id(
            batchId
        );

    const result =
        await transferReliefBatch(
            blockchainBatchId,
            Number(toLocation)
        );

    return buildTransactionResult(
        result,
        "BATCH_TRANSFER",
        batchId,
        {
            batchId,
            toLocation:
                Number(toLocation),
        }
    );
}

// ============================================================
// DISTRIBUTION
// ============================================================

export async function recordDistributionProof({
    distributionId,
    beneficiaryId,
    batchId,
    item,
    quantity,
    timestamp,
}) {
    requireString(distributionId, "distributionId");
    requireString(beneficiaryId, "beneficiaryId");
    requireString(batchId, "batchId");
    requireString(item, "item");

    const distributionQuantity = requirePositiveAmount(quantity);
    const distributionTimestamp = requireTimestamp(timestamp);

    const blockchainDistributionId = toBytes32Id(distributionId);
    const blockchainBatchId = toBytes32Id(batchId);
    const beneficiaryHash = toBytes32Id(beneficiaryId);

    const result = await recordDistribution(
        blockchainDistributionId,
        blockchainBatchId,
        beneficiaryHash,
        item.trim(),
        distributionQuantity,
        distributionTimestamp
    );

    return buildTransactionResult(
        result,
        "DISTRIBUTION",
        distributionId,
        {
            distributionId,
            beneficiaryId,
            batchId,
            item: item.trim(),
            quantity: distributionQuantity.toString(),
            timestamp: distributionTimestamp.toString(),
        }
    );
}


// ============================================================
// EXPENSE PROOF
// ============================================================

export async function recordExpenseProofOnChain({
    expenseId,
    campaignId,
    evidenceHash,
}) {
    requireString(
        expenseId,
        "expenseId"
    );

    requireString(
        campaignId,
        "campaignId"
    );

    requireString(
        evidenceHash,
        "evidenceHash"
    );

    const blockchainExpenseId =
        toBytes32Id(
            expenseId
        );

    const blockchainCampaignId =
        toBytes32Id(
            campaignId
        );

    const result =
        await recordExpenseProof(
            blockchainExpenseId,
            blockchainCampaignId,
            requireBytes32Hash(
                evidenceHash,
                "evidenceHash"
            )
        );

    return buildTransactionResult(
        result,
        "EXPENSE",
        expenseId,
        {
            expenseId,
            campaignId,
        }
    );
}

// ============================================================
// EXPENSE VERIFICATION
// ============================================================

export async function verifyExpenseProof({
    expenseId,
}) {
    requireString(
        expenseId,
        "expenseId"
    );

    const blockchainExpenseId =
        toBytes32Id(
            expenseId
        );

    const result =
        await verifyExpense(
            blockchainExpenseId
        );

    return buildTransactionResult(
        result,
        "EXPENSE_VERIFIED",
        expenseId,
        {
            expenseId,
        }
    );
}

// ============================================================
// AUDITOR VERIFICATION
// ============================================================

export async function recordVerificationProof({
    entityId,
    entityType,
    verificationHash,
}) {
    requireString(
        entityId,
        "entityId"
    );

    requireString(
        entityType,
        "entityType"
    );

    requireString(
        verificationHash,
        "verificationHash"
    );

    const blockchainEntityId =
        toBytes32Id(
            entityId
        );

    const blockchainEntityType =
        toEntityTypeBytes32(
            entityType
        );

    const result =
        await recordVerification(
            blockchainEntityId,
            blockchainEntityType,
            requireBytes32Hash(
                verificationHash,
                "verificationHash"
            )
        );

    return buildTransactionResult(
        result,
        "VERIFICATION",
        entityId,
        {
            verifiedEntityType:
                entityType.toUpperCase(),
        }
    );
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
    toBytes32Id,

    toEntityTypeBytes32,

    createCampaignProof,

    verifyCampaignProof,

    recordDonationProof,

    recordFundAllocationProof,

    createReliefBatchProof,

    transferReliefBatchProof,

    recordDistributionProof,

    recordExpenseProofOnChain,

    verifyExpenseProof,

    recordVerificationProof,
};