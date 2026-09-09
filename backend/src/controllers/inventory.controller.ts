import { Request, Response } from "express";
import { prisma } from "../config/database";

export const createInventory = async (req: Request, res: Response) => {
  try {
    const { warehouseId, item, quantity, unit, minimumRequired } = req.body;
    const numericQuantity = Number(quantity);
    const numericMinimum =
      minimumRequired !== undefined ? Number(minimumRequired) : 0;

    if (
      !warehouseId ||
      !item ||
      !Number.isFinite(numericQuantity) ||
      numericQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "warehouseId, item and a valid non-negative quantity are required",
      });
    }

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: String(warehouseId) },
    });

    if (!warehouse) {
      return res.status(404).json({ success: false, message: "Warehouse not found" });
    }

    const inventory = await prisma.inventory.create({
      data: {
        warehouseId: String(warehouseId),
        item: String(item),
        quantity: numericQuantity,
        unit: unit ? String(unit) : undefined,
        minimumRequired:
          Number.isFinite(numericMinimum) && numericMinimum >= 0
            ? numericMinimum
            : 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Inventory created successfully",
      data: inventory,
    });
  } catch (error) {
    console.error("Create inventory error:", error);
    return res.status(500).json({ success: false, message: "Failed to create inventory" });
  }
};

export const getInventory = async (_req: Request, res: Response) => {
  try {
    const inventory = await prisma.inventory.findMany({
      include: { warehouse: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    console.error("Get inventory error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch inventory" });
  }
};

export const updateInventory = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { quantity, minimumRequired, item, unit } = req.body;

    const existing = await prisma.inventory.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Inventory not found" });
    }

    const updated = await prisma.inventory.update({
      where: { id },
      data: {
        quantity:
          quantity !== undefined ? Number(quantity) : undefined,
        minimumRequired:
          minimumRequired !== undefined ? Number(minimumRequired) : undefined,
        item: item !== undefined ? String(item) : undefined,
        unit: unit !== undefined ? String(unit) : undefined,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update inventory error:", error);
    return res.status(500).json({ success: false, message: "Failed to update inventory" });
  }
};
