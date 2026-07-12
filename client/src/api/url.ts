import type {
  CreateUrlResponse,
  ListQueryOptions,
  UrlListResponse,
  ApiResponse,
  UrlRecord,
} from "@mochiroute/shared";
import { authFetch } from "./common";

export async function createShortUrl(
  originalUrl: string,
): Promise<ApiResponse<CreateUrlResponse>> {
  const response = await authFetch("/api/url", {
    method: "POST",
    body: JSON.stringify({ originalUrl }),
  });
  const data: ApiResponse<CreateUrlResponse> = await response.json();
  return data;
}

export async function getUrls(
  options: ListQueryOptions = { page: 1, pageLength: 20 },
): Promise<UrlListResponse> {
  const params = new URLSearchParams({
    page: String(options.page),
    pageLength: String(options.pageLength),
  });
  const response = await authFetch(`/api/url?${params}`, {
    method: "GET",
  });
  const data: UrlListResponse = await response.json();
  return data;
}

export async function deleteUrl(id: string): Promise<ApiResponse<UrlRecord>> {
  const response = await authFetch(`/api/url/${id}`, {
    method: "DELETE",
  });
  const data: ApiResponse<UrlRecord> = await response.json();
  return data;
}
