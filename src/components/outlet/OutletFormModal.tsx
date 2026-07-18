"use client";

import { useState } from "react";

interface OutletFormModalProps {
  mode: "create" | "edit";
  outlet?: {
    noId: string;
    outlet: string;
    tglDaftar: string;
    totalOrder?: number;
    totalPendapatan?: number;
    totalBayar?: number;
  } | null;
  nextNoInduk?: string | null;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
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
        className="modal-content"
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
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </>
                )}
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                {mode === "create" ? "Daftarkan Outlet Baru" : "Edit Data Outlet"}
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                {mode === "create"
                  ? "Isi identitas toko untuk didaftarkan"
                  : "Ubah data registrasi outlet"}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NO ID */}
          <div>
            <label
              htmlFor="noId"
              className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5"
            >
              NO ID
            </label>
            <input
              id="noId"
              name="noId"
              type="text"
              className="input"
              placeholder="Contoh: #RJ1SN001"
              defaultValue={mode === "create" ? (nextNoInduk ?? "") : (outlet?.noId ?? "")}
              required
            />
          </div>

          {/* Outlet Name */}
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

          {/* Tanggal Daftar */}
          <div>
            <label
              htmlFor="tglDaftar"
              className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5"
            >
              Tanggal Daftar
            </label>
            <input
              id="tglDaftar"
              name="tglDaftar"
              type="date"
              className="input"
              defaultValue={outlet?.tglDaftar ?? new Date().toISOString().slice(0, 10)}
              required
            />
          </div>

          {/* Transaction / Legacy Financial Fields (Opsional) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[var(--card-border)]/50 pt-3">
            <div>
              <label
                htmlFor="order"
                className="block text-xs font-medium text-[var(--muted-foreground)] mb-1"
              >
                Order <span className="text-[10px] text-[var(--muted)]">(Opsional)</span>
              </label>
              <input
                id="order"
                name="order"
                type="number"
                step="any"
                min="0"
                className="input text-xs font-mono"
                placeholder="Order (Krd)"
                defaultValue={outlet?.totalOrder ?? ""}
              />
            </div>

            <div>
              <label
                htmlFor="pendapatan"
                className="block text-xs font-medium text-[var(--muted-foreground)] mb-1"
              >
                Pendapatan <span className="text-[10px] text-[var(--muted)]">(Opsional)</span>
              </label>
              <input
                id="pendapatan"
                name="pendapatan"
                type="number"
                step="any"
                min="0"
                className="input text-xs font-mono"
                placeholder="Pendapatan (Rp)"
                defaultValue={outlet?.totalPendapatan ?? ""}
              />
            </div>

            <div>
              <label
                htmlFor="totalBayar"
                className="block text-xs font-medium text-[var(--muted-foreground)] mb-1"
              >
                Total Bayar <span className="text-[10px] text-[var(--muted)]">(Opsional)</span>
              </label>
              <input
                id="totalBayar"
                name="totalBayar"
                type="number"
                step="any"
                min="0"
                className="input text-xs font-mono"
                placeholder="Bayar (Rp)"
                defaultValue={outlet?.totalBayar ?? ""}
              />
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
              className={`btn text-xs ${
                mode === "create" ? "btn-primary" : "btn-primary"
              }`}
              disabled={loading}
            >
              {loading
                ? "Menyimpan..."
                : mode === "create"
                ? "Daftarkan Outlet"
                : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
