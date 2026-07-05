import path from "path";
import express, { Express, Router } from "express";
import { Config, isDevelopment } from "../../config";
import { PrismaClient } from "../../generated/prisma/client";
import { loginUser, registerUser } from "./auth";
import { createUrl, deleteUrl, getUrl, getUrls, redirectUrl } from "./url";
import { authenticate, optionalAuthenticate } from "../../middleware/auth";

const CLIENT_DIST = path.join(__dirname, "../../../../client/dist");

export function attachRoutes(app: Express, config: Config, db: PrismaClient) {
  const api = Router();

  app.get("/health", (_req, res) => {
    res.json({ message: "OK" });
  });

  api.post("/register", registerUser(db, config));
  api.post("/login", loginUser(db, config));

  api.post("/url", optionalAuthenticate(config), createUrl(db, config));
  api.get("/url/:id", authenticate(config), getUrl(db));
  api.get("/url", authenticate(config), getUrls(db));
  api.delete("/url/:id", authenticate(config), deleteUrl(db));

  app.use("/api", api);

  app.get("/r/:shortCode", redirectUrl(db));

  if (!isDevelopment()) {
    app.use(express.static(CLIENT_DIST));
    app.get(/^(?!\/api|\/r\/|\/health).*/, (_req, res) => {
      res.sendFile(path.join(CLIENT_DIST, "index.html"));
    });
  }
}
