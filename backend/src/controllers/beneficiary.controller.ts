import { Request, Response } from "express";
import { prisma } from "../config/database";

export const createBeneficiary = async (req: Request, res: Response) => {
  try {
    const {
      anonymousCode,
      campId,
      location,
      familySize,
      eligibility,
      aidHistory,
    } = req.body;

    if (!anonymousCode || !location || familySize === undefined) {
      return res.status(400).json({
        success: false,
        message: "anonymousCode, location and familySize are required",
      });
    }

    const existingBeneficiary = await prisma.beneficiary.findUnique({
      where: {
        anonymousCode: String(anonymousCode),
      },
    });

    if (existingBeneficiary) {
      return res.status(409).json({
        success: false,
        message: "Beneficiary with this anonymousCode already exists",
      });
    }

    const beneficiary = await prisma.beneficiary.create({
      data: {
        anonymousCode: String(anonymousCode),
        campId: campId ? String(campId) : undefined,
        location: String(location),
        familySize: Number(familySize),
        eligibility: eligibility ?? undefined,
        aidHistory: aidHistory ?? undefined,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Beneficiary created successfully",
      data: beneficiary,
    });
  } catch (error) {
    console.error("Create beneficiary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create beneficiary",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getBeneficiaries = async (
  _req: Request,
  res: Response
) => {
  try {
    const beneficiaries = await prisma.beneficiary.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        camp: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: beneficiaries,
    });
  } catch (error) {
    console.error("Get beneficiaries error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch beneficiaries",
    });
  }
};

export const getBeneficiaryById = async (
  req: Request,
  res: Response
) => {
  try {
    const beneficiaryId = String(req.params.id);

    const beneficiary = await prisma.beneficiary.findUnique({
      where: {
        id: beneficiaryId,
      },
      include: {
        camp: true,
        distributions: true,
      },
    });

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: "Beneficiary not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: beneficiary,
    });
  } catch (error) {
    console.error("Get beneficiary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch beneficiary",
    });
  }
};