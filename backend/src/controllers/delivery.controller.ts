import { Request, Response } from "express";
import { prisma } from "../config/database";
import {
  DeliveryStatus,
  BatchStatus,
} from "@prisma/client";

/**
 * Create a new delivery
 * POST /api/deliveries
 */
export async function createDelivery(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const {
      batchId,
      vehicleId,
      originWarehouseId,
      destinationCampId,
      origin,
      destination,
      cargoQuantity,
      departure,
    } = req.body;

    // Basic validation
    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: "batchId is required",
      });
    }

    if (!origin) {
      return res.status(400).json({
        success: false,
        message: "origin is required",
      });
    }

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: "destination is required",
      });
    }

    if (
      cargoQuantity === undefined ||
      cargoQuantity === null ||
      Number(cargoQuantity) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "cargoQuantity must be greater than 0",
      });
    }

    const quantity = Number(cargoQuantity);

    // Check batch
    const batch = await prisma.reliefBatch.findUnique({
      where: {
        id: String(batchId),
      },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Relief batch not found",
      });
    }

    // Check cargo quantity
    if (quantity > batch.quantity) {
      return res.status(400).json({
        success: false,
        message: `Cargo quantity cannot exceed batch quantity (${batch.quantity})`,
      });
    }

    // Check vehicle if supplied
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: {
          id: String(vehicleId),
        },
      });

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: "Vehicle not found",
        });
      }
    }

    // Check warehouse if supplied
    if (originWarehouseId) {
      const warehouse = await prisma.warehouse.findUnique({
        where: {
          id: String(originWarehouseId),
        },
      });

      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: "Origin warehouse not found",
        });
      }
    }

    // Check destination camp if supplied
    if (destinationCampId) {
      const camp = await prisma.camp.findUnique({
        where: {
          id: String(destinationCampId),
        },
      });

      if (!camp) {
        return res.status(404).json({
          success: false,
          message: "Destination camp not found",
        });
      }
    }

    // Create delivery
    const delivery = await prisma.delivery.create({
      data: {
        batchId: String(batchId),
        vehicleId: vehicleId
          ? String(vehicleId)
          : undefined,
        originWarehouseId: originWarehouseId
          ? String(originWarehouseId)
          : undefined,
        destinationCampId: destinationCampId
          ? String(destinationCampId)
          : undefined,
        origin: String(origin),
        destination: String(destination),
        cargoQuantity: quantity,
        departure: departure
          ? new Date(departure)
          : new Date(),
        status: DeliveryStatus.CREATED,
      },
      include: {
        batch: true,
        vehicle: true,
        originWarehouse: true,
        destinationCamp: true,
      },
    });

    // Update batch status
    await prisma.reliefBatch.update({
      where: {
        id: String(batchId),
      },
      data: {
        status: BatchStatus.DISPATCHED,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Delivery created successfully",
      data: delivery,
    });
  } catch (error) {
    console.error("Create delivery error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create delivery",
    });
  }
}

/**
 * Get all deliveries
 * GET /api/deliveries
 */
export async function getDeliveries(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const deliveries = await prisma.delivery.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        batch: true,
        vehicle: true,
        originWarehouse: true,
        destinationCamp: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: deliveries,
    });
  } catch (error) {
    console.error("Get deliveries error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch deliveries",
    });
  }
}

/**
 * Get one delivery by ID
 * GET /api/deliveries/:id
 */
export async function getDeliveryById(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    // IMPORTANT:
    // Convert Express route parameter to string
    const deliveryId: string = String(req.params.id);

    const delivery = await prisma.delivery.findUnique({
      where: {
        id: deliveryId,
      },
      include: {
        batch: true,
        vehicle: true,
        originWarehouse: true,
        destinationCamp: true,
      },
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    console.error("Get delivery by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch delivery",
    });
  }
}

/**
 * Update delivery status
 * PUT /api/deliveries/:id/status
 */
export async function updateDeliveryStatus(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    // IMPORTANT:
    // Force route parameter to string
    const deliveryId: string = String(req.params.id);

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required",
      });
    }

    const validStatuses = Object.values(DeliveryStatus);

    if (!validStatuses.includes(status as DeliveryStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid delivery status. Allowed values: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    const existingDelivery = await prisma.delivery.findUnique({
      where: {
        id: deliveryId,
      },
    });

    if (!existingDelivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    const deliveryStatus = status as DeliveryStatus;

    // Set arrival time when delivery arrives or is delivered
    const arrivalTime =
      deliveryStatus === DeliveryStatus.ARRIVED ||
      deliveryStatus === DeliveryStatus.DELIVERED
        ? new Date()
        : undefined;

    const updatedDelivery = await prisma.delivery.update({
      where: {
        id: deliveryId,
      },
      data: {
        status: deliveryStatus,
        arrival: arrivalTime,
      },
      include: {
        batch: true,
        vehicle: true,
        originWarehouse: true,
        destinationCamp: true,
      },
    });

    // Update related batch status
    if (deliveryStatus === DeliveryStatus.IN_TRANSIT) {
      await prisma.reliefBatch.update({
        where: {
          id: String(existingDelivery.batchId),
        },
        data: {
          status: BatchStatus.IN_TRANSIT,
        },
      });
    }

    if (
      deliveryStatus === DeliveryStatus.ARRIVED ||
      deliveryStatus === DeliveryStatus.DELIVERED
    ) {
      await prisma.reliefBatch.update({
        where: {
          id: String(existingDelivery.batchId),
        },
        data: {
          status: BatchStatus.RECEIVED,
        },
      });
    }

    if (deliveryStatus === DeliveryStatus.CANCELLED) {
      // Keep batch status unchanged when delivery is cancelled.
    }

    return res.status(200).json({
      success: true,
      message: "Delivery status updated successfully",
      data: updatedDelivery,
    });
  } catch (error) {
    console.error("Update delivery status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update delivery status",
    });
  }
}

/**
 * Update delivery GPS location
 * POST /api/deliveries/:id/location
 */
export async function updateDeliveryLocation(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    // IMPORTANT:
    // Force route parameter to string
    const deliveryId: string = String(req.params.id);

    const { latitude, longitude } = req.body;

    if (
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null
    ) {
      return res.status(400).json({
        success: false,
        message: "latitude and longitude are required",
      });
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({
        success: false,
        message: "latitude and longitude must be valid numbers",
      });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "latitude must be between -90 and 90",
      });
    }

    if (lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: "longitude must be between -180 and 180",
      });
    }

    const existingDelivery = await prisma.delivery.findUnique({
      where: {
        id: deliveryId,
      },
    });

    if (!existingDelivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    // If delivery has not started, mark it IN_TRANSIT
    const newStatus =
      existingDelivery.status === DeliveryStatus.CREATED
        ? DeliveryStatus.IN_TRANSIT
        : existingDelivery.status;

    const updatedDelivery = await prisma.delivery.update({
      where: {
        id: deliveryId,
      },
      data: {
        latitude: lat,
        longitude: lon,
        status: newStatus,
      },
      include: {
        batch: true,
        vehicle: true,
        originWarehouse: true,
        destinationCamp: true,
      },
    });

    // Update batch status
    if (newStatus === DeliveryStatus.IN_TRANSIT) {
      await prisma.reliefBatch.update({
        where: {
          id: String(existingDelivery.batchId),
        },
        data: {
          status: BatchStatus.IN_TRANSIT,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Delivery location updated successfully",
      data: updatedDelivery,
    });
  } catch (error) {
    console.error("Update delivery location error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update delivery location",
    });
  }
}