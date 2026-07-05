import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "../../generated/prisma/client";
import { createUrl, redirectUrl } from "./url";
import {
  createMockReq,
  createMockRes,
  createMockDb,
  mockUrlRecord,
  testConfig,
} from "../../test/helpers";

describe("createUrl", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid URL", async () => {
    const req = createMockReq({ originalUrl: "not-a-url" });
    const res = createMockRes();

    await createUrl(db, testConfig)(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it("returns 400 when URL is missing http or https", async () => {
    const req = createMockReq({ originalUrl: "ftp://example.com" });
    const res = createMockRes();

    await createUrl(db, testConfig)(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it("returns 201 and short URL on success", async () => {
    vi.mocked(db.urlRecord.create).mockResolvedValue(mockUrlRecord);

    const req = createMockReq({ originalUrl: "https://example.com" });
    const res = createMockRes();

    await createUrl(db, testConfig)(req, res);

    expect(db.urlRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          originalURL: "https://example.com",
          shortCode: expect.any(String),
        }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: {
          shortUrl: "http://localhost:3000/r/abc12Xy",
          originalUrl: "https://example.com",
        },
      }),
    );
  });

  it("returns 409 when short code generation is exhausted", async () => {
    const error = new Prisma.PrismaClientKnownRequestError("dup", {
      code: "P2002",
      clientVersion: "test",
    });
    vi.mocked(db.urlRecord.create).mockRejectedValue(error);

    const req = createMockReq({ originalUrl: "https://example.com" });
    const res = createMockRes();

    await createUrl(db, testConfig)(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to generate unique short code",
    });
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(db.urlRecord.create).mockRejectedValue(new Error("db down"));

    const req = createMockReq({ originalUrl: "https://example.com" });
    const res = createMockRes();

    await createUrl(db, testConfig)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to create URL",
    });
  });
});

describe("redirectUrl", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 302 redirect on success", async () => {
    vi.mocked(db.urlRecord.findUnique).mockResolvedValue(mockUrlRecord);
    vi.mocked(db.urlRecord.update).mockResolvedValue({
      ...mockUrlRecord,
      clicks: 1,
    });

    const req = createMockReq({}, { shortCode: "abc12Xy" });
    const res = createMockRes();

    await redirectUrl(db)(req, res);

    expect(db.urlRecord.findUnique).toHaveBeenCalledWith({
      where: { shortCode: "abc12Xy" },
    });
    expect(db.urlRecord.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { clicks: { increment: 1 } },
    });
    expect(res.redirect).toHaveBeenCalledWith(302, "https://example.com");
  });

  it("returns 404 when short code is not found", async () => {
    vi.mocked(db.urlRecord.findUnique).mockResolvedValue(null);

    const req = createMockReq({}, { shortCode: "missing" });
    const res = createMockRes();

    await redirectUrl(db)(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "URL not found",
    });
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(db.urlRecord.findUnique).mockRejectedValue(new Error("db down"));

    const req = createMockReq({}, { shortCode: "abc12Xy" });
    const res = createMockRes();

    await redirectUrl(db)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to redirect URL",
    });
  });
});
