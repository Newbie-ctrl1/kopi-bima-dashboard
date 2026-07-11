"use server";

// ============================================
// Kopi Bima — Server Actions (Prisma)
// ============================================

import { revalidatePath } from "next/cache";
import * as store from "@/lib/store";
import type { OutletFormData, OrderFormData, PaymentFormData } from "@/lib/types";
import * as XLSX from "xlsx";

// ============================================
// DATABASE ACTIONS
// ============================================

export async function createDatabaseAction(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name || !name.trim()) {
    return { error: "Nama database tidak boleh kosong" };
  }
  await store.createDatabase(name.trim());
  revalidatePath("/");
  return { success: true };
}

export async function deleteDatabaseAction(id: string) {
  await store.deleteDatabase(id);
  revalidatePath("/");
  return { success: true };
}

export async function updateDatabaseAction(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name || !name.trim()) {
    return { error: "Nama database tidak boleh kosong" };
  }
  await store.updateDatabase(id, name.trim());
  revalidatePath("/");
  return { success: true };
}

// ============================================
// JALUR ACTIONS
// ============================================

export async function createJalurAction(dbId: string, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name || !name.trim()) {
    return { error: "Nama jalur tidak boleh kosong" };
  }
  await store.createJalur(dbId, name.trim());
  revalidatePath(`/db/${dbId}`);
  return { success: true };
}

export async function deleteJalurAction(id: string, dbId: string) {
  await store.deleteJalur(id);
  revalidatePath(`/db/${dbId}`);
  return { success: true };
}

export async function updateJalurAction(id: string, dbId: string, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name || !name.trim()) {
    return { error: "Nama jalur tidak boleh kosong" };
  }
  await store.updateJalur(id, name.trim());
  revalidatePath(`/db/${dbId}`);
  return { success: true };
}

// ============================================
// ALAMAT ACTIONS
// ============================================

export async function createAlamatAction(
  jalurId: string,
  dbId: string,
  formData: FormData
) {
  const name = formData.get("name") as string;
  if (!name || !name.trim()) {
    return { error: "Nama alamat tidak boleh kosong" };
  }
  await store.createAlamat(jalurId, name.trim());
  revalidatePath(`/db/${dbId}/jalur/${jalurId}`);
  return { success: true };
}

export async function deleteAlamatAction(
  id: string,
  jalurId: string,
  dbId: string
) {
  await store.deleteAlamat(id);
  revalidatePath(`/db/${dbId}/jalur/${jalurId}`);
  return { success: true };
}

export async function updateAlamatAction(
  id: string,
  jalurId: string,
  dbId: string,
  formData: FormData
) {
  const name = formData.get("name") as string;
  if (!name || !name.trim()) {
    return { error: "Nama alamat tidak boleh kosong" };
  }
  await store.updateAlamat(id, name.trim());
  revalidatePath(`/db/${dbId}/jalur/${jalurId}`);
  return { success: true };
}

// ============================================
// OUTLET ACTIONS (Registration Only)
// ============================================

function parseOutletFormData(formData: FormData): OutletFormData {
  return {
    noInduk: (formData.get("noInduk") as string) || "",
    outlet: (formData.get("outlet") as string) || "",
    tglDaftar: (formData.get("tglDaftar") as string) || "",
  };
}

function validateOutletData(data: OutletFormData): string | null {
  if (!data.noInduk.trim()) return "No Induk tidak boleh kosong";
  if (!data.outlet.trim()) return "Nama outlet tidak boleh kosong";
  if (!data.tglDaftar) return "Tanggal daftar tidak boleh kosong";
  return null;
}

export async function createOutletAction(
  alamatId: string,
  basePath: string,
  formData: FormData
) {
  const data = parseOutletFormData(formData);
  const error = validateOutletData(data);
  if (error) return { error };

  await store.createOutlet(alamatId, data);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateOutletAction(
  outletId: string,
  basePath: string,
  formData: FormData
) {
  const data = parseOutletFormData(formData);
  const error = validateOutletData(data);
  if (error) return { error };

  const result = await store.updateOutlet(outletId, data);
  if (!result) return { error: "Data outlet tidak ditemukan" };

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteOutletAction(outletId: string, basePath: string) {
  await store.deleteOutlet(outletId);
  revalidatePath("/", "layout");
  return { success: true };
}

// ============================================
// ORDER ACTIONS
// ============================================

function parseOrderFormData(formData: FormData): OrderFormData {
  return {
    outletId: (formData.get("outletId") as string) || "",
    order: parseFloat(formData.get("order") as string) || 0,
    harga: parseFloat(formData.get("harga") as string) || 100000,
    totalBayar: parseFloat(formData.get("totalBayar") as string) || 0,
    orderStatus: (formData.get("orderStatus") as any) || "Sukses",
    paymentMethod: (formData.get("paymentMethod") as any) || "Cash",
    tglOrder: (formData.get("tglOrder") as string) || "",
  };
}

function validateOrderData(data: OrderFormData): string | null {
  if (!data.outletId) return "Outlet harus dipilih";
  if (data.order <= 0) return "Jumlah order harus lebih dari 0";
  if (data.harga <= 0) return "Harga harus lebih dari 0";
  if (data.totalBayar < 0) return "Total bayar tidak boleh negatif";
  if (!data.tglOrder) return "Tanggal order tidak boleh kosong";
  return null;
}

export async function createOrderAction(basePath: string, formData: FormData) {
  const data = parseOrderFormData(formData);
  const error = validateOrderData(data);
  if (error) return { error };

  try {
    await store.createOrder(data);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Gagal membuat order" };
  }
}

export async function updateOrderAction(
  orderId: string,
  basePath: string,
  formData: FormData
) {
  const data = parseOrderFormData(formData);
  const error = validateOrderData(data);
  if (error) return { error };

  try {
    const result = await store.updateOrder(orderId, data);
    if (!result) return { error: "Data order tidak ditemukan" };

    revalidatePath("/", "layout");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Gagal mengubah order" };
  }
}

export async function deleteOrderAction(orderId: string, basePath: string) {
  await store.deleteOrder(orderId);
  revalidatePath("/", "layout");
  return { success: true };
}

// ============================================
// PAYMENT ACTIONS
// ============================================

function parsePaymentFormData(formData: FormData): PaymentFormData {
  return {
    outletId: (formData.get("outletId") as string) || "",
    amount: parseFloat(formData.get("amount") as string) || 0,
    paymentMethod: (formData.get("paymentMethod") as any) || "Cash",
    tglPayment: (formData.get("tglPayment") as string) || "",
  };
}

function validatePaymentData(data: PaymentFormData): string | null {
  if (!data.outletId) return "Outlet harus dipilih";
  if (data.amount <= 0) return "Nominal pembayaran harus lebih dari 0";
  if (!data.tglPayment) return "Tanggal pembayaran tidak boleh kosong";
  return null;
}

export async function createPaymentAction(basePath: string, formData: FormData) {
  const data = parsePaymentFormData(formData);
  const error = validatePaymentData(data);
  if (error) return { error };

  try {
    await store.createPayment(data);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Gagal membuat pembayaran" };
  }
}

export async function updatePaymentAction(
  paymentId: string,
  basePath: string,
  formData: FormData
) {
  const data = parsePaymentFormData(formData);
  const error = validatePaymentData(data);
  if (error) return { error };

  try {
    const result = await store.updatePayment(paymentId, data);
    if (!result) return { error: "Data pembayaran tidak ditemukan" };

    revalidatePath("/", "layout");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Gagal mengubah pembayaran" };
  }
}

export async function deletePaymentAction(paymentId: string, basePath: string) {
  await store.deletePayment(paymentId);
  revalidatePath("/", "layout");
  return { success: true };
}

// ============================================
// UPLOAD (CSV / EXCEL) ACTION — Outlet Registration Only
// ============================================

export async function uploadOutletsAction(
  alamatId: string,
  basePath: string,
  formData: FormData
) {
  const file = formData.get("file") as File;
  if (!file) return { error: "File tidak ditemukan" };

  const fileName = file.name.toLowerCase();
  const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");
  const isCsv = fileName.endsWith(".csv");

  if (!isExcel && !isCsv) {
    return { error: "Format file harus CSV atau Excel (.xlsx/.xls)" };
  }

  try {
    let rows: Record<string, string>[];

    if (isCsv) {
      const text = await file.text();
      rows = parseCsv(text);
    } else {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
        defval: "",
      });
    }

    if (rows.length === 0) {
      return { error: "File tidak berisi data" };
    }

    const outlets: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      const noInduk =
        row["noInduk"] ||
        row["no_induk"] ||
        row["No Induk"] ||
        row["NO INDUK"] ||
        "";
      const outlet =
        row["outlet"] || row["Outlet"] || row["OUTLET"] || row["nama"] || "";
      const tglDaftar =
        row["tglDaftar"] ||
        row["tgl_daftar"] ||
        row["tanggal_daftar"] ||
        row["tanggal"] ||
        "";

      const orderStr =
        row["order"] ||
        row["Order"] ||
        row["ORDER"] ||
        row["jumlah_order"] ||
        row["jumlah"] ||
        "0";
      const orderVal = parseFloat(String(orderStr)) || 0;

      const hargaStr =
        row["harga"] ||
        row["Harga"] ||
        row["HARGA"] ||
        "";
      const hargaVal = hargaStr !== "" ? (parseFloat(String(hargaStr)) || undefined) : undefined;

      const totalBayarStr =
        row["totalBayar"] ||
        row["total_bayar"] ||
        row["Total Bayar"] ||
        row["TOTAL BAYAR"] ||
        row["bayar"] ||
        row["Bayar"] ||
        "0";
      const totalBayarVal = parseFloat(String(totalBayarStr)) || 0;

      if (!noInduk && !outlet) {
        errors.push(`Baris ${rowNum}: No Induk dan Outlet kosong, dilewati`);
        continue;
      }

      outlets.push({
        noInduk: String(noInduk).trim(),
        outlet: String(outlet).trim(),
        tglDaftar: String(tglDaftar).trim(),
        order: orderVal,
        harga: hargaVal,
        totalBayar: totalBayarVal,
      });
    }

    if (outlets.length === 0) {
      return {
        error: "Tidak ada data valid dalam file",
        details: errors,
      };
    }

    await store.bulkImportOutlets(alamatId, outlets);
    revalidatePath("/", "layout");

    return {
      success: true,
      imported: outlets.length,
      warnings: errors.length > 0 ? errors : undefined,
    };
  } catch (e) {
    console.error("Upload error:", e);
    return { error: "Gagal memproses file. Pastikan format file benar." };
  }
}

// ---- CSV Parser ----

function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row);
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ============================================
// COFFEE STOCK ACTIONS
// ============================================

export async function createCoffeeStockAction(formData: FormData) {
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const quantity = parseFloat(formData.get("quantity") as string) || 0;
  const unit = formData.get("unit") as string;
  const price = parseFloat(formData.get("price") as string) || 0;

  if (!name || !name.trim()) return { error: "Nama stok kopi tidak boleh kosong" };
  if (!sku || !sku.trim()) return { error: "SKU tidak boleh kosong" };
  if (!unit || !unit.trim()) return { error: "Satuan tidak boleh kosong" };

  try {
    await store.createCoffeeStock(name.trim(), sku.trim(), quantity, unit.trim(), price);
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    if (err.code === "P2002") {
      return { error: "SKU sudah digunakan oleh item stok lain" };
    }
    return { error: err.message || "Gagal membuat item stok baru" };
  }
}

export async function updateCoffeeStockAction(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const quantity = parseFloat(formData.get("quantity") as string) || 0;
  const unit = formData.get("unit") as string;
  const price = parseFloat(formData.get("price") as string) || 0;

  if (!name || !name.trim()) return { error: "Nama stok kopi tidak boleh kosong" };
  if (!sku || !sku.trim()) return { error: "SKU tidak boleh kosong" };
  if (!unit || !unit.trim()) return { error: "Satuan tidak boleh kosong" };

  try {
    await store.updateCoffeeStock(id, {
      name: name.trim(),
      sku: sku.trim(),
      quantity,
      unit: unit.trim(),
      price,
    });
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    if (err.code === "P2002") {
      return { error: "SKU sudah digunakan oleh item stok lain" };
    }
    return { error: err.message || "Gagal mengubah item stok" };
  }
}

export async function deleteCoffeeStockAction(id: string) {
  try {
    await store.deleteCoffeeStock(id);
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Gagal menghapus item stok" };
  }
}
