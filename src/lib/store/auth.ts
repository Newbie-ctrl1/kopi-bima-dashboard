// ============================================
// Kopi Bima — User Management & Authentication
// ============================================

import { prisma } from "../db";
import crypto from "node:crypto";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function ensureDefaultAdmin(): Promise<void> {
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    const envUsername = process.env.ADMIN_USERNAME || "admin";
    const envPassword = process.env.ADMIN_PASSWORD || "bima123";
    const hashedPassword = hashPassword(envPassword);

    await prisma.user.create({
      data: {
        username: envUsername,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("Default admin bootstrapped successfully.");
  }
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

export async function getUserByUsername(username: string) {
  return await prisma.user.findUnique({
    where: { username },
  });
}

export async function getAllUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createUser(data: { username: string; password: string; role: string }) {
  const hashedPassword = hashPassword(data.password);
  return await prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      role: data.role,
    },
  });
}

export async function deleteUser(id: string) {
  return await prisma.user.delete({
    where: { id },
  });
}
