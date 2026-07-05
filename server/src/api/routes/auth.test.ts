import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "../../generated/prisma/client";
import { registerUser, loginUser } from "./auth";
import { createMockReq, createMockRes, testConfig } from "../../test/helpers";
import { createMockDb } from "../../test/helpers";

vi.mock("../../crypto", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed-password"),
  verifyPassword: vi.fn(),
}));

import { hashPassword, verifyPassword } from "../../crypto";

describe("registerUser", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid email", async () => {
    const req = createMockReq({
      email: "not-an-email",
      password: "password123",
    });
    const res = createMockRes();

    await registerUser(db, testConfig)(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it("returns 201 and token on success", async () => {
    vi.mocked(db.user.create).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      role: "USER",
      passwordHash: "hashed-password",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = createMockReq({
      email: "test@example.com",
      password: "password123",
    });
    const res = createMockRes();

    await registerUser(db, testConfig)(req, res);

    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: { email: "test@example.com", role: "user" },
        token: expect.any(String),
      }),
    );
  });

  it("returns 409 when email already exists", async () => {
    const error = new Prisma.PrismaClientKnownRequestError("dup", {
      code: "P2002",
      clientVersion: "test",
    });
    vi.mocked(db.user.create).mockRejectedValue(error);

    const req = createMockReq({
      email: "test@example.com",
      password: "password123",
    });
    const res = createMockRes();

    await registerUser(db, testConfig)(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User already exists",
    });
  });
});

describe("loginUser", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for unknown user", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null);

    const req = createMockReq({
      email: "missing@example.com",
      password: "password123",
    });
    const res = createMockRes();

    await loginUser(db, testConfig)(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  it("returns 401 for wrong password", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      role: "USER",
      passwordHash: "hashed-password",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(verifyPassword).mockResolvedValue(false);

    const req = createMockReq({
      email: "test@example.com",
      password: "wrongpassword",
    });
    const res = createMockRes();

    await loginUser(db, testConfig)(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 200 and token on success", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      role: "USER",
      passwordHash: "hashed-password",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(verifyPassword).mockResolvedValue(true);

    const req = createMockReq({
      email: "test@example.com",
      password: "password123",
    });
    const res = createMockRes();

    await loginUser(db, testConfig)(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        token: expect.any(String),
        data: { email: "test@example.com", role: "user" },
      }),
    );
  });
});
