import { User as PublicUser } from "@mochiroute/shared";
import { User as PrismaUser } from "../generated/prisma/client";

export function toExposedUser(user: PrismaUser): PublicUser {
  return {
    email: user.email,
    role: user.role === "ADMIN" ? "admin" : "user",
  };
}
