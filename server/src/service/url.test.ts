import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "../generated/prisma/client";
import {
  createUrlRecord,
  deleteUrlRecord,
  getUrlRecord,
  getUrlsRecord,
  resolveRedirect,
  ShortCodeExhaustedError,
  UrlNotFoundError,
} from "./url";
import {
  createMockDb,
  mockExposedUrlRecord,
  mockUrlRecord,
  testAuthUser,
} from "../test/helpers";

describe("createUrlRecord", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a url record with a generated short code", async () => {
    vi.mocked(db.urlRecord.create).mockResolvedValue(mockUrlRecord);

    const result = await createUrlRecord(db, "https://example.com");

    expect(db.urlRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          originalURL: "https://example.com",
          shortCode: expect.any(String),
          userId: null,
        }),
      }),
    );
    expect(result).toEqual(mockUrlRecord);
  });

  it("sets userId when provided", async () => {
    vi.mocked(db.urlRecord.create).mockResolvedValue(mockUrlRecord);

    await createUrlRecord(db, "https://example.com", testAuthUser.userId);

    expect(db.urlRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 1 }),
      }),
    );
  });

  it("retries on P2002 and succeeds", async () => {
    const p2002 = new Prisma.PrismaClientKnownRequestError("dup", {
      code: "P2002",
      clientVersion: "test",
    });
    vi.mocked(db.urlRecord.create)
      .mockRejectedValueOnce(p2002)
      .mockResolvedValueOnce(mockUrlRecord);

    const result = await createUrlRecord(db, "https://example.com");

    expect(db.urlRecord.create).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockUrlRecord);
  });

  it("throws ShortCodeExhaustedError after max retries", async () => {
    const p2002 = new Prisma.PrismaClientKnownRequestError("dup", {
      code: "P2002",
      clientVersion: "test",
    });
    vi.mocked(db.urlRecord.create).mockRejectedValue(p2002);

    await expect(createUrlRecord(db, "https://example.com")).rejects.toThrow(
      ShortCodeExhaustedError,
    );
    expect(db.urlRecord.create).toHaveBeenCalledTimes(3);
  });

  it("rethrows unexpected errors", async () => {
    vi.mocked(db.urlRecord.create).mockRejectedValue(new Error("db down"));

    await expect(createUrlRecord(db, "https://example.com")).rejects.toThrow(
      "db down",
    );
  });
});

describe("resolveRedirect", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns originalURL and increments clicks", async () => {
    vi.mocked(db.urlRecord.findUnique).mockResolvedValue(mockUrlRecord);
    vi.mocked(db.urlRecord.update).mockResolvedValue({
      ...mockUrlRecord,
      clicks: 1,
    });

    const result = await resolveRedirect(db, "abc12Xy");

    expect(db.urlRecord.findUnique).toHaveBeenCalledWith({
      where: { shortCode: "abc12Xy" },
    });
    expect(db.urlRecord.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { clicks: { increment: 1 } },
    });
    expect(result).toBe("https://example.com");
  });

  it("throws UrlNotFoundError when short code is missing", async () => {
    vi.mocked(db.urlRecord.findUnique).mockResolvedValue(null);

    await expect(resolveRedirect(db, "abc12Xy")).rejects.toThrow(
      UrlNotFoundError,
    );
  });

  it("throws UrlNotFoundError when update returns P2025", async () => {
    vi.mocked(db.urlRecord.findUnique).mockResolvedValue(mockUrlRecord);
    const p2025 = new Prisma.PrismaClientKnownRequestError("missing", {
      code: "P2025",
      clientVersion: "test",
    });
    vi.mocked(db.urlRecord.update).mockRejectedValue(p2025);

    await expect(resolveRedirect(db, "abc12Xy")).rejects.toThrow(
      UrlNotFoundError,
    );
  });
});

describe("getUrlRecord", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns exposed url for owner", async () => {
    vi.mocked(db.urlRecord.findUnique).mockResolvedValue(mockUrlRecord);

    const result = await getUrlRecord(db, 1, 1);

    expect(db.urlRecord.findUnique).toHaveBeenCalledWith({
      where: { id: 1, userId: 1 },
    });
    expect(result).toEqual(mockExposedUrlRecord);
  });

  it("throws UrlNotFoundError when record is missing", async () => {
    vi.mocked(db.urlRecord.findUnique).mockResolvedValue(null);

    await expect(getUrlRecord(db, 999, 1)).rejects.toThrow(UrlNotFoundError);
  });
});

describe("getUrlsRecord", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated urls and total count", async () => {
    vi.mocked(db.urlRecord.findMany).mockResolvedValue([mockUrlRecord]);
    vi.mocked(db.urlRecord.count).mockResolvedValue(47);

    const result = await getUrlsRecord(db, 1, { page: 2, pageLength: 5 });

    expect(db.urlRecord.findMany).toHaveBeenCalledWith({
      where: { userId: 1 },
      orderBy: { createdAt: "desc" },
      skip: 5,
      take: 5,
    });
    expect(db.urlRecord.count).toHaveBeenCalledWith({ where: { userId: 1 } });
    expect(result).toEqual({
      urls: [mockExposedUrlRecord],
      count: 47,
    });
  });

  it("uses first page defaults from options", async () => {
    vi.mocked(db.urlRecord.findMany).mockResolvedValue([]);
    vi.mocked(db.urlRecord.count).mockResolvedValue(0);

    await getUrlsRecord(db, 1, { page: 1, pageLength: 10 });

    expect(db.urlRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 }),
    );
  });
});

describe("deleteUrlRecord", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes by id and userId", async () => {
    vi.mocked(db.urlRecord.deleteMany).mockResolvedValue({ count: 1 });

    await deleteUrlRecord(db, 1, 1);

    expect(db.urlRecord.deleteMany).toHaveBeenCalledWith({
      where: { id: 1, userId: 1 },
    });
  });
});
