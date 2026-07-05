import { PrismaClient } from "../../generated/prisma/client";
import { Request, Response } from "express";
import { AuthResponse, registerSchema, loginSchema } from "@mochiroute/shared";
import { writeErrorResponse, logError } from "./write";
import { Config } from "../../config";
import {
  registerUser as registerUserAccount,
  authenticateUser,
  buildAuthResult,
  UserAlreadyExistsError,
  InvalidCredentialsError,
} from "../../service/auth";

export const registerUser =
  (db: PrismaClient, config: Config) => async (req: Request, res: Response) => {
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return writeErrorResponse(res, validationResult.error.message, 400);
    }

    const { email, password } = validationResult.data;

    try {
      const user = await registerUserAccount(db, email, password);
      const { user: exposed, token } = buildAuthResult(user, config.jwtSecret);

      const response: AuthResponse = {
        success: true,
        message: "User created successfully",
        data: exposed,
        token,
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
      return writeErrorResponse(res, validationResult.error.message, 400);
    }

    const { email, password } = validationResult.data;

    try {
      const user = await authenticateUser(db, email, password);
      const { user: exposed, token } = buildAuthResult(user, config.jwtSecret);

      const response: AuthResponse = {
        success: true,
        message: "User logged in successfully",
        data: exposed,
        token,
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
