// ============================================
// Kopi Bima — Analytics, Stats & Summaries
// ============================================

import { prisma } from "../db";
import type { OrderWithRelations, PaymentWithRelations } from "../types";
import { autoUpdatePastProsesOrders } from "./order";
import { getOutletsWithSummary } from "./outlet";

// ---- Type Exports ----

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

// ---- Stats Helpers ----

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

// ---- Database Analytics ----

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
        outletNoInduk: o.outlet.noId,
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
        outletNoInduk: p.outlet.noId,
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
          outletNoInduk: p.outlet.noId,
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

// ---- Next NoInduk Generator ----

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
      const match = o.noId.match(/(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n: number) => !isNaN(n));

  const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
  const nextSeq = maxNum + 1;
  const nextSeqStr = String(nextSeq).padStart(3, "0");

  return `${prefix}${nextSeqStr}`;
}

// ---- Global Summaries ----

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
