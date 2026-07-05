import { z } from "zod";
import { createUrlSchema } from "./validations";
import { ApiResponse } from "./write";

export interface UrlRecord {
  id: number;
  shortCode: string;
  originalUrl: string;
  userId: number | null;
  clicks: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

export interface CreateUrlResponse {
  shortUrl: string;
  originalUrl: string;
}

export interface UrlListResponse extends ApiResponse<UrlRecord[]> {
  count: number;
}

export type CreateUrlRequest = z.infer<typeof createUrlSchema>;
