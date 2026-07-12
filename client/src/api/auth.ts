import type { ApiResponse, User } from "@mochiroute/shared";
import { authFetch } from "./common";

export const login = async (
  email: string,
  password: string,
): Promise<ApiResponse<User>> => {
  const response = await authFetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const data: ApiResponse<User> = await response.json();
  return data;
};

export const register = async (
  email: string,
  password: string,
): Promise<ApiResponse<User>> => {
  const response = await authFetch("/api/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const data: ApiResponse<User> = await response.json();
  return data;
};

export const logout = async (): Promise<ApiResponse<User>> => {
  const response = await authFetch("/api/logout", {
    method: "POST",
  });
  const data: ApiResponse<User> = await response.json();
  return data;
};

export const myUser = async (): Promise<ApiResponse<User>> => {
  const response = await authFetch("/api/me", {
    method: "GET",
  });
  const data: ApiResponse<User> = await response.json();
  return data;
};
