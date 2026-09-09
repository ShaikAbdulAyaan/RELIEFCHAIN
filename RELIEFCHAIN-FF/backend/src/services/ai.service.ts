import axios from "axios";
import { AlertType, RiskLevel } from "@prisma/client";

export interface ExpenseAIInput {
  expenseId: string;
  campaignId: string;
  amount: number;
  category: string;
  supplier?: string | null;
  timestamp: string;
  evidenceAvailable: boolean;
  historicalExpenses?: number[];
  location?: string | null;
}

export interface ExpenseAIResult {
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  generatedAlert?: {
    alertType: AlertType;
    message: string;
  };
}

function localRisk(input: ExpenseAIInput): ExpenseAIResult {
  const reasons: string[] = [];
  let score = 0;

  if (!input.evidenceAvailable) {
    score += 35;
    reasons.push("Missing evidence");
  }

  const history = input.historicalExpenses ?? [];
  if (history.length > 0) {
    const average =
      history.reduce((sum, value) => sum + value, 0) / history.length;

    if (average > 0 && input.amount > average * 1.5) {
      score += 35;
      reasons.push("Unusual amount compared with historical expenses");
    }
  }

  if (!input.supplier) {
    score += 10;
    reasons.push("Supplier information is missing");
  }

  const hour = new Date(input.timestamp).getHours();
  if (hour < 5 || hour >= 23) {
    score += 15;
    reasons.push("Unusual transaction time");
  }

  score = Math.min(100, score);

  const riskLevel: RiskLevel =
    score >= 71 ? RiskLevel.HIGH : score >= 31 ? RiskLevel.MEDIUM : RiskLevel.LOW;

  const generatedAlert =
    riskLevel === RiskLevel.HIGH || !input.evidenceAvailable
      ? {
          alertType: !input.evidenceAvailable
            ? AlertType.MISSING_EVIDENCE
            : AlertType.SUSPICIOUS_EXPENSE,
          message:
            reasons.length > 0
              ? reasons.join("; ")
              : "Expense requires review",
        }
      : undefined;

  return {
    riskScore: score,
    riskLevel,
    reasons,
    generatedAlert,
  };
}

export async function analyzeExpenseRisk(
  input: ExpenseAIInput
): Promise<ExpenseAIResult> {
  const aiUrl = process.env.AI_SERVICE_URL;
  const apiKey = process.env.AI_SERVICE_API_KEY;

  if (!aiUrl) {
    return localRisk(input);
  }

  try {
    const response = await axios.post(
      `${aiUrl.replace(/\/$/, "")}/ai/expense-risk`,
      input,
      {
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "X-API-KEY": apiKey } : {}),
        },
        timeout: 5000,
      }
    );

    const data = response.data?.data ?? response.data;

    const rawLevel = String(
      data.riskLevel ?? data.risk_level ?? "LOW"
    ).toUpperCase();

    const riskLevel =
      rawLevel === "HIGH"
        ? RiskLevel.HIGH
        : rawLevel === "MEDIUM"
          ? RiskLevel.MEDIUM
          : RiskLevel.LOW;

    const reasons = Array.isArray(data.reasons)
      ? data.reasons.map((reason: unknown) => String(reason))
      : [];

    let generatedAlert:
      | {
          alertType: AlertType;
          message: string;
        }
      | undefined;

    if (data.generatedAlert) {
      const rawType = String(
        data.generatedAlert.alertType ??
          data.generatedAlert.alert_type ??
          "SUSPICIOUS_EXPENSE"
      ).toUpperCase();

      const alertType = Object.values(AlertType).find(
        (value) => value === rawType
      );

      if (alertType) {
        generatedAlert = {
          alertType,
          message: String(
            data.generatedAlert.message ??
              reasons.join("; ") ??
              "Expense requires review"
          ),
        };
      }
    }

    return {
      riskScore: Math.max(
        0,
        Math.min(100, Number(data.riskScore ?? data.risk_score ?? 0))
      ),
      riskLevel,
      reasons,
      generatedAlert,
    };
  } catch (error) {
    console.error("AI service unavailable. Using local risk engine.", error);
    return localRisk(input);
  }
}
