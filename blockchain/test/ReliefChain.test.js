import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

const WAREHOUSE = 1n;
const TRUCK = 2n;
const CAMP = 3n;

function now() {
  return BigInt(Math.floor(Date.now() / 1000));
}

async function deployFixture() {
  const [admin, system, ngo, auditor, user] = await ethers.getSigners();
  const ReliefChain = await ethers.getContractFactory("ReliefChain");
  const reliefChain = await ReliefChain.deploy(admin.address);
  await reliefChain.waitForDeployment();

  await reliefChain.connect(admin).grantSystemRole(system.address);
  await reliefChain.connect(admin).grantNgoRole(ngo.address);
  await reliefChain.connect(admin).grantAuditorRole(auditor.address);

  return { reliefChain, admin, system, ngo, auditor, user };
}

async function createVerifiedCampaign(reliefChain, system, admin, label = "CAMPAIGN") {
  const campaignId = ethers.id(`${label}-${Date.now()}-${Math.random()}`);
  await reliefChain.connect(system).createCampaign(campaignId, `ipfs://${label.toLowerCase()}`);
  await reliefChain.connect(admin).verifyCampaign(campaignId);
  return campaignId;
}

async function createBatchAtCamp(reliefChain, system, campaignId, label = "BATCH") {
  const batchId = ethers.id(`${label}-${Date.now()}-${Math.random()}`);
  const timestamp = now();
  await reliefChain.connect(system).createReliefBatch(
    batchId,
    campaignId,
    `RC-${label}-001`,
    "Food Packets",
    500,
    timestamp
  );
  await reliefChain.connect(system).transferReliefBatch(batchId, TRUCK);
  await reliefChain.connect(system).transferReliefBatch(batchId, CAMP);
  return { batchId, timestamp };
}

describe("ReliefChain", function () {
  it("deploys with the admin roles configured", async function () {
    const { reliefChain, admin } = await deployFixture();
    expect(await reliefChain.hasRole(await reliefChain.DEFAULT_ADMIN_ROLE(), admin.address)).to.equal(true);
    expect(await reliefChain.hasRole(await reliefChain.ADMIN_ROLE(), admin.address)).to.equal(true);
  });

  it("grants and revokes application roles", async function () {
    const { reliefChain, admin, user } = await deployFixture();
    await reliefChain.connect(admin).grantSystemRole(user.address);
    expect(await reliefChain.hasRole(await reliefChain.SYSTEM_ROLE(), user.address)).to.equal(true);
    await reliefChain.connect(admin).revokeSystemRole(user.address);
    expect(await reliefChain.hasRole(await reliefChain.SYSTEM_ROLE(), user.address)).to.equal(false);
  });

  it("creates and verifies a campaign", async function () {
    const { reliefChain, admin, system } = await deployFixture();
    const campaignId = ethers.id("CAMPAIGN-TEST");
    await expect(reliefChain.connect(system).createCampaign(campaignId, "ipfs://campaign"))
      .to.emit(reliefChain, "CampaignCreated");
    await expect(reliefChain.connect(admin).verifyCampaign(campaignId))
      .to.emit(reliefChain, "CampaignVerified");
    const campaign = await reliefChain.getCampaign(campaignId);
    expect(campaign.campaignId).to.equal(campaignId);
    expect(campaign.verified).to.equal(true);
    expect(campaign.exists).to.equal(true);
  });

  it("blocks unauthorized campaign creation", async function () {
    const { reliefChain, user } = await deployFixture();
    await expect(
      reliefChain.connect(user).createCampaign(ethers.id("NOPE"), "ipfs://nope")
    ).to.be.revertedWithCustomError(reliefChain, "AccessControlUnauthorizedAccount");
  });

  it("records a donation without a donor field", async function () {
    const { reliefChain, system, admin } = await deployFixture();
    const campaignId = await createVerifiedCampaign(reliefChain, system, admin);
    const donationId = ethers.id("DONATION-TEST");
    const timestamp = now();
    await expect(reliefChain.connect(system).recordDonation(campaignId, donationId, 10000, timestamp))
      .to.emit(reliefChain, "DonationReceived")
      .withArgs(campaignId, donationId, 10000n, timestamp);
    const donation = await reliefChain.getDonation(donationId);
    expect(donation.campaignId).to.equal(campaignId);
    expect(donation.amount).to.equal(10000n);
    expect(donation.timestamp).to.equal(timestamp);
    expect(donation.exists).to.equal(true);
  });

  it("rejects a donation to an unverified campaign", async function () {
    const { reliefChain, system } = await deployFixture();
    const campaignId = ethers.id("UNVERIFIED-CAMPAIGN");
    const donationId = ethers.id("DONATION-UNVERIFIED");
    await reliefChain.connect(system).createCampaign(campaignId, "ipfs://campaign");
    await expect(
      reliefChain.connect(system).recordDonation(campaignId, donationId, 1000, now())
    ).to.be.revertedWith("Campaign not verified");
  });

  it("blocks donation calls from unauthorized accounts", async function () {
    const { reliefChain, system, admin, user } = await deployFixture();
    const campaignId = await createVerifiedCampaign(reliefChain, system, admin);
    await expect(
      reliefChain.connect(user).recordDonation(campaignId, ethers.id("DONATION-UNAUTHORIZED"), 1000, now())
    ).to.be.revertedWithCustomError(reliefChain, "AccessControlUnauthorizedAccount");
  });

  it("records fund allocation", async function () {
    const { reliefChain, system, admin } = await deployFixture();
    const campaignId = await createVerifiedCampaign(reliefChain, system, admin);
    const allocationId = ethers.id("ALLOCATION-TEST");
    await expect(reliefChain.connect(system).recordFundAllocation(campaignId, allocationId, 3000))
      .to.emit(reliefChain, "FundAllocated");
    const allocation = await reliefChain.getFundAllocation(allocationId);
    expect(allocation.campaignId).to.equal(campaignId);
    expect(allocation.amount).to.equal(3000n);
    expect(allocation.exists).to.equal(true);
  });

  it("creates a relief batch with explicit batch fields", async function () {
    const { reliefChain, system, admin } = await deployFixture();
    const campaignId = await createVerifiedCampaign(reliefChain, system, admin);
    const batchId = ethers.id("BATCH-TEST");
    const timestamp = now();
    await expect(reliefChain.connect(system).createReliefBatch(
      batchId, campaignId, "RC-KERALA-FOOD-001", "Food Packets", 500, timestamp
    )).to.emit(reliefChain, "ReliefBatchCreated")
      .withArgs(batchId, campaignId, "RC-KERALA-FOOD-001", "Food Packets", 500n, timestamp);
    const batch = await reliefChain.getReliefBatch(batchId);
    expect(batch.batchCode).to.equal("RC-KERALA-FOOD-001");
    expect(batch.item).to.equal("Food Packets");
    expect(batch.quantity).to.equal(500n);
    expect(batch.timestamp).to.equal(timestamp);
    expect(batch.location).to.equal(WAREHOUSE);
  });

  it("moves a batch sequentially from warehouse to truck to camp", async function () {
    const { reliefChain, system, admin } = await deployFixture();
    const campaignId = await createVerifiedCampaign(reliefChain, system, admin);
    const { batchId } = await createBatchAtCamp(reliefChain, system, campaignId);
    const batch = await reliefChain.getReliefBatch(batchId);
    expect(batch.location).to.equal(CAMP);
  });

  it("rejects an invalid batch movement", async function () {
    const { reliefChain, system, admin } = await deployFixture();
    const campaignId = await createVerifiedCampaign(reliefChain, system, admin);
    const batchId = ethers.id("BATCH-MOVEMENT");
    await reliefChain.connect(system).createReliefBatch(batchId, campaignId, "RC-MOVE-001", "Water", 100, now());
    await expect(reliefChain.connect(system).transferReliefBatch(batchId, CAMP))
      .to.be.revertedWith("Invalid batch movement");
  });

  it("records aid distribution only when the batch is at camp", async function () {
    const { reliefChain, system, admin } = await deployFixture();
    const campaignId = await createVerifiedCampaign(reliefChain, system, admin);
    const { batchId } = await createBatchAtCamp(reliefChain, system, campaignId);
    const distributionId = ethers.id("DISTRIBUTION-TEST");
    const beneficiaryHash = ethers.id("BENEFICIARY-TEST");
    const timestamp = now();
    await expect(reliefChain.connect(system).recordDistribution(
      distributionId, batchId, beneficiaryHash, "Food Packets", 5, timestamp
    )).to.emit(reliefChain, "AidDistributed");
    const distribution = await reliefChain.getDistribution(distributionId);
    expect(distribution.batchId).to.equal(batchId);
    expect(distribution.beneficiaryHash).to.equal(beneficiaryHash);
    expect(distribution.quantity).to.equal(5n);
  });

  it("records and verifies an expense proof", async function () {
    const { reliefChain, system, admin, auditor } = await deployFixture();
    const campaignId = await createVerifiedCampaign(reliefChain, system, admin);
    const expenseId = ethers.id("EXPENSE-TEST");
    const evidenceHash = ethers.id("EVIDENCE-TEST");
    await expect(reliefChain.connect(system).recordExpenseProof(expenseId, campaignId, evidenceHash))
      .to.emit(reliefChain, "ExpenseRecorded");
    await expect(reliefChain.connect(auditor).verifyExpense(expenseId))
      .to.emit(reliefChain, "ExpenseVerified");
    const expense = await reliefChain.getExpenseProof(expenseId);
    expect(expense.campaignId).to.equal(campaignId);
    expect(expense.evidenceHash).to.equal(evidenceHash);
    expect(expense.verified).to.equal(true);
  });

  it("records an auditor verification", async function () {
    const { reliefChain, auditor } = await deployFixture();
    const entityId = ethers.id("ENTITY-TEST");
    const entityType = ethers.id("CAMPAIGN");
    const verificationHash = ethers.id("VERIFICATION-TEST");
    await expect(reliefChain.connect(auditor).recordVerification(entityId, entityType, verificationHash))
      .to.emit(reliefChain, "VerificationRecorded");
    const verification = await reliefChain.getVerification(entityId);
    expect(verification.entityType).to.equal(entityType);
    expect(verification.verificationHash).to.equal(verificationHash);
    expect(verification.auditor).to.equal(auditor.address);
  });

  it("runs the complete relief lifecycle", async function () {
    const { reliefChain, admin, system, auditor } = await deployFixture();
    const campaignId = await createVerifiedCampaign(reliefChain, system, admin, "E2E-CAMPAIGN");
    const donationId = ethers.id("E2E-DONATION");
    await reliefChain.connect(system).recordDonation(campaignId, donationId, 50000, now());
    await reliefChain.connect(system).recordFundAllocation(campaignId, ethers.id("E2E-ALLOCATION"), 30000);
    const { batchId } = await createBatchAtCamp(reliefChain, system, campaignId, "E2E-BATCH");
    await reliefChain.connect(system).recordDistribution(
      ethers.id("E2E-DISTRIBUTION"), batchId, ethers.id("E2E-BENEFICIARY"), "Food Packets", 5, now()
    );
    const expenseId = ethers.id("E2E-EXPENSE");
    await reliefChain.connect(system).recordExpenseProof(expenseId, campaignId, ethers.id("E2E-EVIDENCE"));
    await reliefChain.connect(auditor).verifyExpense(expenseId);
    expect((await reliefChain.getExpenseProof(expenseId)).verified).to.equal(true);
  });
});
