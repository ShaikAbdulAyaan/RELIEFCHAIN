import "dotenv/config";
import { ethers } from "ethers";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

// ============================================================
// ETHERS SETUP
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifactPath = path.resolve(
    __dirname,
    "../artifacts/contracts/ReliefChain.sol/ReliefChain.json"
);

const artifact = JSON.parse(
    await readFile(artifactPath, "utf8")
);

// ============================================================
// CONTRACT CONFIGURATION
// ============================================================

const CONTRACT_ADDRESS =
    process.env.RELIEFCHAIN_CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS) {
    throw new Error(
        "RELIEFCHAIN_CONTRACT_ADDRESS is missing from .env"
    );
}

if (!ethers.isAddress(CONTRACT_ADDRESS)) {
    throw new Error(
        "RELIEFCHAIN_CONTRACT_ADDRESS is not a valid Ethereum address"
    );
}

// ============================================================
// PROVIDER
// ============================================================

const provider =
    new ethers.JsonRpcProvider(
        process.env.BLOCKCHAIN_RPC_URL ||
        "http://127.0.0.1:8545"
    );

// ============================================================
// PRIVATE KEYS
// ============================================================

const ADMIN_PRIVATE_KEY =
    process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY;

const SYSTEM_PRIVATE_KEY =
    process.env.BLOCKCHAIN_SYSTEM_PRIVATE_KEY;

const AUDITOR_PRIVATE_KEY =
    process.env.BLOCKCHAIN_AUDITOR_PRIVATE_KEY;

if (!ADMIN_PRIVATE_KEY) {
    throw new Error(
        "BLOCKCHAIN_ADMIN_PRIVATE_KEY is missing from .env"
    );
}

if (!SYSTEM_PRIVATE_KEY) {
    throw new Error(
        "BLOCKCHAIN_SYSTEM_PRIVATE_KEY is missing from .env"
    );
}

if (!AUDITOR_PRIVATE_KEY) {
    throw new Error(
        "BLOCKCHAIN_AUDITOR_PRIVATE_KEY is missing from .env"
    );
}

// ============================================================
// RAW WALLETS
// ============================================================

const adminRawWallet =
    new ethers.Wallet(
        ADMIN_PRIVATE_KEY,
        provider
    );

const systemRawWallet =
    new ethers.Wallet(
        SYSTEM_PRIVATE_KEY,
        provider
    );

const auditorRawWallet =
    new ethers.Wallet(
        AUDITOR_PRIVATE_KEY,
        provider
    );

// ============================================================
// NONCE MANAGERS
// ============================================================

const adminWallet =
    new ethers.NonceManager(
        adminRawWallet
    );

const systemWallet =
    new ethers.NonceManager(
        systemRawWallet
    );

const auditorWallet =
    new ethers.NonceManager(
        auditorRawWallet
    );

// ============================================================
// ROLE-SPECIFIC CONTRACT INSTANCES
// ============================================================

const adminContract =
    new ethers.Contract(
        CONTRACT_ADDRESS,
        artifact.abi,
        adminWallet
    );

const systemContract =
    new ethers.Contract(
        CONTRACT_ADDRESS,
        artifact.abi,
        systemWallet
    );

const auditorContract =
    new ethers.Contract(
        CONTRACT_ADDRESS,
        artifact.abi,
        auditorWallet
    );

// ============================================================
// READ-ONLY CONTRACT
// ============================================================

const readOnlyContract =
    new ethers.Contract(
        CONTRACT_ADDRESS,
        artifact.abi,
        provider
    );

// ============================================================
// STARTUP INFORMATION
// ============================================================

console.log(
    "Blockchain service initialized"
);

console.log(
    "Contract:",
    CONTRACT_ADDRESS
);

console.log(
    "Admin wallet:",
    adminRawWallet.address
);

console.log(
    "System wallet:",
    systemRawWallet.address
);

console.log(
    "Auditor wallet:",
    auditorRawWallet.address
);

// ============================================================
// CAMPAIGN FUNCTIONS
// ============================================================

/**
 * Create a new relief campaign.
 *
 * Requires SYSTEM_ROLE.
 */
export async function createCampaign(
    campaignId,
    metadataHash
) {
    if (!campaignId) {
        throw new Error(
            "campaignId is required"
        );
    }

    if (!metadataHash) {
        throw new Error(
            "metadataHash is required"
        );
    }

    const tx =
        await systemContract.createCampaign(
            campaignId,
            metadataHash
        );

    const receipt =
        await tx.wait();

    if (!receipt) {
        throw new Error(
            "Campaign transaction receipt not found"
        );
    }

    return {
        transactionHash:
            receipt.hash,

        campaignId
    };
}

/**
 * Verify an existing campaign.
 *
 * Requires ADMIN_ROLE.
 */
export async function verifyCampaign(
    campaignId
) {
    if (!campaignId) {
        throw new Error(
            "campaignId is required"
        );
    }

    const tx =
        await adminContract.verifyCampaign(
            campaignId
        );

    const receipt =
        await tx.wait();

    if (!receipt) {
        throw new Error(
            "Campaign verification receipt not found"
        );
    }

    return {
        transactionHash:
            receipt.hash,

        campaignId
    };
}

/**
 * Read campaign information.
 */
export async function getCampaign(
    campaignId
) {
    if (!campaignId) {
        throw new Error(
            "campaignId is required"
        );
    }

    return await readOnlyContract.getCampaign(
        campaignId
    );
}

// ============================================================
// CAMPAIGN READINESS
// ============================================================

/**
 * Ensure a campaign exists on-chain and is verified.
 *
 * Member 2 currently creates campaigns off-chain and only calls
 * the four blockchain proof endpoints. To keep those endpoints
 * independently usable, the blockchain service creates a minimal
 * on-chain campaign proof when necessary and verifies it with the
 * configured admin wallet.
 */
export async function ensureCampaignReady(campaignId) {
    if (!campaignId) throw new Error("campaignId is required");

    try {
        const campaign = await readOnlyContract.getCampaign(campaignId);
        if (!campaign.verified) {
            const tx = await adminContract.verifyCampaign(campaignId);
            await tx.wait();
        }
        return await readOnlyContract.getCampaign(campaignId);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.toLowerCase().includes("campaign does not exist")) {
            throw error;
        }

        const metadata = `reliefchain:auto-campaign:${campaignId}`;
        const createTx = await systemContract.createCampaign(campaignId, metadata);
        await createTx.wait();

        const verifyTx = await adminContract.verifyCampaign(campaignId);
        await verifyTx.wait();

        return await readOnlyContract.getCampaign(campaignId);
    }
}

// ============================================================
// DONATION FUNCTIONS
// ============================================================

/**
 * Record a donation on blockchain.
 *
 * Requires SYSTEM_ROLE.
 *
 * Solidity signature:
 *
 * recordDonation(
 *     bytes32 campaignId,
 *     bytes32 donationId,
 *     uint256 amount,
 *     uint256 timestamp
 * )
 */
export async function recordDonation(
    campaignId,
    donationId,
    amount,
    timestamp
) {
    if (!campaignId) throw new Error("campaignId is required");
    if (!donationId) throw new Error("donationId is required");

    await ensureCampaignReady(campaignId);

    const donationAmount = BigInt(amount);
    if (donationAmount <= 0n) throw new Error("Donation amount must be greater than zero");

    const donationTimestamp = BigInt(timestamp);
    if (donationTimestamp <= 0n) throw new Error("Donation timestamp must be greater than zero");

    const tx = await systemContract.recordDonation(
        campaignId,
        donationId,
        donationAmount,
        donationTimestamp
    );

    const receipt = await tx.wait();
    if (!receipt) throw new Error("Donation transaction receipt not found");

    return {
        transactionHash: receipt.hash,
        campaignId,
        donationId,
        amount: donationAmount.toString(),
        timestamp: donationTimestamp.toString()
    };
}

/**
 * Read donation information.
 */
export async function getDonation(
    donationId
) {
    if (!donationId) {
        throw new Error(
            "donationId is required"
        );
    }

    return await readOnlyContract.getDonation(
        donationId
    );
}

// ============================================================
// FUND ALLOCATION FUNCTIONS
// ============================================================

/**
 * Record fund allocation.
 *
 * Requires SYSTEM_ROLE.
 */
export async function recordFundAllocation(
    campaignId,
    allocationId,
    amount
) {
    if (!campaignId) {
        throw new Error(
            "campaignId is required"
        );
    }

    if (!allocationId) {
        throw new Error(
            "allocationId is required"
        );
    }

    const allocationAmount =
        BigInt(amount);

    if (allocationAmount <= 0n) {
        throw new Error(
            "Allocation amount must be greater than zero"
        );
    }

    const tx =
        await systemContract.recordFundAllocation(
            campaignId,
            allocationId,
            allocationAmount
        );

    const receipt =
        await tx.wait();

    if (!receipt) {
        throw new Error(
            "Fund allocation transaction receipt not found"
        );
    }

    return {
        transactionHash:
            receipt.hash,

        campaignId,

        allocationId
    };
}

/**
 * Read fund allocation information.
 */
export async function getFundAllocation(
    allocationId
) {
    if (!allocationId) {
        throw new Error(
            "allocationId is required"
        );
    }

    return await readOnlyContract.getFundAllocation(
        allocationId
    );
}

// ============================================================
// RELIEF BATCH FUNCTIONS
// ============================================================

/**
 * Create a relief batch.
 *
 * Requires SYSTEM_ROLE.
 */
export async function createReliefBatch(
    batchId,
    campaignId,
    batchCode,
    item,
    quantity,
    timestamp
) {
    if (!batchId) throw new Error("batchId is required");
    if (!campaignId) throw new Error("campaignId is required");
    if (!batchCode) throw new Error("batchCode is required");
    if (!item) throw new Error("item is required");

    await ensureCampaignReady(campaignId);

    const batchQuantity = BigInt(quantity);
    if (batchQuantity <= 0n) throw new Error("Batch quantity must be greater than zero");

    const batchTimestamp = BigInt(timestamp);
    if (batchTimestamp <= 0n) throw new Error("Batch timestamp must be greater than zero");

    const tx = await systemContract.createReliefBatch(
        batchId,
        campaignId,
        batchCode,
        item,
        batchQuantity,
        batchTimestamp
    );

    const receipt = await tx.wait();
    if (!receipt) throw new Error("Relief batch transaction receipt not found");

    return {
        transactionHash: receipt.hash,
        batchId,
        campaignId,
        batchCode,
        item,
        quantity: batchQuantity.toString(),
        timestamp: batchTimestamp.toString()
    };
}

/**
 * Move a relief batch through the supply chain.
 *
 * 0 = NONE
 * 1 = WAREHOUSE
 * 2 = TRUCK
 * 3 = CAMP
 *
 * Requires SYSTEM_ROLE.
 */
export async function transferReliefBatch(
    batchId,
    location
) {
    if (!batchId) {
        throw new Error(
            "batchId is required"
        );
    }

    if (
        !Number.isInteger(location) ||
        location < 1 ||
        location > 3
    ) {
        throw new Error(
            "Invalid location. Use 1=WAREHOUSE, 2=TRUCK, 3=CAMP"
        );
    }

    const tx =
        await systemContract.transferReliefBatch(
            batchId,
            location
        );

    const receipt =
        await tx.wait();

    if (!receipt) {
        throw new Error(
            "Batch transfer transaction receipt not found"
        );
    }

    return {
        transactionHash:
            receipt.hash,

        batchId,

        location
    };
}

/**
 * Read relief batch information.
 */
export async function getReliefBatch(
    batchId
) {
    if (!batchId) {
        throw new Error(
            "batchId is required"
        );
    }

    return await readOnlyContract.getReliefBatch(
        batchId
    );
}

// ============================================================
// DISTRIBUTION READINESS
// ============================================================

/**
 * Move a batch to CAMP before a distribution proof.
 *
 * Member 2 exposes distribution creation but not the two physical
 * movement calls. The blockchain service therefore advances a
 * warehouse batch through TRUCK to CAMP when required.
 */
export async function ensureBatchAtCamp(batchId) {
    if (!batchId) throw new Error("batchId is required");

    let batch = await readOnlyContract.getReliefBatch(batchId);
    let location = Number(batch.location);

    if (location === 1) {
        const tx = await systemContract.transferReliefBatch(batchId, 2);
        await tx.wait();
        location = 2;
    }

    if (location === 2) {
        const tx = await systemContract.transferReliefBatch(batchId, 3);
        await tx.wait();
        location = 3;
    }

    if (location !== 3) {
        throw new Error("Batch must be at camp before distribution");
    }

    batch = await readOnlyContract.getReliefBatch(batchId);
    return batch;
}

// ============================================================
// AID DISTRIBUTION FUNCTIONS
// ============================================================

/**
 * Record aid distribution at a relief camp.
 *
 * Requires SYSTEM_ROLE.
 */
export async function recordDistribution(
    distributionId,
    batchId,
    beneficiaryHash,
    item,
    quantity,
    timestamp
) {
    if (!distributionId) throw new Error("distributionId is required");
    if (!batchId) throw new Error("batchId is required");
    if (!beneficiaryHash) throw new Error("beneficiaryHash is required");
    if (!item) throw new Error("item is required");

    await ensureBatchAtCamp(batchId);

    const distributionQuantity = BigInt(quantity);
    if (distributionQuantity <= 0n) throw new Error("Distribution quantity must be greater than zero");

    const distributionTimestamp = BigInt(timestamp);
    if (distributionTimestamp <= 0n) throw new Error("Distribution timestamp must be greater than zero");

    const tx = await systemContract.recordDistribution(
        distributionId,
        batchId,
        beneficiaryHash,
        item,
        distributionQuantity,
        distributionTimestamp
    );

    const receipt = await tx.wait();
    if (!receipt) throw new Error("Distribution transaction receipt not found");

    return {
        transactionHash: receipt.hash,
        distributionId,
        batchId,
        item,
        quantity: distributionQuantity.toString(),
        timestamp: distributionTimestamp.toString()
    };
}

/**
 * Read distribution information.
 */
export async function getDistribution(
    distributionId
) {
    if (!distributionId) {
        throw new Error(
            "distributionId is required"
        );
    }

    return await readOnlyContract.getDistribution(
        distributionId
    );
}

// ============================================================
// EXPENSE PROOF FUNCTIONS
// ============================================================

/**
 * Record an expense proof.
 *
 * Requires SYSTEM_ROLE.
 */
export async function recordExpenseProof(
    expenseId,
    campaignId,
    evidenceHash
) {
    if (!expenseId) {
        throw new Error(
            "expenseId is required"
        );
    }

    if (!campaignId) {
        throw new Error(
            "campaignId is required"
        );
    }

    await ensureCampaignReady(campaignId);

    if (!evidenceHash) {
        throw new Error(
            "evidenceHash is required"
        );
    }

    const tx =
        await systemContract.recordExpenseProof(
            expenseId,
            campaignId,
            evidenceHash
        );

    const receipt =
        await tx.wait();

    if (!receipt) {
        throw new Error(
            "Expense proof transaction receipt not found"
        );
    }

    return {
        transactionHash:
            receipt.hash,

        expenseId,

        campaignId
    };
}

/**
 * Verify an expense proof.
 *
 * Requires AUDITOR_ROLE.
 */
export async function verifyExpense(
    expenseId
) {
    if (!expenseId) {
        throw new Error(
            "expenseId is required"
        );
    }

    const tx =
        await auditorContract.verifyExpense(
            expenseId
        );

    const receipt =
        await tx.wait();

    if (!receipt) {
        throw new Error(
            "Expense verification receipt not found"
        );
    }

    return {
        transactionHash:
            receipt.hash,

        expenseId
    };
}

/**
 * Read expense information.
 */
export async function getExpense(
    expenseId
) {
    if (!expenseId) {
        throw new Error(
            "expenseId is required"
        );
    }

    return await readOnlyContract.getExpenseProof(
        expenseId
    );
}

// ============================================================
// AUDITOR VERIFICATION FUNCTIONS
// ============================================================

/**
 * Record an auditor verification.
 *
 * Requires AUDITOR_ROLE.
 */
export async function recordVerification(
    entityId,
    entityType,
    verificationHash
) {
    if (!entityId) {
        throw new Error(
            "entityId is required"
        );
    }

    if (!entityType) {
        throw new Error(
            "entityType is required"
        );
    }

    if (!verificationHash) {
        throw new Error(
            "verificationHash is required"
        );
    }

    const tx =
        await auditorContract.recordVerification(
            entityId,
            entityType,
            verificationHash
        );

    const receipt =
        await tx.wait();

    if (!receipt) {
        throw new Error(
            "Verification transaction receipt not found"
        );
    }

    return {
        transactionHash:
            receipt.hash,

        entityId
    };
}

/**
 * Read verification information.
 */
export async function getVerification(
    entityId
) {
    if (!entityId) {
        throw new Error(
            "entityId is required"
        );
    }

    return await readOnlyContract.getVerification(
        entityId
    );
}

// ============================================================
// EXPORTS
// ============================================================

const contract =
    systemContract;

const rawWallet =
    systemRawWallet;

const wallet =
    systemWallet;

export {
    provider,

    rawWallet,
    wallet,
    contract,

    adminRawWallet,
    adminWallet,

    systemRawWallet,
    systemWallet,

    auditorRawWallet,
    auditorWallet,

    adminContract,
    systemContract,
    auditorContract,
    readOnlyContract
};