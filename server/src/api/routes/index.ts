import path from "path";
import express, { Express, Router } from "express";
import { Config, isDevelopment } from "../../config";
import { PrismaClient } from "../../generated/prisma/client";
import { loginUser, logoutUser, myUser, registerUser } from "./auth";
import { createUrl, deleteUrl, getUrl, getUrls, redirectUrl } from "./url";
import { authenticate, optionalAuthenticate } from "../../middleware/auth";
import {
  authRateLimiter,
  createUrlRateLimiter,
  redirectRateLimiter,
} from "../../middleware/rateLimit";

const CLIENT_DIST = path.join(__dirname, "../../../../client/dist");

export function attachRoutes(app: Express, config: Config, db: PrismaClient) {
  const api = Router();

  app.get("/health", (_req, res) => {
    res.json({ message: "OK" });
  });

  api.post("/register", authRateLimiter, registerUser(db, config));
  api.post("/login", authRateLimiter, loginUser(db, config));
  api.post("/logout", logoutUser());
  api.get("/me", authenticate(config), myUser());

  api.post(
    "/url",
    createUrlRateLimiter,
    optionalAuthenticate(config),
    createUrl(db, config),
  );
  api.get("/url/:id", authenticate(config), getUrl(db));
  api.get("/url", authenticate(config), getUrls(db));
  api.delete("/url/:id", authenticate(config), deleteUrl(db));

  app.use("/api", api);

  // 404 for all other api routes
  app.use("/api", (_req, res) => {
    res.status(404).json({
      success: false,
      message: "Not found",
    });
  });

  app.get("/r/:shortCode", redirectRateLimiter, redirectUrl(db));

  if (!isDevelopment()) {
    app.use(express.static(CLIENT_DIST));
    app.get(/^(?!\/api|\/r\/|\/health).*/, (_req, res) => {
      res.sendFile(path.join(CLIENT_DIST, "index.html"));
    });
  }
}
