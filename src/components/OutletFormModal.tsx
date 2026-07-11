"use client";

import { useState, useEffect } from "react";
import type { Outlet } from "@/lib/types";

interface OutletFormModalProps {
  mode: "create" | "edit";
  outlet?: Outlet;
  nextNoInduk?: string;
  onClose: () => void;
  onSubmit: (
    formData: FormData
  ) => Promise<{ error?: string; success?: boolean }>;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function OutletFormModal({
  mode,
  outlet,
  nextNoInduk,
  onClose,
  onSubmit,
}: OutletFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<number | "">(outlet?.order ?? 1);
  const [harga, setHarga] = useState<number | "">(outlet?.harga ?? 100000);
  const [totalBayar, setTotalBayar] = useState<number | "">(outlet?.totalBayar ?? 0);

  const numOrder = order === "" ? 0 : order;
  const numHarga = harga === "" ? 0 : harga;
  const numTotalBayar = totalBayar === "" ? 0 : totalBayar;

  const totalHarga = numOrder * numHarga;
  const totalPiutang = Math.max(0, totalHarga - numTotalBayar);
  const status = totalPiutang > 0 ? "Piutang" : "Lunas";

  // Reset when outlet changes
  useEffect(() => {
    if (outlet) {
      setOrder(outlet.order);
      setHarga(outlet.harga);
      setTotalBayar(outlet.totalBayar);
    }
  }, [outlet]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
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
                mode === "create" ? "gradient-amber" : "gradient-blue"
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={mode === "create" ? "#0c0a09" : "#fff"}
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
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </>
                )}
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {mode === "create" ? "Tambah Data Outlet" : "Edit Data Outlet"}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {mode === "create"
                  ? "Isi formulir untuk menambah data baru"
                  : "Perbarui informasi outlet"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost rounded-lg">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* No Induk */}
            <div>
              <label
                htmlFor="noInduk"
                className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5"
              >
                No Induk
              </label>
              <input
                id="noInduk"
                name="noInduk"
                type="text"
                className="input"
                placeholder="Contoh: #RJ1SN001"
                defaultValue={mode === "create" ? (nextNoInduk ?? "") : (outlet?.noInduk ?? "")}
                required
              />
            </div>

            {/* Outlet */}
            <div>
              <label
                htmlFor="outlet"
                className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5"
              >
                Nama Outlet
              </label>
              <input
                id="outlet"
                name="outlet"
                type="text"
                className="input"
                placeholder="Contoh: Toko Sejahtera"
                defaultValue={outlet?.outlet ?? ""}
                required
              />
            </div>

            {/* Kunjungan */}
            <div>
              <label
                htmlFor="kunjungan"
                className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5"
              >
                Tanggal Kunjungan
              </label>
              <input
                id="kunjungan"
                name="kunjungan"
                type="date"
                className="input"
                defaultValue={outlet?.kunjungan ?? ""}
                required
              />
            </div>

            {/* Order */}
            <div>
              <label
                htmlFor="order"
                className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5"
              >
                Order (Kardus)
              </label>
              <input
                id="order"
                name="order"
                type="number"
                step="0.1"
                min="0"
                className="input"
                placeholder="Contoh: 1.5"
                value={order}
                onChange={(e) => {
                  const val = e.target.value;
                  setOrder(val === "" ? "" : parseFloat(val));
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

            {/* Total Bayar */}
            <div>
              <label
                htmlFor="totalBayar"
                className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5"
              >
                Total Bayar (Rp)
              </label>
              <input
                id="totalBayar"
                name="totalBayar"
                type="number"
                min="0"
                className="input"
                placeholder="0"
                value={totalBayar}
                onChange={(e) => {
                  const val = e.target.value;
                  setTotalBayar(val === "" ? "" : parseFloat(val));
                }}
                required
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="rounded-xl bg-[var(--background)] border border-[var(--card-border)] p-4 mb-5">
            <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">
              Preview Kalkulasi
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-[var(--muted)] mb-1">Total Harga</p>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {formatCurrency(totalHarga)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)] mb-1">
                  Total Piutang
                </p>
                <p
                  className={`text-sm font-semibold ${
                    totalPiutang > 0
                      ? "text-[var(--danger)]"
                      : "text-[var(--success)]"
                  }`}
                >
                  {formatCurrency(totalPiutang)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)] mb-1">Status</p>
                <span
                  className={`badge ${
                    status === "Lunas" ? "badge-lunas" : "badge-piutang"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status === "Lunas"
                        ? "bg-[var(--success)]"
                        : "bg-[var(--danger)]"
                    }`}
                  />
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[var(--danger-bg)] border border-[var(--danger)]/20 text-sm text-[var(--danger)]">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Batal
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading
                ? "Menyimpan..."
                : mode === "create"
                ? "Tambah Data"
                : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
