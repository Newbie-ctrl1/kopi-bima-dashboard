// ============================================
// Kopi Bima — Data Access Layer (Prisma & PostgreSQL)
// ============================================

import { prisma } from "./db";
import type { Database, Jalur, Alamat, Outlet, OutletFormData } from "./types";

// ---- Compute helper ----

function calculateFields(input: OutletFormData) {
  const totalPiutang = Math.max(0, input.order * input.harga - input.totalBayar);
  const status = totalPiutang > 0 ? "Piutang" : "Lunas";
  return {
    noInduk: input.noInduk,
    outlet: input.outlet,
    tglDaftar: input.tglDaftar,
    order: input.order,
    harga: input.harga,
    totalBayar: input.totalBayar,
    totalPiutang,
    status,
  };
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
// OUTLET CRUD
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
    order: o.order,
    harga: o.harga,
    totalBayar: o.totalBayar,
    totalPiutang: o.totalPiutang,
    status: o.status as "Lunas" | "Piutang",
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
    order: o.order,
    harga: o.harga,
    totalBayar: o.totalBayar,
    totalPiutang: o.totalPiutang,
    status: o.status as "Lunas" | "Piutang",
  };
}

export async function createOutlet(
  alamatId: string,
  input: OutletFormData
): Promise<Outlet> {
  const fields = calculateFields(input);
  const o = await prisma.outlet.create({
    data: {
      alamatId,
      ...fields,
    },
  });
  return {
    id: o.id,
    alamatId: o.alamatId,
    noInduk: o.noInduk,
    outlet: o.outlet,
    tglDaftar: o.tglDaftar,
    order: o.order,
    harga: o.harga,
    totalBayar: o.totalBayar,
    totalPiutang: o.totalPiutang,
    status: o.status as "Lunas" | "Piutang",
  };
}

export async function updateOutlet(
  id: string,
  input: OutletFormData
): Promise<Outlet | null> {
  const fields = calculateFields(input);
  try {
    const o = await prisma.outlet.update({
      where: { id },
      data: fields,
    });
    return {
      id: o.id,
      alamatId: o.alamatId,
      noInduk: o.noInduk,
      outlet: o.outlet,
      tglDaftar: o.tglDaftar,
      order: o.order,
      harga: o.harga,
      totalBayar: o.totalBayar,
      totalPiutang: o.totalPiutang,
      status: o.status as "Lunas" | "Piutang",
    };
  } catch {
    return null;
  }
}

export async function deleteOutlet(id: string): Promise<void> {
  await prisma.outlet.delete({ where: { id } });
}

export async function bulkCreateOutlets(
  alamatId: string,
  inputs: OutletFormData[]
): Promise<void> {
  const data = inputs.map((input) => ({
    alamatId,
    ...calculateFields(input),
  }));
  await prisma.outlet.createMany({
    data,
  });
}

// ============================================
// STATS HELPERS
// ============================================

export async function getOutletStats(alamatId: string) {
  const outlets = await getOutletsByAlamat(alamatId);
  const total = outlets.length;
  const lunas = outlets.filter((o) => o.status === "Lunas").length;
  const piutang = outlets.filter((o) => o.status === "Piutang").length;
  const totalPendapatan = outlets.reduce((sum, o) => sum + o.totalBayar, 0);
  const totalPiutangNominal = outlets.reduce(
    (sum, o) => sum + o.totalPiutang,
    0
  );

  return {
    total,
    lunas,
    piutang,
    totalPendapatan,
    totalPiutangNominal,
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
// ANALYTICS HELPERS
// ============================================

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
    order: o.order,
    harga: o.harga,
    totalBayar: o.totalBayar,
    totalPiutang: o.totalPiutang,
    status: o.status as "Lunas" | "Piutang",
  }));
}

export interface AnalyticsPeriod {
  key: string;
  label: string;
  totalOutlet: number;
  totalOrder: number;
  totalHarga: number;
  totalBayar: number;
  totalPiutang: number;
  lunas: number;
  piutang: number;
  outlets: Outlet[];
}

export async function getAnalyticsData(
  dbId: string,
  mode: "harian" | "bulanan" | "tahunan"
): Promise<AnalyticsPeriod[]> {
  const outlets = await getOutletsByDatabase(dbId);

  // Group outlets by period key
  const groups = new Map<string, Outlet[]>();

  for (const o of outlets) {
    const date = o.tglDaftar || "";
    let key: string;

    if (mode === "harian") {
      key = date;
    } else if (mode === "bulanan") {
      key = date.slice(0, 7);
    } else {
      key = date.slice(0, 4);
    }

    if (!key) continue;

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(o);
  }

  // Convert to AnalyticsPeriod array
  const periods: AnalyticsPeriod[] = [];

  for (const [key, periodOutlets] of groups) {
    let label: string;

    if (mode === "harian") {
      const d = new Date(key + "T00:00:00");
      label = d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } else if (mode === "bulanan") {
      const [y, m] = key.split("-");
      const d = new Date(parseInt(y), parseInt(m) - 1, 1);
      label = d.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
    } else {
      label = `Tahun ${key}`;
    }

    periods.push({
      key,
      label,
      totalOutlet: periodOutlets.length,
      totalOrder: periodOutlets.reduce((sum, o) => sum + o.order, 0),
      totalHarga: periodOutlets.reduce(
        (sum, o) => sum + o.order * o.harga,
        0
      ),
      totalBayar: periodOutlets.reduce((sum, o) => sum + o.totalBayar, 0),
      totalPiutang: periodOutlets.reduce((sum, o) => sum + o.totalPiutang, 0),
      lunas: periodOutlets.filter((o) => o.status === "Lunas").length,
      piutang: periodOutlets.filter((o) => o.status === "Piutang").length,
      outlets: periodOutlets,
    });
  }

  // Sort by key descending
  periods.sort((a, b) => b.key.localeCompare(a.key));

  return periods;
}

// Get aggregate summary for a database
export async function getDatabaseSummary(dbId: string) {
  const outlets = await getOutletsByDatabase(dbId);
  const totalPendapatan = outlets.reduce((sum, o: any) => sum + o.order * o.harga, 0);
  const totalBayar = outlets.reduce((sum, o: any) => sum + o.totalBayar, 0);
  const totalPiutang = outlets.reduce((sum, o: any) => sum + o.totalPiutang, 0);
  return {
    totalOutlet: outlets.length,
    totalOrder: outlets.reduce((sum, o: any) => sum + o.order, 0),
    totalPendapatan,
    totalBayar,
    totalPiutang,
    lunas: outlets.filter((o: any) => o.status === "Lunas").length,
    piutang: outlets.filter((o: any) => o.status === "Piutang").length,
  };
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
    lawang: "LW",
    singosari: "SG",
    kepanjen: "KP",
    gondanglegi: "GL",
  };
  const cleanAlamat = alamat.name.toLowerCase().trim();
  let alamatCode = mapped[cleanAlamat];
  if (!alamatCode) {
    const words = cleanAlamat.split(/[\s-_]+/);
    if (words.length > 1) {
      alamatCode = (words[0][0] + words[1][0]).toUpperCase();
    } else {
      const first = cleanAlamat[0];
      const consonants = cleanAlamat.slice(1).replace(/[aeiou]/g, "");
      alamatCode = (first + (consonants[0] || cleanAlamat[1] || "X")).toUpperCase();
    }
  }

  const prefix = `#${dbLetter}${jalurCode}${alamatCode}`;

  // 4. Find next sequence number
  let maxSeq = 0;
  for (const o of alamat.outlets) {
    if (o.noInduk.startsWith(prefix)) {
      const seqStr = o.noInduk.slice(prefix.length);
      const seqNum = parseInt(seqStr, 10);
      if (!isNaN(seqNum) && seqNum > maxSeq) {
        maxSeq = seqNum;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const nextSeqStr = String(nextSeq).padStart(3, "0");

  return `${prefix}${nextSeqStr}`;
}

export async function getGlobalSummary() {
  const outlets = await prisma.outlet.findMany();
  const totalPendapatan = outlets.reduce((sum, o: any) => sum + o.order * o.harga, 0);
  const totalBayar = outlets.reduce((sum, o: any) => sum + o.totalBayar, 0);
  const totalPiutang = outlets.reduce((sum, o: any) => sum + o.totalPiutang, 0);
  const totalOrder = outlets.reduce((sum, o: any) => sum + o.order, 0);

  return {
    totalOutlet: outlets.length,
    totalOrder,
    totalPendapatan,
    totalBayar,
    totalPiutang,
    pemasukan: totalPendapatan - totalPiutang,
    lunas: outlets.filter((o: any) => o.status === "Lunas").length,
    piutang: outlets.filter((o: any) => o.status === "Piutang").length,
  };
}

export async function getGlobalPeriodSummary() {
  const outlets = await prisma.outlet.findMany();

  const dailyMap: Record<string, { order: number; pendapatan: number; bayar: number; piutang: number }> = {};
  const monthlyMap: Record<string, { order: number; pendapatan: number; bayar: number; piutang: number }> = {};
  const yearlyMap: Record<string, { order: number; pendapatan: number; bayar: number; piutang: number }> = {};

  for (const o of outlets) {
    const dateStr = o.tglDaftar;
    if (!dateStr || dateStr.length < 10) continue;

    const day = dateStr;
    const month = dateStr.slice(0, 7);
    const year = dateStr.slice(0, 4);

    const val = o.order;
    const rev = o.order * o.harga;
    const pay = o.totalBayar;
    const piut = o.totalPiutang;

    // Daily
    if (!dailyMap[day]) dailyMap[day] = { order: 0, pendapatan: 0, bayar: 0, piutang: 0 };
    dailyMap[day].order += val;
    dailyMap[day].pendapatan += rev;
    dailyMap[day].bayar += pay;
    dailyMap[day].piutang += piut;

    // Monthly
    if (!monthlyMap[month]) monthlyMap[month] = { order: 0, pendapatan: 0, bayar: 0, piutang: 0 };
    monthlyMap[month].order += val;
    monthlyMap[month].pendapatan += rev;
    monthlyMap[month].bayar += pay;
    monthlyMap[month].piutang += piut;

    // Yearly
    if (!yearlyMap[year]) yearlyMap[year] = { order: 0, pendapatan: 0, bayar: 0, piutang: 0 };
    yearlyMap[year].order += val;
    yearlyMap[year].pendapatan += rev;
    yearlyMap[year].bayar += pay;
    yearlyMap[year].piutang += piut;
  }

  const formatPeriod = (map: Record<string, any>) => {
    return Object.entries(map)
      .map(([label, val]: [string, any]) => ({
        label,
        ...val,
        pemasukan: val.pendapatan - val.piutang,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  return {
    harian: formatPeriod(dailyMap),
    bulanan: formatPeriod(monthlyMap),
    tahunan: formatPeriod(yearlyMap),
  };
}

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
    data: {
      name,
      sku,
      quantity,
      unit,
      price,
    },
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
