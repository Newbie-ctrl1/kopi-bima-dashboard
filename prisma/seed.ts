import { PrismaClient } from "../src/generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function calculateFields(order: number, harga: number, totalBayar: number) {
  const totalPiutang = Math.max(0, order * harga - totalBayar);
  const status = totalPiutang > 0 ? "Piutang" : "Lunas";
  return { totalPiutang, status };
}

async function main() {
  console.log("Seeding enriched Database Kopi Bima to PostgreSQL...");

  // ============================================
  // 1. SEED DATABASE RENDI
  // ============================================
  console.log("Seeding Database Rendi...");
  const dbRendi = await prisma.database.upsert({
    where: { id: "db-rendi" },
    update: { name: "Database Rendi" },
    create: {
      id: "db-rendi",
      name: "Database Rendi",
      createdAt: new Date("2026-07-01T00:00:00Z"),
    },
  });

  // Jalurs in Rendi
  const jRendi1 = await prisma.jalur.upsert({
    where: { id: "jalur-rendi-1" },
    update: { name: "Jalur 1", databaseId: dbRendi.id },
    create: {
      id: "jalur-rendi-1",
      name: "Jalur 1",
      databaseId: dbRendi.id,
      createdAt: new Date("2026-07-01T01:00:00Z"),
    },
  });

  const jRendi2 = await prisma.jalur.upsert({
    where: { id: "jalur-rendi-2" },
    update: { name: "Jalur 2", databaseId: dbRendi.id },
    create: {
      id: "jalur-rendi-2",
      name: "Jalur 2",
      databaseId: dbRendi.id,
      createdAt: new Date("2026-07-01T02:00:00Z"),
    },
  });

  // Alamats in Jalur 1
  const aSananrejo = await prisma.alamat.upsert({
    where: { id: "alamat-sananrejo" },
    update: { name: "Sananrejo", jalurId: jRendi1.id },
    create: {
      id: "alamat-sananrejo",
      name: "Sananrejo",
      jalurId: jRendi1.id,
      createdAt: new Date("2026-07-01T03:00:00Z"),
    },
  });

  const aWonokerto = await prisma.alamat.upsert({
    where: { id: "alamat-wonokerto" },
    update: { name: "Wonokerto", jalurId: jRendi1.id },
    create: {
      id: "alamat-wonokerto",
      name: "Wonokerto",
      jalurId: jRendi1.id,
      createdAt: new Date("2026-07-01T04:00:00Z"),
    },
  });

  // Alamats in Jalur 2
  const aBululawang = await prisma.alamat.upsert({
    where: { id: "alamat-bululawang" },
    update: { name: "Bululawang", jalurId: jRendi2.id },
    create: {
      id: "alamat-bululawang",
      name: "Bululawang",
      jalurId: jRendi2.id,
      createdAt: new Date("2026-07-01T05:00:00Z"),
    },
  });

  const aKrebet = await prisma.alamat.upsert({
    where: { id: "alamat-krebet" },
    update: { name: "Krebet", jalurId: jRendi2.id },
    create: {
      id: "alamat-krebet",
      name: "Krebet",
      jalurId: jRendi2.id,
      createdAt: new Date("2026-07-01T06:00:00Z"),
    },
  });

  // Outlets in Sananrejo
  const outletsSananrejo = [
    { id: "o-sn-001", noInduk: "#DRJ1SN001", outlet: "Toko Sejahtera", kunjungan: "2026-07-07", order: 2.0, harga: 100000, totalBayar: 200000 },
    { id: "o-sn-002", noInduk: "#DRJ1SN002", outlet: "Warung Barokah", kunjungan: "2026-07-08", order: 1.5, harga: 100000, totalBayar: 100000 },
    { id: "o-sn-003", noInduk: "#DRJ1SN003", outlet: "Toko Makmur Jaya", kunjungan: "2026-07-07", order: 3.0, harga: 100000, totalBayar: 300000 },
    { id: "o-sn-004", noInduk: "#DRJ1SN004", outlet: "Kios Berkah Sanan", kunjungan: "2026-07-09", order: 0.5, harga: 100000, totalBayar: 50000 },
    { id: "o-sn-005", noInduk: "#DRJ1SN005", outlet: "Toko Roti Lezat", kunjungan: "2026-07-10", order: 2.2, harga: 100000, totalBayar: 150000 },
  ];

  for (const o of outletsSananrejo) {
    const { totalPiutang, status } = calculateFields(o.order, o.harga, o.totalBayar);
    await prisma.outlet.upsert({
      where: { id: o.id },
      update: { ...o, totalPiutang, status, alamatId: aSananrejo.id },
      create: { ...o, totalPiutang, status, alamatId: aSananrejo.id },
    });
  }

  // Outlets in Wonokerto
  const outletsWonokerto = [
    { id: "o-wn-001", noInduk: "#DRJ1WN001", outlet: "Toko Berkah", kunjungan: "2026-07-08", order: 1.0, harga: 100000, totalBayar: 50000 },
    { id: "o-wn-002", noInduk: "#DRJ1WN002", outlet: "Warung Bu Sri", kunjungan: "2026-07-08", order: 2.5, harga: 100000, totalBayar: 250000 },
    { id: "o-wn-003", noInduk: "#DRJ1WN003", outlet: "Toko Rejeki Wono", kunjungan: "2026-07-09", order: 4.0, harga: 100000, totalBayar: 350000 },
  ];

  for (const o of outletsWonokerto) {
    const { totalPiutang, status } = calculateFields(o.order, o.harga, o.totalBayar);
    await prisma.outlet.upsert({
      where: { id: o.id },
      update: { ...o, totalPiutang, status, alamatId: aWonokerto.id },
      create: { ...o, totalPiutang, status, alamatId: aWonokerto.id },
    });
  }

  // Outlets in Bululawang
  const outletsBululawang = [
    { id: "o-bl-001", noInduk: "#DRJ2BL001", outlet: "Kios Mandiri", kunjungan: "2026-07-09", order: 2.0, harga: 110000, totalBayar: 150000 },
    { id: "o-bl-002", noInduk: "#DRJ2BL002", outlet: "Toko Sumber Sari", kunjungan: "2026-07-10", order: 1.8, harga: 110000, totalBayar: 198000 },
    { id: "o-bl-003", noInduk: "#DRJ2BL003", outlet: "Agen Sembako Bulu", kunjungan: "2026-07-09", order: 5.0, harga: 110000, totalBayar: 500000 },
  ];

  for (const o of outletsBululawang) {
    const { totalPiutang, status } = calculateFields(o.order, o.harga, o.totalBayar);
    await prisma.outlet.upsert({
      where: { id: o.id },
      update: { ...o, totalPiutang, status, alamatId: aBululawang.id },
      create: { ...o, totalPiutang, status, alamatId: aBululawang.id },
    });
  }

  // Outlets in Krebet
  const outletsKrebet = [
    { id: "o-kb-001", noInduk: "#DRJ2KB001", outlet: "Toko Manis Krebet", kunjungan: "2026-07-10", order: 3.5, harga: 100000, totalBayar: 350000 },
    { id: "o-kb-002", noInduk: "#DRJ2KB002", outlet: "Warung Kopi Gula", kunjungan: "2026-07-10", order: 1.2, harga: 100000, totalBayar: 100000 },
  ];

  for (const o of outletsKrebet) {
    const { totalPiutang, status } = calculateFields(o.order, o.harga, o.totalBayar);
    await prisma.outlet.upsert({
      where: { id: o.id },
      update: { ...o, totalPiutang, status, alamatId: aKrebet.id },
      create: { ...o, totalPiutang, status, alamatId: aKrebet.id },
    });
  }

  // ============================================
  // 2. SEED DATABASE FARID
  // ============================================
  console.log("Seeding Database Farid...");
  const dbFarid = await prisma.database.upsert({
    where: { id: "db-farid" },
    update: { name: "Database Farid" },
    create: {
      id: "db-farid",
      name: "Database Farid",
      createdAt: new Date("2026-07-02T00:00:00Z"),
    },
  });

  // Jalurs in Farid
  const jFaridUtara = await prisma.jalur.upsert({
    where: { id: "jalur-farid-utara" },
    update: { name: "Jalur 1", databaseId: dbFarid.id },
    create: {
      id: "jalur-farid-utara",
      name: "Jalur 1",
      databaseId: dbFarid.id,
      createdAt: new Date("2026-07-02T01:00:00Z"),
    },
  });

  const jFaridSelatan = await prisma.jalur.upsert({
    where: { id: "jalur-farid-selatan" },
    update: { name: "Jalur 2", databaseId: dbFarid.id },
    create: {
      id: "jalur-farid-selatan",
      name: "Jalur 2",
      databaseId: dbFarid.id,
      createdAt: new Date("2026-07-02T02:00:00Z"),
    },
  });

  // Alamats in Jalur 1
  const aLawang = await prisma.alamat.upsert({
    where: { id: "alamat-lawang" },
    update: { name: "Lawang", jalurId: jFaridUtara.id },
    create: {
      id: "alamat-lawang",
      name: "Lawang",
      jalurId: jFaridUtara.id,
      createdAt: new Date("2026-07-02T03:00:00Z"),
    },
  });

  const aSingosari = await prisma.alamat.upsert({
    where: { id: "alamat-singosari" },
    update: { name: "Singosari", jalurId: jFaridUtara.id },
    create: {
      id: "alamat-singosari",
      name: "Singosari",
      jalurId: jFaridUtara.id,
      createdAt: new Date("2026-07-02T04:00:00Z"),
    },
  });

  // Alamats in Jalur 2
  const aKepanjen = await prisma.alamat.upsert({
    where: { id: "alamat-kepanjen" },
    update: { name: "Kepanjen", jalurId: jFaridSelatan.id },
    create: {
      id: "alamat-kepanjen",
      name: "Kepanjen",
      jalurId: jFaridSelatan.id,
      createdAt: new Date("2026-07-02T05:00:00Z"),
    },
  });

  const aGondanglegi = await prisma.alamat.upsert({
    where: { id: "alamat-gondanglegi" },
    update: { name: "Gondanglegi", jalurId: jFaridSelatan.id },
    create: {
      id: "alamat-gondanglegi",
      name: "Gondanglegi",
      jalurId: jFaridSelatan.id,
      createdAt: new Date("2026-07-02T06:00:00Z"),
    },
  });

  // Outlets in Lawang
  const outletsLawang = [
    { id: "o-lw-001", noInduk: "#DFJ1LW001", outlet: "Toko Sehat", kunjungan: "2026-07-07", order: 4.0, harga: 100000, totalBayar: 400000 },
    { id: "o-lw-002", noInduk: "#DFJ1LW002", outlet: "Warung Murni", kunjungan: "2026-07-08", order: 2.5, harga: 100000, totalBayar: 200000 },
    { id: "o-lw-003", noInduk: "#DFJ1LW003", outlet: "Kios Sejahtera Lawang", kunjungan: "2026-07-08", order: 1.0, harga: 100000, totalBayar: 100000 },
    { id: "o-lw-004", noInduk: "#DFJ1LW004", outlet: "Toko Baru Lawang", kunjungan: "2026-07-09", order: 3.2, harga: 100000, totalBayar: 320000 },
  ];

  for (const o of outletsLawang) {
    const { totalPiutang, status } = calculateFields(o.order, o.harga, o.totalBayar);
    await prisma.outlet.upsert({
      where: { id: o.id },
      update: { ...o, totalPiutang, status, alamatId: aLawang.id },
      create: { ...o, totalPiutang, status, alamatId: aLawang.id },
    });
  }

  // Outlets in Singosari
  const outletsSingosari = [
    { id: "o-sg-001", noInduk: "#DFJ1SG001", outlet: "Toko Rahayu", kunjungan: "2026-07-09", order: 3.0, harga: 100000, totalBayar: 300000 },
    { id: "o-sg-002", noInduk: "#DFJ1SG002", outlet: "Warung Soto Sari", kunjungan: "2026-07-09", order: 0.8, harga: 100000, totalBayar: 80000 },
    { id: "o-sg-003", noInduk: "#DFJ1SG003", outlet: "Toko Singo Candi", kunjungan: "2026-07-10", order: 2.0, harga: 100000, totalBayar: 150000 },
  ];

  for (const o of outletsSingosari) {
    const { totalPiutang, status } = calculateFields(o.order, o.harga, o.totalBayar);
    await prisma.outlet.upsert({
      where: { id: o.id },
      update: { ...o, totalPiutang, status, alamatId: aSingosari.id },
      create: { ...o, totalPiutang, status, alamatId: aSingosari.id },
    });
  }

  // Outlets in Kepanjen
  const outletsKepanjen = [
    { id: "o-kp-001", noInduk: "#DFJ2KP001", outlet: "Toko Abadi", kunjungan: "2026-07-09", order: 5.0, harga: 95000, totalBayar: 400000 },
    { id: "o-kp-002", noInduk: "#DFJ2KP002", outlet: "Warung Solo", kunjungan: "2026-07-10", order: 1.2, harga: 95000, totalBayar: 114000 },
    { id: "o-kp-003", noInduk: "#DFJ2KP003", outlet: "Toko Jaya Kepanjen", kunjungan: "2026-07-10", order: 2.8, harga: 95000, totalBayar: 200000 },
    { id: "o-kp-004", noInduk: "#DFJ2KP004", outlet: "Agen Bintang Selatan", kunjungan: "2026-07-11", order: 6.0, harga: 95000, totalBayar: 570000 },
  ];

  for (const o of outletsKepanjen) {
    const { totalPiutang, status } = calculateFields(o.order, o.harga, o.totalBayar);
    await prisma.outlet.upsert({
      where: { id: o.id },
      update: { ...o, totalPiutang, status, alamatId: aKepanjen.id },
      create: { ...o, totalPiutang, status, alamatId: aKepanjen.id },
    });
  }

  // Outlets in Gondanglegi
  const outletsGondanglegi = [
    { id: "o-gl-001", noInduk: "#DFJ2GL001", outlet: "Toko Gondang Indah", kunjungan: "2026-07-11", order: 3.0, harga: 100000, totalBayar: 200000 },
    { id: "o-gl-002", noInduk: "#DFJ2GL002", outlet: "Warung Legit", kunjungan: "2026-07-11", order: 1.5, harga: 100000, totalBayar: 150000 },
  ];

  for (const o of outletsGondanglegi) {
    const { totalPiutang, status } = calculateFields(o.order, o.harga, o.totalBayar);
    await prisma.outlet.upsert({
      where: { id: o.id },
      update: { ...o, totalPiutang, status, alamatId: aGondanglegi.id },
      create: { ...o, totalPiutang, status, alamatId: aGondanglegi.id },
    });
  }

  // ============================================
  // 3. SEED COFFEE STOCKS
  // ============================================
  console.log("Seeding Coffee Stocks...");
  await prisma.coffeeStock.deleteMany({});
  await prisma.coffeeStock.create({
    data: {
      id: "stock-kopi-cap-bima",
      name: "Kopi Cap Bima",
      sku: "KCB-01",
      quantity: 50.0,
      unit: "kardus",
      price: 85000,
    },
  });

  console.log("Enriched seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
