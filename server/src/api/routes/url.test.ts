import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "../../generated/prisma/client";
import { createUrl, deleteUrl, getUrl, redirectUrl } from "./url";
import {
  createMockReq,
  createMockRes,
  createMockDb,
  mockExposedUrlRecord,
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

  it("returns 400 for an empty short code", async () => {
    const req = createMockReq({}, { shortCode: "" });
    const res = createMockRes();

    await redirectUrl(db)(req, res);

    expect(db.urlRecord.findUnique).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it("returns 400 for a short code with invalid length", async () => {
    const req = createMockReq({}, { shortCode: "abc" });
    const res = createMockRes();

    await redirectUrl(db)(req, res);

    expect(db.urlRecord.findUnique).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it("returns 400 for a short code with invalid characters", async () => {
    const req = createMockReq({}, { shortCode: "abc!@#x" });
    const res = createMockRes();

    await redirectUrl(db)(req, res);

    expect(db.urlRecord.findUnique).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
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

describe("getUrl", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for a non-numeric id", async () => {
    const req = createMockReq({}, { id: "abc" });
    const res = createMockRes();

    await getUrl(db)(req, res);

    expect(db.urlRecord.findUnique).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it("returns 400 for a non-positive id", async () => {
    const req = createMockReq({}, { id: "0" });
    const res = createMockRes();

    await getUrl(db)(req, res);

    expect(db.urlRecord.findUnique).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it("returns 200 and url data on success", async () => {
    vi.mocked(db.urlRecord.findUnique).mockResolvedValue(mockUrlRecord);

    const req = createMockReq({}, { id: "1" });
    const res = createMockRes();

    await getUrl(db)(req, res);

    expect(db.urlRecord.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "URL fetched successfully",
      data: mockExposedUrlRecord,
    });
  });

  it("returns 404 when url is not found", async () => {
    vi.mocked(db.urlRecord.findUnique).mockResolvedValue(null);

    const req = createMockReq({}, { id: "999" });
    const res = createMockRes();

    await getUrl(db)(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "URL not found",
    });
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(db.urlRecord.findUnique).mockRejectedValue(new Error("db down"));

    const req = createMockReq({}, { id: "1" });
    const res = createMockRes();

    await getUrl(db)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to get URL",
    });
  });
});

describe("deleteUrl", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for a non-numeric id", async () => {
    const req = createMockReq({}, { id: "abc" });
    const res = createMockRes();

    await deleteUrl(db)(req, res);

    expect(db.urlRecord.deleteMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it("returns 400 for a non-positive id", async () => {
    const req = createMockReq({}, { id: "0" });
    const res = createMockRes();

    await deleteUrl(db)(req, res);

    expect(db.urlRecord.deleteMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it("returns 200 when url is deleted", async () => {
    vi.mocked(db.urlRecord.deleteMany).mockResolvedValue({ count: 1 });

    const req = createMockReq({}, { id: "1" });
    const res = createMockRes();

    await deleteUrl(db)(req, res);

    expect(db.urlRecord.deleteMany).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "URL deleted successfully",
    });
  });

  it("returns 200 when url is already missing (idempotent)", async () => {
    vi.mocked(db.urlRecord.deleteMany).mockResolvedValue({ count: 0 });

    const req = createMockReq({}, { id: "999" });
    const res = createMockRes();

    await deleteUrl(db)(req, res);

    expect(db.urlRecord.deleteMany).toHaveBeenCalledWith({
      where: { id: 999 },
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "URL deleted successfully",
    });
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(db.urlRecord.deleteMany).mockRejectedValue(new Error("db down"));

    const req = createMockReq({}, { id: "1" });
    const res = createMockRes();

    await deleteUrl(db)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to delete URL",
    });
  });
});
