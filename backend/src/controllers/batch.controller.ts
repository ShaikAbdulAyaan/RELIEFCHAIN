import { Request, Response } from "express";
import { prisma } from "../config/database";
import { BatchStatus } from "@prisma/client";
import { blockchainService } from "../services/blockchain.service";

export const createBatch = async (req: Request, res: Response) => {
  try {
    const {
      campaignId,
      batchCode,
      item,
      quantity,
      unit,
      originWarehouseId,
      destinationCampId,
    } = req.body;

    const numericQuantity = Number(quantity);

    if (
      !campaignId ||
      !batchCode ||
      !item ||
      !Number.isFinite(numericQuantity) ||
      numericQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "campaignId, batchCode, item and positive quantity are required",
      });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: String(campaignId) },
    });
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    if (originWarehouseId) {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: String(originWarehouseId) },
      });
      if (!warehouse) {
        return res.status(404).json({ success: false, message: "Origin warehouse not found" });
      }
    }

    if (destinationCampId) {
      const camp = await prisma.camp.findUnique({
        where: { id: String(destinationCampId) },
      });
      if (!camp) {
        return res.status(404).json({ success: false, message: "Destination camp not found" });
      }
    }

    const batch = await prisma.reliefBatch.create({
      data: {
        campaignId: String(campaignId),
        batchCode: String(batchCode),
        item: String(item),
        quantity: numericQuantity,
        unit: unit ? String(unit) : undefined,
        originWarehouseId: originWarehouseId
          ? String(originWarehouseId)
          : undefined,
        destinationCampId: destinationCampId
          ? String(destinationCampId)
          : undefined,
        status: BatchStatus.CREATED,
      },
    });

    let blockchain = null;

    try {
      blockchain = await blockchainService.createReliefBatch({
        batchId: batch.id,
        campaignId: batch.campaignId,
        batchCode: batch.batchCode,
        item: batch.item,
        quantity: batch.quantity,
        timestamp: batch.createdAt.toISOString(),
      });

      await prisma.blockchainTransaction.create({
        data: {
          transactionHash: blockchain.transactionHash,
          blockNumber: blockchain.blockNumber,
          contractAddress: blockchain.contractAddress,
          network: blockchain.network,
          entityType: "RELIEF_BATCH",
          entityId: batch.id,
          batchId: batch.id,
          campaignId: batch.campaignId,
        },
      });
    } catch (blockchainError) {
      console.error("Batch blockchain proof failed:", blockchainError);
    }

    return res.status(201).json({
      success: true,
      message: "Relief batch created successfully",
      data: { batch, blockchain },
    });
  } catch (error) {
    console.error("Create batch error:", error);
    return res.status(500).json({ success: false, message: "Failed to create batch" });
  }
};

export const getBatchById = async (req: Request, res: Response) => {
  try {
    const batch = await prisma.reliefBatch.findUnique({
      where: { id: String(req.params.id) },
      include: {
        campaign: true,
        originWarehouse: true,
        destinationCamp: true,
        deliveries: true,
        distributions: true,
        blockchainTx: true,
      },
    });

    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    return res.status(200).json({ success: true, data: batch });
  } catch (error) {
    console.error("Get batch error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch batch" });
  }
};

export const transferBatch = async (req: Request, res: Response) => {
  try {
    const batchId = String(req.params.id);
    const { status } = req.body;

    if (!Object.values(BatchStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${Object.values(BatchStatus).join(", ")}`,
      });
    }

    const batch = await prisma.reliefBatch.findUnique({ where: { id: batchId } });
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    const updated = await prisma.reliefBatch.update({
      where: { id: batchId },
      data: { status },
    });

    return res.status(200).json({
      success: true,
      message: "Batch status updated",
      data: updated,
    });
  } catch (error) {
    console.error("Transfer batch error:", error);
    return res.status(500).json({ success: false, message: "Failed to transfer batch" });
  }
};
