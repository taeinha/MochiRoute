import { Router } from "express";
import { PrismaClient } from "../../generated/prisma/client";
import { Request, Response } from "express";

export const createUrl =
  (db: PrismaClient) => async (req: Request, res: Response) => {
    // do create url logic here
  };

export const getUrl =
  (db: PrismaClient) => async (req: Request, res: Response) => {
    // do get url logic here
  };

export const updateUrl =
  (db: PrismaClient) => async (req: Request, res: Response) => {
    // do update url logic here
  };

export const deleteUrl =
  (db: PrismaClient) => async (req: Request, res: Response) => {
    // do delete url logic here
  };

export const redirectUrl =
  (db: PrismaClient) => async (req: Request, res: Response) => {
    // do redirect url logic here
  };
