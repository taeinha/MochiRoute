import {
  PrismaClient,
  UrlRecord as PrismaUrlRecord,
  Prisma,
} from "../generated/prisma/client";
import { generateShortCode } from "../util/tools";

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
): Promise<PrismaUrlRecord> {
  for (let i = 0; i < MAX_GENERATION_RETRIES; i++) {
    try {
      return await db.urlRecord.create({
        data: { originalURL, shortCode: generateShortCode(7) },
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

export async function findUrlRecordByShortCode(
  db: PrismaClient,
  shortCode: string,
): Promise<PrismaUrlRecord> {
  const url = await db.urlRecord.findUnique({ where: { shortCode } });
  if (!url) throw new UrlNotFoundError();
  return url;
}

export async function incrementUrlClicks(
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

export async function resolveRedirect(
  db: PrismaClient,
  shortCode: string,
): Promise<string> {
  let url: PrismaUrlRecord;
  try {
    url = await findUrlRecordByShortCode(db, shortCode);
    await incrementUrlClicks(db, url.id);
  } catch (error) {
    throw error;
  }
  return url.originalURL;
}
