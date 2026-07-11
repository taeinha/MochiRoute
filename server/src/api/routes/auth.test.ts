import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerUser, loginUser, logoutUser, myUser } from "./auth";
import {
  authenticateUser,
  buildAuthResult,
  InvalidCredentialsError,
  registerUser as registerUserAccount,
  UserAlreadyExistsError,
} from "../../service/auth";
import {
  createMockReq,
  createMockRes,
  mockPrismaUser,
  testAuthUser,
  testConfig,
} from "../../test/helpers";
import { createMockDb } from "../../test/helpers";
import { logger } from "../../lib/logger";
import { COOKIE_NAME } from "../../crypto/jwt";
import type { AuthenticatedRequest } from "../../middleware/auth";

vi.mock("../../service/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../service/auth")>();
  return {
    ...actual,
    registerUser: vi.fn(),
    authenticateUser: vi.fn(),
    buildAuthResult: vi.fn(),
  };
});

beforeEach(() => {
  vi.spyOn(logger, "error").mockImplementation(() => {});
});

describe("registerUser route", () => {
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

    expect(registerUserAccount).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it("returns 201, sets auth cookie, and omits token from body", async () => {
    vi.mocked(registerUserAccount).mockResolvedValue(mockPrismaUser);
    vi.mocked(buildAuthResult).mockReturnValue({
      user: { email: "test@example.com", role: "user" },
      token: "test-token",
    });

    const req = createMockReq({
      email: "test@example.com",
      password: "password123",
    });
    const res = createMockRes();

    await registerUser(db, testConfig)(req, res);

    expect(registerUserAccount).toHaveBeenCalledWith(
      db,
      "test@example.com",
      "password123",
    );
    expect(buildAuthResult).toHaveBeenCalledWith(
      mockPrismaUser,
      testConfig.jwtSecret,
    );
    expect(res.cookie).toHaveBeenCalledWith(
      COOKIE_NAME,
      "test-token",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User created successfully",
      data: { email: "test@example.com", role: "user" },
    });
  });

  it("returns 409 when email already exists", async () => {
    vi.mocked(registerUserAccount).mockRejectedValue(
      new UserAlreadyExistsError(),
    );

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

  it("returns 500 on unexpected error", async () => {
    vi.mocked(registerUserAccount).mockRejectedValue(new Error("db down"));

    const req = createMockReq({
      email: "test@example.com",
      password: "password123",
    });
    const res = createMockRes();

    await registerUser(db, testConfig)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to create user",
    });
  });
});

describe("loginUser route", () => {
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

    await loginUser(db, testConfig)(req, res);

    expect(authenticateUser).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 401 for invalid credentials", async () => {
    vi.mocked(authenticateUser).mockRejectedValue(
      new InvalidCredentialsError(),
    );

    const req = createMockReq({
      email: "test@example.com",
      password: "wrongpassword",
    });
    const res = createMockRes();

    await loginUser(db, testConfig)(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  it("returns 200, sets auth cookie, and omits token from body", async () => {
    vi.mocked(authenticateUser).mockResolvedValue(mockPrismaUser);
    vi.mocked(buildAuthResult).mockReturnValue({
      user: { email: "test@example.com", role: "user" },
      token: "test-token",
    });

    const req = createMockReq({
      email: "test@example.com",
      password: "password123",
    });
    const res = createMockRes();

    await loginUser(db, testConfig)(req, res);

    expect(authenticateUser).toHaveBeenCalledWith(
      db,
      "test@example.com",
      "password123",
    );
    expect(res.cookie).toHaveBeenCalledWith(
      COOKIE_NAME,
      "test-token",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User logged in successfully",
      data: { email: "test@example.com", role: "user" },
    });
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(authenticateUser).mockRejectedValue(new Error("db down"));

    const req = createMockReq({
      email: "test@example.com",
      password: "password123",
    });
    const res = createMockRes();

    await loginUser(db, testConfig)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to log in",
    });
  });
});

describe("logoutUser route", () => {
  it("clears the auth cookie and returns success", async () => {
    const req = createMockReq();
    const res = createMockRes();

    await logoutUser()(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith(
      COOKIE_NAME,
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User logged out successfully",
    });
  });
});

describe("myUser route", () => {
  it("returns the authenticated user without userId", async () => {
    const req = createMockReq({}, {}, {}, {}, testAuthUser);
    const res = createMockRes();

    await myUser()(req as AuthenticatedRequest, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User authenticated successfully",
      data: { email: "test@example.com", role: "user" },
    });
  });
});
