import { Request, Response } from "express";
import { prisma } from "../config/database";
import {
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

export const simulatePayment = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      donationId,
      method,
    } = req.body;

    if (
      !donationId ||
      !Object.values(PaymentMethod).includes(
        method
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "donationId and a valid method are required",
      });
    }

    const donation =
      await prisma.donation.findUnique({
        where: {
          id: String(donationId),
        },
        include: {
          payment: true,
        },
      });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    let payment;

    if (donation.payment) {
      payment =
        await prisma.payment.update({
          where: {
            donationId: donation.id,
          },
          data: {
            method,
            status: PaymentStatus.SUCCESS,
            simulated: true,
          },
        });
    } else {
      payment =
        await prisma.payment.create({
          data: {
            donationId: donation.id,
            method,
            amount: donation.amount,
            status: PaymentStatus.SUCCESS,
            gatewayReference: `SIM-${Date.now()}`,
            simulated: true,
          },
        });
    }

    await prisma.donation.update({
      where: {
        id: donation.id,
      },
      data: {
        paymentMethod: method,
        status: PaymentStatus.SUCCESS,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Payment simulation successful",
      data: payment,
    });
  } catch (error) {
    console.error(
      "Simulate payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to simulate payment",
    });
  }
};

export const getPaymentById = async (
  req: Request,
  res: Response
) => {
  try {
    const payment =
      await prisma.payment.findUnique({
        where: {
          id: String(req.params.id),
        },
        include: {
          donation: true,
        },
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error(
      "Get payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
    });
  }
};