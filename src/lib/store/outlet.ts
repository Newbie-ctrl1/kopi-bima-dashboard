// ============================================
// Kopi Bima — Outlet CRUD (Registration Only)
// ============================================

import { prisma } from "../db";
import { Prisma } from "../../generated/client/client";
import type { Outlet, OutletFormData, OutletWithSummary } from "../types";
import { adjustCoffeeStock, getCoffeeStockQuantity } from "./helpers";

export async function createOutlet(
  alamatId: string,
  input: OutletFormData
): Promise<Outlet> {
  let orderQty = input.order ?? 0;
  const inputPendapatan = input.pendapatan ?? 0;
  const payAmount = input.totalBayar ?? 0;

  const stocks = await prisma.coffeeStock.findMany({ take: 1 });
  const defaultPrice = stocks.length > 0 ? stocks[0].price : 100000;

  if (orderQty > 0) {
    const currentStock = await getCoffeeStockQuantity();
    if (orderQty > currentStock) {
      throw new Error(`Stok kopi tidak mencukupi untuk pendaftaran outlet. (Stok tersedia: ${currentStock} Kardus, Diminta: ${orderQty} Kardus)`);
    }
  }

  return await prisma.$transaction(async (tx) => {
    const o = await tx.outlet.create({
      data: {
        alamatId,
        noId: input.noId,
        outlet: input.outlet,
        tglDaftar: input.tglDaftar,
      },
    });

    const hasFinancials = orderQty > 0 || inputPendapatan > 0 || payAmount > 0;
    if (hasFinancials) {
      if (orderQty === 0 && inputPendapatan > 0) {
        orderQty = 1;
      }
      const price = inputPendapatan > 0 ? (orderQty > 0 ? inputPendapatan / orderQty : defaultPrice) : defaultPrice;
      const totalOrderVal = inputPendapatan > 0 ? inputPendapatan : orderQty * price;
      const totalPiutang = Math.max(0, totalOrderVal - payAmount);
      const status: "Lunas" | "Piutang" = totalPiutang > 0 ? "Piutang" : "Lunas";

      await tx.order.create({
        data: {
          outletId: o.id,
          order: orderQty,
          harga: price,
          totalBayar: payAmount,
          totalPiutang: totalPiutang,
          status: status,
          orderStatus: "Sukses",
          tglOrder: input.tglDaftar || new Date().toISOString().slice(0, 10),
        },
      });

      if (orderQty > 0 && stocks.length > 0) {
        await tx.coffeeStock.update({
          where: { id: stocks[0].id },
          data: {
            quantity: {
              decrement: orderQty,
            },
          },
        });
      }
    }

    if (payAmount > 0) {
      await tx.payment.create({
        data: {
          outletId: o.id,
          amount: payAmount,
          paymentMethod: "Cash",
          tglPayment: input.tglDaftar || new Date().toISOString().slice(0, 10),
        },
      });
    }

    return {
      id: o.id,
      alamatId: o.alamatId,
      noId: o.noId,
      outlet: o.outlet,
      tglDaftar: o.tglDaftar,
    };
  });
}

export async function updateOutlet(
  id: string,
  input: OutletFormData
): Promise<Outlet | null> {
  try {
    const existingOutlet = await prisma.outlet.findUnique({
      where: { id },
      include: {
        orders: { orderBy: { createdAt: "asc" }, take: 1 },
        payments: { orderBy: { createdAt: "asc" }, take: 1 },
      },
    });
    if (!existingOutlet) return null;

    const stocks = await prisma.coffeeStock.findMany({ take: 1 });
    const defaultPrice = stocks.length > 0 ? stocks[0].price : 100000;

    const existingOrder = existingOutlet.orders[0];
    const existingPayment = existingOutlet.payments[0];

    let newOrderQty = input.order !== undefined ? input.order : (existingOrder ? existingOrder.order : 0);
    const inputPendapatan = input.pendapatan !== undefined ? input.pendapatan : (existingOrder ? existingOrder.order * existingOrder.harga : 0);
    const newPayAmount = input.totalBayar !== undefined ? input.totalBayar : (existingOrder ? existingOrder.totalBayar : 0);

    // Stock check
    if (newOrderQty > 0) {
      const oldQty = existingOrder && existingOrder.orderStatus === "Sukses" ? existingOrder.order : 0;
      const qtyDiff = newOrderQty - oldQty;
      if (qtyDiff > 0) {
        const currentStock = await getCoffeeStockQuantity();
        if (qtyDiff > currentStock) {
          throw new Error(`Stok kopi tidak mencukupi untuk memperbarui order. (Stok tersedia: ${currentStock} Kardus, Butuh tambahan: ${qtyDiff} Kardus)`);
        }
      }
    }

    return await prisma.$transaction(async (tx) => {
      const o = await tx.outlet.update({
        where: { id },
        data: {
          noId: input.noId,
          outlet: input.outlet,
          tglDaftar: input.tglDaftar,
        },
      });

      const hasFinancials = newOrderQty > 0 || inputPendapatan > 0 || newPayAmount > 0;
      if (hasFinancials) {
        if (newOrderQty === 0 && inputPendapatan > 0) {
          newOrderQty = 1;
        }
        const price = inputPendapatan > 0 ? (newOrderQty > 0 ? inputPendapatan / newOrderQty : defaultPrice) : (existingOrder ? existingOrder.harga : defaultPrice);
        const totalOrderVal = inputPendapatan > 0 ? inputPendapatan : newOrderQty * price;
        const totalPiutang = Math.max(0, totalOrderVal - newPayAmount);
        const status: "Lunas" | "Piutang" = totalPiutang > 0 ? "Piutang" : "Lunas";

        const oldQty = existingOrder && existingOrder.orderStatus === "Sukses" ? existingOrder.order : 0;
        const qtyDiff = newOrderQty - oldQty;

        if (existingOrder) {
          await tx.order.update({
            where: { id: existingOrder.id },
            data: {
              order: newOrderQty,
              harga: price,
              totalBayar: newPayAmount,
              totalPiutang,
              status,
              tglOrder: input.tglDaftar,
            },
          });
        } else {
          await tx.order.create({
            data: {
              outletId: o.id,
              order: newOrderQty,
              harga: price,
              totalBayar: newPayAmount,
              totalPiutang: totalPiutang,
              status,
              orderStatus: "Sukses",
              tglOrder: input.tglDaftar,
            },
          });
        }

        if (qtyDiff !== 0 && stocks.length > 0) {
          await tx.coffeeStock.update({
            where: { id: stocks[0].id },
            data: {
              quantity: {
                decrement: qtyDiff,
              },
            },
          });
        }
      }

      if (input.totalBayar !== undefined) {
        if (existingPayment) {
          await tx.payment.update({
            where: { id: existingPayment.id },
            data: {
              amount: newPayAmount,
              tglPayment: input.tglDaftar,
            },
          });
        } else if (newPayAmount > 0) {
          await tx.payment.create({
            data: {
              outletId: o.id,
              amount: newPayAmount,
              paymentMethod: "Cash",
              tglPayment: input.tglDaftar,
            },
          });
        }
      }

      return {
        id: o.id,
        alamatId: o.alamatId,
        noId: o.noId,
        outlet: o.outlet,
        tglDaftar: o.tglDaftar,
      };
    });
  } catch (err: any) {
    if (err.message && err.message.includes("Stok kopi")) throw err;
    return null;
  }
}

export async function deleteOutlet(id: string): Promise<void> {
  // Before deleting outlet, refund stock for all Sukses orders
  const orders = await prisma.order.findMany({
    where: { outletId: id, orderStatus: "Sukses" },
  });
  const totalToRefund = orders.reduce((sum, o) => sum + o.order, 0);
  if (totalToRefund > 0) {
    await adjustCoffeeStock(totalToRefund);
  }
  await prisma.outlet.delete({ where: { id } });
}

export async function bulkImportOutlets(
  alamatId: string,
  inputs: Array<{
    noId: string;
    outlet: string;
    tglDaftar: string;
    order?: number;
    pendapatan?: number;
    totalBayar?: number;
  }>
): Promise<void> {
  const CHUNK_SIZE = 500; // safe PostgreSQL param limit margin

  // Check stock first (across all chunks)
  const totalRequestedOrder = inputs.reduce((sum, input) => sum + (input.order ?? 0), 0);
  if (totalRequestedOrder > 0) {
    const currentStock = await getCoffeeStockQuantity();
    if (totalRequestedOrder > currentStock) {
      throw new Error(`Stok kopi tidak mencukupi untuk melakukan import. (Stok tersedia: ${currentStock} Kardus, Total diminta: ${totalRequestedOrder} Kardus)`);
    }
  }

  const stocks = await prisma.coffeeStock.findMany({ take: 1 });
  const defaultPrice = stocks.length > 0 ? stocks[0].price : 100000;

  // Split into chunks of CHUNK_SIZE
  const chunks: typeof inputs[] = [];
  for (let i = 0; i < inputs.length; i += CHUNK_SIZE) {
    chunks.push(inputs.slice(i, i + CHUNK_SIZE));
  }

  for (const chunk of chunks) {
    await prisma.$transaction(async (tx) => {
      // ── 1. Batch-create all outlets in one query ──────────────────────────
      await tx.outlet.createMany({
        data: chunk.map((input) => ({
          alamatId,
          noId: input.noId,
          outlet: input.outlet,
          tglDaftar: input.tglDaftar || new Date().toISOString().slice(0, 10),
        })),
      });

      // ── 2. Fetch the newly created outlets by noId to get their IDs ───────
      const noIds = chunk.map((i) => i.noId);
      const createdOutlets = await tx.outlet.findMany({
        where: { alamatId, noId: { in: noIds } },
        select: { id: true, noId: true },
      });
      const idByNoId = Object.fromEntries(createdOutlets.map((o) => [o.noId, o.id]));

      // ── 3. Prepare order, payment & stock data ────────────────────────────
      const orderData: Prisma.OrderCreateManyInput[] = [];
      const paymentData: Prisma.PaymentCreateManyInput[] = [];
      let chunkStockDecrement = 0;

      for (const input of chunk) {
        const outletId = idByNoId[input.noId];
        if (!outletId) continue;

        let orderQty = input.order ?? 0;
        const inputPendapatan = input.pendapatan ?? 0;
        const payAmount = input.totalBayar ?? 0;

        const hasFinancials = orderQty > 0 || inputPendapatan > 0 || payAmount > 0;
        if (hasFinancials) {
          if (orderQty === 0 && inputPendapatan > 0) orderQty = 1;
          const price =
            inputPendapatan > 0
              ? orderQty > 0
                ? inputPendapatan / orderQty
                : defaultPrice
              : defaultPrice;
          const totalOrderVal = inputPendapatan > 0 ? inputPendapatan : orderQty * price;
          const totalPiutang = Math.max(0, totalOrderVal - payAmount);
          const status: "Lunas" | "Piutang" = totalPiutang > 0 ? "Piutang" : "Lunas";

          orderData.push({
            outletId,
            order: orderQty,
            harga: price,
            totalBayar: payAmount,
            totalPiutang,
            status,
            orderStatus: "Sukses",
            tglOrder: input.tglDaftar || new Date().toISOString().slice(0, 10),
          });

          if (orderQty > 0 && stocks.length > 0) {
            chunkStockDecrement += orderQty;
          }
        }

        if (payAmount > 0) {
          paymentData.push({
            outletId,
            amount: payAmount,
            paymentMethod: "Cash",
            tglPayment: input.tglDaftar || new Date().toISOString().slice(0, 10),
          });
        }
      }

      // ── 4. Execute all writes in parallel ─────────────────────────────────
      await Promise.all([
        orderData.length > 0 ? tx.order.createMany({ data: orderData }) : Promise.resolve(),
        paymentData.length > 0 ? tx.payment.createMany({ data: paymentData }) : Promise.resolve(),
        chunkStockDecrement > 0 && stocks.length > 0
          ? tx.coffeeStock.update({
              where: { id: stocks[0].id },
              data: { quantity: { decrement: chunkStockDecrement } },
            })
          : Promise.resolve(),
      ]);
    }, {
      timeout: 30000, // 30s per chunk — safe for Neon/Vercel cold-start
    });
  }
}




export async function getOutletsWithSummary(alamatId: string): Promise<OutletWithSummary[]> {
  const outlets = await prisma.outlet.findMany({
    where: { alamatId },
    orderBy: { noId: "asc" },
    include: {
      orders: true,
      payments: true,
    },
  });

  return outlets.map((o: any) => {
    const suksesOrders = o.orders.filter((ord: any) => ord.orderStatus === "Sukses");
    const totalOrder = suksesOrders.reduce((sum: number, ord: any) => sum + ord.order, 0);
    const totalPendapatan = suksesOrders.reduce((sum: number, ord: any) => sum + ord.order * ord.harga, 0);
    const totalBayar = o.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const totalPiutang = Math.max(0, totalPendapatan - totalBayar);

    return {
      id: o.id,
      alamatId: o.alamatId,
      noId: o.noId,
      outlet: o.outlet,
      tglDaftar: o.tglDaftar,
      totalOrder,
      totalPendapatan,
      totalBayar,
      totalPiutang,
      orderCount: o.orders.length,
    };
  });
}
