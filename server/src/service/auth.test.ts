import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "../generated/prisma/client";
import {
  authenticateUser,
  buildAuthResult,
  InvalidCredentialsError,
  registerUser,
  UserAlreadyExistsError,
} from "./auth";
import { createMockDb, mockPrismaUser, testConfig } from "../test/helpers";

vi.mock("../crypto", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed-password"),
  verifyPassword: vi.fn(),
}));

import { hashPassword, verifyPassword } from "../crypto";

describe("registerUser", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hashes password and creates user with USER role", async () => {
    vi.mocked(db.user.create).mockResolvedValue(mockPrismaUser);

    const result = await registerUser(db, "test@example.com", "password123");

    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(db.user.create).toHaveBeenCalledWith({
      data: {
        email: "test@example.com",
        passwordHash: "hashed-password",
        role: "USER",
      },
    });
    expect(result).toEqual(mockPrismaUser);
  });

  it("throws UserAlreadyExistsError on P2002", async () => {
    const error = new Prisma.PrismaClientKnownRequestError("dup", {
      code: "P2002",
      clientVersion: "test",
    });
    vi.mocked(db.user.create).mockRejectedValue(error);

    await expect(
      registerUser(db, "test@example.com", "password123"),
    ).rejects.toThrow(UserAlreadyExistsError);
  });

  it("rethrows unexpected errors", async () => {
    vi.mocked(db.user.create).mockRejectedValue(new Error("db down"));

    await expect(
      registerUser(db, "test@example.com", "password123"),
    ).rejects.toThrow("db down");
  });
});

describe("authenticateUser", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws InvalidCredentialsError for unknown user", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null);

    await expect(
      authenticateUser(db, "missing@example.com", "password123"),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("throws InvalidCredentialsError for wrong password", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(mockPrismaUser);
    vi.mocked(verifyPassword).mockResolvedValue(false);

    await expect(
      authenticateUser(db, "test@example.com", "wrongpassword"),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("returns user when credentials are valid", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(mockPrismaUser);
    vi.mocked(verifyPassword).mockResolvedValue(true);

    const result = await authenticateUser(
      db,
      "test@example.com",
      "password123",
    );

    expect(verifyPassword).toHaveBeenCalledWith(
      "password123",
      "hashed-password",
    );
    expect(result).toEqual(mockPrismaUser);
  });
});

describe("buildAuthResult", () => {
  it("returns exposed user and jwt token", () => {
    const result = buildAuthResult(mockPrismaUser, testConfig.jwtSecret);

    expect(result.user).toEqual({
      email: "test@example.com",
      role: "user",
    });
    expect(typeof result.token).toBe("string");
    expect(result.token.split(".")).toHaveLength(3);
  });
});
