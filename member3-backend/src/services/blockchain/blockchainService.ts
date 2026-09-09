import {
    keccak256,
    toUtf8Bytes,
    TransactionReceipt,
} from "ethers";

import {
    systemContract,
    adminContract,
    auditorContract,
    readOnlyContract,
    reliefChainAddress,
    blockchainNetwork,
} from "../../config/blockchain";


/* =========================================================
   HELPERS
   ========================================================= */

function toBytes32Id(id: string): string {
    if (!id || !id.trim()) {
        throw new Error("Entity ID cannot be empty");
    }

    return keccak256(toUtf8Bytes(id.trim()));
}


function toBytes32Text(value: string): string {
    if (!value || !value.trim()) {
        throw new Error("Value cannot be empty");
    }
    const trimmed = value.trim();
    if (/^0x[0-9a-fA-F]{64}$/.test(trimmed)) return trimmed;
    if (/^[0-9a-fA-F]{64}$/.test(trimmed)) return `0x${trimmed}`;
    return keccak256(toUtf8Bytes(trimmed));
}


function buildResult(
    receipt: TransactionReceipt,
    entityType: string,
    entityId: string
) {
    return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        contractAddress: reliefChainAddress,
        network: blockchainNetwork === "localhost:31337" ? "localhost" : blockchainNetwork,
        entityType,
        entityId,
        timestamp: new Date(),
    };
}


async function waitForTransaction(
    tx: any,
    entityType: string,
    entityId: string
) {
    const receipt = await tx.wait();

    if (!receipt) {
        throw new Error(
            `${entityType} transaction receipt not found`
        );
    }

    return buildResult(
        receipt,
        entityType,
        entityId
    );
}


/* =========================================================
   CAMPAIGN
   ========================================================= */

/**
 * Creates immutable blockchain proof for a campaign.
 *
 * SYSTEM_ROLE required.
 */
export async function createCampaignProof(
    campaignId: string,
    metadataHash: string
) {
    const campaignHash = toBytes32Id(campaignId);

    if (!metadataHash || !metadataHash.trim()) {
        throw new Error("metadataHash is required");
    }

    const tx = await systemContract.createCampaign(
        campaignHash,
        metadataHash
    );

    return waitForTransaction(
        tx,
        "CAMPAIGN",
        campaignId
    );
}


/**
 * Verifies a campaign on-chain.
 *
 * ADMIN_ROLE required.
 */
export async function verifyCampaignProof(
    campaignId: string
) {
    const campaignHash = toBytes32Id(campaignId);

    const tx = await adminContract.verifyCampaign(
        campaignHash
    );

    return waitForTransaction(
        tx,
        "CAMPAIGN_VERIFICATION",
        campaignId
    );
}


/**
 * Retrieves campaign information from blockchain.
 */
export async function getCampaignProof(
    campaignId: string
) {
    const campaignHash = toBytes32Id(campaignId);

    return readOnlyContract.getCampaign(
        campaignHash
    );
}


/* =========================================================
   DONATION
   ========================================================= */

/**
 * Records donation proof on-chain.
 *
 * SYSTEM_ROLE required.
 */
export async function recordDonationProof(
    campaignId: string,
    donationId: string,
    amount: bigint,
    timestamp: bigint
) {
    const campaignHash = toBytes32Id(campaignId);
    const donationHash = toBytes32Id(donationId);

    if (amount <= 0n) {
        throw new Error("Donation amount must be greater than zero");
    }
    if (timestamp <= 0n) {
        throw new Error("Donation timestamp must be greater than zero");
    }

    const tx = await systemContract.recordDonation(
        campaignHash,
        donationHash,
        amount,
        timestamp
    );

    return waitForTransaction(tx, "DONATION", donationId);
}


/**
 * Retrieves donation proof from blockchain.
 */
export async function getDonationProof(
    donationId: string
) {
    const donationHash = toBytes32Id(donationId);

    return readOnlyContract.getDonation(
        donationHash
    );
}


/* =========================================================
   FUND ALLOCATION
   ========================================================= */

/**
 * Records fund allocation proof.
 *
 * SYSTEM_ROLE required.
 */
export async function recordFundAllocationProof(
    campaignId: string,
    allocationId: string,
    amount: bigint
) {
    const campaignHash = toBytes32Id(campaignId);
    const allocationHash = toBytes32Id(allocationId);

    if (amount <= 0n) {
        throw new Error("Allocation amount must be greater than zero");
    }

    const tx = await systemContract.recordFundAllocation(
        campaignHash,
        allocationHash,
        amount
    );

    return waitForTransaction(tx, "FUND_ALLOCATION", allocationId);
}


/**
 * Retrieves fund allocation from blockchain.
 */
export async function getFundAllocationProof(
    allocationId: string
) {
    const allocationHash =
        toBytes32Id(allocationId);

    return readOnlyContract.getFundAllocation(
        allocationHash
    );
}


/* =========================================================
   RELIEF BATCH
   ========================================================= */

/**
 * Creates a relief batch proof.
 *
 * SYSTEM_ROLE required.
 */
export async function createReliefBatchProof(
    batchId: string,
    campaignId: string,
    batchCode: string,
    item: string,
    quantity: bigint,
    timestamp: bigint
) {
    const batchHash = toBytes32Id(batchId);
    const campaignHash = toBytes32Id(campaignId);

    if (!batchCode?.trim()) throw new Error("batchCode is required");
    if (!item?.trim()) throw new Error("item is required");
    if (quantity <= 0n) throw new Error("Batch quantity must be greater than zero");
    if (timestamp <= 0n) throw new Error("Batch timestamp must be greater than zero");

    const tx = await systemContract.createReliefBatch(
        batchHash,
        campaignHash,
        batchCode.trim(),
        item.trim(),
        quantity,
        timestamp
    );

    return waitForTransaction(tx, "RELIEF_BATCH", batchId);
}


/**
 * Transfers a relief batch between locations.
 *
 * SYSTEM_ROLE required.
 *
 * Location values expected:
 * NONE
 * WAREHOUSE
 * TRUCK
 * CAMP
 */
export async function transferReliefBatchProof(
    batchId: string,
    toLocation: number
) {
    const batchHash = toBytes32Id(batchId);

    if (
        !Number.isInteger(toLocation) ||
        toLocation < 1 ||
        toLocation > 3
    ) {
        throw new Error(
            "Invalid destination. Use 1=WAREHOUSE, 2=TRUCK, 3=CAMP"
        );
    }

    const tx =
        await systemContract.transferReliefBatch(
            batchHash,
            toLocation
        );

    return waitForTransaction(
        tx,
        "BATCH_TRANSFER",
        batchId
    );
}


/**
 * Retrieves relief batch proof.
 */
export async function getReliefBatchProof(
    batchId: string
) {
    const batchHash = toBytes32Id(batchId);

    return readOnlyContract.getReliefBatch(
        batchHash
    );
}


/* =========================================================
   DISTRIBUTION
   ========================================================= */

/**
 * Records aid distribution proof.
 *
 * SYSTEM_ROLE required.
 */
export async function recordDistributionProof(
    distributionId: string,
    beneficiaryId: string,
    batchId: string,
    item: string,
    quantity: bigint,
    timestamp: bigint
) {
    const distributionHash = toBytes32Id(distributionId);
    const batchHash = toBytes32Id(batchId);
    const beneficiaryBytes32 = toBytes32Id(beneficiaryId);

    if (!item?.trim()) throw new Error("item is required");
    if (quantity <= 0n) throw new Error("Distribution quantity must be greater than zero");
    if (timestamp <= 0n) throw new Error("Distribution timestamp must be greater than zero");

    const tx = await systemContract.recordDistribution(
        distributionHash,
        batchHash,
        beneficiaryBytes32,
        item.trim(),
        quantity,
        timestamp
    );

    return waitForTransaction(tx, "DISTRIBUTION", distributionId);
}


/**
 * Retrieves distribution proof.
 */
export async function getDistributionProof(
    distributionId: string
) {
    const distributionHash =
        toBytes32Id(distributionId);

    return readOnlyContract.getDistribution(
        distributionHash
    );
}


/* =========================================================
   EXPENSE
   ========================================================= */

/**
 * Records an expense and evidence hash.
 *
 * SYSTEM_ROLE required.
 */
export async function recordExpenseProof(
    expenseId: string,
    campaignId: string,
    evidenceHash: string
) {
    const expenseHash =
        toBytes32Id(expenseId);

    const campaignHash =
        toBytes32Id(campaignId);

    const evidenceBytes32 =
        toBytes32Text(evidenceHash);

    const tx =
        await systemContract.recordExpenseProof(
            expenseHash,
            campaignHash,
            evidenceBytes32
        );

    return waitForTransaction(
        tx,
        "EXPENSE",
        expenseId
    );
}


/**
 * Verifies an expense.
 *
 * AUDITOR_ROLE required.
 */
export async function verifyExpenseProof(
    expenseId: string
) {
    const expenseHash =
        toBytes32Id(expenseId);

    const tx =
        await auditorContract.verifyExpense(
            expenseHash
        );

    return waitForTransaction(
        tx,
        "EXPENSE_VERIFICATION",
        expenseId
    );
}


/**
 * Retrieves expense proof.
 */
export async function getExpenseProof(
    expenseId: string
) {
    const expenseHash =
        toBytes32Id(expenseId);

    return readOnlyContract.getExpenseProof(
        expenseHash
    );
}


/* =========================================================
   AUDITOR VERIFICATION
   ========================================================= */

/**
 * Records generic auditor verification.
 *
 * AUDITOR_ROLE required.
 */
export async function recordVerificationProof(
    entityId: string,
    entityType: string,
    verificationHash: string
) {
    const entityHash =
        toBytes32Id(entityId);

    const entityTypeHash =
        toBytes32Text(entityType.toUpperCase());

    const verificationBytes32 =
        toBytes32Text(verificationHash);

    const tx =
        await auditorContract.recordVerification(
            entityHash,
            entityTypeHash,
            verificationBytes32
        );

    return waitForTransaction(
        tx,
        "VERIFICATION",
        entityId
    );
}


/**
 * Retrieves generic verification proof.
 */
export async function getVerificationProof(
    entityId: string
) {
    const entityHash =
        toBytes32Id(entityId);

    return readOnlyContract.getVerification(
        entityHash
    );
}


/* =========================================================
   BLOCKCHAIN INFORMATION
   ========================================================= */

export function getBlockchainInfo() {
    return {
        contractAddress: reliefChainAddress,
        network: blockchainNetwork === "localhost:31337" ? "localhost" : blockchainNetwork,
    };
}