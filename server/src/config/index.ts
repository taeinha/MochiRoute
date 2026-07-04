export interface Config {
  databaseUrl: string;
  jwtSecret: string;
  port: number;
}

export const getConfig = (): Config => {
  return {
    databaseUrl: process.env.DATABASE_URL || "",
    jwtSecret: process.env.JWT_SECRET || "",
    port: parseInt(process.env.PORT || "3000"),
  };
};
