import { Request, Response } from "express";
import { prisma } from "../config/database";

export async function createVehicle(
  req: Request,
  res: Response
) {
  try {
    const {
      vehicleNumber,
      driverId,
      driverName,
      driverPhone,
      licenseNumber,
      status,
    } = req.body;

    if (!vehicleNumber) {
      return res.status(400).json({
        success: false,
        message: "vehicleNumber is required",
      });
    }

    const existingVehicle = await prisma.vehicle.findUnique({
      where: {
        vehicleNumber,
      },
    });

    if (existingVehicle) {
      return res.status(409).json({
        success: false,
        message: "Vehicle with this number already exists",
      });
    }

    if (driverId) {
      const driver = await prisma.user.findUnique({
        where: {
          id: driverId,
        },
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Driver not found",
        });
      }
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleNumber,
        driverId: driverId || null,
        driverName: driverName || null,
        driverPhone: driverPhone || null,
        licenseNumber: licenseNumber || null,
        status: status || "AVAILABLE",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("Create vehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create vehicle",
    });
  }
}

export async function getVehicles(
  req: Request,
  res: Response
) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    console.error("Get vehicles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicles",
    });
  }
}

export async function getVehicleById(
  req: Request,
  res: Response
) {
  try {
    const vehicleId = String(req.params.id);

    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id: vehicleId,
      },
      include: {
        deliveries: true,
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("Get vehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle",
    });
  }
}

export async function updateVehicle(
  req: Request,
  res: Response
) {
  try {
    const vehicleId = String(req.params.id);

    const {
      driverId,
      driverName,
      driverPhone,
      licenseNumber,
      status,
    } = req.body;

    const existingVehicle = await prisma.vehicle.findUnique({
      where: {
        id: vehicleId,
      },
    });

    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    if (driverId) {
      const driver = await prisma.user.findUnique({
        where: {
          id: driverId,
        },
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Driver not found",
        });
      }
    }

    const vehicle = await prisma.vehicle.update({
      where: {
        id: vehicleId,
      },
      data: {
        driverId:
          driverId !== undefined
            ? driverId || null
            : undefined,

        driverName:
          driverName !== undefined
            ? driverName || null
            : undefined,

        driverPhone:
          driverPhone !== undefined
            ? driverPhone || null
            : undefined,

        licenseNumber:
          licenseNumber !== undefined
            ? licenseNumber || null
            : undefined,

        status:
          status !== undefined
            ? status
            : undefined,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("Update vehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle",
    });
  }
}