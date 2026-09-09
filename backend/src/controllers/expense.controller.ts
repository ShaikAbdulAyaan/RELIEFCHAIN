import { Request, Response } from "express";
import { createHash } from "crypto";
import { prisma } from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  ExpenseStatus,
  PaymentMethod,
} from "@prisma/client";
import { analyzeExpenseRisk } from "../services/ai.service";
import { blockchainService } from "../services/blockchain.service";

export const createExpense = async (
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
      campaignId,
      amount,
      category,
      supplier,
      date,
      paymentMethod,
      purpose,
      location,
      gpsLatitude,
      gpsLongitude,
      evidence,
      evidenceUrl,
    } = req.body;

    const numericAmount = Number(amount);

    if (
      !campaignId ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !category ||
      !purpose
    ) {
      return res.status(400).json({
        success: false,
        message:
          "campaignId, positive amount, category and purpose are required",
      });
    }

    if (
      paymentMethod !== undefined &&
      paymentMethod !== null &&
      !Object.values(PaymentMethod).includes(
        paymentMethod
      )
    ) {
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

    const expenseDate = date
      ? new Date(date)
      : new Date();

    if (Number.isNaN(expenseDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    const historical = await prisma.expense.findMany({
      where: {
        campaignId: String(campaignId),
      },
      select: {
        amount: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    const hasEvidence =
      Boolean(evidenceUrl) ||
      (Array.isArray(evidence) &&
        evidence.length > 0);

    const expense = await prisma.expense.create({
      data: {
        campaignId: String(campaignId),
        responsiblePersonId: req.user.id,
        amount: numericAmount,
        category: String(category),
        supplier: supplier
          ? String(supplier)
          : undefined,
        date: expenseDate,
        paymentMethod:
          paymentMethod ?? undefined,
        purpose: String(purpose),
        location: location
          ? String(location)
          : undefined,
        gpsLatitude:
          gpsLatitude !== undefined
            ? Number(gpsLatitude)
            : undefined,
        gpsLongitude:
          gpsLongitude !== undefined
            ? Number(gpsLongitude)
            : undefined,
        status: ExpenseStatus.PENDING,
        aiReasons: [],
      },
    });

    const ai = await analyzeExpenseRisk({
      expenseId: expense.id,
      campaignId: String(campaignId),
      amount: numericAmount,
      category: String(category),
      supplier: supplier
        ? String(supplier)
        : null,
      timestamp: expenseDate.toISOString(),
      evidenceAvailable: hasEvidence,
      historicalExpenses: historical.map(
        (item: { amount: unknown }) =>
          Number(item.amount)
      ),
      location: location
        ? String(location)
        : null,
    });

    const updatedExpense =
      await prisma.expense.update({
        where: {
          id: expense.id,
        },
        data: {
          riskScore: ai.riskScore,
          riskLevel: ai.riskLevel,
          aiReasons: ai.reasons,
        },
      });

    if (ai.generatedAlert) {
      await prisma.alert.create({
        data: {
          type: ai.generatedAlert.alertType,
          message: ai.generatedAlert.message,
          riskScore: ai.riskScore,
          reasons: ai.reasons,
          expenseId: expense.id,
        },
      });
    }

    let blockchain = null;

    const hashSource =
      typeof evidence === "string"
        ? evidence
        : evidenceUrl
          ? String(evidenceUrl)
          : `${expense.id}:${expense.amount}:${expense.date.toISOString()}`;

    const evidenceHash = createHash("sha256")
      .update(hashSource)
      .digest("hex");

    try {
      blockchain =
        await blockchainService.recordExpenseProof({
          expenseId: expense.id,
          campaignId: String(campaignId),
          evidenceHash,
        });

      await prisma.blockchainTransaction.create({
        data: {
          transactionHash:
            blockchain.transactionHash,
          blockNumber: blockchain.blockNumber,
          contractAddress:
            blockchain.contractAddress,
          network: blockchain.network,
          entityType: "EXPENSE",
          entityId: expense.id,
          expenseId: expense.id,
          campaignId: String(campaignId),
        },
      });
    } catch (blockchainError) {
      console.error(
        "Expense blockchain proof failed:",
        blockchainError
      );
    }

    return res.status(201).json({
      success: true,
      message: "Expense created and analyzed",
      data: {
        expense: updatedExpense,
        risk: ai,
        evidenceHash,
        blockchain,
      },
    });
  } catch (error) {
    console.error(
      "Create expense error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create expense",
    });
  }
};

export const getExpenses = async (
  _req: Request,
  res: Response
) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        campaign: true,
        responsiblePerson: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        evidence: true,
        alerts: true,
        blockchainTx: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error(
      "Get expenses error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
    });
  }
};

export const getExpenseById = async (
  req: Request,
  res: Response
) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: {
        id: String(req.params.id),
      },
      include: {
        campaign: true,
        responsiblePerson: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        evidence: true,
        alerts: true,
        blockchainTx: true,
      },
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error(
      "Get expense error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expense",
    });
  }
};

export const updateExpense = async (
  req: Request,
  res: Response
) => {
  try {
    const expenseId = String(
      req.params.id
    );

    const existing =
      await prisma.expense.findUnique({
        where: {
          id: expenseId,
        },
      });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const {
      status,
      supplier,
      purpose,
      location,
      gpsLatitude,
      gpsLongitude,
    } = req.body;

    const validStatuses =
      Object.values(ExpenseStatus);

    if (
      status !== undefined &&
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense status",
      });
    }

    const expense = await prisma.expense.update({
      where: {
        id: expenseId,
      },
      data: {
        status,
        supplier:
          supplier !== undefined
            ? String(supplier)
            : undefined,
        purpose:
          purpose !== undefined
            ? String(purpose)
            : undefined,
        location:
          location !== undefined
            ? String(location)
            : undefined,
        gpsLatitude:
          gpsLatitude !== undefined
            ? Number(gpsLatitude)
            : undefined,
        gpsLongitude:
          gpsLongitude !== undefined
            ? Number(gpsLongitude)
            : undefined,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });
  } catch (error) {
    console.error(
      "Update expense error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update expense",
    });
  }
};