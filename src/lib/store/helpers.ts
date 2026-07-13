// ============================================
// Kopi Bima — Shared Order & Stock Helpers
// ============================================

import { prisma } from "../db";
import type { OrderFormData } from "../types";

export function calculateOrderFields(input: OrderFormData) {
  const isCancelled = input.orderStatus === "Cancel";
  const totalPiutang = isCancelled ? 0 : Math.max(0, input.order * input.harga - input.totalBayar);
  const status = isCancelled ? "Cancel" : totalPiutang > 0 ? "Piutang" : "Lunas";
  return {
    order: input.order,
    harga: input.harga,
    totalBayar: input.totalBayar,
    totalPiutang,
    status,
    orderStatus: input.orderStatus ?? "Sukses",
    paymentMethod: input.paymentMethod ?? "Cash",
    tglOrder: input.tglOrder,
    keterangan: input.keterangan ?? null,
    outletId: input.outletId,
  };
}

export async function adjustCoffeeStock(quantityDiff: number) {
  if (quantityDiff === 0) return;
  const stocks = await prisma.coffeeStock.findMany({ take: 1 });
  if (stocks.length > 0) {
    const stock = stocks[0];
    await prisma.coffeeStock.update({
      where: { id: stock.id },
      data: {
        quantity: {
          increment: quantityDiff,
        },
      },
    });
  }
}

export async function getCoffeeStockQuantity(): Promise<number> {
  const stocks = await prisma.coffeeStock.findMany({ take: 1 });
  return stocks.length > 0 ? stocks[0].quantity : 0;
}
