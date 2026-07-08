import { z } from "zod";

const SHORT_CODE_LENGTH = 7;
const SHORT_CODE_PATTERN = /^[a-zA-Z0-9]{7}$/;

export const createUrlSchema = z.object({
  originalUrl: z
    .pipe(
      z
        .string()
        .min(1, { message: "URL is required" })
        .max(2048, { message: "URL must be less than 2048 characters" }),
      z.url("Invalid URL"),
    )
    .refine((url) => url.startsWith("http://") || url.startsWith("https://"), {
      message: "URL must start with http:// or https://",
    }),
});

export const shortCodeParamSchema = z.object({
  shortCode: z
    .string()
    .min(1, { message: "Short code is required" })
    .length(SHORT_CODE_LENGTH, {
      message: `Short code must be ${SHORT_CODE_LENGTH} characters`,
    })
    .regex(SHORT_CODE_PATTERN, { message: "Invalid short code" }),
});

export const urlIdParamSchema = z.object({
  id: z.coerce
    .number({ error: "Invalid URL id" })
    .int({ message: "Invalid URL id" })
    .positive({ message: "Invalid URL id" }),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageLength: z.coerce.number().int().positive().max(100).default(10),
});
