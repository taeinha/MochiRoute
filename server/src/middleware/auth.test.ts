import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import { authenticate, optionalAuthenticate, AuthenticatedRequest } from "./auth";
import { signToken } from "../crypto/jwt";
import {
  createMockNext,
  createMockReq,
  createMockRes,
  testConfig,
} from "../test/helpers";

const validPayload = {
  userId: 1,
  email: "test@example.com",
  role: "user" as const,
};

describe("authenticate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when authorization header is missing", () => {
    const req = createMockReq({}, {}, {});
    const res = createMockRes();
    const next = createMockNext();

    authenticate(testConfig)(req, res, next);

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

    authenticate(testConfig)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token payload fails validation", () => {
    const token = jwt.sign(
      { userId: "1", email: "test@example.com", role: "user" },
      testConfig.jwtSecret,
      { algorithm: "HS256" },
    );
    const req = createMockReq({}, {}, { authorization: `Bearer ${token}` });
    const res = createMockRes();
    const next = createMockNext();

    authenticate(testConfig)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next and attaches user for a valid token", () => {
    const token = signToken(validPayload, testConfig.jwtSecret);
    const req = createMockReq({}, {}, { authorization: `Bearer ${token}` });
    const res = createMockRes();
    const next = createMockNext();

    authenticate(testConfig)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect((req as AuthenticatedRequest).user).toEqual(validPayload);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("optionalAuthenticate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls next when authorization header is missing", () => {
    const req = createMockReq({}, {}, {});
    const res = createMockRes();
    const next = createMockNext();

    optionalAuthenticate(testConfig)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", () => {
    const req = createMockReq({}, {}, { authorization: "Bearer bad-token" });
    const res = createMockRes();
    const next = createMockNext();

    optionalAuthenticate(testConfig)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token payload fails validation", () => {
    const token = jwt.sign(
      { userId: 1, email: "bad-email", role: "user" },
      testConfig.jwtSecret,
      { algorithm: "HS256" },
    );
    const req = createMockReq({}, {}, { authorization: `Bearer ${token}` });
    const res = createMockRes();
    const next = createMockNext();

    optionalAuthenticate(testConfig)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next and attaches user for a valid token", () => {
    const token = signToken(validPayload, testConfig.jwtSecret);
    const req = createMockReq({}, {}, { authorization: `Bearer ${token}` });
    const res = createMockRes();
    const next = createMockNext();

    optionalAuthenticate(testConfig)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect((req as AuthenticatedRequest).user).toEqual(validPayload);
    expect(res.status).not.toHaveBeenCalled();
  });
});
