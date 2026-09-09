import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import morgan from "morgan";
import disasterRoutes from "./routes/disaster.routes";
import campaignRoutes from "./routes/campaign.routes";
import authRoutes from "./routes/auth.routes";
import donationRoutes from "./routes/donation.routes";
import paymentRoutes from "./routes/payment.routes";
import fundRoutes from "./routes/fund.routes";
import expenseRoutes from "./routes/expense.routes";
import inventoryRoutes from "./routes/inventory.routes";
import batchRoutes from "./routes/batch.routes";
import deliveryRoutes from "./routes/delivery.routes";
import distributionRoutes from "./routes/distribution.routes";
import vehicleRoutes from "./routes/vehicle.routes";
import beneficiaryRoutes from "./routes/beneficiary.routes";

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/api/disasters", disasterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/funds", fundRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/distributions", distributionRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/beneficiaries", beneficiaryRoutes);
// Home
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "RELIEFCHAIN Backend API is running",
    version: "1.0.0",
  });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    service: "RELIEFCHAIN Backend",
    status: "healthy",
  });
});

// Authentication
app.use("/api/auth", authRoutes);

export default app;