import jwt from "jsonwebtoken";

export type TokenPayload = { userId: number; email: string; role: string };

export function signToken(
  payload: { userId: number; email: string; role: string },
  secret: string,
) {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string, secret: string): TokenPayload {
  return jwt.verify(token, secret) as TokenPayload;
}
