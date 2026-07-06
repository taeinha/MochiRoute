import { Config } from "../config";
import { Request, Response, NextFunction } from "express";
import { writeErrorResponse } from "../api/routes/write";
import { verifyToken } from "../crypto/jwt";
import { TokenPayload } from "@mochiroute/shared";

export type AuthenticatedRequest = Request & { user: TokenPayload };

export const authenticate =
  (config: Config) => (req: Request, res: Response, next: NextFunction) => {
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

export const optionalAuthenticate =
  (config: Config) => (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(); // anonymous create allowed
    }

    try {
      (req as AuthenticatedRequest).user = verifyToken(token, config.jwtSecret);
      next();
    } catch {
      return writeErrorResponse(res, "Invalid token", 401);
    }
  };
