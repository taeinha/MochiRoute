import { z } from "zod";

export const createUrlSchema = z.object({
  originalUrl: z
    .url("Invalid URL")
    .refine((url) => url.startsWith("http://") || url.startsWith("https://"), {
      message: "URL must start with http:// or https://",
    }),
});
