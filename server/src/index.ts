import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getConfig, Config } from "./config";
import { createApp } from "./api/handler";

const config: Config = getConfig();

const adapter = new PrismaPg({ connectionString: config.databaseUrl });
const prisma = new PrismaClient({ adapter });

const app = createApp(config, prisma);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
