import { describe, expect, it } from "vitest";
import {
  buildShortUrl,
  toCreateUrlResponse,
  toExposedUrlRecord,
} from "./url";
import { mockUrlRecord, testConfig } from "../test/helpers";

describe("buildShortUrl", () => {
  it("builds a redirect URL from baseUrl and shortCode", () => {
    expect(buildShortUrl(testConfig, "abc12Xy")).toBe(
      "http://localhost:3000/r/abc12Xy",
    );
  });

  it("strips a trailing slash from baseUrl", () => {
    expect(
      buildShortUrl({ ...testConfig, baseUrl: "http://localhost:3000/" }, "abc12Xy"),
    ).toBe("http://localhost:3000/r/abc12Xy");
  });
});

describe("toCreateUrlResponse", () => {
  it("maps a prisma record to the create response shape", () => {
    expect(toCreateUrlResponse(mockUrlRecord, testConfig)).toEqual({
      shortUrl: "http://localhost:3000/r/abc12Xy",
      originalUrl: "https://example.com",
    });
  });
});

describe("toExposedUrlRecord", () => {
  it("maps prisma fields to the public API shape", () => {
    expect(toExposedUrlRecord(mockUrlRecord)).toEqual({
      id: 1,
      originalUrl: "https://example.com",
      shortCode: "abc12Xy",
      userId: null,
      clicks: 0,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      expiresAt: null,
    });
  });

  it("serializes expiresAt when present", () => {
    const record = {
      ...mockUrlRecord,
      expiresAt: new Date("2026-12-31T23:59:59.000Z"),
    };

    expect(toExposedUrlRecord(record).expiresAt).toBe("2026-12-31T23:59:59.000Z");
  });
});
