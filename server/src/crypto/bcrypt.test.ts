import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./bcrypt";

describe("hashPassword", () => {
  it("returns a hash different from the plaintext password", async () => {
    const hash = await hashPassword("password123");

    expect(hash).not.toBe("password123");
    expect(hash.startsWith("$2")).toBe(true);
  });
});

describe("verifyPassword", () => {
  it("returns true for the correct password", async () => {
    const hash = await hashPassword("password123");

    expect(await verifyPassword("password123", hash)).toBe(true);
  });

  it("returns false for the wrong password", async () => {
    const hash = await hashPassword("password123");

    expect(await verifyPassword("wrongpassword", hash)).toBe(false);
  });
});
