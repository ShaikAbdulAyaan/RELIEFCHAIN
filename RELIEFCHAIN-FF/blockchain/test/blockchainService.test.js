import { expect } from "chai";
import { ethers } from "ethers";

const hasExternalConfig = Boolean(process.env.RELIEFCHAIN_CONTRACT_ADDRESS);
const describeExternal = hasExternalConfig ? describe : describe.skip;

describeExternal("Blockchain Service (external localhost node)", function () {
  let service;

  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const campaignId = ethers.id(`SERVICE-CAMPAIGN-${suffix}`);
  const donationId = ethers.id(`SERVICE-DONATION-${suffix}`);

  before(async function () {
    service = await import("../services/blockchainService.js");
  });

  it("creates and verifies a campaign", async function () {
    const created = await service.createCampaign(campaignId, "ipfs://service-test");
    expect(created.transactionHash).to.match(/^0x[0-9a-fA-F]{64}$/);

    const beforeVerification = await service.getCampaign(campaignId);
    expect(beforeVerification.verified).to.equal(false);

    const verified = await service.verifyCampaign(campaignId);
    expect(verified.transactionHash).to.match(/^0x[0-9a-fA-F]{64}$/);

    const campaign = await service.getCampaign(campaignId);
    expect(campaign.campaignId).to.equal(campaignId);
    expect(campaign.metadataHash).to.equal("ipfs://service-test");
    expect(campaign.verified).to.equal(true);
  });

  it("records and reads a donation without donorAddress", async function () {
    const timestamp = Math.floor(Date.now() / 1000);
    const result = await service.recordDonation(campaignId, donationId, 5000, timestamp);
    expect(result.transactionHash).to.match(/^0x[0-9a-fA-F]{64}$/);
    expect(result.donationId).to.equal(donationId);
    expect(result.campaignId).to.equal(campaignId);

    const donation = await service.getDonation(donationId);
    expect(donation.donationId).to.equal(donationId);
    expect(donation.campaignId).to.equal(campaignId);
    expect(donation.amount).to.equal(5000n);
    expect(donation.timestamp).to.equal(BigInt(timestamp));
  });
});
