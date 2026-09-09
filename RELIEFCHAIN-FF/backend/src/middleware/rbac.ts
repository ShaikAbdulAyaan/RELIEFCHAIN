import { Request, Response, NextFunction } from "express";

export type Role =
  | "ADMIN"
  | "NGO"
  | "VERIFIER"
  | "DONOR"
  | "VOLUNTEER"
  | "WAREHOUSE_MANAGER"
  | "DRIVER"
  | "AUDITOR";

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
}