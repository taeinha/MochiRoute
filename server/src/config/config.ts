export interface Config {
  databaseUrl: string;
  jwtSecret: string;
  port: number;
  baseUrl: string;
}

export const getConfig = (): Config => {
  return {
    databaseUrl: process.env.DATABASE_URL || "",
    jwtSecret: process.env.JWT_SECRET || "",
    port: parseInt(process.env.PORT || "3000"),
    baseUrl: isDevelopment()
      ? `http://localhost:${process.env.PORT || "3000"}`
      : process.env.BASE_URL || "",
  };
};

export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV !== "production";
};
