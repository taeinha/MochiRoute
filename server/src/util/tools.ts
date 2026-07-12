import { randomBytes } from "crypto";
import { z } from "zod";
import { isDevelopment } from "../config/";
import type { Response, Request } from "express";

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

export const setCookie = (
  res: Response,
  name: string,
  value: string,
  maxAge: number,
) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: !isDevelopment(),
    sameSite: "lax",
    path: "/",
    maxAge,
  });
};

export const getCookie = (req: Request, name: string): string | undefined => {
  return req.cookies[name];
};

export const deleteCookie = (res: Response, name: string) => {
  res.clearCookie(name, {
    httpOnly: true,
    secure: !isDevelopment(),
    sameSite: "lax",
    path: "/",
  });
};
