import { Request, Response } from "express";
import { prisma } from "../config/database";
import { DisasterType, Severity } from "@prisma/client";

export const createDisaster = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      type,
      severity,
      description,
      location,
      affectedPeople,
      requiredResources,
    } = req.body;

    // Basic validation
    if (
      !name ||
      !type ||
      !severity ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        message:
          "name, type, severity and location are required",
      });
    }

    // Validate disaster type
    if (
      !Object.values(DisasterType).includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid disaster type. Allowed values: ${Object.values(
          DisasterType
        ).join(", ")}`,
      });
    }

    // Validate severity
    if (
      !Object.values(Severity).includes(severity)
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid severity. Allowed values: ${Object.values(
          Severity
        ).join(", ")}`,
      });
    }

    // requiredResources must be an array
    const resources = Array.isArray(
      requiredResources
    )
      ? requiredResources.map((resource: unknown) =>
          String(resource)
        )
      : [];

    const disaster =
      await prisma.disaster.create({
        data: {
          name: String(name),
          type,
          severity,
          description: description
            ? String(description)
            : undefined,
          location: String(location),
          affectedPeople:
            affectedPeople !== undefined
              ? Number(affectedPeople)
              : 0,
          requiredResources: resources,
        },
      });

    return res.status(201).json({
      success: true,
      message: "Disaster created successfully",
      data: disaster,
    });
  } catch (error) {
    console.error(
      "========== CREATE DISASTER ERROR =========="
    );
    console.error(error);
    console.error(
      "============================================"
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create disaster",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};

export const getDisasters = async (
  _req: Request,
  res: Response
) => {
  try {
    const disasters =
      await prisma.disaster.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      data: disasters,
    });
  } catch (error) {
    console.error(
      "Get disasters error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch disasters",
    });
  }
};

export const getDisasterById = async (
  req: Request,
  res: Response
) => {
  try {
    const disaster =
      await prisma.disaster.findUnique({
        where: {
          id: String(req.params.id),
        },
        include: {
          campaigns: true,
          camps: true,
          warehouses: true,
          hospitals: true,
          zones: true,
          distributionPoints: true,
        },
      });

    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: "Disaster not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: disaster,
    });
  } catch (error) {
    console.error(
      "Get disaster by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch disaster",
    });
  }
};