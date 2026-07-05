import { z } from "zod";
import { createUrlSchema } from "./validations";

export interface UrlRecord {
  id: string;
  shortCode: string;
  originalUrl: string;
  userId: string | null;
  clicks: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

export interface CreateUrlResponse {
  shortUrl: string;
  originalUrl: string;
}

export interface UrlListResponse {
  urls: UrlRecord[];
  count: number;
}

export type CreateUrlRequest = z.infer<typeof createUrlSchema>;
