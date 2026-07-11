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

export interface Outlet {
  id: string;
  alamatId: string;
  noInduk: string;
  outlet: string;
  kunjungan: string; // date string (YYYY-MM-DD)
  order: number; // jumlah kardus (bisa desimal: 0.2, 0.5, 1, dst)
  harga: number; // harga per kardus (default: 100000)
  totalBayar: number; // nominal yang sudah dibayarkan
  totalPiutang: number; // computed: (order * harga) - totalBayar
  status: "Lunas" | "Piutang"; // computed: totalPiutang > 0 ? "Piutang" : "Lunas"
}

export interface OutletFormData {
  noInduk: string;
  outlet: string;
  kunjungan: string;
  order: number;
  harga: number;
  totalBayar: number;
}

export interface StoreData {
  databases: Database[];
  jalur: Jalur[];
  alamat: Alamat[];
  outlets: Outlet[];
}
