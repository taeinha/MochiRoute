import { PrismaClient } from "../../generated/prisma/client";
import { Request, Response } from "express";
import {
  registerSchema,
  loginSchema,
  type ApiResponse,
  type User,
} from "@mochiroute/shared";
import { writeErrorResponse, logError } from "./write";
import { Config } from "../../config";
import {
  registerUser as registerUserAccount,
  authenticateUser,
  buildAuthResult,
  UserAlreadyExistsError,
  InvalidCredentialsError,
} from "../../service/auth";
import { formatZodError } from "../../util";
import { deleteCookie, setCookie } from "../../util/tools";
import { AuthenticatedRequest } from "../../middleware/auth";
import { COOKIE_NAME } from "../../crypto/jwt";

export const registerUser =
  (db: PrismaClient, config: Config) => async (req: Request, res: Response) => {
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return writeErrorResponse(
        res,
        formatZodError(validationResult.error),
        400,
      );
    }

    const { email, password } = validationResult.data;

    try {
      const user = await registerUserAccount(db, email, password);
      const { user: exposed, token } = buildAuthResult(user, config.jwtSecret);
      setCookie(res, COOKIE_NAME, token, 7 * 24 * 60 * 60 * 1000);

      const response: ApiResponse<User> = {
        success: true,
        message: "User created successfully",
        data: exposed,
      };

      return res.status(201).json(response);
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        return writeErrorResponse(res, error.message, 409);
      }
      const message = "Failed to create user";
      logError(message, error);
      return writeErrorResponse(res, message, 500);
    }
  };

export const loginUser =
  (db: PrismaClient, config: Config) => async (req: Request, res: Response) => {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return writeErrorResponse(
        res,
        formatZodError(validationResult.error),
        400,
      );
    }

    const { email, password } = validationResult.data;

    try {
      const user = await authenticateUser(db, email, password);
      const { user: exposed, token } = buildAuthResult(user, config.jwtSecret);
      setCookie(res, COOKIE_NAME, token, 7 * 24 * 60 * 60 * 1000);

      const response: ApiResponse<User> = {
        success: true,
        message: "User logged in successfully",
        data: exposed,
      };

      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return writeErrorResponse(res, error.message, 401);
      }
      const message = "Failed to log in";
      logError(message, error);
      return writeErrorResponse(res, message, 500);
    }
  };

export const logoutUser = () => async (req: Request, res: Response) => {
  deleteCookie(res, COOKIE_NAME);
  return res
    .status(200)
    .json({ success: true, message: "User logged out successfully" });
};

export const myUser = () => async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const response: ApiResponse<User> = {
    success: true,
    message: "User authenticated successfully",
    data: { email: user.email, role: user.role },
  };
  return res.status(200).json(response);
};
