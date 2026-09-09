import { Request, Response } from "express";
import { prisma } from "../config/database";
import { ExpenseStatus } from "@prisma/client";

export const allocateFunds = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      campaignId,
      amount,
      category,
      purpose,
    } = req.body;

    const numericAmount = Number(amount);

    if (
      !campaignId ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message:
          "campaignId, positive amount and category are required",
      });
    }

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: String(campaignId),
      },
      include: {
        fundAllocations: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    const allocated =
      campaign.fundAllocations.reduce<number>(
        (
          sum: number,
          item: { amount: unknown }
        ) => sum + Number(item.amount),
        0
      );

    const raised = Number(
      campaign.raisedAmount
    );

    if (
      allocated + numericAmount >
      raised
    ) {
      return res.status(400).json({
        success: false,
        message: `Insufficient unallocated funds. Available: ${Math.max(
          0,
          raised - allocated
        )}`,
      });
    }

    const allocation =
      await prisma.fundAllocation.create({
        data: {
          campaignId: String(campaignId),
          amount: numericAmount,
          category: String(category),
          purpose: purpose
            ? String(purpose)
            : undefined,
          status: ExpenseStatus.VERIFIED,
        },
      });

    return res.status(201).json({
      success: true,
      message: "Funds allocated successfully",
      data: allocation,
    });
  } catch (error) {
    console.error(
      "Allocate funds error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to allocate funds",
    });
  }
};

export const getCampaignFunds = async (
  req: Request,
  res: Response
) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: {
        id: String(req.params.id),
      },
      include: {
        fundAllocations: true,
        expenses: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    const raised = Number(
      campaign.raisedAmount
    );

    const allocated =
      campaign.fundAllocations.reduce<number>(
        (
          sum: number,
          item: { amount: unknown }
        ) => sum + Number(item.amount),
        0
      );

    const spent =
      campaign.expenses
        .filter(
          (expense: { status: string }) =>
            expense.status !== "REJECTED"
        )
        .reduce<number>(
          (
            sum: number,
            expense: { amount: unknown }
          ) =>
            sum + Number(expense.amount),
          0
        );

    return res.status(200).json({
      success: true,
      data: {
        campaignId: campaign.id,
        raised,
        allocated,
        spent,
        remaining: raised - spent,
        unallocated: raised - allocated,
      },
    });
  } catch (error) {
    console.error(
      "Get campaign funds error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch fund summary",
    });
  }
};

export const getAllocations = async (
  _req: Request,
  res: Response
) => {
  try {
    const allocations =
      await prisma.fundAllocation.findMany({
        include: {
          campaign: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      data: allocations,
    });
  } catch (error) {
    console.error(
      "Get allocations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch allocations",
    });
  }
};