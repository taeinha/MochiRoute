import { beforeEach, describe, expect, it, vi } from "vitest";
import { authenticate, AuthenticatedRequest } from "./auth";
import { signToken } from "../crypto/jwt";
import {
  createMockNext,
  createMockReq,
  createMockRes,
} from "../test/helpers";

describe("authenticate", () => {
  const jwtSecret = "middleware-test-secret";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = jwtSecret;
    process.env.NODE_ENV = "development";
  });

  it("returns 401 when authorization header is missing", () => {
    const req = createMockReq({}, {}, {});
    const res = createMockRes();
    const next = createMockNext();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", () => {
    const req = createMockReq({}, {}, { authorization: "Bearer bad-token" });
    const res = createMockRes();
    const next = createMockNext();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next and attaches user for a valid token", () => {
    const payload = {
      userId: 1,
      email: "test@example.com",
      role: "user",
    };
    const token = signToken(payload, jwtSecret);
    const req = createMockReq({}, {}, { authorization: `Bearer ${token}` });
    const res = createMockRes();
    const next = createMockNext();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect((req as AuthenticatedRequest).user).toMatchObject(payload);
    expect(res.status).not.toHaveBeenCalled();
  });
});
