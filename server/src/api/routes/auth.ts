import { Router } from "express";
import { PrismaClient } from "../../generated/prisma/client";
import { Request, Response } from "express";

export const registerUser =
  (db: PrismaClient) => async (req: Request, res: Response) => {
    // do register user logic here
  };

export const loginUser =
  (db: PrismaClient) => async (req: Request, res: Response) => {
    // do login user logic here
  };
