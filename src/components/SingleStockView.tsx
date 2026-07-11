"use client";

import { useState } from "react";
import CoffeeStockFormModal from "./CoffeeStockFormModal";

interface CoffeeStock {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  price: number;
}

interface SingleStockViewProps {
  stock: CoffeeStock;
  onUpdateStock: (id: string, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SingleStockView({
  stock,
  onUpdateStock,
}: SingleStockViewProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  const totalValue = stock.quantity * stock.price;
  const pct = Math.min((stock.quantity / 100) * 100, 100);

  // Status styling
  const getStockStatus = (qty: number) => {
    if (qty < 10) {
      return {
        label: "Hampir Habis",
        color: "text-[var(--danger)] bg-[var(--danger-bg)] border-[var(--danger)]/15",
      };
    }
    if (qty < 30) {
      return {
        label: "Perlu Reorder",
        color: "text-amber-500 bg-amber-500/5 border-amber-500/10",
      };
    }
    return {
      label: "Tersedia",
      color: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10",
    };
  };

  const getProgressColor = (qty: number) => {
    if (qty < 10) return "bg-[var(--danger)]";
    if (qty < 30) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const status = getStockStatus(stock.quantity);

  return (
    <div className="space-y-6">
      {/* Focused Single Stock Card */}
      <div className="max-w-2xl mx-auto stat-card p-8 animate-scale-up relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-[var(--accent)]/5 blur-3xl" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-[var(--card-border)] mb-8">
          <div>
            <span className="font-mono font-bold text-xs text-[var(--accent)] uppercase tracking-wider">
              SKU: {stock.sku}
            </span>
            <h2 className="text-xl font-bold font-serif-aww text-[var(--foreground)] mt-1">
              {stock.name}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Satu-satunya produk persediaan kopi Cap Bima yang dikelola
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded text-xs uppercase font-bold border self-start ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Quantities & Status Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          {/* Persediaan Kuantitas */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">
              Volume Persediaan
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-serif-aww text-[var(--foreground)]">
                {stock.quantity.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-[var(--muted)]">
                {stock.unit}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2 bg-[var(--background)] rounded-full overflow-hidden border border-[var(--card-border)]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(stock.quantity)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-[var(--muted-foreground)] font-mono">
                <span>0 kardus</span>
                <span>Kapasitas 100 kardus</span>
              </div>
            </div>
          </div>

          {/* Pricing & Asset value */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">
              Rincian Aset Stok
            </span>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Harga Satuan:</span>
                <span className="font-bold text-[var(--foreground)] font-mono">
                  {formatCurrency(stock.price)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[var(--card-border)]/50 pt-1.5">
                <span className="text-[var(--muted-foreground)]">Total Nilai Aset:</span>
                <span className="font-bold text-[var(--accent)] font-mono text-base">
                  {formatCurrency(totalValue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end border-t border-[var(--card-border)] pt-6">
          <button
            onClick={() => setShowEditModal(true)}
            className="btn btn-primary text-xs flex items-center gap-2"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Ubah Kuantitas & Harga
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <CoffeeStockFormModal
          mode="edit"
          stock={stock}
          onClose={() => setShowEditModal(false)}
          onSubmit={async (formData) => {
            return await onUpdateStock(stock.id, formData);
          }}
        />
      )}
    </div>
  );
}
