"use client";

import { useState, useEffect } from "react";
import type { Outlet } from "@/lib/types";

interface OrderFormModalProps {
  mode: "create" | "edit";
  outlets: Outlet[]; // List of registered outlets for dropdown
  order?: {
    id: string;
    outletId: string;
    order: number;
    harga: number;
    totalBayar: number;
    orderStatus: "Sukses" | "Pending" | "Cancel" | "Proses";
    paymentMethod: "Cash" | "Transfer";
    tglOrder: string;
  } | null;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function OrderFormModal({
  mode,
  outlets,
  order,
  onClose,
  onSubmit,
}: OrderFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [outletId, setOutletId] = useState(order?.outletId ?? "");
  const [qty, setQty] = useState<number | "">(order?.order ?? 1);
  const [harga, setHarga] = useState<number | "">(order?.harga ?? 100000);
  const [orderStatus, setOrderStatus] = useState<"Sukses" | "Pending" | "Cancel" | "Proses">(order?.orderStatus ?? "Sukses");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (outletId) {
      const match = outlets.find((o) => o.id === outletId);
      if (match) {
        setSearchQuery(`${match.noInduk} — ${match.outlet}`);
      }
    } else {
      setSearchQuery("");
    }
  }, [outletId, outlets]);

  const filteredOutlets = outlets.filter(
    (o) =>
      o.outlet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.noInduk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const numQty = qty === "" ? 0 : qty;
  const numHarga = harga === "" ? 0 : harga;
  const totalHarga = numQty * numHarga;

  useEffect(() => {
    if (order) {
      setOutletId(order.outletId);
      setQty(order.order);
      setHarga(order.harga);
      setOrderStatus(order.orderStatus);
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("totalBayar", "0");
    formData.set("paymentMethod", "Cash");
    const result = await onSubmit(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                mode === "create" ? "gradient-emerald" : "gradient-blue"
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {mode === "create" ? (
                  <>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </>
                ) : (
                  <>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </>
                )}
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                {mode === "create" ? "Buat Order Baru" : "Edit Order"}
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                {mode === "create"
                  ? "Pilih outlet dan isi detail pesanan"
                  : "Ubah detail pesanan atau status"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] rounded-lg transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* Searchable Outlet Selection */}
            <div className="sm:col-span-2 relative">
              <label
                htmlFor="outlet-search"
                className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5"
              >
                Pilih Outlet (Cari Nama / No Induk)
              </label>
              <div className="relative">
                <input
                  id="outlet-search"
                  type="text"
                  className="input pr-10"
                  placeholder="Ketik nama toko atau no induk..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (outletId) {
                      setOutletId(""); // Reset selection if they edit text
                    }
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  required={!outletId}
                  autoComplete="off"
                />
                {outletId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOutletId("");
                      setSearchQuery("");
                      setIsDropdownOpen(true);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    ✕
                  </button>
                ) : (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none">
                    🔍
                  </span>
                )}
              </div>

              {/* Hidden Input for Form Submission */}
              <input type="hidden" name="outletId" value={outletId} />

              {/* Dropdown Options */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg bg-[#0d0d0c] border border-[var(--card-border)] shadow-xl divide-y divide-[var(--card-border)]">
                  {filteredOutlets.length === 0 ? (
                    <div className="p-3 text-xs text-[var(--muted-foreground)] text-center">
                      Tidak ada outlet yang cocok
                    </div>
                  ) : (
                    filteredOutlets.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-xs text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-white transition-colors flex items-center justify-between"
                        onClick={() => {
                          setOutletId(o.id);
                          setSearchQuery(`${o.noInduk} — ${o.outlet}`);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span className="font-semibold">{o.outlet}</span>
                        <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                          {o.noInduk}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Status Order */}
            <div>
              <label
                htmlFor="orderStatus"
                className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5"
              >
                Status Order
              </label>
              <select
                id="orderStatus"
                name="orderStatus"
                className="input cursor-pointer"
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as any)}
                required
              >
                <option value="Sukses">✅ Sukses</option>
                <option value="Proses">⚙️ Proses</option>
                <option value="Pending">⏳ Pending</option>
                <option value="Cancel">❌ Cancel</option>
              </select>
            </div>

            {/* Hidden tglOrder — always today */}
            <input type="hidden" name="tglOrder" value={new Date().toISOString().slice(0, 10)} />

            {/* Order Quantity */}
            <div>
              <label
                htmlFor="order"
                className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5"
              >
                Jumlah (Kardus)
              </label>
              <input
                id="order"
                name="order"
                type="number"
                step="0.1"
                min="0.1"
                className="input"
                placeholder="Contoh: 1.5"
                value={qty}
                onChange={(e) => {
                  const val = e.target.value;
                  setQty(val === "" ? "" : parseFloat(val));
                }}
                required
              />
            </div>

            {/* Harga */}
            <div>
              <label
                htmlFor="harga"
                className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5"
              >
                Harga per Kardus (Rp)
              </label>
              <input
                id="harga"
                name="harga"
                type="number"
                min="0"
                className="input"
                placeholder="100000"
                value={harga}
                onChange={(e) => {
                  const val = e.target.value;
                  setHarga(val === "" ? "" : parseFloat(val));
                }}
                required
              />
            </div>
          </div>

          {/* Live Preview — only total, no piutang/lunas */}
          <div className="rounded-xl bg-[var(--background)] border border-[var(--card-border)] p-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider mb-1">Total Harga</p>
                <p className="text-lg font-bold font-serif-aww text-[var(--foreground)]">
                  {formatCurrency(totalHarga)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider mb-1">Status</p>
                <span
                  className={`badge ${
                    orderStatus === "Sukses"
                      ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/15"
                      : orderStatus === "Proses"
                      ? "text-blue-500 bg-blue-500/5 border-blue-500/15"
                      : orderStatus === "Pending"
                      ? "text-amber-500 bg-amber-500/5 border-amber-500/15"
                      : "text-rose-500 bg-rose-500/5 border-rose-500/15"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      orderStatus === "Sukses"
                        ? "bg-emerald-500"
                        : orderStatus === "Proses"
                        ? "bg-blue-500"
                        : orderStatus === "Pending"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                  />
                  {orderStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--card-border)]">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary text-xs"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary text-xs"
              disabled={loading}
            >
              {loading
                ? "Menyimpan..."
                : mode === "create"
                ? "Buat Order"
                : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
