import express, { Express } from "express";
import cors from "cors";
import { Config } from "../config";
import { PrismaClient } from "../generated/prisma/client";
import { attachRoutes } from "./routes";

export const createApp = (config: Config, db: PrismaClient): Express => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  attachRoutes(app, config, db);

  return app;
};
