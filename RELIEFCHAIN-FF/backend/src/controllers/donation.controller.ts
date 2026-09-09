import { Request, Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { blockchainService } from "../services/blockchain.service";

export const createDonation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const { campaignId, amount, paymentMethod } = req.body;

    const numericAmount = Number(amount);

    if (
      !campaignId ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "campaignId and a positive amount are required",
      });
    }

    if (!Object.values(PaymentMethod).includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `paymentMethod must be one of: ${Object.values(
          PaymentMethod
        ).join(", ")}`,
      });
    }

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: String(campaignId),
      },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    if (new Date(campaign.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Campaign deadline has passed",
      });
    }

    /*
     * Create donation.
     *
     * We intentionally use the main Prisma client instead of
     * prisma.$transaction() because the generated Prisma 6
     * transaction client in this project is not exposing the
     * model properties correctly.
     */

    const donation = await prisma.donation.create({
      data: {
        campaignId: String(campaignId),
        donorId: req.user.id,
        amount: numericAmount,
        paymentMethod,
        status: PaymentStatus.SUCCESS,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        donationId: donation.id,
        method: paymentMethod,
        amount: numericAmount,
        status: PaymentStatus.SUCCESS,
        gatewayReference: `SIM-${Date.now()}-${donation.id.slice(0, 8)}`,
        simulated: true,
      },
    });

    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: String(campaignId),
      },
      data: {
        raisedAmount: {
          increment: numericAmount,
        },
      },
    });

    let blockchain:
      | Awaited<ReturnType<typeof blockchainService.recordDonation>>
      | null = null;

    try {
      blockchain = await blockchainService.recordDonation({
        donationId: donation.id,
        campaignId: donation.campaignId,
        amount: numericAmount,
        timestamp: new Date().toISOString(),
      });

      await prisma.blockchainTransaction.create({
        data: {
          transactionHash: blockchain.transactionHash,
          blockNumber: blockchain.blockNumber,
          contractAddress: blockchain.contractAddress,
          network: blockchain.network,
          entityType: "DONATION",
          entityId: donation.id,
          donationId: donation.id,
          campaignId: donation.campaignId,
        },
      });
    } catch (blockchainError) {
      console.error(
        "Donation blockchain proof failed:",
        blockchainError
      );
    }

    return res.status(201).json({
      success: true,
      message: "Donation successful",
      data: {
        donation,
        payment,
        campaignRaisedAmount: updatedCampaign.raisedAmount,
        blockchain,
      },
    });
  } catch (error) {
    console.error("Create donation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create donation",
    });
  }
};

export const getDonations = async (
  _req: Request,
  res: Response
) => {
  try {
    const donations = await prisma.donation.findMany({
      include: {
        campaign: true,
        payment: true,
        blockchainTx: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: donations,
    });
  } catch (error) {
    console.error("Get donations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch donations",
    });
  }
};

export const getDonationById = async (
  req: Request,
  res: Response
) => {
  try {
    const donation = await prisma.donation.findUnique({
      where: {
        id: String(req.params.id),
      },
      include: {
        campaign: true,
        payment: true,
        blockchainTx: true,
      },
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    console.error("Get donation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch donation",
    });
  }
};