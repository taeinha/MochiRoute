import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "./jwt";

const secret = "test-secret";
const payload = { userId: 1, email: "test@example.com", role: "user" };

describe("signToken", () => {
  it("returns a JWT string", () => {
    const token = signToken(payload, secret);

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });
});

describe("verifyToken", () => {
  it("returns the original payload for a valid token", () => {
    const token = signToken(payload, secret);

    expect(verifyToken(token, secret)).toMatchObject(payload);
  });

  it("throws for an invalid token", () => {
    expect(() => verifyToken("not-a-token", secret)).toThrow();
  });

  it("throws when the secret does not match", () => {
    const token = signToken(payload, secret);

    expect(() => verifyToken(token, "wrong-secret")).toThrow();
  });
});
