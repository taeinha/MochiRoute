import { describe, expect, it } from "vitest";
import { toExposedUser } from "./user";

const baseUser = {
  id: 1,
  email: "test@example.com",
  passwordHash: "hashed-password",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("toExposedUser", () => {
  it("maps USER role to user", () => {
    expect(toExposedUser({ ...baseUser, role: "USER" })).toEqual({
      email: "test@example.com",
      role: "user",
    });
  });

  it("maps ADMIN role to admin", () => {
    expect(toExposedUser({ ...baseUser, role: "ADMIN" })).toEqual({
      email: "test@example.com",
      role: "admin",
    });
  });
});
