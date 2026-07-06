import { z } from "zod";
import {
  registerSchema,
  loginSchema,
  tokenPayloadSchema,
} from "./validations/auth";
import { ApiResponse } from "./write";

export interface User {
  email: string;
  role: "user" | "admin";
}

export interface AuthResponse extends ApiResponse<User> {
  token: string;
}

export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
