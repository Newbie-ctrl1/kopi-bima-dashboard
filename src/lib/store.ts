// ============================================
// Kopi Bima — Data Access Layer (Prisma & PostgreSQL)
// ============================================

import { prisma } from "./db";
import crypto from "node:crypto";
import type { Database, Jalur, Alamat, Outlet, OutletFormData, OutletWithSummary, Order, OrderFormData, OrderWithRelations, Payment, PaymentFormData, PaymentWithRelations } from "./types";

// ---- Order Compute helper ----

function calculateOrderFields(input: OrderFormData) {
  const isCancelled = input.orderStatus === "Cancel";
  const totalPiutang = isCancelled ? 0 : Math.max(0, input.order * input.harga - input.totalBayar);
  const status = totalPiutang > 0 ? "Piutang" : "Lunas";
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

// ---- Stock adjustment helper ----

async function adjustCoffeeStock(quantityDiff: number) {
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

async function getCoffeeStockQuantity(): Promise<number> {
  const stocks = await prisma.coffeeStock.findMany({ take: 1 });
  return stocks.length > 0 ? stocks[0].quantity : 0;
}

// ============================================
// DATABASE CRUD
// ============================================

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

// ============================================
// JALUR CRUD
// ============================================

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

// ============================================
// ALAMAT CRUD
// ============================================

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

// ============================================
// OUTLET CRUD (Registration Only)
// ============================================

export async function getOutletsByAlamat(alamatId: string): Promise<Outlet[]> {
  const list = await prisma.outlet.findMany({
    where: { alamatId },
    orderBy: { noInduk: "asc" },
  });
  return list.map((o: any) => ({
    id: o.id,
    alamatId: o.alamatId,
    noInduk: o.noInduk,
    outlet: o.outlet,
    tglDaftar: o.tglDaftar,
  }));
}

export async function getOutletById(id: string): Promise<Outlet | undefined> {
  const o = await prisma.outlet.findUnique({ where: { id } });
  if (!o) return undefined;
  return {
    id: o.id,
    alamatId: o.alamatId,
    noInduk: o.noInduk,
    outlet: o.outlet,
    tglDaftar: o.tglDaftar,
  };
}

export async function createOutlet(
  alamatId: string,
  input: OutletFormData
): Promise<Outlet> {
  const o = await prisma.outlet.create({
    data: {
      alamatId,
      noInduk: input.noInduk,
      outlet: input.outlet,
      tglDaftar: input.tglDaftar,
    },
  });
  return {
    id: o.id,
    alamatId: o.alamatId,
    noInduk: o.noInduk,
    outlet: o.outlet,
    tglDaftar: o.tglDaftar,
  };
}

export async function updateOutlet(
  id: string,
  input: OutletFormData
): Promise<Outlet | null> {
  try {
    const o = await prisma.outlet.update({
      where: { id },
      data: {
        noInduk: input.noInduk,
        outlet: input.outlet,
        tglDaftar: input.tglDaftar,
      },
    });
    return {
      id: o.id,
      alamatId: o.alamatId,
      noInduk: o.noInduk,
      outlet: o.outlet,
      tglDaftar: o.tglDaftar,
    };
  } catch {
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

export async function bulkCreateOutlets(
  alamatId: string,
  inputs: OutletFormData[]
): Promise<void> {
  const data = inputs.map((input) => ({
    alamatId,
    noInduk: input.noInduk,
    outlet: input.outlet,
    tglDaftar: input.tglDaftar,
  }));
  await prisma.outlet.createMany({ data });
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

// ============================================
// ORDER CRUD
// ============================================

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
    outletNoInduk: o.outlet.noInduk,
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
    orderBy: { noInduk: "asc" },
  });
  return list.map((o: any) => ({
    id: o.id,
    alamatId: o.alamatId,
    noInduk: o.noInduk,
    outlet: o.outlet,
    tglDaftar: o.tglDaftar,
  }));
}

// ============================================
// STATS HELPERS
// ============================================

export async function getOutletStats(alamatId: string) {
  const outletsWithSummary = await getOutletsWithSummary(alamatId);
  const total = outletsWithSummary.length;
  const totalPendapatan = outletsWithSummary.reduce((sum, o) => sum + o.totalPendapatan, 0);
  const totalPemasukan = outletsWithSummary.reduce((sum, o) => sum + o.totalBayar, 0);
  const totalPiutang = outletsWithSummary.reduce((sum, o) => sum + o.totalPiutang, 0);
  const lunas = outletsWithSummary.filter((o) => o.totalPiutang === 0 && o.totalOrder > 0).length;
  const piutang = outletsWithSummary.filter((o) => o.totalPiutang > 0).length;

  return {
    total,
    lunas,
    piutang,
    totalPendapatan,
    totalPemasukan,
    totalPiutang,
  };
}

// Count children for display
export async function countJalurInDb(dbId: string): Promise<number> {
  return prisma.jalur.count({ where: { databaseId: dbId } });
}

export async function countAlamatInJalur(jalurId: string): Promise<number> {
  return prisma.alamat.count({ where: { jalurId } });
}

export async function countOutletsInAlamat(alamatId: string): Promise<number> {
  return prisma.outlet.count({ where: { alamatId } });
}

// ============================================
// ANALYTICS HELPERS (from Order model)
// ============================================

export interface AnalyticsPeriod {
  key: string;
  label: string;
  totalOutlet: number;
  totalOrder: number;
  totalPendapatan: number;
  totalBayar: number;
  totalPiutang: number;
  lunas: number;
  piutang: number;
  orders: OrderWithRelations[];
  payments: PaymentWithRelations[];
}

export async function getDatabaseAnalytics(
  dbId: string
): Promise<{ periods: AnalyticsPeriod[]; summary: any }> {
  await autoUpdatePastProsesOrders(dbId);

  const orders = await prisma.order.findMany({
    where: {
      orderStatus: "Sukses",
      outlet: {
        alamat: {
          jalur: {
            databaseId: dbId,
          },
        },
      },
    },
  });

  const payments = await prisma.payment.findMany({
    where: {
      outlet: {
        alamat: {
          jalur: {
            databaseId: dbId,
          },
        },
      },
    },
  });

  const totalPendapatan = orders.reduce((sum, o: any) => sum + o.order * o.harga, 0);
  const totalBayar = payments.reduce((sum, p: any) => sum + p.amount, 0);
  const totalPiutang = Math.max(0, totalPendapatan - totalBayar);
  const totalOrder = orders.reduce((sum, o: any) => sum + o.order, 0);

  // Pending orders
  const pendingOrders = await prisma.order.findMany({
    where: {
      orderStatus: "Pending",
      outlet: {
        alamat: {
          jalur: {
            databaseId: dbId,
          },
        },
      },
    },
  });
  const pendingCount = pendingOrders.length;
  const pendingOrder = pendingOrders.reduce((sum, o: any) => sum + o.order, 0);
  const pendingNominal = pendingOrders.reduce((sum, o: any) => sum + o.order * o.harga, 0);

  // Get outlets to compute lunas/piutang count
  const outlets = await prisma.outlet.findMany({
    where: {
      alamat: {
        jalur: {
          databaseId: dbId,
        },
      },
    },
    include: {
      orders: true,
      payments: true,
    },
  });

  let lunasCount = 0;
  let piutangCount = 0;
  for (const o of outlets) {
    const suksesOrders = o.orders.filter((ord: any) => ord.orderStatus === "Sukses");
    const totalOrderVal = suksesOrders.reduce((sum: number, ord: any) => sum + ord.order * ord.harga, 0);
    const totalPaidVal = o.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    if (totalOrderVal - totalPaidVal > 0) {
      piutangCount++;
    } else {
      lunasCount++;
    }
  }

  const summary = {
    totalOutlet: outlets.length,
    totalOrder,
    totalPendapatan,
    totalBayar,
    totalPiutang,
    lunas: lunasCount,
    piutang: piutangCount,
    pendingCount,
    pendingOrder,
    pendingNominal,
  };

  return { periods: [], summary };
}

export async function getDatabaseSummary(dbId: string) {
  const { summary } = await getDatabaseAnalytics(dbId);
  return summary;
}

export async function getAnalyticsData(
  dbId: string,
  period: "harian" | "bulanan" | "tahunan"
): Promise<AnalyticsPeriod[]> {
  await autoUpdatePastProsesOrders(dbId);

  const orders = await prisma.order.findMany({
    where: {
      orderStatus: "Sukses",
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

  const payments = await prisma.payment.findMany({
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

  const map: Record<
    string,
    {
      outlets: Set<string>;
      order: number;
      pendapatan: number;
      bayar: number;
      outletMap: Record<
        string,
        {
          outletId: string;
          outletName: string;
          outletNoInduk: string;
          alamatName: string;
          jalurName: string;
          databaseName: string;
          order: number;
          harga: number;
          total: number;
          bayar: number;
          keteranganList: string[];
        }
      >;
    }
  > = {};

  // Group orders
  for (const o of orders) {
    const dateStr = o.tglOrder;
    if (!dateStr || dateStr.length < 10) continue;

    let key: string;
    if (period === "harian") key = dateStr;
    else if (period === "bulanan") key = dateStr.slice(0, 7);
    else key = dateStr.slice(0, 4);

    if (!map[key]) {
      map[key] = {
        outlets: new Set(),
        order: 0,
        pendapatan: 0,
        bayar: 0,
        outletMap: {},
      };
    }

    map[key].outlets.add(o.outletId);
    map[key].order += o.order;
    map[key].pendapatan += o.order * o.harga;

    if (!map[key].outletMap[o.outletId]) {
      map[key].outletMap[o.outletId] = {
        outletId: o.outletId,
        outletName: o.outlet.outlet,
        outletNoInduk: o.outlet.noInduk,
        alamatName: o.outlet.alamat.name,
        jalurName: o.outlet.alamat.jalur.name,
        databaseName: o.outlet.alamat.jalur.database.name,
        order: 0,
        harga: o.harga,
        total: 0,
        bayar: 0,
        keteranganList: [],
      };
    }
    const cell = map[key].outletMap[o.outletId];
    cell.order += o.order;
    cell.total += o.order * o.harga;
    cell.harga = o.harga; // Keep latest price
    if (o.keterangan && o.keterangan.trim()) {
      if (!cell.keteranganList.includes(o.keterangan.trim())) {
        cell.keteranganList.push(o.keterangan.trim());
      }
    }
  }

  // Group payments
  for (const p of payments) {
    const dateStr = p.tglPayment;
    if (!dateStr || dateStr.length < 10) continue;

    let key: string;
    if (period === "harian") key = dateStr;
    else if (period === "bulanan") key = dateStr.slice(0, 7);
    else key = dateStr.slice(0, 4);

    if (!map[key]) {
      map[key] = {
        outlets: new Set(),
        order: 0,
        pendapatan: 0,
        bayar: 0,
        outletMap: {},
      };
    }

    map[key].outlets.add(p.outletId);
    map[key].bayar += p.amount;

    if (!map[key].outletMap[p.outletId]) {
      map[key].outletMap[p.outletId] = {
        outletId: p.outletId,
        outletName: p.outlet.outlet,
        outletNoInduk: p.outlet.noInduk,
        alamatName: p.outlet.alamat.name,
        jalurName: p.outlet.alamat.jalur.name,
        databaseName: p.outlet.alamat.jalur.database.name,
        order: 0,
        harga: 0,
        total: 0,
        bayar: 0,
        keteranganList: [],
      };
    }
    map[key].outletMap[p.outletId].bayar += p.amount;
  }

  return Object.entries(map)
    .map(([key, val]) => {
      const periodOrders = Object.values(val.outletMap).map((oCell) => {
        const totalPiutang = Math.max(0, oCell.total - oCell.bayar);
        const status = totalPiutang > 0 ? ("Piutang" as const) : ("Lunas" as const);
        return {
          id: `${key}-${oCell.outletId}`,
          outletId: oCell.outletId,
          order: oCell.order,
          harga: oCell.harga,
          totalBayar: oCell.bayar,
          totalPiutang: totalPiutang,
          status: status,
          orderStatus: "Sukses" as const,
          paymentMethod: "Cash" as const,
          tglOrder: key,
          keterangan: oCell.keteranganList.length > 0 ? oCell.keteranganList.join("; ") : undefined,
          outletName: oCell.outletName,
          outletNoInduk: oCell.outletNoInduk,
          alamatName: oCell.alamatName,
          jalurName: oCell.jalurName,
          databaseName: oCell.databaseName,
        };
      });

      const periodPayments = payments
        .filter((p) => {
          const dateStr = p.tglPayment;
          if (!dateStr || dateStr.length < 10) return false;
          if (period === "harian") return dateStr === key;
          if (period === "bulanan") return dateStr.slice(0, 7) === key;
          return dateStr.slice(0, 4) === key;
        })
        .map((p) => ({
          id: p.id,
          outletId: p.outletId,
          amount: p.amount,
          paymentMethod: p.paymentMethod as "Cash" | "Transfer",
          tglPayment: p.tglPayment,
          keterangan: p.keterangan ?? undefined,
          outletName: p.outlet.outlet,
          outletNoInduk: p.outlet.noInduk,
          alamatName: p.outlet.alamat.name,
          jalurName: p.outlet.alamat.jalur.name,
          databaseName: p.outlet.alamat.jalur.database.name,
        }));

      const lunasCount = periodOrders.filter((o) => o.status === "Lunas" && o.order > 0).length;
      const piutangCount = periodOrders.filter((o) => o.status === "Piutang").length;

      return {
        key,
        label: key,
        totalOutlet: val.outlets.size,
        totalOrder: val.order,
        totalPendapatan: val.pendapatan,
        totalBayar: val.bayar,
        totalPiutang: Math.max(0, val.pendapatan - val.bayar),
        lunas: lunasCount,
        piutang: piutangCount,
        orders: periodOrders,
        payments: periodPayments,
      };
    })
    .sort((a, b) => b.key.localeCompare(a.key));
}

export async function getNextNoInduk(alamatId: string): Promise<string> {
  const alamat = await prisma.alamat.findUnique({
    where: { id: alamatId },
    include: {
      jalur: {
        include: {
          database: true,
        },
      },
      outlets: true,
    },
  });

  if (!alamat) return "";

  // 1. Database code: initials of database name
  const dbWords = alamat.jalur.database.name.trim().split(/[\s-_]+/);
  let dbLetter = "";
  if (dbWords.length > 1) {
    dbLetter = dbWords.map((w) => w.charAt(0).toUpperCase()).join("");
  } else {
    dbLetter = dbWords[0].slice(0, 2).toUpperCase();
  }

  // 2. Jalur code: J + digit
  const jalurNum = alamat.jalur.name.match(/\d+/)?.[0] || "1";
  const jalurCode = `J${jalurNum}`;

  // 3. Alamat code
  const mapped: Record<string, string> = {
    sananrejo: "SN",
    wonokerto: "WN",
    bululawang: "BL",
    krebet: "KB",
    tajinan: "TJ",
    pakisaji: "PK",
    gondanglegi: "GL",
    kepanjen: "KP",
    sumberpucung: "SP",
    dampit: "DM",
    turen: "TR",
  };
  const nameKey = alamat.name.toLowerCase().replace(/\s+/g, "");
  const alamatCode = mapped[nameKey] || alamat.name.slice(0, 2).toUpperCase();

  const prefix = `#${dbLetter}${jalurCode}${alamatCode}`;

  // 4. Sequence number
  const existingNums = alamat.outlets
    .map((o: any) => {
      const match = o.noInduk.match(/(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n: number) => !isNaN(n));

  const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
  const nextSeq = maxNum + 1;
  const nextSeqStr = String(nextSeq).padStart(3, "0");

  return `${prefix}${nextSeqStr}`;
}

export async function getGlobalSummary() {
  const orders = await prisma.order.findMany({ where: { orderStatus: "Sukses" } });
  const payments = await prisma.payment.findMany();
  const pendingOrders = await prisma.order.findMany({ where: { orderStatus: "Pending" } });

  const totalPendapatan = orders.reduce((sum, o: any) => sum + o.order * o.harga, 0);
  const totalBayar = payments.reduce((sum, p: any) => sum + p.amount, 0);
  const totalPiutang = Math.max(0, totalPendapatan - totalBayar);
  const totalOrder = orders.reduce((sum, o: any) => sum + o.order, 0);

  const pendingOrder = pendingOrders.reduce((sum, o: any) => sum + o.order, 0);
  const pendingNominal = pendingOrders.reduce((sum, o: any) => sum + o.order * o.harga, 0);

  // Get all outlets to compute lunas/piutang count
  const outlets = await prisma.outlet.findMany({
    include: {
      orders: true,
      payments: true,
    },
  });

  let lunasCount = 0;
  let piutangCount = 0;
  for (const o of outlets) {
    const suksesOrders = o.orders.filter((ord: any) => ord.orderStatus === "Sukses");
    const totalOrderVal = suksesOrders.reduce((sum: number, ord: any) => sum + ord.order * ord.harga, 0);
    const totalPaidVal = o.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    if (totalOrderVal - totalPaidVal > 0) {
      piutangCount++;
    } else if (suksesOrders.length > 0) {
      lunasCount++;
    }
  }

  return {
    totalOutlet: outlets.length,
    totalOrder,
    totalPendapatan,
    totalBayar,
    totalPiutang,
    pemasukan: totalBayar,
    lunas: lunasCount,
    piutang: piutangCount,
    pendingCount: pendingOrders.length,
    pendingOrder,
    pendingNominal,
  };
}

export async function getGlobalPeriodSummary() {
  const orders = await prisma.order.findMany({
    where: { orderStatus: "Sukses" },
  });
  const payments = await prisma.payment.findMany();

  const dailyMap: Record<string, { order: number; pendapatan: number; bayar: number; piutang: number }> = {};
  const monthlyMap: Record<string, { order: number; pendapatan: number; bayar: number; piutang: number }> = {};
  const yearlyMap: Record<string, { order: number; pendapatan: number; bayar: number; piutang: number }> = {};

  // Group orders for order count & pendapatan
  for (const o of orders) {
    const dateStr = o.tglOrder;
    if (!dateStr || dateStr.length < 10) continue;

    const day = dateStr;
    const month = dateStr.slice(0, 7);
    const year = dateStr.slice(0, 4);

    const val = o.order;
    const rev = o.order * o.harga;

    // Daily
    if (!dailyMap[day]) dailyMap[day] = { order: 0, pendapatan: 0, bayar: 0, piutang: 0 };
    dailyMap[day].order += val;
    dailyMap[day].pendapatan += rev;

    // Monthly
    if (!monthlyMap[month]) monthlyMap[month] = { order: 0, pendapatan: 0, bayar: 0, piutang: 0 };
    monthlyMap[month].order += val;
    monthlyMap[month].pendapatan += rev;

    // Yearly
    if (!yearlyMap[year]) yearlyMap[year] = { order: 0, pendapatan: 0, bayar: 0, piutang: 0 };
    yearlyMap[year].order += val;
    yearlyMap[year].pendapatan += rev;
  }

  // Group payments for bayar (received/pemasukan)
  for (const p of payments) {
    const dateStr = p.tglPayment;
    if (!dateStr || dateStr.length < 10) continue;

    const day = dateStr;
    const month = dateStr.slice(0, 7);
    const year = dateStr.slice(0, 4);

    const amt = p.amount;

    // Daily
    if (!dailyMap[day]) dailyMap[day] = { order: 0, pendapatan: 0, bayar: 0, piutang: 0 };
    dailyMap[day].bayar += amt;

    // Monthly
    if (!monthlyMap[month]) monthlyMap[month] = { order: 0, pendapatan: 0, bayar: 0, piutang: 0 };
    monthlyMap[month].bayar += amt;

    // Yearly
    if (!yearlyMap[year]) yearlyMap[year] = { order: 0, pendapatan: 0, bayar: 0, piutang: 0 };
    yearlyMap[year].bayar += amt;
  }

  // Compute piutang = pendapatan - bayar for each period
  const computePiutang = (map: Record<string, any>) => {
    for (const key in map) {
      map[key].piutang = Math.max(0, map[key].pendapatan - map[key].bayar);
    }
  };
  computePiutang(dailyMap);
  computePiutang(monthlyMap);
  computePiutang(yearlyMap);

  const formatPeriod = (map: Record<string, any>) => {
    return Object.entries(map)
      .map(([label, val]: [string, any]) => ({
        label,
        ...val,
        pemasukan: val.bayar,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  return {
    harian: formatPeriod(dailyMap),
    bulanan: formatPeriod(monthlyMap),
    tahunan: formatPeriod(yearlyMap),
  };
}

// ============================================
// COFFEE STOCK
// ============================================

export async function getCoffeeStocks() {
  return await prisma.coffeeStock.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createCoffeeStock(
  name: string,
  sku: string,
  quantity: number,
  unit: string,
  price: number
) {
  return await prisma.coffeeStock.create({
    data: { name, sku, quantity, unit, price },
  });
}

export async function updateCoffeeStock(id: string, data: any) {
  return await prisma.coffeeStock.update({
    where: { id },
    data,
  });
}

export async function deleteCoffeeStock(id: string) {
  return await prisma.coffeeStock.delete({
    where: { id },
  });
}

// ============================================
// PAYMENT CRUD
// ============================================

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
    outletNoInduk: p.outlet.noInduk,
    alamatName: p.outlet.alamat.name,
    jalurName: p.outlet.alamat.jalur.name,
    databaseName: p.outlet.alamat.jalur.database.name,
  }));
}

// ============================================
// USER MANAGEMENT & AUTHENTICATION STORE LOGIC
// ============================================

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
