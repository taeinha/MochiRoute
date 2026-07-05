import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerUser, loginUser } from "./auth";
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
  testConfig,
} from "../../test/helpers";
import { createMockDb } from "../../test/helpers";

vi.mock("../../service/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../service/auth")>();
  return {
    ...actual,
    registerUser: vi.fn(),
    authenticateUser: vi.fn(),
    buildAuthResult: vi.fn(),
  };
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

  it("returns 201 and token on success", async () => {
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
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: { email: "test@example.com", role: "user" },
        token: "test-token",
      }),
    );
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

  it("returns 200 and token on success", async () => {
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
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        token: "test-token",
        data: { email: "test@example.com", role: "user" },
      }),
    );
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
