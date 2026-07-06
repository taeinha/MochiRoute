import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getConfig, Config } from "./config";
import { createApp } from "./api/handler";

const config: Config = getConfig();

const adapter = new PrismaPg({ connectionString: config.databaseUrl });
const prisma = new PrismaClient({ adapter });

const app = createApp(config, prisma);

const server = app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received, shutting down gracefully`);
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
  server.close(() => {
    void prisma
      .$disconnect()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error("Error during shutdown", error);
        process.exit(1);
      });
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT")); // local Ctrl+C
