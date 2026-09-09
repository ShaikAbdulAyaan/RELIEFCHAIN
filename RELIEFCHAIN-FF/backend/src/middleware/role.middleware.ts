import { Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "./auth.middleware";

export function requireRole(...allowedRoles: string[]) {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      const userRoles = await prisma.userRole.findMany({
        where: {
          userId: req.user.id,
        },
        include: {
          role: true,
        },
      });

      const roleNames: string[] = userRoles.map(
        (userRole: { role: { name: string } }) => userRole.role.name
      );

      const hasPermission: boolean = allowedRoles.some(
        (role: string) => roleNames.includes(role)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      next();
    } catch (error) {
      console.error("Role authorization error:", error);

      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
}