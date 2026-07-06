import { describe, it, expect, vi, beforeEach } from "vitest";
import { createUrl, deleteUrl, getUrl, getUrls, redirectUrl } from "./url";
import {
  createUrlRecord,
  deleteUrlRecord,
  getUrlRecord,
  getUrlsRecord,
  resolveRedirect,
  ShortCodeExhaustedError,
  UrlNotFoundError,
} from "../../service/url";
import {
  createMockReq,
  createMockRes,
  createMockDb,
  mockExposedUrlRecord,
  mockUrlRecord,
  testAuthUser,
  testConfig,
} from "../../test/helpers";
import { logger } from "../../lib/logger";

vi.mock("../../service/url", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../service/url")>();
  return {
    ...actual,
    createUrlRecord: vi.fn(),
    resolveRedirect: vi.fn(),
    getUrlRecord: vi.fn(),
    getUrlsRecord: vi.fn(),
    deleteUrlRecord: vi.fn(),
  };
});

beforeEach(() => {
  vi.spyOn(logger, "error").mockImplementation(() => {});
});

describe("createUrl", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid URL", async () => {
    const req = createMockReq({ originalUrl: "not-a-url" });
    const res = createMockRes();

    await createUrl(db, testConfig)(req, res);

    expect(createUrlRecord).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when URL is missing http or https", async () => {
    const req = createMockReq({ originalUrl: "ftp://example.com" });
    const res = createMockRes();

    await createUrl(db, testConfig)(req, res);

    expect(createUrlRecord).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 201 and short URL on success", async () => {
    vi.mocked(createUrlRecord).mockResolvedValue(mockUrlRecord);

    const req = createMockReq({ originalUrl: "https://example.com" });
    const res = createMockRes();

    await createUrl(db, testConfig)(req, res);

    expect(createUrlRecord).toHaveBeenCalledWith(
      db,
      "https://example.com",
      undefined,
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

  it("passes userId when user is authenticated", async () => {
    vi.mocked(createUrlRecord).mockResolvedValue(mockUrlRecord);

    const req = createMockReq(
      { originalUrl: "https://example.com" },
      {},
      {},
      {},
      testAuthUser,
    );
    const res = createMockRes();

    await createUrl(db, testConfig)(req, res);

    expect(createUrlRecord).toHaveBeenCalledWith(db, "https://example.com", 1);
  });

  it("returns 409 when short code generation is exhausted", async () => {
    vi.mocked(createUrlRecord).mockRejectedValue(new ShortCodeExhaustedError());

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
    vi.mocked(createUrlRecord).mockRejectedValue(new Error("db down"));

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
    vi.mocked(resolveRedirect).mockResolvedValue("https://example.com");

    const req = createMockReq({}, { shortCode: "abc12Xy" });
    const res = createMockRes();

    await redirectUrl(db)(req, res);

    expect(resolveRedirect).toHaveBeenCalledWith(db, "abc12Xy");
    expect(res.redirect).toHaveBeenCalledWith(302, "https://example.com");
  });

  it("returns 400 for an empty short code", async () => {
    const req = createMockReq({}, { shortCode: "" });
    const res = createMockRes();

    await redirectUrl(db)(req, res);

    expect(resolveRedirect).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 for a short code with invalid length", async () => {
    const req = createMockReq({}, { shortCode: "abc" });
    const res = createMockRes();

    await redirectUrl(db)(req, res);

    expect(resolveRedirect).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when short code is not found", async () => {
    vi.mocked(resolveRedirect).mockRejectedValue(new UrlNotFoundError());

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
    vi.mocked(resolveRedirect).mockRejectedValue(new Error("db down"));

    const req = createMockReq({}, { shortCode: "abc12Xy" });
    const res = createMockRes();

    await redirectUrl(db)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("getUrl", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for a non-numeric id", async () => {
    const req = createMockReq({}, { id: "abc" }, {}, {}, testAuthUser);
    const res = createMockRes();

    await getUrl(db)(req, res);

    expect(getUrlRecord).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 200 and url data on success", async () => {
    vi.mocked(getUrlRecord).mockResolvedValue(mockExposedUrlRecord);

    const req = createMockReq({}, { id: "1" }, {}, {}, testAuthUser);
    const res = createMockRes();

    await getUrl(db)(req, res);

    expect(getUrlRecord).toHaveBeenCalledWith(db, 1, 1);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "URL fetched successfully",
      data: mockExposedUrlRecord,
    });
  });

  it("returns 404 when url is not found", async () => {
    vi.mocked(getUrlRecord).mockRejectedValue(new UrlNotFoundError());

    const req = createMockReq({}, { id: "999" }, {}, {}, testAuthUser);
    const res = createMockRes();

    await getUrl(db)(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(getUrlRecord).mockRejectedValue(new Error("db down"));

    const req = createMockReq({}, { id: "1" }, {}, {}, testAuthUser);
    const res = createMockRes();

    await getUrl(db)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("getUrls", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with paginated response", async () => {
    vi.mocked(getUrlsRecord).mockResolvedValue({
      urls: [mockExposedUrlRecord],
      count: 47,
    });

    const req = createMockReq({}, {}, {}, {}, testAuthUser);
    const res = createMockRes();

    await getUrls(db)(req, res);

    expect(getUrlsRecord).toHaveBeenCalledWith(db, 1, {
      page: 1,
      pageLength: 10,
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "URLs fetched successfully",
      data: [mockExposedUrlRecord],
      count: 47,
    });
  });

  it("passes query options to the service", async () => {
    vi.mocked(getUrlsRecord).mockResolvedValue({ urls: [], count: 0 });

    const req = createMockReq(
      {},
      {},
      {},
      { page: "2", pageLength: "5" },
      testAuthUser,
    );
    const res = createMockRes();

    await getUrls(db)(req, res);

    expect(getUrlsRecord).toHaveBeenCalledWith(db, 1, {
      page: 2,
      pageLength: 5,
    });
  });

  it("returns 400 for invalid page", async () => {
    const req = createMockReq({}, {}, {}, { page: "abc" }, testAuthUser);
    const res = createMockRes();

    await getUrls(db)(req, res);

    expect(getUrlsRecord).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(getUrlsRecord).mockRejectedValue(new Error("db down"));

    const req = createMockReq({}, {}, {}, {}, testAuthUser);
    const res = createMockRes();

    await getUrls(db)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("deleteUrl", () => {
  const db = createMockDb();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for a non-numeric id", async () => {
    const req = createMockReq({}, { id: "abc" }, {}, {}, testAuthUser);
    const res = createMockRes();

    await deleteUrl(db)(req, res);

    expect(deleteUrlRecord).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 200 when url is deleted", async () => {
    vi.mocked(deleteUrlRecord).mockResolvedValue(undefined);

    const req = createMockReq({}, { id: "1" }, {}, {}, testAuthUser);
    const res = createMockRes();

    await deleteUrl(db)(req, res);

    expect(deleteUrlRecord).toHaveBeenCalledWith(db, 1, 1);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "URL deleted successfully",
    });
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(deleteUrlRecord).mockRejectedValue(new Error("db down"));

    const req = createMockReq({}, { id: "1" }, {}, {}, testAuthUser);
    const res = createMockRes();

    await deleteUrl(db)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
