import { expect } from "chai";
import { ethers } from "ethers";

const hasExternalConfig = Boolean(process.env.RELIEFCHAIN_CONTRACT_ADDRESS);
const describeExternal = hasExternalConfig ? describe : describe.skip;

describeExternal("Blockchain Adapter (external localhost node)", function () {
  let adapter;
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const campaignId = `adapter-campaign-${suffix}`;
  const donationId = `adapter-donation-${suffix}`;
  const allocationId = `adapter-allocation-${suffix}`;
  const batchId = `adapter-batch-${suffix}`;
  const distributionId = `adapter-distribution-${suffix}`;
  const expenseId = `adapter-expense-${suffix}`;

  before(async function () {
    adapter = await import("../integration/blockchainAdapter.js");
  });

  it("converts IDs to bytes32 deterministically", function () {
    const a = adapter.toBytes32Id(campaignId);
    const b = adapter.toBytes32Id(campaignId);
    expect(a).to.match(/^0x[0-9a-fA-F]{64}$/);
    expect(a).to.equal(b);
  });

  it("records campaign, donation and allocation proofs", async function () {
    const campaign = await adapter.createCampaignProof({
      campaignId,
      metadataHash: `ipfs://adapter-${suffix}`,
    });
    expect(campaign.transactionHash).to.match(/^0x[0-9a-fA-F]{64}$/);

    const verified = await adapter.verifyCampaignProof({ campaignId });
    expect(verified.transactionHash).to.match(/^0x[0-9a-fA-F]{64}$/);

    const donation = await adapter.recordDonationProof({
      campaignId,
      donationId,
      amount: 5000,
      timestamp: Math.floor(Date.now() / 1000),
    });
    expect(donation.transactionHash).to.match(/^0x[0-9a-fA-F]{64}$/);
    expect(donation).not.to.have.property("donorAddress");

    const allocation = await adapter.recordFundAllocationProof({
      campaignId,
      allocationId,
      amount: 3000,
    });
    expect(allocation.transactionHash).to.match(/^0x[0-9a-fA-F]{64}$/);
  });

  it("creates, moves and distributes a relief batch", async function () {
    const batch = await adapter.createReliefBatchProof({
      batchId,
      campaignId,
      batchCode: "RC-KERALA-FOOD-001",
      item: "Food Packets",
      quantity: 500,
      timestamp: Math.floor(Date.now() / 1000),
    });
    expect(batch.transactionHash).to.match(/^0x[0-9a-fA-F]{64}$/);

    const truck = await adapter.transferReliefBatchProof({ batchId, toLocation: 2 });
    expect(truck.transactionHash).to.match(/^0x[0-9a-fA-F]{64}$/);

    const camp = await adapter.transferReliefBatchProof({ batchId, toLocation: 3 });
    expect(camp.transactionHash).to.match(/^0x[0-9a-fA-F]{64}$/);

    const distribution = await adapter.recordDistributionProof({
      distributionId,
      beneficiaryId: `beneficiary-${suffix}`,
      batchId,
      item: "Food Packets",
      quantity: 5,
      timestamp: Math.floor(Date.now() / 1000),
    });
    expect(distribution.transactionHash).to.match(/^0x[0-9a-fA-F]{64}$/);
  });

  it("records and verifies an expense proof", async function () {
    const expense = await adapter.recordExpenseProofOnChain({
      expenseId,
      campaignId,
      evidenceHash: ethers.id(`expense-evidence-${suffix}`),
    });
    expect(expense.transactionHash).to.match(/^0x[0-9a-fA-F]{64}$/);

    const verified = await adapter.verifyExpenseProof({ expenseId });
    expect(verified.transactionHash).to.match(/^0x[0-9a-fA-F]{64}$/);
  });
});
