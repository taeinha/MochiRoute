import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getConfig, isDevelopment } from "./index";

describe("isDevelopment", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("returns true when NODE_ENV is not production", () => {
    process.env.NODE_ENV = "development";
    expect(isDevelopment()).toBe(true);
  });

  it("returns false when NODE_ENV is production", () => {
    process.env.NODE_ENV = "production";
    expect(isDevelopment()).toBe(false);
  });
});

describe("getConfig", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("reads database and jwt values from env", () => {
    process.env.DATABASE_URL = "postgresql://mochi:mochi@localhost:5432/mochiroute";
    process.env.JWT_SECRET = "super-secret";
    process.env.NODE_ENV = "development";

    expect(getConfig()).toEqual({
      databaseUrl: "postgresql://mochi:mochi@localhost:5432/mochiroute",
      jwtSecret: "super-secret",
      port: 3000,
      baseUrl: "http://localhost:3000",
    });
  });

  it("uses localhost baseUrl in development with custom port", () => {
    process.env.DATABASE_URL = "postgresql://mochi:mochi@localhost:5432/mochiroute";
    process.env.JWT_SECRET = "super-secret";
    process.env.NODE_ENV = "development";
    process.env.PORT = "4000";

    expect(getConfig().baseUrl).toBe("http://localhost:4000");
    expect(getConfig().port).toBe(4000);
  });

  it("uses BASE_URL in production", () => {
    process.env.DATABASE_URL = "postgresql://mochi:mochi@localhost:5432/mochiroute";
    process.env.JWT_SECRET = "super-secret";
    process.env.NODE_ENV = "production";
    process.env.BASE_URL = "https://mochiroute.taeha.dev";

    expect(getConfig().baseUrl).toBe("https://mochiroute.taeha.dev");
  });

  it("throws when DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL;
    process.env.JWT_SECRET = "super-secret";
    process.env.NODE_ENV = "development";

    expect(() => getConfig()).toThrow("Environment variable DATABASE_URL is not set");
  });

  it("throws when JWT_SECRET is missing", () => {
    process.env.DATABASE_URL = "postgresql://mochi:mochi@localhost:5432/mochiroute";
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = "development";

    expect(() => getConfig()).toThrow("Environment variable JWT_SECRET is not set");
  });

  it("throws when BASE_URL is missing in production", () => {
    process.env.DATABASE_URL = "postgresql://mochi:mochi@localhost:5432/mochiroute";
    process.env.JWT_SECRET = "super-secret";
    process.env.NODE_ENV = "production";
    delete process.env.BASE_URL;

    expect(() => getConfig()).toThrow("Environment variable BASE_URL is not set");
  });
});
