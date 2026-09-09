import { expect } from "chai";
import { sha256Hex, sha256Bytes32, keccakId, normalizeBytes32Hash } from "../utils/hash.js";
import { getTransactionExplorerUrl } from "../utils/explorer.js";
import { createPayment, processPayment, buildDonationProofPayload } from "../utils/paymentSimulation.js";
import { validateUpload, safeCompare } from "../utils/security.js";

describe("Member 3 utilities", function () {
  it("hashes evidence deterministically", function () {
    expect(sha256Hex("abc")).to.equal("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(sha256Bytes32("abc")).to.match(/^0x[0-9a-f]{64}$/);
    expect(keccakId("campaign-1")).to.match(/^0x[0-9a-f]{64}$/);
    expect(normalizeBytes32Hash("0x" + "ab".repeat(32))).to.equal("0x" + "ab".repeat(32));
  });

  it("builds explorer links only for known networks", function () {
    expect(getTransactionExplorerUrl("0xabc", "sepolia")).to.equal("https://sepolia.etherscan.io/tx/0xabc");
    expect(getTransactionExplorerUrl("0xabc", "hardhat")).to.equal(null);
  });

  it("simulates successful and failed payments", function () {
    const p = createPayment({ donationId: "d1", campaignId: "c1", donorId: "u1", amount: 500 });
    expect(processPayment(p).status).to.equal("SUCCESS");
    const failed = processPayment(createPayment({ donationId: "d2", campaignId: "c1", donorId: "u1", amount: 1, shouldFail: true }));
    expect(failed.status).to.equal("FAILED");
  });

  it("creates a donation proof payload from successful payment", function () {
    const p = processPayment(createPayment({ donationId: "d1", campaignId: "c1", donorId: "u1", amount: 500 }));
    const proof = buildDonationProofPayload(p, "0x000000000000000000000000000000000000dEaD");
    expect(proof.donationId).to.equal("d1");
    expect(proof.amount).to.equal(500);
  });

  it("hardens basic security helpers", function () {
    expect(safeCompare("secret", "secret")).to.equal(true);
    expect(safeCompare("secret", "wrong")).to.equal(false);
    expect(() => validateUpload({ mimetype: "application/pdf", sizeBytes: 10, allowedMimeTypes: ["application/pdf"], maxBytes: 100 })).not.to.throw();
    expect(() => validateUpload({ mimetype: "text/html", sizeBytes: 10, allowedMimeTypes: ["application/pdf"], maxBytes: 100 })).to.throw();
  });
});
