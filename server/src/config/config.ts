export interface Config {
  databaseUrl: string;
  jwtSecret: string;
  port: number;
  baseUrl: string;
}

export const getConfig = (): Config => {
  const port = parseInt(process.env.PORT || "3000");
  return {
    databaseUrl: requireEnv("DATABASE_URL"),
    jwtSecret: requireEnv("JWT_SECRET"),
    port: port,
    baseUrl: isDevelopment()
      ? `http://localhost:${port}`
      : requireEnv("BASE_URL"),
  };
};

export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV !== "production";
};

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value.trim();
};
