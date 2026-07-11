import { PrismaClient } from "../src/generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Kopi Bima (Outlet + Order architecture)...");

  // Dynamic dates relative to today's date
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const twoDaysAgoStr = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const threeDaysAgoStr = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const fourDaysAgoStr = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

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

  // Alamats
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

  // ============================================
  // OUTLETS (Registration Only)
  // ============================================
  const outletData = [
    { id: "o-sn-001", noInduk: "#DRJ1SN001", outlet: "Toko Sejahtera", tglDaftar: fourDaysAgoStr, alamatId: aSananrejo.id },
    { id: "o-sn-002", noInduk: "#DRJ1SN002", outlet: "Warung Barokah", tglDaftar: fourDaysAgoStr, alamatId: aSananrejo.id },
    { id: "o-sn-003", noInduk: "#DRJ1SN003", outlet: "Toko Makmur Jaya", tglDaftar: threeDaysAgoStr, alamatId: aSananrejo.id },
    { id: "o-sn-004", noInduk: "#DRJ1SN004", outlet: "Kios Berkah Sanan", tglDaftar: twoDaysAgoStr, alamatId: aSananrejo.id },
    { id: "o-sn-005", noInduk: "#DRJ1SN005", outlet: "Toko Roti Lezat", tglDaftar: yesterdayStr, alamatId: aSananrejo.id },
    { id: "o-wn-001", noInduk: "#DRJ1WN001", outlet: "Toko Berkah", tglDaftar: threeDaysAgoStr, alamatId: aWonokerto.id },
    { id: "o-wn-002", noInduk: "#DRJ1WN002", outlet: "Warung Bu Sri", tglDaftar: twoDaysAgoStr, alamatId: aWonokerto.id },
    { id: "o-wn-003", noInduk: "#DRJ1WN003", outlet: "Toko Rejeki Wono", tglDaftar: twoDaysAgoStr, alamatId: aWonokerto.id },
    { id: "o-bl-001", noInduk: "#DRJ2BL001", outlet: "Kios Mandiri", tglDaftar: twoDaysAgoStr, alamatId: aBululawang.id },
    { id: "o-bl-002", noInduk: "#DRJ2BL002", outlet: "Toko Sumber Sari", tglDaftar: yesterdayStr, alamatId: aBululawang.id },
    { id: "o-bl-003", noInduk: "#DRJ2BL003", outlet: "Agen Sembako Bulu", tglDaftar: yesterdayStr, alamatId: aBululawang.id },
    { id: "o-kb-001", noInduk: "#DRJ2KB001", outlet: "Warung Hj. Mimin", tglDaftar: yesterdayStr, alamatId: aKrebet.id },
    { id: "o-kb-002", noInduk: "#DRJ2KB002", outlet: "Toko Krebet Indah", tglDaftar: todayStr, alamatId: aKrebet.id },
  ];

  for (const o of outletData) {
    await prisma.outlet.upsert({
      where: { id: o.id },
      update: { noInduk: o.noInduk, outlet: o.outlet, tglDaftar: o.tglDaftar, alamatId: o.alamatId },
      create: o,
    });
  }
  console.log(`  ✓ ${outletData.length} outlets registered`);

  // ============================================
  // ORDERS (Separate transaction values)
  // ============================================
  const orderData = [
    // --- July 2026 (Daily July) ---
    { id: "ord-001", outletId: "o-sn-001", order: 2.0, harga: 100000, orderStatus: "Sukses", tglOrder: twoDaysAgoStr },
    { id: "ord-002", outletId: "o-sn-001", order: 1.0, harga: 100000, orderStatus: "Sukses", tglOrder: yesterdayStr },
    { id: "ord-003", outletId: "o-sn-002", order: 1.5, harga: 100000, orderStatus: "Sukses", tglOrder: yesterdayStr },
    { id: "ord-004", outletId: "o-sn-003", order: 3.0, harga: 100000, orderStatus: "Sukses", tglOrder: twoDaysAgoStr },
    { id: "ord-013", outletId: "o-bl-003", order: 5.0, harga: 110000, orderStatus: "Cancel", tglOrder: yesterdayStr },
    { id: "ord-005", outletId: "o-sn-004", order: 0.5, harga: 100000, orderStatus: "Pending", tglOrder: yesterdayStr },
    { id: "ord-010", outletId: "o-wn-003", order: 1.5, harga: 100000, orderStatus: "Proses", tglOrder: yesterdayStr },
    { id: "ord-006", outletId: "o-sn-005", order: 2.2, harga: 100000, orderStatus: "Sukses", tglOrder: todayStr },
    { id: "ord-007", outletId: "o-wn-001", order: 1.0, harga: 100000, orderStatus: "Sukses", tglOrder: todayStr },
    { id: "ord-008", outletId: "o-wn-002", order: 2.5, harga: 100000, orderStatus: "Sukses", tglOrder: todayStr },
    { id: "ord-009", outletId: "o-wn-003", order: 4.0, harga: 100000, orderStatus: "Sukses", tglOrder: todayStr },
    { id: "ord-011", outletId: "o-bl-001", order: 2.0, harga: 110000, orderStatus: "Sukses", tglOrder: todayStr },
    { id: "ord-012", outletId: "o-bl-002", order: 1.8, harga: 110000, orderStatus: "Sukses", tglOrder: todayStr },
    { id: "ord-014", outletId: "o-bl-003", order: 3.0, harga: 110000, orderStatus: "Sukses", tglOrder: todayStr },
    { id: "ord-015", outletId: "o-kb-001", order: 1.5, harga: 105000, orderStatus: "Sukses", tglOrder: todayStr },
    { id: "ord-016", outletId: "o-kb-002", order: 2.0, harga: 105000, orderStatus: "Sukses", tglOrder: todayStr },

    // --- June 2026 (Monthly June) ---
    { id: "ord-rendi-jun-01", outletId: "o-sn-001", order: 10.0, harga: 100000, orderStatus: "Sukses", tglOrder: "2026-06-15" },
    { id: "ord-rendi-jun-02", outletId: "o-sn-002", order: 5.0, harga: 100000, orderStatus: "Sukses", tglOrder: "2026-06-20" },

    // --- May 2026 (Monthly May) ---
    { id: "ord-rendi-may-01", outletId: "o-sn-003", order: 8.0, harga: 100000, orderStatus: "Sukses", tglOrder: "2026-05-10" },

    // --- Year 2025 (Yearly 2025) ---
    { id: "ord-rendi-2025-01", outletId: "o-wn-001", order: 12.0, harga: 95000, orderStatus: "Sukses", tglOrder: "2025-11-12" },

    // --- Year 2024 (Yearly 2024) ---
    { id: "ord-rendi-2024-01", outletId: "o-wn-002", order: 20.0, harga: 90000, orderStatus: "Sukses", tglOrder: "2024-08-08" },
  ];

  for (const o of orderData) {
    const isCancelled = o.orderStatus === "Cancel";
    const totalPiutang = isCancelled ? 0 : o.order * o.harga;
    const status = totalPiutang > 0 ? "Piutang" : "Lunas";

    await prisma.order.upsert({
      where: { id: o.id },
      update: {
        outletId: o.outletId,
        order: o.order,
        harga: o.harga,
        totalBayar: 0,
        totalPiutang,
        status,
        orderStatus: o.orderStatus,
        tglOrder: o.tglOrder,
      },
      create: {
        id: o.id,
        outletId: o.outletId,
        order: o.order,
        harga: o.harga,
        totalBayar: 0,
        totalPiutang,
        status,
        orderStatus: o.orderStatus,
        tglOrder: o.tglOrder,
      },
    });
  }
  console.log(`  ✓ ${orderData.length} orders seeded`);

  // ============================================
  // PAYMENTS (Separate transactions)
  // ============================================
  const paymentData = [
    // --- July 2026 ---
    { id: "pay-001", outletId: "o-sn-001", amount: 200000, paymentMethod: "Cash", tglPayment: twoDaysAgoStr },
    { id: "pay-002", outletId: "o-sn-001", amount: 100000, paymentMethod: "Cash", tglPayment: yesterdayStr },
    { id: "pay-003", outletId: "o-sn-002", amount: 100000, paymentMethod: "Cash", tglPayment: yesterdayStr },
    { id: "pay-004", outletId: "o-sn-003", amount: 300000, paymentMethod: "Cash", tglPayment: twoDaysAgoStr },
    { id: "pay-006", outletId: "o-sn-005", amount: 150000, paymentMethod: "Transfer", tglPayment: todayStr },
    { id: "pay-007", outletId: "o-wn-001", amount: 50000, paymentMethod: "Cash", tglPayment: todayStr },
    { id: "pay-008", outletId: "o-wn-002", amount: 250000, paymentMethod: "Transfer", tglPayment: todayStr },
    { id: "pay-009", outletId: "o-wn-003", amount: 350000, paymentMethod: "Cash", tglPayment: todayStr },
    { id: "pay-011", outletId: "o-bl-001", amount: 150000, paymentMethod: "Transfer", tglPayment: todayStr },
    { id: "pay-012", outletId: "o-bl-002", amount: 198000, paymentMethod: "Cash", tglPayment: todayStr },
    { id: "pay-014", outletId: "o-bl-003", amount: 330000, paymentMethod: "Transfer", tglPayment: todayStr },
    { id: "pay-015", outletId: "o-kb-001", amount: 100000, paymentMethod: "Cash", tglPayment: todayStr },
    { id: "pay-016", outletId: "o-kb-002", amount: 210000, paymentMethod: "Transfer", tglPayment: todayStr },

    // --- June 2026 ---
    { id: "pay-rendi-jun-01", outletId: "o-sn-001", amount: 1000000, paymentMethod: "Transfer", tglPayment: "2026-06-15" },
    { id: "pay-rendi-jun-02", outletId: "o-sn-002", amount: 300000, paymentMethod: "Cash", tglPayment: "2026-06-21" },

    // --- May 2026 ---
    { id: "pay-rendi-may-01", outletId: "o-sn-003", amount: 800000, paymentMethod: "Transfer", tglPayment: "2026-05-10" },

    // --- Year 2025 ---
    { id: "pay-rendi-2025-01", outletId: "o-wn-001", amount: 1140000, paymentMethod: "Transfer", tglPayment: "2025-11-12" },

    // --- Year 2024 ---
    { id: "pay-rendi-2024-01", outletId: "o-wn-002", amount: 1800000, paymentMethod: "Transfer", tglPayment: "2024-08-08" },
  ];

  for (const p of paymentData) {
    await prisma.payment.upsert({
      where: { id: p.id },
      update: {
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        tglPayment: p.tglPayment,
        outletId: p.outletId,
      },
      create: p,
    });
  }
  console.log(`  ✓ ${paymentData.length} payments seeded`);

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

  const jFarid1 = await prisma.jalur.upsert({
    where: { id: "jalur-farid-1" },
    update: { name: "Jalur 1", databaseId: dbFarid.id },
    create: {
      id: "jalur-farid-1",
      name: "Jalur 1",
      databaseId: dbFarid.id,
      createdAt: new Date("2026-07-02T01:00:00Z"),
    },
  });

  const aTajinan = await prisma.alamat.upsert({
    where: { id: "alamat-tajinan" },
    update: { name: "Tajinan", jalurId: jFarid1.id },
    create: {
      id: "alamat-tajinan",
      name: "Tajinan",
      jalurId: jFarid1.id,
      createdAt: new Date("2026-07-02T02:00:00Z"),
    },
  });

  const aPakisaji = await prisma.alamat.upsert({
    where: { id: "alamat-pakisaji" },
    update: { name: "Pakisaji", jalurId: jFarid1.id },
    create: {
      id: "alamat-pakisaji",
      name: "Pakisaji",
      jalurId: jFarid1.id,
      createdAt: new Date("2026-07-02T03:00:00Z"),
    },
  });

  const faridOutlets = [
    { id: "o-tj-001", noInduk: "#DFJ1TJ001", outlet: "Toko Abadi", tglDaftar: twoDaysAgoStr, alamatId: aTajinan.id },
    { id: "o-tj-002", noInduk: "#DFJ1TJ002", outlet: "Warung Pojok", tglDaftar: twoDaysAgoStr, alamatId: aTajinan.id },
    { id: "o-tj-003", noInduk: "#DFJ1TJ003", outlet: "Kios Maju Bersama", tglDaftar: yesterdayStr, alamatId: aTajinan.id },
    { id: "o-pk-001", noInduk: "#DFJ1PK001", outlet: "Toko Pak Bambang", tglDaftar: yesterdayStr, alamatId: aPakisaji.id },
    { id: "o-pk-002", noInduk: "#DFJ1PK002", outlet: "Warung Sederhana", tglDaftar: yesterdayStr, alamatId: aPakisaji.id },
    { id: "o-pk-003", noInduk: "#DFJ1PK003", outlet: "Toko Sembako 99", tglDaftar: todayStr, alamatId: aPakisaji.id },
  ];

  for (const o of faridOutlets) {
    await prisma.outlet.upsert({
      where: { id: o.id },
      update: { noInduk: o.noInduk, outlet: o.outlet, tglDaftar: o.tglDaftar, alamatId: o.alamatId },
      create: o,
    });
  }

  const faridOrders = [
    // --- July 2026 ---
    { id: "ord-f01", outletId: "o-tj-001", order: 3.0, harga: 95000, orderStatus: "Sukses", tglOrder: twoDaysAgoStr },
    { id: "ord-f02", outletId: "o-tj-002", order: 1.0, harga: 95000, orderStatus: "Sukses", tglOrder: twoDaysAgoStr },
    { id: "ord-f03", outletId: "o-tj-003", order: 2.0, harga: 95000, orderStatus: "Sukses", tglOrder: yesterdayStr },
    { id: "ord-f04", outletId: "o-pk-001", order: 4.0, harga: 100000, orderStatus: "Sukses", tglOrder: yesterdayStr },
    { id: "ord-f05", outletId: "o-pk-002", order: 1.5, harga: 100000, orderStatus: "Pending", tglOrder: yesterdayStr },
    { id: "ord-f06", outletId: "o-pk-003", order: 2.5, harga: 100000, orderStatus: "Sukses", tglOrder: todayStr },
    { id: "ord-f07", outletId: "o-tj-001", order: 2.0, harga: 95000, orderStatus: "Sukses", tglOrder: todayStr },

    // --- June 2026 ---
    { id: "ord-farid-jun-01", outletId: "o-tj-001", order: 6.0, harga: 95000, orderStatus: "Sukses", tglOrder: "2026-06-12" },

    // --- Year 2025 ---
    { id: "ord-farid-2025-01", outletId: "o-tj-002", order: 15.0, harga: 90000, orderStatus: "Sukses", tglOrder: "2025-10-10" },
  ];

  for (const o of faridOrders) {
    const isCancelled = o.orderStatus === "Cancel";
    const totalPiutang = isCancelled ? 0 : o.order * o.harga;
    const status = totalPiutang > 0 ? "Piutang" : "Lunas";

    await prisma.order.upsert({
      where: { id: o.id },
      update: {
        outletId: o.outletId, order: o.order, harga: o.harga,
        totalBayar: 0, totalPiutang, status, orderStatus: o.orderStatus, tglOrder: o.tglOrder,
      },
      create: {
        id: o.id, outletId: o.outletId, order: o.order, harga: o.harga,
        totalBayar: 0, totalPiutang, status, orderStatus: o.orderStatus, tglOrder: o.tglOrder,
      },
    });
  }

  const faridPayments = [
    // --- July 2026 ---
    { id: "pay-f01", outletId: "o-tj-001", amount: 285000, paymentMethod: "Cash", tglPayment: twoDaysAgoStr },
    { id: "pay-f02", outletId: "o-tj-002", amount: 50000, paymentMethod: "Cash", tglPayment: twoDaysAgoStr },
    { id: "pay-f03", outletId: "o-tj-003", amount: 190000, paymentMethod: "Cash", tglPayment: yesterdayStr },
    { id: "pay-f04", outletId: "o-pk-001", amount: 400000, paymentMethod: "Cash", tglPayment: yesterdayStr },
    { id: "pay-f06", outletId: "o-pk-003", amount: 200000, paymentMethod: "Transfer", tglPayment: todayStr },
    { id: "pay-f07", outletId: "o-tj-001", amount: 190000, paymentMethod: "Cash", tglPayment: todayStr },

    // --- June 2026 ---
    { id: "pay-farid-jun-01", outletId: "o-tj-001", amount: 570000, paymentMethod: "Transfer", tglPayment: "2026-06-12" },

    // --- Year 2025 ---
    { id: "pay-farid-2025-01", outletId: "o-tj-002", amount: 1350000, paymentMethod: "Transfer", tglPayment: "2025-10-10" },
  ];

  for (const p of faridPayments) {
    await prisma.payment.upsert({
      where: { id: p.id },
      update: {
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        tglPayment: p.tglPayment,
        outletId: p.outletId,
      },
      create: p,
    });
  }

  console.log(`  ✓ ${faridOutlets.length} outlets + ${faridOrders.length} orders + ${faridPayments.length} payments seeded for Farid`);

  // ============================================
  // 3. COFFEE STOCK
  // ============================================
  console.log("Seeding Coffee Stock...");
  await prisma.coffeeStock.upsert({
    where: { id: "stock-bima-01" },
    update: {
      name: "Kopi Cap Bima",
      sku: "KOPI-BIMA-001",
      quantity: 100,
      unit: "Kardus",
      price: 100000,
    },
    create: {
      id: "stock-bima-01",
      name: "Kopi Cap Bima",
      sku: "KOPI-BIMA-001",
      quantity: 100,
      unit: "Kardus",
      price: 100000,
    },
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
