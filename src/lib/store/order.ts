// ============================================
// Kopi Bima — Order CRUD
// ============================================

import { prisma } from "../db";
import type { Outlet, Order, OrderFormData, OrderWithRelations } from "../types";
import { calculateOrderFields, adjustCoffeeStock, getCoffeeStockQuantity } from "./helpers";

export async function createOrder(input: OrderFormData): Promise<Order> {
  if (input.orderStatus === "Sukses") {
    const currentStock = await getCoffeeStockQuantity();
    if (currentStock < input.order) {
      throw new Error(`Stok kopi tidak mencukupi (Tersisa: ${currentStock} Kardus, Diminta: ${input.order} Kardus)`);
    }
  }

  const fields = calculateOrderFields(input);
  const o = await prisma.order.create({ data: fields });

  // Reactive Coffee Stock adjustment
  if (o.orderStatus === "Sukses") {
    await adjustCoffeeStock(-o.order);
  }

  return {
    id: o.id,
    outletId: o.outletId,
    order: o.order,
    harga: o.harga,
    totalBayar: o.totalBayar,
    totalPiutang: o.totalPiutang,
    status: o.status as "Lunas" | "Piutang",
    orderStatus: o.orderStatus as "Sukses" | "Pending" | "Cancel" | "Proses",
    paymentMethod: o.paymentMethod as "Cash" | "Transfer",
    tglOrder: o.tglOrder,
    keterangan: o.keterangan ?? undefined,
  };
}

export async function updateOrder(
  id: string,
  input: OrderFormData
): Promise<Order | null> {
  const oldOrder = await prisma.order.findUnique({ where: { id } });
  if (!oldOrder) return null;

  // Calculate stock effect before database update
  const oldStockEffect = oldOrder.orderStatus === "Sukses" ? -oldOrder.order : 0;
  const newStockEffect = input.orderStatus === "Sukses" ? -input.order : 0;
  const netDiff = newStockEffect - oldStockEffect;

  if (netDiff !== 0) {
    if (netDiff < 0) {
      const currentStock = await getCoffeeStockQuantity();
      const needed = Math.abs(netDiff);
      if (currentStock < needed) {
        throw new Error(`Stok kopi tidak mencukupi (Tersisa: ${currentStock} Kardus, Butuh tambahan: ${needed} Kardus)`);
      }
    }
  }

  const fields = calculateOrderFields(input);
  const o = await prisma.order.update({
    where: { id },
    data: fields,
  });

  if (netDiff !== 0) {
    await adjustCoffeeStock(netDiff);
  }

  return {
    id: o.id,
    outletId: o.outletId,
    order: o.order,
    harga: o.harga,
    totalBayar: o.totalBayar,
    totalPiutang: o.totalPiutang,
    status: o.status as "Lunas" | "Piutang",
    orderStatus: o.orderStatus as "Sukses" | "Pending" | "Cancel" | "Proses",
    paymentMethod: o.paymentMethod as "Cash" | "Transfer",
    tglOrder: o.tglOrder,
    keterangan: o.keterangan ?? undefined,
  };
}

export async function deleteOrder(id: string): Promise<void> {
  const oldOrder = await prisma.order.findUnique({ where: { id } });
  if (oldOrder && oldOrder.orderStatus === "Sukses") {
    await adjustCoffeeStock(oldOrder.order);
  }
  await prisma.order.delete({ where: { id } });
}

export async function autoUpdatePastProsesOrders(dbId: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const pastProsesOrders = await prisma.order.findMany({
    where: {
      orderStatus: "Proses",
      tglOrder: {
        lt: today,
      },
      outlet: {
        alamat: {
          jalur: {
            databaseId: dbId,
          },
        },
      },
    },
    select: { id: true },
  });

  if (pastProsesOrders.length > 0) {
    await prisma.order.updateMany({
      where: {
        id: { in: pastProsesOrders.map((o) => o.id) },
      },
      data: {
        orderStatus: "Pending",
      },
    });
  }
}

// Get all orders for a database with outlet/location relations
export async function getOrdersByDatabase(dbId: string): Promise<OrderWithRelations[]> {
  await autoUpdatePastProsesOrders(dbId);

  const list = await prisma.order.findMany({
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

  return list.map((o: any) => ({
    id: o.id,
    outletId: o.outletId,
    order: o.order,
    harga: o.harga,
    totalBayar: o.totalBayar,
    totalPiutang: o.totalPiutang,
    status: o.status as "Lunas" | "Piutang",
    orderStatus: o.orderStatus as "Sukses" | "Pending" | "Cancel" | "Proses",
    paymentMethod: o.paymentMethod as "Cash" | "Transfer",
    tglOrder: o.tglOrder,
    keterangan: o.keterangan ?? undefined,
    outletName: o.outlet.outlet,
    outletNoInduk: o.outlet.noId,
    alamatName: o.outlet.alamat.name,
    jalurName: o.outlet.alamat.jalur.name,
    databaseName: o.outlet.alamat.jalur.database.name,
  }));
}

// Get all outlets registered in a database (for order form dropdown)
export async function getOutletsByDatabase(dbId: string): Promise<Outlet[]> {
  const list = await prisma.outlet.findMany({
    where: {
      alamat: {
        jalur: {
          databaseId: dbId,
        },
      },
    },
    orderBy: { noId: "asc" },
  });
  return list.map((o: any) => ({
    id: o.id,
    alamatId: o.alamatId,
    noId: o.noId,
    outlet: o.outlet,
    tglDaftar: o.tglDaftar,
  }));
}
