import { UrlRecord as PrismaUrlRecord } from "../generated/prisma/client";
import { CreateUrlResponse, UrlRecord as PublicUrl } from "@mochiroute/shared";
import { Config } from "../config";

export function buildShortUrl(config: Config, shortCode: string): string {
  return `${config.baseUrl.replace(/\/$/, "")}/r/${shortCode}`;
}

export function toCreateUrlResponse(
  url: PrismaUrlRecord,
  config: Config,
): CreateUrlResponse {
  return {
    shortUrl: buildShortUrl(config, url.shortCode),
    originalUrl: url.originalURL,
  };
}

export function toExposedUrlRecord(url: PrismaUrlRecord): PublicUrl {
  return {
    id: url.id,
    originalUrl: url.originalURL,
    shortCode: url.shortCode,
    userId: url.userId,
    clicks: url.clicks,
    createdAt: new Date(url.createdAt).toISOString(),
    updatedAt: new Date(url.updatedAt).toISOString(),
    expiresAt: url.expiresAt ? new Date(url.expiresAt).toISOString() : null,
  };
}
