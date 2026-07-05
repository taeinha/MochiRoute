import {
  PrismaClient,
  Prisma,
  User as PrismaUser,
} from "../generated/prisma/client";
import { verifyPassword, hashPassword } from "../crypto";
import { toExposedUser } from "../exposed";
import { signToken } from "../crypto/jwt";

export class UserAlreadyExistsError extends Error {
  constructor() {
    super("User already exists");
    this.name = "UserAlreadyExistsError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

export async function registerUser(
  db: PrismaClient,
  email: string,
  password: string,
): Promise<PrismaUser> {
  try {
    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: { email, passwordHash: hashedPassword, role: "USER" },
    });
    return user;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new UserAlreadyExistsError();
    }
    throw error;
  }
}

export async function authenticateUser(
  db: PrismaClient,
  email: string,
  password: string,
): Promise<PrismaUser> {
  const user = await db.user.findUnique({ where: { email } });
  const valid = user && (await verifyPassword(password, user.passwordHash));
  if (!valid) throw new InvalidCredentialsError();
  return user;
}

export function buildAuthResult(user: PrismaUser, jwtSecret: string) {
  const exposed = toExposedUser(user);
  const token = signToken(
    { userId: user.id, email: exposed.email, role: exposed.role },
    jwtSecret,
  );
  return { user: exposed, token };
}
