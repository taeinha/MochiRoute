import type { AuthResponse } from "@mochiroute/shared";

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data: AuthResponse = await response.json();
  return data;
};

export const register = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data: AuthResponse = await response.json();
  return data;
};
