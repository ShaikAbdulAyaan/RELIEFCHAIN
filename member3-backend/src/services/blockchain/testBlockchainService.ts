import {
    createCampaignProof,
    getCampaignProof,
} from "./blockchainService";


async function main() {
    console.log("\n========================================");
    console.log("RELIEFCHAIN BLOCKCHAIN SERVICE TEST");
    console.log("========================================\n");

    const campaignId =
        `CAMPAIGN-TEST-${Date.now()}`;

    const metadataHash =
        "QmReliefChainCampaignTestHash";

    console.log("Campaign ID:");
    console.log(campaignId);

    console.log("\nCreating campaign proof...\n");

    const result =
        await createCampaignProof(
            campaignId,
            metadataHash
        );

    console.log("TRANSACTION SUCCESS");
    console.log("----------------------------------------");
    console.log("Transaction Hash:", result.transactionHash);
    console.log("Block Number:", result.blockNumber);
    console.log("Contract:", result.contractAddress);
    console.log("Network:", result.network);
    console.log("Entity Type:", result.entityType);
    console.log("Entity ID:", result.entityId);
    console.log("----------------------------------------");

    console.log("\nReading campaign from blockchain...\n");

    const campaign =
        await getCampaignProof(
            campaignId
        );

    console.log("CAMPAIGN DATA FROM BLOCKCHAIN");
    console.log("----------------------------------------");
    console.log(campaign);
    console.log("----------------------------------------");

    console.log("\nTEST COMPLETED SUCCESSFULLY");
}


main().catch((error) => {
    console.error("\nTEST FAILED");
    console.error(error);
    process.exit(1);
});