import rateLimit from "express-rate-limit";
import { ApiResponse } from "@mochiroute/shared";

const rateLimitResponse = {
  success: false,
  message: "Too many requests, please try again later",
} satisfies ApiResponse<null>;

const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  handler: (_req, res) => {
    res.status(429).json(rateLimitResponse);
  },
};

export const authRateLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
});

export const createUrlRateLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
});

export const redirectRateLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000, // 1 minute
  max: 100,
});
