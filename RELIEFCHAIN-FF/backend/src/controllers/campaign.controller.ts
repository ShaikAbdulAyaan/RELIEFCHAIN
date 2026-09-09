import { Request, Response } from "express";
import { createHash } from "crypto";
import { prisma } from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { blockchainService } from "../services/blockchain.service";

export const createCampaign = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const {
      title,
      description,
      disasterId,
      organizationId,
      location,
      severity,
      targetAmount,
      deadline,
      requiredResources,
      beneficiaryCount,
      expectedExpenses,
      documents,
    } = req.body;

    if (
      !title ||
      !description ||
      !disasterId ||
      !organizationId ||
      !location ||
      !severity ||
      targetAmount === undefined ||
      !deadline ||
      !Array.isArray(requiredResources)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "title, description, disasterId, organizationId, location, severity, targetAmount, deadline and requiredResources are required",
      });
    }

    const disaster = await prisma.disaster.findUnique({
      where: {
        id: String(disasterId),
      },
    });

    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: "Disaster not found",
      });
    }

    const organization = await prisma.organization.findUnique({
      where: {
        id: String(organizationId),
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const campaignDeadline = new Date(deadline);
    if (Number.isNaN(campaignDeadline.getTime())) {
      return res.status(400).json({
        success: false,
        message: "deadline must be a valid date",
      });
    }

    const numericTargetAmount = Number(targetAmount);
    if (!Number.isFinite(numericTargetAmount) || numericTargetAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "targetAmount must be a positive number",
      });
    }

    const campaign = await prisma.campaign.create({
      data: {
        title: String(title),
        description: String(description),
        disasterId: String(disasterId),
        organizationId: String(organizationId),
        createdById: req.user.id,
        location: String(location),
        severity,
        targetAmount: numericTargetAmount,
        deadline: campaignDeadline,
        requiredResources: requiredResources.map(String),
        beneficiaryCount:
          beneficiaryCount !== undefined
            ? Number(beneficiaryCount)
            : 0,
        expectedExpenses: expectedExpenses ?? undefined,
        documents: documents ?? undefined,
      },
    });

    let blockchain = null;
    try {
      const metadataHash = createHash("sha256")
        .update(JSON.stringify({
          campaignId: campaign.id,
          title: campaign.title,
          description: campaign.description,
          disasterId: campaign.disasterId,
          organizationId: campaign.organizationId,
          location: campaign.location,
          severity: campaign.severity,
          targetAmount: campaign.targetAmount.toString(),
          deadline: campaign.deadline.toISOString(),
          requiredResources: campaign.requiredResources,
        }))
        .digest("hex");

      blockchain = await blockchainService.createCampaign({
        campaignId: campaign.id,
        metadataHash,
      });

      await prisma.blockchainTransaction.create({
        data: {
          transactionHash: blockchain.transactionHash,
          blockNumber: blockchain.blockNumber,
          contractAddress: blockchain.contractAddress,
          network: blockchain.network,
          entityType: "CAMPAIGN_CREATED",
          entityId: campaign.id,
          campaignId: campaign.id,
        },
      });
    } catch (blockchainError) {
      console.error("Campaign blockchain proof failed:", blockchainError);
    }

    return res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      data: { campaign, blockchain },
    });
  } catch (error) {
    console.error("Create campaign error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create campaign",
    });
  }
};

export const getCampaigns = async (
  _req: Request,
  res: Response
) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        disaster: true,
        organization: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    console.error("Get campaigns error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns",
    });
  }
};

export const getCampaignById = async (
  req: Request,
  res: Response
) => {
  try {
    const campaignId = String(req.params.id);

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
      },
      include: {
        disaster: true,
        organization: true,
        donations: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error("Get campaign error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaign",
    });
  }
};