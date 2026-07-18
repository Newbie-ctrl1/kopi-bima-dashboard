import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "../src/generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function day(offset: number): string {
  return new Date(Date.now() + offset * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

async function main() {
  console.log("🌱 Seeding Kopi Bima (fresh data)...\n");

  const today        = day(0);
  const yesterday    = day(-1);
  const twoDaysAgo   = day(-2);
  const threeDaysAgo = day(-3);
  const fourDaysAgo  = day(-4);

  // ============================================================
  // RESET — hapus semua data lama agar seed bersih
  // ============================================================
  console.log("🗑️  Clearing old data...");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Order", "Payment", "Outlet", "Alamat", "Jalur", "Database", "CoffeeStock" RESTART IDENTITY CASCADE`);
  console.log("   ✓ Cleared\n");

  // ============================================================
  // 1. DATABASE RENDI
  // ============================================================
  console.log("📂 Seeding Database Rendi...");
  const dbRendi = await prisma.database.create({
    data: { id: "db-rendi", name: "Database Rendi" },
  });

  const jR1 = await prisma.jalur.create({
    data: { id: "jr-1", name: "Jalur 1", databaseId: dbRendi.id },
  });
  const jR2 = await prisma.jalur.create({
    data: { id: "jr-2", name: "Jalur 2", databaseId: dbRendi.id },
  });
  const jR3 = await prisma.jalur.create({
    data: { id: "jr-3", name: "Jalur 3", databaseId: dbRendi.id },
  });

  const aSananrejo  = await prisma.alamat.create({ data: { id: "a-sn", name: "Sananrejo",   jalurId: jR1.id } });
  const aWonokerto  = await prisma.alamat.create({ data: { id: "a-wn", name: "Wonokerto",   jalurId: jR1.id } });
  const aBululawang = await prisma.alamat.create({ data: { id: "a-bl", name: "Bululawang",  jalurId: jR2.id } });
  const aKrebet     = await prisma.alamat.create({ data: { id: "a-kb", name: "Krebet",      jalurId: jR2.id } });
  const aGondang    = await prisma.alamat.create({ data: { id: "a-gl", name: "Gondanglegi", jalurId: jR3.id } });
  const aTuren      = await prisma.alamat.create({ data: { id: "a-tr", name: "Turen",       jalurId: jR3.id } });

  // OUTLETS — Rendi
  const rendiOutlets = [
    { id: "o-sn-1", noId: "#DRJ1SN001", outlet: "Toko Sejahtera",     tglDaftar: fourDaysAgo, alamatId: aSananrejo.id },
    { id: "o-sn-2", noId: "#DRJ1SN002", outlet: "Warung Barokah",     tglDaftar: fourDaysAgo, alamatId: aSananrejo.id },
    { id: "o-sn-3", noId: "#DRJ1SN003", outlet: "Kios Makmur Jaya",   tglDaftar: threeDaysAgo, alamatId: aSananrejo.id },
    { id: "o-sn-4", noId: "#DRJ1SN004", outlet: "Toko Bahagia",       tglDaftar: threeDaysAgo, alamatId: aSananrejo.id },
    { id: "o-sn-5", noId: "#DRJ1SN005", outlet: "Warung Pak Harto",   tglDaftar: twoDaysAgo,   alamatId: aSananrejo.id },
    { id: "o-wn-1", noId: "#DRJ1WN001", outlet: "Toko Berkah Wono",   tglDaftar: threeDaysAgo, alamatId: aWonokerto.id },
    { id: "o-wn-2", noId: "#DRJ1WN002", outlet: "Warung Bu Sri",      tglDaftar: twoDaysAgo,   alamatId: aWonokerto.id },
    { id: "o-wn-3", noId: "#DRJ1WN003", outlet: "Kios Maju Wono",     tglDaftar: twoDaysAgo,   alamatId: aWonokerto.id },
    { id: "o-bl-1", noId: "#DRJ2BL001", outlet: "Kios Mandiri Bulu",  tglDaftar: twoDaysAgo,   alamatId: aBululawang.id },
    { id: "o-bl-2", noId: "#DRJ2BL002", outlet: "Toko Sumber Sari",   tglDaftar: yesterday,    alamatId: aBululawang.id },
    { id: "o-bl-3", noId: "#DRJ2BL003", outlet: "Agen Sembako Bulu",  tglDaftar: yesterday,    alamatId: aBululawang.id },
    { id: "o-kb-1", noId: "#DRJ2KB001", outlet: "Warung Hj. Mimin",   tglDaftar: yesterday,    alamatId: aKrebet.id },
    { id: "o-kb-2", noId: "#DRJ2KB002", outlet: "Toko Krebet Indah",  tglDaftar: today,        alamatId: aKrebet.id },
    { id: "o-gl-1", noId: "#DRJ3GL001", outlet: "Toko Abadi Gondang", tglDaftar: twoDaysAgo,   alamatId: aGondang.id },
    { id: "o-gl-2", noId: "#DRJ3GL002", outlet: "Warung Sari Rasa",   tglDaftar: yesterday,    alamatId: aGondang.id },
    { id: "o-tr-1", noId: "#DRJ3TR001", outlet: "Kios Maju Turen",    tglDaftar: yesterday,    alamatId: aTuren.id },
    { id: "o-tr-2", noId: "#DRJ3TR002", outlet: "Toko Rezeki Turen",  tglDaftar: today,        alamatId: aTuren.id },
  ];

  for (const o of rendiOutlets) {
    await prisma.outlet.create({ data: o });
  }
  console.log(`   ✓ ${rendiOutlets.length} outlets`);

  // ORDERS — Rendi (with keterangan on some)
  type OrderSeed = {
    id: string; outletId: string; order: number; harga: number;
    orderStatus: string; tglOrder: string; keterangan?: string;
  };

  const rendiOrders: OrderSeed[] = [
    // --- Hari ini ---
    { id: "ro-t01", outletId: "o-sn-5", order: 2.0, harga: 100000, orderStatus: "Sukses", tglOrder: today, keterangan: "Titip salesman pagi" },
    { id: "ro-t02", outletId: "o-wn-1", order: 1.5, harga: 100000, orderStatus: "Sukses", tglOrder: today },
    { id: "ro-t03", outletId: "o-wn-2", order: 2.5, harga: 100000, orderStatus: "Sukses", tglOrder: today, keterangan: "Bayar 50% dulu" },
    { id: "ro-t04", outletId: "o-wn-3", order: 3.0, harga: 100000, orderStatus: "Sukses", tglOrder: today },
    { id: "ro-t05", outletId: "o-bl-1", order: 2.0, harga: 110000, orderStatus: "Sukses", tglOrder: today },
    { id: "ro-t06", outletId: "o-bl-2", order: 1.8, harga: 110000, orderStatus: "Sukses", tglOrder: today, keterangan: "Transfer BRI sudah masuk" },
    { id: "ro-t07", outletId: "o-bl-3", order: 3.0, harga: 110000, orderStatus: "Sukses", tglOrder: today },
    { id: "ro-t08", outletId: "o-kb-1", order: 1.5, harga: 105000, orderStatus: "Sukses", tglOrder: today },
    { id: "ro-t09", outletId: "o-kb-2", order: 2.0, harga: 105000, orderStatus: "Proses", tglOrder: today, keterangan: "Menunggu konfirmasi toko" },
    { id: "ro-t10", outletId: "o-gl-1", order: 4.0, harga: 100000, orderStatus: "Sukses", tglOrder: today },
    { id: "ro-t11", outletId: "o-gl-2", order: 2.5, harga: 100000, orderStatus: "Sukses", tglOrder: today },
    { id: "ro-t12", outletId: "o-tr-1", order: 3.0, harga: 100000, orderStatus: "Sukses", tglOrder: today },
    { id: "ro-t13", outletId: "o-tr-2", order: 1.0, harga: 100000, orderStatus: "Sukses", tglOrder: today, keterangan: "Order perdana, harga promo" },

    // --- Kemarin ---
    { id: "ro-y01", outletId: "o-sn-1", order: 2.0, harga: 100000, orderStatus: "Sukses", tglOrder: yesterday },
    { id: "ro-y02", outletId: "o-sn-2", order: 1.5, harga: 100000, orderStatus: "Sukses", tglOrder: yesterday, keterangan: "Pembayaran cicilan ke-2" },
    { id: "ro-y03", outletId: "o-sn-3", order: 3.0, harga: 100000, orderStatus: "Sukses", tglOrder: yesterday },
    { id: "ro-y04", outletId: "o-sn-4", order: 0.5, harga: 100000, orderStatus: "Pending", tglOrder: yesterday, keterangan: "Tunggu konfirmasi pemilik" },
    { id: "ro-y05", outletId: "o-wn-3", order: 1.5, harga: 100000, orderStatus: "Cancel", tglOrder: yesterday, keterangan: "Dibatalkan — stok habis" },
    { id: "ro-y06", outletId: "o-bl-3", order: 5.0, harga: 110000, orderStatus: "Sukses", tglOrder: yesterday },

    // --- 2 hari lalu ---
    { id: "ro-d01", outletId: "o-sn-1", order: 2.0, harga: 100000, orderStatus: "Sukses", tglOrder: twoDaysAgo },
    { id: "ro-d02", outletId: "o-sn-3", order: 3.0, harga: 100000, orderStatus: "Sukses", tglOrder: twoDaysAgo },
    { id: "ro-d03", outletId: "o-gl-1", order: 2.0, harga: 100000, orderStatus: "Sukses", tglOrder: twoDaysAgo },

    // --- Juni 2026 ---
    { id: "ro-jun01", outletId: "o-sn-1", order: 10.0, harga: 100000, orderStatus: "Sukses", tglOrder: "2026-06-15" },
    { id: "ro-jun02", outletId: "o-sn-2", order:  5.0, harga: 100000, orderStatus: "Sukses", tglOrder: "2026-06-20", keterangan: "Repeat order bulan lalu" },
    { id: "ro-jun03", outletId: "o-wn-1", order:  8.0, harga: 100000, orderStatus: "Sukses", tglOrder: "2026-06-25" },
    { id: "ro-jun04", outletId: "o-bl-1", order:  6.0, harga: 110000, orderStatus: "Sukses", tglOrder: "2026-06-28" },

    // --- Mei 2026 ---
    { id: "ro-may01", outletId: "o-sn-3", order:  8.0, harga: 100000, orderStatus: "Sukses", tglOrder: "2026-05-10" },
    { id: "ro-may02", outletId: "o-wn-2", order: 12.0, harga: 100000, orderStatus: "Sukses", tglOrder: "2026-05-18" },
    { id: "ro-may03", outletId: "o-kb-1", order:  5.0, harga: 105000, orderStatus: "Sukses", tglOrder: "2026-05-25" },

    // --- April 2026 ---
    { id: "ro-apr01", outletId: "o-sn-1", order: 15.0, harga: 98000, orderStatus: "Sukses", tglOrder: "2026-04-05" },
    { id: "ro-apr02", outletId: "o-gl-1", order:  9.0, harga: 98000, orderStatus: "Sukses", tglOrder: "2026-04-20" },

    // --- Tahun 2025 ---
    { id: "ro-2025-01", outletId: "o-wn-1", order: 12.0, harga: 95000, orderStatus: "Sukses", tglOrder: "2025-11-12" },
    { id: "ro-2025-02", outletId: "o-bl-2", order:  7.0, harga: 95000, orderStatus: "Sukses", tglOrder: "2025-09-03" },
    { id: "ro-2025-03", outletId: "o-sn-2", order: 20.0, harga: 93000, orderStatus: "Sukses", tglOrder: "2025-03-15" },

    // --- Tahun 2024 ---
    { id: "ro-2024-01", outletId: "o-wn-2", order: 20.0, harga: 90000, orderStatus: "Sukses", tglOrder: "2024-08-08" },
    { id: "ro-2024-02", outletId: "o-sn-1", order: 18.0, harga: 88000, orderStatus: "Sukses", tglOrder: "2024-04-22" },
  ];

  for (const o of rendiOrders) {
    const isCancelled   = o.orderStatus === "Cancel";
    const isPending     = o.orderStatus === "Pending" || o.orderStatus === "Proses";
    const totalPiutang  = (isCancelled || isPending) ? 0 : o.order * o.harga;
    const status        = totalPiutang > 0 ? "Piutang" : "Lunas";
    await prisma.order.create({
      data: {
        id: o.id, outletId: o.outletId,
        order: o.order, harga: o.harga,
        totalBayar: 0, totalPiutang, status,
        orderStatus: o.orderStatus, tglOrder: o.tglOrder,
        keterangan: o.keterangan ?? null,
      },
    });
  }
  console.log(`   ✓ ${rendiOrders.length} orders`);

  // PAYMENTS — Rendi (with keterangan on some)
  type PaySeed = {
    id: string; outletId: string; amount: number;
    paymentMethod: string; tglPayment: string; keterangan?: string;
  };

  const rendiPayments: PaySeed[] = [
    // --- Hari ini ---
    { id: "rp-t01", outletId: "o-sn-5", amount: 220000, paymentMethod: "Cash",     tglPayment: today, keterangan: "Bayar lunas order pagi" },
    { id: "rp-t02", outletId: "o-wn-1", amount: 150000, paymentMethod: "Cash",     tglPayment: today },
    { id: "rp-t03", outletId: "o-wn-2", amount: 125000, paymentMethod: "Transfer", tglPayment: today, keterangan: "Transfer BCA jam 09:12" },
    { id: "rp-t04", outletId: "o-wn-3", amount: 300000, paymentMethod: "Cash",     tglPayment: today },
    { id: "rp-t05", outletId: "o-bl-1", amount: 220000, paymentMethod: "Transfer", tglPayment: today },
    { id: "rp-t06", outletId: "o-bl-2", amount: 198000, paymentMethod: "Cash",     tglPayment: today },
    { id: "rp-t07", outletId: "o-gl-1", amount: 400000, paymentMethod: "Cash",     tglPayment: today, keterangan: "Pembayaran tunai lengkap" },
    { id: "rp-t08", outletId: "o-gl-2", amount: 250000, paymentMethod: "Transfer", tglPayment: today },
    { id: "rp-t09", outletId: "o-tr-1", amount: 300000, paymentMethod: "Cash",     tglPayment: today },

    // --- Kemarin ---
    { id: "rp-y01", outletId: "o-sn-1", amount: 200000, paymentMethod: "Cash",     tglPayment: yesterday },
    { id: "rp-y02", outletId: "o-sn-2", amount: 150000, paymentMethod: "Transfer", tglPayment: yesterday, keterangan: "Cicilan bulan ini" },
    { id: "rp-y03", outletId: "o-bl-3", amount: 550000, paymentMethod: "Transfer", tglPayment: yesterday },

    // --- 2 hari lalu ---
    { id: "rp-d01", outletId: "o-sn-1", amount: 200000, paymentMethod: "Cash",     tglPayment: twoDaysAgo },
    { id: "rp-d02", outletId: "o-sn-3", amount: 300000, paymentMethod: "Cash",     tglPayment: twoDaysAgo },

    // --- Juni 2026 ---
    { id: "rp-jun01", outletId: "o-sn-1", amount: 1000000, paymentMethod: "Transfer", tglPayment: "2026-06-15", keterangan: "Pelunasan piutang Juni" },
    { id: "rp-jun02", outletId: "o-sn-2", amount:  500000, paymentMethod: "Cash",     tglPayment: "2026-06-21" },
    { id: "rp-jun03", outletId: "o-wn-1", amount:  800000, paymentMethod: "Transfer", tglPayment: "2026-06-26" },
    { id: "rp-jun04", outletId: "o-bl-1", amount:  660000, paymentMethod: "Transfer", tglPayment: "2026-06-28" },

    // --- Mei 2026 ---
    { id: "rp-may01", outletId: "o-sn-3", amount:  800000, paymentMethod: "Transfer", tglPayment: "2026-05-11" },
    { id: "rp-may02", outletId: "o-wn-2", amount: 1200000, paymentMethod: "Transfer", tglPayment: "2026-05-19" },

    // --- April 2026 ---
    { id: "rp-apr01", outletId: "o-sn-1", amount: 1470000, paymentMethod: "Transfer", tglPayment: "2026-04-06", keterangan: "Pelunasan piutang April" },

    // --- Tahun 2025 ---
    { id: "rp-2025-01", outletId: "o-wn-1", amount: 1140000, paymentMethod: "Transfer", tglPayment: "2025-11-13" },
    { id: "rp-2025-02", outletId: "o-bl-2", amount:  665000, paymentMethod: "Cash",     tglPayment: "2025-09-04" },

    // --- Tahun 2024 ---
    { id: "rp-2024-01", outletId: "o-wn-2", amount: 1800000, paymentMethod: "Transfer", tglPayment: "2024-08-09" },
  ];

  for (const p of rendiPayments) {
    await prisma.payment.create({
      data: {
        id: p.id, outletId: p.outletId,
        amount: p.amount, paymentMethod: p.paymentMethod,
        tglPayment: p.tglPayment,
        keterangan: p.keterangan ?? null,
      },
    });
  }
  console.log(`   ✓ ${rendiPayments.length} payments`);

  // ============================================================
  // 2. DATABASE FARID
  // ============================================================
  console.log("\n📂 Seeding Database Farid...");
  const dbFarid = await prisma.database.create({
    data: { id: "db-farid", name: "Database Farid" },
  });

  const jF1 = await prisma.jalur.create({ data: { id: "jf-1", name: "Jalur 1", databaseId: dbFarid.id } });
  const jF2 = await prisma.jalur.create({ data: { id: "jf-2", name: "Jalur 2", databaseId: dbFarid.id } });

  const aTajinan  = await prisma.alamat.create({ data: { id: "a-tj", name: "Tajinan",  jalurId: jF1.id } });
  const aPakisaji = await prisma.alamat.create({ data: { id: "a-pk", name: "Pakisaji", jalurId: jF1.id } });
  const aKepanjen = await prisma.alamat.create({ data: { id: "a-kp", name: "Kepanjen", jalurId: jF2.id } });
  const aDampit   = await prisma.alamat.create({ data: { id: "a-dm", name: "Dampit",   jalurId: jF2.id } });

  const faridOutlets = [
    { id: "o-tj-1", noId: "#DFJ1TJ001", outlet: "Toko Abadi",        tglDaftar: twoDaysAgo,   alamatId: aTajinan.id },
    { id: "o-tj-2", noId: "#DFJ1TJ002", outlet: "Warung Pojok",      tglDaftar: twoDaysAgo,   alamatId: aTajinan.id },
    { id: "o-tj-3", noId: "#DFJ1TJ003", outlet: "Kios Maju Bersama", tglDaftar: yesterday,    alamatId: aTajinan.id },
    { id: "o-pk-1", noId: "#DFJ1PK001", outlet: "Toko Pak Bambang",  tglDaftar: yesterday,    alamatId: aPakisaji.id },
    { id: "o-pk-2", noId: "#DFJ1PK002", outlet: "Warung Sederhana",  tglDaftar: yesterday,    alamatId: aPakisaji.id },
    { id: "o-pk-3", noId: "#DFJ1PK003", outlet: "Toko Sembako 99",   tglDaftar: today,        alamatId: aPakisaji.id },
    { id: "o-kp-1", noId: "#DFJ2KP001", outlet: "Toko Jaya Kepanjen",tglDaftar: twoDaysAgo,   alamatId: aKepanjen.id },
    { id: "o-kp-2", noId: "#DFJ2KP002", outlet: "Warung Bu Dewi",    tglDaftar: yesterday,    alamatId: aKepanjen.id },
    { id: "o-dm-1", noId: "#DFJ2DM001", outlet: "Agen Dampit Raya",  tglDaftar: yesterday,    alamatId: aDampit.id },
    { id: "o-dm-2", noId: "#DFJ2DM002", outlet: "Kios Berkah Dampit",tglDaftar: today,        alamatId: aDampit.id },
  ];

  for (const o of faridOutlets) {
    await prisma.outlet.create({ data: o });
  }
  console.log(`   ✓ ${faridOutlets.length} outlets`);

  const faridOrders: OrderSeed[] = [
    // --- Hari ini ---
    { id: "fo-t01", outletId: "o-pk-3", order: 2.5, harga: 100000, orderStatus: "Sukses", tglOrder: today, keterangan: "Order baru daftar hari ini" },
    { id: "fo-t02", outletId: "o-tj-1", order: 2.0, harga:  95000, orderStatus: "Sukses", tglOrder: today },
    { id: "fo-t03", outletId: "o-kp-1", order: 3.0, harga: 100000, orderStatus: "Sukses", tglOrder: today },
    { id: "fo-t04", outletId: "o-kp-2", order: 1.5, harga: 100000, orderStatus: "Proses", tglOrder: today, keterangan: "Konfirmasi dikirim via WA" },
    { id: "fo-t05", outletId: "o-dm-1", order: 4.0, harga: 105000, orderStatus: "Sukses", tglOrder: today },
    { id: "fo-t06", outletId: "o-dm-2", order: 1.0, harga: 105000, orderStatus: "Sukses", tglOrder: today, keterangan: "Order percobaan stok baru" },

    // --- Kemarin ---
    { id: "fo-y01", outletId: "o-tj-3", order: 2.0, harga:  95000, orderStatus: "Sukses", tglOrder: yesterday },
    { id: "fo-y02", outletId: "o-pk-1", order: 4.0, harga: 100000, orderStatus: "Sukses", tglOrder: yesterday, keterangan: "Pesanan rutin mingguan" },
    { id: "fo-y03", outletId: "o-pk-2", order: 1.5, harga: 100000, orderStatus: "Pending", tglOrder: yesterday, keterangan: "Tagih ke pemilik besok" },
    { id: "fo-y04", outletId: "o-dm-1", order: 3.0, harga: 105000, orderStatus: "Sukses", tglOrder: yesterday },

    // --- 2 hari lalu ---
    { id: "fo-d01", outletId: "o-tj-1", order: 3.0, harga: 95000, orderStatus: "Sukses", tglOrder: twoDaysAgo },
    { id: "fo-d02", outletId: "o-tj-2", order: 1.0, harga: 95000, orderStatus: "Sukses", tglOrder: twoDaysAgo },

    // --- Juni 2026 ---
    { id: "fo-jun01", outletId: "o-tj-1", order:  6.0, harga:  95000, orderStatus: "Sukses", tglOrder: "2026-06-12" },
    { id: "fo-jun02", outletId: "o-kp-1", order: 10.0, harga: 100000, orderStatus: "Sukses", tglOrder: "2026-06-22", keterangan: "Repeat order bulanan" },

    // --- Mei 2026 ---
    { id: "fo-may01", outletId: "o-pk-1", order: 8.0, harga: 100000, orderStatus: "Sukses", tglOrder: "2026-05-14" },

    // --- Tahun 2025 ---
    { id: "fo-2025-01", outletId: "o-tj-2", order: 15.0, harga: 90000, orderStatus: "Sukses", tglOrder: "2025-10-10" },
    { id: "fo-2025-02", outletId: "o-kp-1", order: 11.0, harga: 92000, orderStatus: "Sukses", tglOrder: "2025-07-07" },

    // --- Tahun 2024 ---
    { id: "fo-2024-01", outletId: "o-dm-1", order: 25.0, harga: 88000, orderStatus: "Sukses", tglOrder: "2024-11-20" },
  ];

  for (const o of faridOrders) {
    const isCancelled   = o.orderStatus === "Cancel";
    const isPending     = o.orderStatus === "Pending" || o.orderStatus === "Proses";
    const totalPiutang  = (isCancelled || isPending) ? 0 : o.order * o.harga;
    const status        = totalPiutang > 0 ? "Piutang" : "Lunas";
    await prisma.order.create({
      data: {
        id: o.id, outletId: o.outletId,
        order: o.order, harga: o.harga,
        totalBayar: 0, totalPiutang, status,
        orderStatus: o.orderStatus, tglOrder: o.tglOrder,
        keterangan: o.keterangan ?? null,
      },
    });
  }
  console.log(`   ✓ ${faridOrders.length} orders`);

  const faridPayments: PaySeed[] = [
    // --- Hari ini ---
    { id: "fp-t01", outletId: "o-pk-3", amount: 250000, paymentMethod: "Cash",     tglPayment: today, keterangan: "Bayar tunai saat daftar" },
    { id: "fp-t02", outletId: "o-tj-1", amount: 190000, paymentMethod: "Cash",     tglPayment: today },
    { id: "fp-t03", outletId: "o-kp-1", amount: 300000, paymentMethod: "Transfer", tglPayment: today, keterangan: "Transfer Mandiri verified" },
    { id: "fp-t04", outletId: "o-dm-1", amount: 420000, paymentMethod: "Cash",     tglPayment: today },

    // --- Kemarin ---
    { id: "fp-y01", outletId: "o-tj-3", amount: 190000, paymentMethod: "Cash",     tglPayment: yesterday },
    { id: "fp-y02", outletId: "o-pk-1", amount: 400000, paymentMethod: "Cash",     tglPayment: yesterday, keterangan: "Lunas order kemarin" },

    // --- 2 hari lalu ---
    { id: "fp-d01", outletId: "o-tj-1", amount: 285000, paymentMethod: "Cash",     tglPayment: twoDaysAgo },
    { id: "fp-d02", outletId: "o-tj-2", amount:  95000, paymentMethod: "Cash",     tglPayment: twoDaysAgo },

    // --- Juni 2026 ---
    { id: "fp-jun01", outletId: "o-tj-1", amount:  570000, paymentMethod: "Transfer", tglPayment: "2026-06-13" },
    { id: "fp-jun02", outletId: "o-kp-1", amount: 1000000, paymentMethod: "Transfer", tglPayment: "2026-06-23", keterangan: "Lunas piutang Juni" },

    // --- Tahun 2025 ---
    { id: "fp-2025-01", outletId: "o-tj-2", amount: 1350000, paymentMethod: "Transfer", tglPayment: "2025-10-11" },

    // --- Tahun 2024 ---
    { id: "fp-2024-01", outletId: "o-dm-1", amount: 2200000, paymentMethod: "Transfer", tglPayment: "2024-11-21", keterangan: "Pelunasan akhir tahun" },
  ];

  for (const p of faridPayments) {
    await prisma.payment.create({
      data: {
        id: p.id, outletId: p.outletId,
        amount: p.amount, paymentMethod: p.paymentMethod,
        tglPayment: p.tglPayment,
        keterangan: p.keterangan ?? null,
      },
    });
  }
  console.log(`   ✓ ${faridPayments.length} payments`);

  // ============================================================
  // 3. COFFEE STOCK
  // ============================================================
  console.log("\n📦 Seeding Coffee Stock...");
  await prisma.coffeeStock.create({
    data: {
      id: "stock-bima-01",
      name: "Kopi Cap Bima",
      sku: "KOPI-BIMA-001",
      quantity: 500,
      unit: "Kardus",
      price: 100000,
    },
  });
  console.log("   ✓ 1 coffee stock");

  // ============================================================
  // SUMMARY
  // ============================================================
  const totalOutlets  = rendiOutlets.length + faridOutlets.length;
  const totalOrders   = rendiOrders.length  + faridOrders.length;
  const totalPayments = rendiPayments.length + faridPayments.length;

  console.log(`
✅ Seeding selesai!
   📦 Database   : 2 (Rendi, Farid)
   🏪 Outlet     : ${totalOutlets}
   🛒 Orders     : ${totalOrders} (incl. Sukses, Pending, Proses, Cancel)
   💰 Payments   : ${totalPayments}
   📝 Keterangan : ✓ beberapa order & pembayaran punya keterangan
   ☕ Stock      : 500 Kardus
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
