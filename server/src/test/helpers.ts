import { vi } from "vitest";
import type { Request, Response } from "express";
import type { PrismaClient } from "../generated/prisma/client";

export function createMockRes() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response;

  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

export function createMockReq(body: Record<string, unknown> = {}) {
  return { body } as Request;
}

export const testConfig = {
  databaseUrl: "postgresql://test",
  jwtSecret: "test-secret",
  port: 3000,
};

export function createMockDb() {
  return {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  } as unknown as PrismaClient;
}
