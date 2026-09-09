import { Request, Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";

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

    const campaign = await prisma.campaign.create({
      data: {
        title,
        description,
        disasterId: String(disasterId),
        organizationId: String(organizationId),
        createdById: req.user.id,
        location,
        severity,
        targetAmount: Number(targetAmount),
        deadline: new Date(deadline),
        requiredResources,
        beneficiaryCount:
          beneficiaryCount !== undefined
            ? Number(beneficiaryCount)
            : 0,
        expectedExpenses: expectedExpenses ?? undefined,
        documents: documents ?? undefined,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      data: campaign,
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