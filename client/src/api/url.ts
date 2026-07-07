import type { ApiResponse, CreateUrlResponse } from "@mochiroute/shared";

export async function createShortUrl(
  originalUrl: string,
): Promise<ApiResponse<CreateUrlResponse>> {
  const response = await fetch("/api/url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ originalUrl }),
  });
  const data: ApiResponse<CreateUrlResponse> = await response.json();
  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.message ?? "Failed to shorten URL");
  }
  return data;
}
