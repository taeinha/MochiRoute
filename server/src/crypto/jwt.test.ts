import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "./jwt";

const secret = "test-secret";
const payload = { userId: 1, email: "test@example.com", role: "user" as const };

describe("signToken", () => {
  it("returns a JWT string", () => {
    const token = signToken(payload, secret);

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("signs with HS256", () => {
    const token = signToken(payload, secret);
    const header = JSON.parse(
      Buffer.from(token.split(".")[0], "base64url").toString(),
    );

    expect(header.alg).toBe("HS256");
  });
});

describe("verifyToken", () => {
  it("returns the original payload for a valid token", () => {
    const token = signToken(payload, secret);

    expect(verifyToken(token, secret)).toEqual(payload);
  });

  it("strips standard JWT claims from the returned payload", () => {
    const token = signToken(payload, secret);

    const result = verifyToken(token, secret);

    expect(result).not.toHaveProperty("exp");
    expect(result).not.toHaveProperty("iat");
  });

  it("throws for an invalid token", () => {
    expect(() => verifyToken("not-a-token", secret)).toThrow();
  });

  it("throws when the secret does not match", () => {
    const token = signToken(payload, secret);

    expect(() => verifyToken(token, "wrong-secret")).toThrow();
  });

  it("throws when the token uses a non-HS256 algorithm", () => {
    const token = jwt.sign(payload, secret, { algorithm: "HS512" });

    expect(() => verifyToken(token, secret)).toThrow();
  });

  it("throws when userId is not a number", () => {
    const token = jwt.sign(
      { userId: "1", email: "test@example.com", role: "user" },
      secret,
      { algorithm: "HS256" },
    );

    expect(() => verifyToken(token, secret)).toThrow();
  });

  it("throws when email is invalid", () => {
    const token = jwt.sign(
      { userId: 1, email: "not-an-email", role: "user" },
      secret,
      { algorithm: "HS256" },
    );

    expect(() => verifyToken(token, secret)).toThrow();
  });

  it("throws when role is not user or admin", () => {
    const token = jwt.sign(
      { userId: 1, email: "test@example.com", role: "superuser" },
      secret,
      { algorithm: "HS256" },
    );

    expect(() => verifyToken(token, secret)).toThrow();
  });

  it("throws when required fields are missing", () => {
    const token = jwt.sign({ userId: 1 }, secret, { algorithm: "HS256" });

    expect(() => verifyToken(token, secret)).toThrow();
  });
});
