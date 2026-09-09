import { Request, Response } from "express";
import { prisma } from "../config/database";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import type { AuthRequest } from "../middleware/auth.middleware";

// ===============================
// REGISTER
// ===============================
export async function register(req: Request, res: Response) {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

  const { name, email, password } = result.data;

const existingUser = await prisma.user.findUnique({
  where: { email },
});

if (existingUser) {
  return res.status(409).json({
    success: false,
    message: "User with this email already exists",
  });
}

const hashedPassword = await hashPassword(password);

// Always ensure the default role exists before creating the user.
// This makes a fresh local database immediately usable.
const defaultRole = await prisma.role.upsert({
  where: { name: "DONOR" },
  update: {},
  create: {
    name: "DONOR",
    description: "Default role for registered donors",
  },
});

const user = await prisma.user.create({
  data: {
    id: `USR-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    passwordHash: hashedPassword,
    status: "ACTIVE",
    roles: {
      create: {
        roleId: defaultRole.id,
      },
    },
  },
});

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// ===============================
// LOGIN
// ===============================
export async function login(req: Request, res: Response) {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordValid = await comparePassword(
      password,
      user.passwordHash
    );

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// ===============================
// GET CURRENT USER
// ===============================
export async function getMe(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User information fetched successfully",
      data: {
        id: req.user.id,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}