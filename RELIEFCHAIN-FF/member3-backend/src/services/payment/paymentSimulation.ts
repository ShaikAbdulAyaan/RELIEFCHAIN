import { randomUUID } from "crypto";

export type PaymentStatus = "CREATED" | "PROCESSING" | "SUCCESS" | "FAILED";

export interface SimulatedPayment {
  paymentId: string;
  donationId: string;
  campaignId: string;
  donorId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: "RELIEFCHAIN_SIMULATOR";
  createdAt: string;
  processedAt?: string;
}

export function createSimulatedPayment(input: Omit<SimulatedPayment, "paymentId" | "status" | "provider" | "createdAt" | "processedAt">): SimulatedPayment {
  if (!input.donationId || !input.campaignId || !input.donorId) throw new Error("donationId, campaignId and donorId are required");
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error("amount must be greater than zero");
  return { ...input, paymentId: randomUUID(), status: "CREATED", provider: "RELIEFCHAIN_SIMULATOR", createdAt: new Date().toISOString() };
}

export function processSimulatedPayment(payment: SimulatedPayment, forceFailure = false): SimulatedPayment {
  return { ...payment, status: forceFailure ? "FAILED" : "SUCCESS", processedAt: new Date().toISOString() };
}
