import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "../../lib/logger";
import { logError } from "./write";

describe("logError", () => {
  beforeEach(() => {
    vi.spyOn(logger, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs message and stack for Error instances", () => {
    const error = new Error("database connection failed");

    logError("Failed to create user", error);

    expect(logger.error).toHaveBeenCalledWith("Failed to create user", {
      message: "database connection failed",
      stack: error.stack,
    });
  });

  it("logs stringified value for non-Error throws", () => {
    logError("Failed to get URLs", "something went wrong");

    expect(logger.error).toHaveBeenCalledWith("Failed to get URLs", {
      error: "something went wrong",
    });
  });
});
