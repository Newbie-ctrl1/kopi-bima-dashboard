"use client";

import { useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import CoffeeStockFormModal from "@/components/stock/CoffeeStockFormModal";
import { formatCurrency } from "@/lib/utils";

interface CoffeeStock {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  price: number;
}

interface CoffeeStockTabProps {
  stocks: CoffeeStock[];
  onCreateStock: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  onUpdateStock: (id: string, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  onDeleteStock: (id: string) => Promise<{ error?: string; success?: boolean }>;
}

export default function CoffeeStockTab({
  stocks,
  onCreateStock,
  onUpdateStock,
  onDeleteStock,
}: CoffeeStockTabProps) {
  const [search, setSearch] = useState("");
  const auth = useAuth();
  const isAdmin = auth?.role === "ADMIN";
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editStock, setEditStock] = useState<CoffeeStock | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = stocks.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await onDeleteStock(deleteId);
    setDeleting(false);
    setDeleteId(null);
  };

  // Determine progress bar color based on stock quantity
  const getProgressColor = (qty: number) => {
    if (qty < 10) return "bg-[var(--danger)]";
    if (qty < 30) return "bg-amber-500";
    return "bg-emerald-500";
  };

  // Estimate low stock label
  const getStockStatus = (qty: number) => {
    if (qty < 10) return { label: "Hampir Habis", color: "text-[var(--danger)] bg-[var(--danger-bg)] border-[var(--danger)]/10" };
    if (qty < 30) return { label: "Perlu Reorder", color: "text-amber-500 bg-amber-500/5 border-amber-500/10" };
    return { label: "Tersedia", color: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" };
  };

  return (
    <div className="space-y-6">
      {/* Stock Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            id="search-stock"
            type="text"
            className="input pl-10"
            placeholder="Cari SKU / Nama Kopi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary text-xs"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Stok Kopi
          </button>
        )}
      </div>

      {/* Stock List Card */}
      <div className="stat-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--background)] border border-[var(--card-border)] flex items-center justify-center mx-auto mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--muted)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[var(--foreground)] mb-1">
              Tidak ada data stok kopi
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {search ? "Coba cari dengan kata kunci lain" : "Mulai dengan menambahkan persediaan stok baru"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nama Item</th>
                  <th>Status</th>
                  <th>Persediaan</th>
                  <th>Harga Satuan</th>
                  <th>Total Nilai Aset</th>
                  {isAdmin && <th aria-label="Aksi" className="w-[60px] text-right"></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const status = getStockStatus(item.quantity);
                  const totalValue = item.quantity * item.price;
                  // Max visual quantity reference (100 for 100%)
                  const pct = Math.min((item.quantity / 100) * 100, 100);

                  return (
                    <tr key={item.id} className="hover:bg-[var(--card)]/40 transition-colors">
                      <td className="font-mono font-bold text-xs text-[var(--accent)]">
                        {item.sku}
                      </td>
                      <td>
                        <span className="font-semibold text-[var(--foreground)]">
                          {item.name}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1 w-32">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="font-bold text-[var(--foreground)]">
                              {item.quantity.toFixed(1)}
                            </span>
                            <span className="text-[var(--muted-foreground)]">
                              {item.unit}
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full h-1.5 bg-[var(--background)] rounded-full overflow-hidden border border-[var(--card-border)]">
                            <div
                              className={`h-full rounded-full ${getProgressColor(item.quantity)}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-xs text-[var(--muted-foreground)]">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="font-mono text-xs font-bold text-[var(--foreground)]">
                        {formatCurrency(totalValue)}
                      </td>
                      {isAdmin && (
                        <td className="text-right relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === item.id ? null : item.id);
                            }}
                            className="btn-icon btn-ghost rounded-lg"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          {activeMenuId === item.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div className="dropdown-menu z-50 animate-scale-up right-0 top-9">
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setEditStock(item);
                                  }}
                                >
                                  Edit Stok
                                </button>
                                <button
                                  className="text-[var(--danger)] hover:bg-[var(--danger-bg)]"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setDeleteId(item.id);
                                  }}
                                >
                                  Hapus Stok
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CoffeeStockFormModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSubmit={onCreateStock}
        />
      )}

      {/* Edit Modal */}
      {editStock && (
        <CoffeeStockFormModal
          mode="edit"
          stock={editStock}
          onClose={() => setEditStock(null)}
          onSubmit={async (formData) => {
            return await onUpdateStock(editStock.id, formData);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-10 h-10 border border-[var(--danger)] bg-[var(--danger-bg)] flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--danger)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-wider font-serif-aww text-[var(--foreground)]">Hapus Stok Kopi</h3>
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide">
                  Tindakan ini bersifat permanen
                </p>
              </div>
            </div>

            <p className="text-sm text-[var(--muted-foreground)] mb-8">
              Apakah Anda yakin ingin menghapus item stok kopi terpilih ini? Data persediaan fisik dan aset akan terhapus secara permanen dari sistem.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="btn btn-secondary"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn btn-danger"
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
