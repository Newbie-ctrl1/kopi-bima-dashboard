// ============================================
// Kopi Bima — Outlet CRUD (Registration Only)
// ============================================

import { prisma } from "../db";
import type { Outlet, OutletFormData, OutletWithSummary } from "../types";
import { adjustCoffeeStock, getCoffeeStockQuantity } from "./helpers";

export async function createOutlet(
  alamatId: string,
  input: OutletFormData
): Promise<Outlet> {
  const orderQty = input.order ?? 0;
  if (orderQty > 0) {
    const currentStock = await getCoffeeStockQuantity();
    if (orderQty > currentStock) {
      throw new Error(`Stok kopi tidak mencukupi untuk pendaftaran outlet. (Stok tersedia: ${currentStock} Kardus, Diminta: ${orderQty} Kardus)`);
    }
  }

  const stocks = await prisma.coffeeStock.findMany({ take: 1 });
  const defaultPrice = stocks.length > 0 ? stocks[0].price : 100000;
  const price = input.harga && input.harga > 0 ? input.harga : defaultPrice;

  return await prisma.$transaction(async (tx) => {
    const o = await tx.outlet.create({
      data: {
        alamatId,
        noInduk: input.noInduk,
        outlet: input.outlet,
        tglDaftar: input.tglDaftar,
      },
    });

    if (orderQty > 0) {
      const totalPiutang = orderQty * price;
      await tx.order.create({
        data: {
          outletId: o.id,
          order: orderQty,
          harga: price,
          totalBayar: 0,
          totalPiutang: totalPiutang,
          status: "Piutang",
          orderStatus: "Sukses",
          tglOrder: input.tglDaftar || new Date().toISOString().slice(0, 10),
        },
      });

      if (stocks.length > 0) {
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

    const payAmount = input.totalBayar ?? 0;
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
      noInduk: o.noInduk,
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

    const newOrderQty = input.order;
    const newPrice = input.harga && input.harga > 0 ? input.harga : defaultPrice;
    const newPayAmount = input.totalBayar;

    const existingOrder = existingOutlet.orders[0];
    const existingPayment = existingOutlet.payments[0];

    // Calculate stock diff if order is updated
    if (newOrderQty !== undefined) {
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
          noInduk: input.noInduk,
          outlet: input.outlet,
          tglDaftar: input.tglDaftar,
        },
      });

      // Update or Create Order
      if (newOrderQty !== undefined) {
        const oldQty = existingOrder && existingOrder.orderStatus === "Sukses" ? existingOrder.order : 0;
        const qtyDiff = newOrderQty - oldQty;

        if (existingOrder) {
          const currentPaid = newPayAmount !== undefined ? newPayAmount : existingOrder.totalBayar;
          const totalPiutang = Math.max(0, newOrderQty * newPrice - currentPaid);
          const status = totalPiutang > 0 ? "Piutang" : "Lunas";
          await tx.order.update({
            where: { id: existingOrder.id },
            data: {
              order: newOrderQty,
              harga: newPrice,
              totalPiutang,
              status,
              tglOrder: input.tglDaftar,
            },
          });
        } else if (newOrderQty > 0) {
          const totalPiutang = newOrderQty * newPrice;
          await tx.order.create({
            data: {
              outletId: o.id,
              order: newOrderQty,
              harga: newPrice,
              totalBayar: 0,
              totalPiutang: totalPiutang,
              status: "Piutang",
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

      // Update or Create Payment
      if (newPayAmount !== undefined) {
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
        noInduk: o.noInduk,
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
    noInduk: string;
    outlet: string;
    tglDaftar: string;
    order?: number;
    harga?: number;
    totalBayar?: number;
  }>
): Promise<void> {
  // Check stock first
  const totalRequestedOrder = inputs.reduce((sum, input) => sum + (input.order ?? 0), 0);
  if (totalRequestedOrder > 0) {
    const currentStock = await getCoffeeStockQuantity();
    if (totalRequestedOrder > currentStock) {
      throw new Error(`Stok kopi tidak mencukupi untuk melakukan import. (Stok tersedia: ${currentStock} Kardus, Total diminta: ${totalRequestedOrder} Kardus)`);
    }
  }

  const stocks = await prisma.coffeeStock.findMany({ take: 1 });
  const defaultPrice = stocks.length > 0 ? stocks[0].price : 100000;

  await prisma.$transaction(async (tx) => {
    for (const input of inputs) {
      const newOutlet = await tx.outlet.create({
        data: {
          alamatId,
          noInduk: input.noInduk,
          outlet: input.outlet,
          tglDaftar: input.tglDaftar || new Date().toISOString().slice(0, 10),
        },
      });

      const orderQty = input.order ?? 0;
      if (orderQty > 0) {
        const price = input.harga && input.harga > 0 ? input.harga : defaultPrice;
        const totalPiutang = orderQty * price;

        await tx.order.create({
          data: {
            outletId: newOutlet.id,
            order: orderQty,
            harga: price,
            totalBayar: 0,
            totalPiutang: totalPiutang,
            status: "Piutang",
            orderStatus: "Sukses",
            tglOrder: input.tglDaftar || new Date().toISOString().slice(0, 10),
          },
        });

        if (stocks.length > 0) {
          const stock = stocks[0];
          await tx.coffeeStock.update({
            where: { id: stock.id },
            data: {
              quantity: {
                decrement: orderQty
              }
            },
          });
        }
      }

      const payAmount = input.totalBayar ?? 0;
      if (payAmount > 0) {
        await tx.payment.create({
          data: {
            outletId: newOutlet.id,
            amount: payAmount,
            paymentMethod: "Cash",
            tglPayment: input.tglDaftar || new Date().toISOString().slice(0, 10),
          },
        });
      }
    }
  });
}

export async function getOutletsWithSummary(alamatId: string): Promise<OutletWithSummary[]> {
  const outlets = await prisma.outlet.findMany({
    where: { alamatId },
    orderBy: { noInduk: "asc" },
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
      noInduk: o.noInduk,
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
