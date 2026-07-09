import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "./crypto/bcrypt";
import { generateShortCode } from "./util/tools";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl?.trim()) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "password123";
const DEMO_URL_COUNT = 20;

const SAMPLE_URLS = [
  "https://github.com",
  "https://www.wikipedia.org",
  "https://developer.mozilla.org",
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://openai.com",
  "https://news.ycombinator.com",
  "https://react.dev",
  "https://nodejs.org",
  "https://www.prisma.io",
  "https://aws.amazon.com",
  "https://example.com/docs/getting-started",
  "https://example.com/blog/docker-tips",
  "https://example.com/pricing",
  "https://example.com/support",
  "https://example.com/changelog",
];

const pickRandom = <T>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

async function main() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash },
    create: {
      email: DEMO_EMAIL,
      passwordHash,
      role: "USER",
    },
  });

  await prisma.urlRecord.deleteMany({ where: { userId: user.id } });

  const usedShortCodes = new Set<string>();
  const demoUrls = Array.from({ length: DEMO_URL_COUNT }, () => {
    let shortCode = generateShortCode(7);
    while (usedShortCodes.has(shortCode)) {
      shortCode = generateShortCode(7);
    }
    usedShortCodes.add(shortCode);

    const createdDaysAgo = randomInt(0, 90);
    const hasExpiry = Math.random() < 0.2;

    return {
      originalURL: pickRandom(SAMPLE_URLS),
      shortCode,
      userId: user.id,
      clicks: randomInt(0, 250),
      createdAt: daysAgo(createdDaysAgo),
      updatedAt: daysAgo(randomInt(0, createdDaysAgo)),
      expiresAt: hasExpiry ? daysAgo(-randomInt(7, 60)) : null,
    };
  });

  await prisma.urlRecord.createMany({
    data: [
      ...demoUrls,
      {
        originalURL: "https://example.com/anonymous-link",
        shortCode: "anon001",
        userId: null,
        clicks: randomInt(0, 50),
      },
    ],
    skipDuplicates: true,
  });

  console.log(`Seeded demo user ${DEMO_EMAIL} with ${demoUrls.length} URLs.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
