export interface UrlRecord {
  id: string;
  shortCode: string;
  originalUrl: string;
  userId: string | null;
  clicks: number;
  createdAt: string;
  expiresAt: string | null;
}

export interface CreateUrlRequest {
  originalUrl: string;
  customCode?: string;
  expiresAt?: string;
}

export interface CreateUrlResponse {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
}

export interface UrlListResponse {
  urls: UrlRecord[];
  total: number;
}
