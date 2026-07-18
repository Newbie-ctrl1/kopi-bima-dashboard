// ============================================
// Kopi Bima — Payment CRUD
// ============================================

import { prisma } from "../db";
import type { Payment, PaymentFormData, PaymentWithRelations } from "../types";

export async function createPayment(input: PaymentFormData): Promise<Payment> {
  const p = await prisma.payment.create({
    data: {
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      tglPayment: input.tglPayment,
      outletId: input.outletId,
      keterangan: input.keterangan ?? null,
    },
  });

  return {
    id: p.id,
    outletId: p.outletId,
    amount: p.amount,
    paymentMethod: p.paymentMethod as "Cash" | "Transfer",
    tglPayment: p.tglPayment,
    keterangan: p.keterangan ?? undefined,
    createdAt: p.createdAt,
  };
}

export async function updatePayment(
  id: string,
  input: PaymentFormData
): Promise<Payment | null> {
  try {
    const p = await prisma.payment.update({
      where: { id },
      data: {
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        tglPayment: input.tglPayment,
        outletId: input.outletId,
        keterangan: input.keterangan ?? null,
      },
    });

    return {
      id: p.id,
      outletId: p.outletId,
      amount: p.amount,
      paymentMethod: p.paymentMethod as "Cash" | "Transfer",
      tglPayment: p.tglPayment,
      keterangan: p.keterangan ?? undefined,
      createdAt: p.createdAt,
    };
  } catch {
    return null;
  }
}

export async function deletePayment(id: string): Promise<void> {
  await prisma.payment.delete({ where: { id } });
}

export async function getPaymentsByDatabase(dbId: string): Promise<PaymentWithRelations[]> {
  const list = await prisma.payment.findMany({
    where: {
      outlet: {
        alamat: {
          jalur: {
            databaseId: dbId,
          },
        },
      },
    },
    include: {
      outlet: {
        include: {
          alamat: {
            include: {
              jalur: {
                include: {
                  database: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return list.map((p: any) => ({
    id: p.id,
    outletId: p.outletId,
    amount: p.amount,
    paymentMethod: p.paymentMethod as "Cash" | "Transfer",
    tglPayment: p.tglPayment,
    keterangan: p.keterangan ?? undefined,
    createdAt: p.createdAt,
    outletName: p.outlet.outlet,
    outletNoInduk: p.outlet.noId,
    alamatName: p.outlet.alamat.name,
    jalurName: p.outlet.alamat.jalur.name,
    databaseName: p.outlet.alamat.jalur.database.name,
  }));
}
