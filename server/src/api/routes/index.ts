import { Config } from "../../config";
import { PrismaClient } from "../../generated/prisma/client";
import { Express } from "express";
import { loginUser, registerUser } from "./auth";
import { createUrl, deleteUrl, getUrl, redirectUrl, updateUrl } from "./url";

export function attachRoutes(app: Express, config: Config, db: PrismaClient) {
  app.get("/health", (req, res) => {
    res.json({ message: "OK" });
  });

  // auth routes
  app.post("/register", registerUser(db, config));
  app.post("/login", loginUser(db, config));

  // url routes
  app.post("/url", createUrl(db));
  app.get("/url/:id", getUrl(db));
  app.put("/url/:id", updateUrl(db));
  app.delete("/url/:id", deleteUrl(db));
  app.get("/url/:id/redirect", redirectUrl(db));
}
