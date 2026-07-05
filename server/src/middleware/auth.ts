import jwt from "jsonwebtoken";
import { getConfig } from "../config";
import { Request, Response, NextFunction } from "express";
import { writeErrorResponse } from "../api/routes/write";
import { TokenPayload, verifyToken } from "../crypto/jwt";

export type AuthenticatedRequest = Request & { user: TokenPayload };

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const config = getConfig();
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return writeErrorResponse(res, "Unauthorized", 401);
  }

  try {
    (req as AuthenticatedRequest).user = verifyToken(token, config.jwtSecret);
    next();
  } catch {
    return writeErrorResponse(res, "Invalid token", 401);
  }
};
