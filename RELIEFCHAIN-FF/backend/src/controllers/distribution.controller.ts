import { Request, Response } from "express";
import { prisma } from "../config/database";
import {
  BatchStatus,
  DistributionStatus,
} from "@prisma/client";
import { blockchainService } from "../services/blockchain.service";

export const createDistribution = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      beneficiaryId,
      batchId,
      campId,
      item,
      quantity,
      gpsLatitude,
      gpsLongitude,
    } = req.body;

    const numericQuantity = Number(quantity);

    if (
      !beneficiaryId ||
      !batchId ||
      !item ||
      !Number.isInteger(numericQuantity) ||
      numericQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "beneficiaryId, batchId, item and positive integer quantity are required",
      });
    }

    const beneficiary = await prisma.beneficiary.findUnique({
      where: {
        id: String(beneficiaryId),
      },
      include: {
        distributions: true,
      },
    });

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: "Beneficiary not found",
      });
    }

    const duplicate = beneficiary.distributions.some(
      (distribution: {
        status: DistributionStatus;
        item: string;
      }) =>
        distribution.status === DistributionStatus.COMPLETED &&
        distribution.item.toLowerCase() ===
          String(item).toLowerCase()
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "Duplicate aid distribution detected for this beneficiary and item",
      });
    }

    if (campId) {
      const camp = await prisma.camp.findUnique({
        where: {
          id: String(campId),
        },
      });

      if (!camp) {
        return res.status(404).json({
          success: false,
          message: "Camp not found",
        });
      }
    }

    if (batchId) {
      const batch = await prisma.reliefBatch.findUnique({
        where: {
          id: String(batchId),
        },
      });

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      if (
        batch.item.toLowerCase() !==
        String(item).toLowerCase()
      ) {
        return res.status(400).json({
          success: false,
          message: "Distribution item does not match batch item",
        });
      }

      const existingDistributed =
        await prisma.distribution.aggregate({
          where: {
            batchId: String(batchId),
            status: DistributionStatus.COMPLETED,
          },
          _sum: {
            quantity: true,
          },
        });

      const alreadyDistributed = Number(
        existingDistributed._sum.quantity ?? 0
      );

      if (
        alreadyDistributed + numericQuantity >
        batch.quantity
      ) {
        return res.status(400).json({
          success: false,
          message: "Insufficient batch quantity",
        });
      }
    }

    /*
     * Create distribution directly with Prisma.
     *
     * This avoids the Prisma 6 transaction-client typing
     * problem that caused tx.distribution / tx.reliefBatch
     * errors.
     */

    const distribution = await prisma.distribution.create({
      data: {
        beneficiaryId: String(beneficiaryId),
        batchId: batchId
          ? String(batchId)
          : undefined,
        campId: campId
          ? String(campId)
          : undefined,
        item: String(item),
        quantity: numericQuantity,
        status: DistributionStatus.COMPLETED,
        gpsLatitude:
          gpsLatitude !== undefined
            ? Number(gpsLatitude)
            : undefined,
        gpsLongitude:
          gpsLongitude !== undefined
            ? Number(gpsLongitude)
            : undefined,
        distributedAt: new Date(),
      },
    });

    /*
     * Check whether the complete batch has now been distributed.
     */

    if (batchId) {
      const batch = await prisma.reliefBatch.findUnique({
        where: {
          id: String(batchId),
        },
      });

      if (batch) {
        const totalDistributed =
          await prisma.distribution.aggregate({
            where: {
              batchId: String(batchId),
              status: DistributionStatus.COMPLETED,
            },
            _sum: {
              quantity: true,
            },
          });

        const total = Number(
          totalDistributed._sum.quantity ?? 0
        );

        if (total >= batch.quantity) {
          await prisma.reliefBatch.update({
            where: {
              id: String(batchId),
            },
            data: {
              status: BatchStatus.DISTRIBUTED,
            },
          });
        }
      }
    }

    /*
     * Update beneficiary aid history.
     */

    const currentHistory =
      beneficiary.aidHistory &&
      typeof beneficiary.aidHistory === "object" &&
      !Array.isArray(beneficiary.aidHistory)
        ? beneficiary.aidHistory
        : {};

    await prisma.beneficiary.update({
      where: {
        id: beneficiary.id,
      },
      data: {
        aidHistory: {
          ...currentHistory,
          lastDistribution: {
            distributionId: distribution.id,
            item: distribution.item,
            quantity: distribution.quantity,
            distributedAt: distribution.distributedAt,
          },
        },
      },
    });

    /*
     * Blockchain proof.
     */

    let blockchain:
      | Awaited<
          ReturnType<
            typeof blockchainService.recordDistribution
          >
        >
      | null = null;

    try {
      blockchain =
        await blockchainService.recordDistribution({
          distributionId: distribution.id,
          beneficiaryId: distribution.beneficiaryId,
          batchId: distribution.batchId ?? undefined,
          item: distribution.item,
          quantity: distribution.quantity,
          timestamp: (
            distribution.distributedAt ??
            distribution.createdAt
          ).toISOString(),
        });

      await prisma.blockchainTransaction.create({
        data: {
          transactionHash: blockchain.transactionHash,
          blockNumber: blockchain.blockNumber,
          contractAddress: blockchain.contractAddress,
          network: blockchain.network,
          entityType: "DISTRIBUTION",
          entityId: distribution.id,
          distributionId: distribution.id,
        },
      });
    } catch (blockchainError) {
      console.error(
        "Distribution blockchain proof failed:",
        blockchainError
      );
    }

    return res.status(201).json({
      success: true,
      message: "Aid distributed successfully",
      data: {
        distribution,
        blockchain,
      },
    });
  } catch (error) {
    console.error(
      "Create distribution error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create distribution",
    });
  }
};

export const getDistributions = async (
  _req: Request,
  res: Response
) => {
  try {
    const distributions =
      await prisma.distribution.findMany({
        include: {
          beneficiary: true,
          batch: true,
          camp: true,
          blockchainTx: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      data: distributions,
    });
  } catch (error) {
    console.error(
      "Get distributions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch distributions",
    });
  }
};

export const getDistributionById = async (
  req: Request,
  res: Response
) => {
  try {
    const distribution =
      await prisma.distribution.findUnique({
        where: {
          id: String(req.params.id),
        },
        include: {
          beneficiary: true,
          batch: true,
          camp: true,
          blockchainTx: true,
        },
      });

    if (!distribution) {
      return res.status(404).json({
        success: false,
        message: "Distribution not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: distribution,
    });
  } catch (error) {
    console.error(
      "Get distribution error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch distribution",
    });
  }
};