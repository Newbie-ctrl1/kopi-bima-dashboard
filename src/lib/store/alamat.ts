// ============================================
// Kopi Bima — Alamat CRUD
// ============================================

import { prisma } from "../db";
import type { Alamat } from "../types";

export async function getAlamatByJalur(jalurId: string): Promise<Alamat[]> {
  const list = await prisma.alamat.findMany({
    where: { jalurId },
    orderBy: { createdAt: "asc" },
  });
  return list.map((a: any) => ({
    id: a.id,
    jalurId: a.jalurId,
    name: a.name,
    createdAt: a.createdAt.toISOString(),
  }));
}

export async function getAlamatById(id: string): Promise<Alamat | undefined> {
  const a = await prisma.alamat.findUnique({ where: { id } });
  if (!a) return undefined;
  return {
    id: a.id,
    jalurId: a.jalurId,
    name: a.name,
    createdAt: a.createdAt.toISOString(),
  };
}

export async function createAlamat(jalurId: string, name: string): Promise<Alamat> {
  const a = await prisma.alamat.create({
    data: { jalurId, name },
  });
  return {
    id: a.id,
    jalurId: a.jalurId,
    name: a.name,
    createdAt: a.createdAt.toISOString(),
  };
}

export async function deleteAlamat(id: string): Promise<void> {
  await prisma.alamat.delete({ where: { id } });
}

export async function updateAlamat(id: string, name: string): Promise<Alamat | null> {
  try {
    const a = await prisma.alamat.update({
      where: { id },
      data: { name },
    });
    return {
      id: a.id,
      jalurId: a.jalurId,
      name: a.name,
      createdAt: a.createdAt.toISOString(),
    };
  } catch {
    return null;
  }
}
