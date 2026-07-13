// ============================================
// Kopi Bima — Data Types & Interfaces
// ============================================

export interface Database {
  id: string;
  name: string;
  createdAt: string;
}

export interface Jalur {
  id: string;
  dbId: string;
  name: string;
  createdAt: string;
}

export interface Alamat {
  id: string;
  jalurId: string;
  name: string;
  createdAt: string;
}

// Outlet = registrasi toko saja
export interface Outlet {
  id: string;
  alamatId: string;
  noInduk: string;
  outlet: string;       // nama toko
  tglDaftar: string;    // tanggal daftar (YYYY-MM-DD)
}

export interface OutletFormData {
  noInduk: string;
  outlet: string;
  tglDaftar: string;
}

// Outlet + ringkasan keuangan (computed dari orders)
export interface OutletWithSummary extends Outlet {
  totalOrder: number;       // jumlah kardus dari semua order Sukses
  totalPendapatan: number;  // order * harga dari semua order Sukses
  totalBayar: number;       // total pembayaran dari semua order Sukses
  totalPiutang: number;     // total piutang dari semua order Sukses
  orderCount: number;       // jumlah order
}

export interface Order {
  id: string;
  outletId: string;
  order: number;            // jumlah kardus
  harga: number;            // harga per kardus
  totalBayar: number;       // nominal yang sudah dibayarkan
  totalPiutang: number;     // computed: (order * harga) - totalBayar
  status: "Lunas" | "Piutang";
  orderStatus: "Sukses" | "Pending" | "Cancel" | "Proses";
  paymentMethod: "Cash" | "Transfer";
  tglOrder: string;         // tanggal order (YYYY-MM-DD)
  keterangan?: string;      // catatan tambahan (opsional)
}

export interface OrderFormData {
  outletId: string;
  order: number;
  harga: number;
  totalBayar: number;
  orderStatus: "Sukses" | "Pending" | "Cancel" | "Proses";
  paymentMethod: "Cash" | "Transfer";
  tglOrder: string;
  keterangan?: string;
}

// Order with outlet & location relations (for Progres Order page)
export interface OrderWithRelations extends Order {
  outletName: string;
  outletNoInduk: string;
  alamatName: string;
  jalurName: string;
  databaseName: string;
}

// Payment = transaksi pembayaran piutang
export interface Payment {
  id: string;
  outletId: string;
  amount: number;
  paymentMethod: "Cash" | "Transfer";
  tglPayment: string;
  keterangan?: string;      // catatan tambahan (opsional)
  createdAt?: Date;
}

export interface PaymentFormData {
  outletId: string;
  amount: number;
  paymentMethod: "Cash" | "Transfer";
  tglPayment: string;
  keterangan?: string;
}

export interface PaymentWithRelations extends Payment {
  outletName: string;
  outletNoInduk: string;
  alamatName: string;
  jalurName: string;
  databaseName: string;
}
