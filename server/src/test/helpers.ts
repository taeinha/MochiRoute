import { vi } from "vitest";
import type { Request, Response } from "express";
import type { PrismaClient } from "../generated/prisma/client";

export function createMockRes() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    redirect: vi.fn(),
  } as unknown as Response;

  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.redirect = vi.fn().mockReturnValue(res);
  return res;
}

export function createMockReq(
  body: Record<string, unknown> = {},
  params: Record<string, string> = {},
  headers: Record<string, string> = {},
) {
  return { body, params, headers } as Request;
}

export function createMockNext() {
  return vi.fn();
}

export const testConfig = {
  databaseUrl: "postgresql://test",
  jwtSecret: "test-secret",
  port: 3000,
  baseUrl: "http://localhost:3000",
};

export function createMockDb() {
  return {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    urlRecord: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  } as unknown as PrismaClient;
}

export const mockUrlRecord = {
  id: 1,
  originalURL: "https://example.com",
  shortCode: "abc12Xy",
  userId: null,
  clicks: 0,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  expiresAt: null,
};

export const mockExposedUrlRecord = {
  id: 1,
  originalUrl: "https://example.com",
  shortCode: "abc12Xy",
  userId: null,
  clicks: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  expiresAt: null,
};
