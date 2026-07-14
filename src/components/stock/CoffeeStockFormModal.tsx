"use client";

import { useState } from "react";

interface CoffeeStock {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  price: number;
}

interface CoffeeStockFormModalProps {
  mode: "create" | "edit";
  stock?: CoffeeStock;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}

export default function CoffeeStockFormModal({
  mode,
  stock,
  onClose,
  onSubmit,
}: CoffeeStockFormModalProps) {
  const [name, setName] = useState(stock?.name ?? "");
  const [sku, setSku] = useState(stock?.sku ?? "");
  const [quantity, setQuantity] = useState<number | "">(stock?.quantity ?? "");
  const [unit, setUnit] = useState(stock?.unit ?? "kardus");
  const [price, setPrice] = useState<number | "">(stock?.price ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim() || !unit.trim()) {
      setError("Semua kolom wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("sku", sku.trim());
    formData.append("quantity", (quantity === "" ? 0 : quantity).toString());
    formData.append("unit", unit.trim());
    formData.append("price", (price === "" ? 0 : price).toString());

    const result = await onSubmit(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="modal-content animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-amber flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h2 className="text-base font-bold uppercase tracking-wider font-serif-aww text-[var(--foreground)]">
              {mode === "create" ? "Tambah Stok Kopi" : "Edit Stok Kopi"}
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost rounded-lg">
            <svg
              width="16"
              height="16"
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

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-[var(--danger-bg)] border border-[var(--danger)]/20 text-xs text-[var(--danger)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="stock-name"
              className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5"
            >
              Nama Item
            </label>
            <input
              id="stock-name"
              type="text"
              className="input"
              placeholder="Contoh: Kopi Robusta Dampit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="stock-sku"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5"
              >
                SKU / Kode
              </label>
              <input
                id="stock-sku"
                type="text"
                className="input"
                placeholder="Contoh: KR-DMP"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="stock-unit"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5"
              >
                Satuan
              </label>
              <input
                id="stock-unit"
                type="text"
                className="input opacity-60 cursor-not-allowed"
                value="kardus"
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="stock-quantity"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5"
              >
                Jumlah Kuantitas
              </label>
              <input
                id="stock-quantity"
                type="number"
                step="0.1"
                min="0"
                className="input"
                placeholder="0"
                value={quantity}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuantity(val === "" ? "" : parseFloat(val));
                }}
                required
              />
            </div>

            <div>
              <label
                htmlFor="stock-price"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5"
              >
                Harga per Satuan (Rp)
              </label>
              <input
                id="stock-price"
                type="number"
                min="0"
                className="input"
                placeholder="50000"
                value={price}
                onChange={(e) => {
                  const val = e.target.value;
                  setPrice(val === "" ? "" : parseFloat(val));
                }}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
