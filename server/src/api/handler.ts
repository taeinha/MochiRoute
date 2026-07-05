import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import { Config } from "../config";
import { PrismaClient } from "../generated/prisma/client";
import { attachRoutes } from "./routes";
import { logger } from "../lib/logger";
import { isDevelopment } from "../config/";

export const createApp = (config: Config, db: PrismaClient): Express => {
  const app = express();

  const morganFormat =
    process.env.NODE_ENV === "production" ? "combined" : "dev";

  app.use(
    morgan(morganFormat, {
      stream: {
        write: (message: string) => logger.http(message),
      },
    }),
  );

  if (isDevelopment()) {
    app.use(cors());
  }

  // needed for rate limited so req.ip is set to the correct IP
  if (!isDevelopment()) {
    app.set("trust proxy", 1);
  }

  app.use(express.json());

  attachRoutes(app, config, db);

  return app;
};
