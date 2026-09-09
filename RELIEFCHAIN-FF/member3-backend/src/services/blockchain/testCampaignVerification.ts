import {
    createCampaignProof,
    verifyCampaignProof,
    getCampaignProof,
} from "./blockchainService";

async function main() {
    console.log("\n========================================");
    console.log("RELIEFCHAIN CAMPAIGN VERIFICATION TEST");
    console.log("========================================\n");

    const campaignId = `CAMPAIGN-VERIFY-${Date.now()}`;
    const metadataHash = "QmReliefChainVerificationTestHash";

    // --------------------------------------------------
    // STEP 1 — CREATE CAMPAIGN
    // --------------------------------------------------

    console.log("STEP 1: Creating campaign...\n");

    const createResult = await createCampaignProof(
        campaignId,
        metadataHash
    );

    console.log("CAMPAIGN CREATED");
    console.log("----------------------------------------");
    console.log("Transaction Hash:", createResult.transactionHash);
    console.log("Block Number:", createResult.blockNumber);
    console.log("Campaign ID:", createResult.entityId);
    console.log("----------------------------------------\n");

    // --------------------------------------------------
    // STEP 2 — READ BEFORE VERIFICATION
    // --------------------------------------------------

    console.log("STEP 2: Reading campaign before verification...\n");

    const beforeVerification = await getCampaignProof(campaignId);

    console.log("CAMPAIGN BEFORE VERIFICATION");
    console.log("----------------------------------------");
    console.log(beforeVerification);
    console.log("----------------------------------------\n");

    // --------------------------------------------------
    // STEP 3 — VERIFY CAMPAIGN
    // --------------------------------------------------

    console.log("STEP 3: Verifying campaign using ADMIN wallet...\n");

    const verifyResult = await verifyCampaignProof(campaignId);

    console.log("CAMPAIGN VERIFIED");
    console.log("----------------------------------------");
    console.log("Transaction Hash:", verifyResult.transactionHash);
    console.log("Block Number:", verifyResult.blockNumber);
    console.log("Campaign ID:", verifyResult.entityId);
    console.log("----------------------------------------\n");

    // --------------------------------------------------
    // STEP 4 — READ AFTER VERIFICATION
    // --------------------------------------------------

    console.log("STEP 4: Reading campaign after verification...\n");

    const afterVerification = await getCampaignProof(campaignId);

    console.log("CAMPAIGN AFTER VERIFICATION");
    console.log("----------------------------------------");
    console.log(afterVerification);
    console.log("----------------------------------------\n");

    // --------------------------------------------------
    // FINAL RESULT
    // --------------------------------------------------

    console.log("========================================");
    console.log("CAMPAIGN VERIFICATION TEST COMPLETED");
    console.log("========================================\n");
}

main().catch((error) => {
    console.error("\nTEST FAILED");
    console.error(error);
    process.exit(1);
});