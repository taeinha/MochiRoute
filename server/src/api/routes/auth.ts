import {
  PrismaClient,
  Prisma,
  User as PrismaUser,
} from "../../generated/prisma/client";
import { Request, Response } from "express";
import { hashPassword, verifyPassword } from "../../crypto";
import { AuthResponse, registerSchema } from "@mochiroute/shared";
import { writeErrorResponse } from "./write";
import { toExposedUser } from "../../exposed";
import { signToken } from "../../crypto/jwt";
import { Config } from "../../config";

export const registerUser =
  (db: PrismaClient, config: Config) => async (req: Request, res: Response) => {
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return writeErrorResponse(res, validationResult.error.message, 400);
    }

    const { email, password } = validationResult.data;

    const hashedPassword = await hashPassword(password);
    let user: PrismaUser;
    try {
      user = await db.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          role: "USER",
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return writeErrorResponse(res, "User already exists", 409);
      }
      return writeErrorResponse(res, "Failed to create user", 500);
    }

    const exposed = toExposedUser(user);
    const token = signToken(
      { userId: user.id, email: exposed.email, role: exposed.role },
      config.jwtSecret,
    );

    const response: AuthResponse = {
      success: true,
      message: "User created successfully",
      data: exposed,
      token,
    };

    res.status(201).json(response);
  };

export const loginUser =
  (db: PrismaClient) => async (req: Request, res: Response) => {
    // do login user logic here
  };
