import { z } from "zod";

export const registerSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const tokenPayloadSchema = z.object({
  userId: z.number().int().positive(),
  email: z.string().email(),
  role: z.enum(["user", "admin"]),
});
