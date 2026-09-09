import { randomUUID } from "node:crypto";
export const PAYMENT_STATUSES = Object.freeze({
  CREATED: "CREATED",
  PROCESSING: "PROCESSING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
});

export function createPayment({ donationId, campaignId, donorId, amount, currency = "INR", shouldFail = false }) {
  if (!donationId || !campaignId || !donorId) throw new Error("donationId, campaignId and donorId are required");
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) throw new Error("amount must be greater than zero");
  return {
    paymentId: randomUUID(), donationId, campaignId, donorId,
    amount: value, currency, status: PAYMENT_STATUSES.CREATED,
    provider: "RELIEFCHAIN_SIMULATOR", createdAt: new Date().toISOString(), shouldFail,
  };
}

export function processPayment(payment) {
  if (!payment?.paymentId) throw new Error("payment is required");
  const processed = { ...payment, status: payment.shouldFail ? PAYMENT_STATUSES.FAILED : PAYMENT_STATUSES.SUCCESS, processedAt: new Date().toISOString() };
  return processed;
}

export function buildDonationProofPayload(payment) {
  if (payment.status !== PAYMENT_STATUSES.SUCCESS) {
    throw new Error("Only successful payments can create donation proofs");
  }

  return {
    campaignId: payment.campaignId,
    donationId: payment.donationId,
    amount: payment.amount,
    timestamp: new Date(payment.processedAt).toISOString(),
  };
}
