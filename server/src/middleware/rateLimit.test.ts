import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import {
  authRateLimiter,
  createUrlRateLimiter,
  redirectRateLimiter,
} from "./rateLimit";
import { createMockNext, createMockRes } from "../test/helpers";

function createRateLimitReq(ip: string): Request {
  return {
    ip,
    socket: { remoteAddress: ip },
    headers: {},
    app: {
      get: vi.fn().mockReturnValue(false),
    },
  } as unknown as Request;
}

async function invokeLimiter(
  limiter: (req: Request, res: Response, next: NextFunction) => void,
  ip: string,
) {
  const req = createRateLimitReq(ip);
  const res = createMockRes();
  res.setHeader = vi.fn().mockReturnValue(res);
  const next = createMockNext();

  await limiter(req, res, next);

  return { req, res, next };
}

describe("rate limiters", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe("when NODE_ENV is test", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "test";
    });

    it("skips auth rate limiting", async () => {
      const { next, res } = await invokeLimiter(authRateLimiter, "10.0.0.1");

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("skips create URL rate limiting", async () => {
      const { next, res } = await invokeLimiter(createUrlRateLimiter, "10.0.0.2");

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("skips redirect rate limiting", async () => {
      const { next, res } = await invokeLimiter(redirectRateLimiter, "10.0.0.3");

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("when NODE_ENV is not test", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
    });

    it("allows requests under the auth limit", async () => {
      const { next, res } = await invokeLimiter(authRateLimiter, "10.0.1.1");

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("returns 429 when the auth limit is exceeded", async () => {
      const ip = "10.0.1.2";

      for (let i = 0; i < 10; i++) {
        await invokeLimiter(authRateLimiter, ip);
      }

      const { next, res } = await invokeLimiter(authRateLimiter, ip);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Too many requests, please try again later",
      });
    });

    it("tracks limits separately per IP", async () => {
      const blockedIp = "10.0.1.3";
      const otherIp = "10.0.1.4";

      for (let i = 0; i < 11; i++) {
        await invokeLimiter(authRateLimiter, blockedIp);
      }

      const { next, res } = await invokeLimiter(authRateLimiter, otherIp);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
