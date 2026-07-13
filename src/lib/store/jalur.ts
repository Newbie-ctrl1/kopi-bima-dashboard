// ============================================
// Kopi Bima — Jalur CRUD
// ============================================

import { prisma } from "../db";
import type { Jalur } from "../types";

export async function getJalurByDb(dbId: string): Promise<Jalur[]> {
  const list = await prisma.jalur.findMany({
    where: { databaseId: dbId },
    orderBy: { createdAt: "asc" },
  });
  return list.map((j: any) => ({
    id: j.id,
    dbId: j.databaseId,
    name: j.name,
    createdAt: j.createdAt.toISOString(),
  }));
}

export async function getJalurById(id: string): Promise<Jalur | undefined> {
  const j = await prisma.jalur.findUnique({ where: { id } });
  if (!j) return undefined;
  return {
    id: j.id,
    dbId: j.databaseId,
    name: j.name,
    createdAt: j.createdAt.toISOString(),
  };
}

export async function createJalur(dbId: string, name: string): Promise<Jalur> {
  const j = await prisma.jalur.create({
    data: { databaseId: dbId, name },
  });
  return {
    id: j.id,
    dbId: j.databaseId,
    name: j.name,
    createdAt: j.createdAt.toISOString(),
  };
}

export async function deleteJalur(id: string): Promise<void> {
  await prisma.jalur.delete({ where: { id } });
}

export async function updateJalur(id: string, name: string): Promise<Jalur | null> {
  try {
    const j = await prisma.jalur.update({
      where: { id },
      data: { name },
    });
    return {
      id: j.id,
      dbId: j.databaseId,
      name: j.name,
      createdAt: j.createdAt.toISOString(),
    };
  } catch {
    return null;
  }
}
