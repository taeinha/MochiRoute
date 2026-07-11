import jwt from "jsonwebtoken";
import { tokenPayloadSchema, TokenPayload } from "@mochiroute/shared";

export const COOKIE_NAME = "auth_token";

export function signToken(
  payload: { userId: number; email: string; role: string },
  secret: string,
) {
  return jwt.sign(payload, secret, { expiresIn: "7d", algorithm: "HS256" });
}

export function verifyToken(token: string, secret: string): TokenPayload {
  const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });

  if (typeof decoded === "string") {
    throw new Error("Invalid token");
  }

  return tokenPayloadSchema.parse(decoded);
}
