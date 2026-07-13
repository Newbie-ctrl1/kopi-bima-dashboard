// ============================================
// Kopi Bima — Database CRUD
// ============================================

import { prisma } from "../db";
import type { Database } from "../types";

export async function getDatabases(): Promise<Database[]> {
  const list = await prisma.database.findMany({
    orderBy: { createdAt: "asc" },
  });
  return list.map((db: any) => ({
    id: db.id,
    name: db.name,
    createdAt: db.createdAt.toISOString(),
  }));
}

export async function getDatabaseById(id: string): Promise<Database | undefined> {
  const db = await prisma.database.findUnique({ where: { id } });
  if (!db) return undefined;
  return {
    id: db.id,
    name: db.name,
    createdAt: db.createdAt.toISOString(),
  };
}

export async function createDatabase(name: string): Promise<Database> {
  const db = await prisma.database.create({
    data: { name },
  });
  return {
    id: db.id,
    name: db.name,
    createdAt: db.createdAt.toISOString(),
  };
}

export async function deleteDatabase(id: string): Promise<void> {
  await prisma.database.delete({ where: { id } });
}

export async function updateDatabase(id: string, name: string): Promise<Database | null> {
  try {
    const db = await prisma.database.update({
      where: { id },
      data: { name },
    });
    return {
      id: db.id,
      name: db.name,
      createdAt: db.createdAt.toISOString(),
    };
  } catch {
    return null;
  }
}
