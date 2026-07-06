import {
  PrismaClient,
  UrlRecord as PrismaUrlRecord,
  Prisma,
} from "../generated/prisma/client";
import { generateShortCode } from "../util/";
import { toExposedUrlRecord } from "../exposed/url";
import { ListQueryOptions, UrlRecord as PublicUrl } from "@mochiroute/shared";

const MAX_GENERATION_RETRIES = 3;

export class ShortCodeExhaustedError extends Error {
  constructor() {
    super("Failed to generate unique short code");
    this.name = "ShortCodeExhaustedError";
  }
}

export class UrlNotFoundError extends Error {
  constructor() {
    super("URL not found");
    this.name = "UrlNotFoundError";
  }
}

export async function createUrlRecord(
  db: PrismaClient,
  originalURL: string,
  userId?: number,
): Promise<PrismaUrlRecord> {
  for (let i = 0; i < MAX_GENERATION_RETRIES; i++) {
    try {
      return await db.urlRecord.create({
        data: {
          originalURL,
          shortCode: generateShortCode(7),
          userId: userId ?? null,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue;
      }
      throw error;
    }
  }
  throw new ShortCodeExhaustedError();
}

export async function resolveRedirect(
  db: PrismaClient,
  shortCode: string,
): Promise<string> {
  const url = await findUrlRecordByShortCode(db, shortCode);
  await incrementUrlClicks(db, url.id);
  return url.originalURL;
}

async function findUrlRecordByShortCode(
  db: PrismaClient,
  shortCode: string,
): Promise<PrismaUrlRecord> {
  const url = await db.urlRecord.findUnique({ where: { shortCode } });
  if (!url) throw new UrlNotFoundError();
  return url;
}

async function incrementUrlClicks(
  db: PrismaClient,
  urlId: number,
): Promise<void> {
  try {
    await db.urlRecord.update({
      where: { id: urlId },
      data: { clicks: { increment: 1 } },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new UrlNotFoundError();
    }
    throw error;
  }
}

export async function getUrlRecord(
  db: PrismaClient,
  urlId: number,
  userId: number,
): Promise<PublicUrl> {
  const url = await findUrlRecordById(db, urlId, userId);
  return toExposedUrlRecord(url);
}

export async function getUrlsRecord(
  db: PrismaClient,
  userId: number,
  { page, pageLength }: ListQueryOptions,
): Promise<{ urls: PublicUrl[]; count: number }> {
  const [urls, count] = await Promise.all([
    db.urlRecord.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      take: pageLength,
      skip: (page - 1) * pageLength,
    }),
    db.urlRecord.count({ where: { userId: userId } }),
  ]);
  return { urls: urls.map(toExposedUrlRecord), count: count };
}

async function findUrlRecordById(
  db: PrismaClient,
  urlId: number,
  userId: number,
): Promise<PrismaUrlRecord> {
  const url = await db.urlRecord.findUnique({
    where: { id: urlId, userId: userId },
  });
  if (!url) throw new UrlNotFoundError();
  return url;
}

// using deleteMany to avoid the need to check if the URL exists
export async function deleteUrlRecord(
  db: PrismaClient,
  urlId: number,
  userId: number,
): Promise<void> {
  await db.urlRecord.deleteMany({ where: { id: urlId, userId: userId } });
}
