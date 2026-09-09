import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

export function generateToken(
  payload: AuthTokenPayload
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(
  token: string
): AuthTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }

  if (
    typeof decoded.userId !== "string" ||
    typeof decoded.email !== "string"
  ) {
    throw new Error("Invalid token payload");
  }

  return decoded as AuthTokenPayload;
}