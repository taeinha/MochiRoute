import { randomBytes } from "crypto";
import { z } from "zod";

const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const generateShortCode = (length = 7): string => {
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARS[bytes[i] % CHARS.length];
  }
  return result;
};

export const formatZodError = (error: z.ZodError): string => {
  return error.issues[0]?.message ?? "Invalid request";
};
