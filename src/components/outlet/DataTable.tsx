"use client";

import { useState } from "react";
import type { OutletWithSummary } from "@/lib/types";
import { useAuth } from "@/components/layout/AuthProvider";
import OutletFormModal from "@/components/outlet/OutletFormModal";
import UploadModal from "@/components/outlet/UploadModal";
import { formatCurrency } from "@/lib/utils";

interface DataTableProps {
  outlets: OutletWithSummary[];
  alamatId: string;
  basePath: string;
  nextNoInduk?: string;
  onCreateOutlet: (
    alamatId: string,
    basePath: string,
    formData: FormData
  ) => Promise<{ error?: string; success?: boolean }>;
  onUpdateOutlet: (
    outletId: string,
    basePath: string,
    formData: FormData
  ) => Promise<{ error?: string; success?: boolean }>;
  onDeleteOutlet: (
    outletId: string,
    basePath: string
  ) => Promise<{ error?: string; success?: boolean }>;
  onUploadOutlets: (
    alamatId: string,
    basePath: string,
    formData: FormData
  ) => Promise<{
    error?: string;
    success?: boolean;
    imported?: number;
    warnings?: string[];
  }>;
}



export default function DataTable({
  outlets,
  alamatId,
  basePath,
  nextNoInduk,
  onCreateOutlet,
  onUpdateOutlet,
  onDeleteOutlet,
  onUploadOutlets,
}: DataTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Lunas" | "Piutang">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const auth = useAuth();
  const isAdmin = auth?.role === "ADMIN";
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editOutlet, setEditOutlet] = useState<OutletWithSummary | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = outlets.filter((o) => {
    const matchesSearch =
      o.noInduk.toLowerCase().includes(search.toLowerCase()) ||
      o.outlet.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "Piutang"
        ? o.totalPiutang > 0
        : o.totalPiutang === 0;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const paginatedOutlets = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await onDeleteOutlet(deleteId, basePath);
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div className="animate-slide-up" style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}>
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 flex-1">
          <div className="relative w-full sm:w-72">
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
              id="search-outlet"
              type="text"
              className="input pl-10"
              placeholder="Cari No Induk / Nama Outlet..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filter Payment Status */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] w-fit">
            {(["all", "Lunas", "Piutang"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setStatusFilter(filter);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-[9px] uppercase font-bold tracking-wider transition-all duration-200 ${
                  statusFilter === filter
                    ? filter === "Lunas"
                      ? "bg-emerald-500/15 text-emerald-500 shadow-sm"
                      : filter === "Piutang"
                      ? "bg-rose-500/15 text-rose-500 shadow-sm"
                      : "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
                }`}
              >
                {filter === "all" ? "Semua" : filter}
              </button>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-3 self-end md:self-auto">
            <button
              id="btn-upload"
              onClick={() => setShowUploadModal(true)}
              className="btn btn-secondary text-xs"
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload CSV/XLSX
            </button>
            <button
              id="btn-tambah-data"
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary text-xs"
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Daftarkan Outlet
            </button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="card-static overflow-hidden border border-[var(--card-border)] bg-[#0d0d0c]">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="font-sans text-[10px] tracking-widest font-bold">No Induk</th>
                <th className="font-sans text-[10px] tracking-widest font-bold">Outlet</th>
                <th className="font-sans text-[10px] tracking-widest font-bold">Tgl Daftar</th>
                <th className="text-center font-sans text-[10px] tracking-widest font-bold">Orders</th>
                <th className="text-right font-sans text-[10px] tracking-widest font-bold">Total Order</th>
                <th className="text-right font-sans text-[10px] tracking-widest font-bold">Pendapatan</th>
                <th className="text-right font-sans text-[10px] tracking-widest font-bold">Bayar</th>
                <th className="text-right font-sans text-[10px] tracking-widest font-bold">Piutang</th>
                <th className="font-sans text-[10px] tracking-widest font-bold">Status</th>
                {isAdmin && <th className="text-center font-sans text-[10px] tracking-widest font-bold">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 10 : 9}>
                    <div className="empty-state py-16">
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-[var(--muted)] mb-2"
                      >
                        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                        <path d="M2 7h20" />
                      </svg>
                      <p className="text-xs text-[var(--muted-foreground)] font-medium">
                        Belum ada outlet terdaftar di alamat ini
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOutlets.map((o) => (
                  <tr key={o.id}>
                    <td className="font-mono text-[var(--foreground)] font-semibold text-xs tracking-tight">
                      {o.noInduk}
                    </td>
                    <td className="text-[var(--foreground)] font-semibold">{o.outlet}</td>
                    <td className="text-xs uppercase tracking-wide">
                      {o.tglDaftar
                        ? new Date(o.tglDaftar).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="text-center">
                      <span className="badge text-[var(--accent)] bg-[var(--accent)]/5 border-[var(--accent)]/15">
                        {o.orderCount}
                      </span>
                    </td>
                    <td className="text-right font-mono text-xs font-semibold text-[var(--foreground)]">
                      {o.totalOrder.toFixed(1)} Krd
                    </td>
                    <td className="text-right font-mono text-xs font-semibold text-purple-400">
                      {formatCurrency(o.totalPendapatan)}
                    </td>
                    <td className="text-right font-mono text-xs font-semibold text-[var(--success)]">
                      {formatCurrency(o.totalBayar)}
                    </td>
                    <td className="text-right font-mono text-xs font-semibold text-[var(--danger)]">
                      {formatCurrency(o.totalPiutang)}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          o.totalPiutang > 0 ? "badge-piutang" : "badge-lunas"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            o.totalPiutang > 0 ? "bg-[var(--danger)]" : "bg-[var(--success)]"
                          }`}
                        />
                        {o.totalPiutang > 0 ? "Piutang" : "Lunas"}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditOutlet(o)}
                            className="p-2 border border-transparent hover:border-[var(--accent)] text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-300"
                            title="Edit"
                          >
                            <svg
                              width="13"
                              height="13"
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
                          </button>
                          <button
                            onClick={() => setDeleteId(o.id)}
                            className="p-2 border border-transparent hover:border-rose-500/30 text-[var(--muted)] hover:text-rose-400 transition-all duration-300"
                            title="Hapus"
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
          <p className="text-xs text-[var(--muted-foreground)]">
            Menampilkan <strong className="text-[var(--foreground)] font-mono">{startIndex + 1}</strong>–
            <strong className="text-[var(--foreground)] font-mono">
              {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}
            </strong> dari{" "}
            <strong className="text-[var(--foreground)] font-mono">{filtered.length}</strong> outlet
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={validPage === 1}
              className="px-3 py-1.5 border border-[var(--card-border)] bg-[#0d0d0c] text-xs font-semibold text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30 disabled:hover:border-[var(--card-border)] disabled:hover:text-[var(--foreground)] disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Sebelumnya
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 flex items-center justify-center text-xs font-mono font-bold transition-all border ${
                    validPage === page
                      ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20"
                      : "bg-[#0d0d0c] border-[var(--card-border)] text-[var(--muted-foreground)] hover:border-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={validPage === totalPages}
              className="px-3 py-1.5 border border-[var(--card-border)] bg-[#0d0d0c] text-xs font-semibold text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30 disabled:hover:border-[var(--card-border)] disabled:hover:text-[var(--foreground)] disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              Selanjutnya
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <OutletFormModal
          mode="create"
          nextNoInduk={nextNoInduk}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (formData) => {
            return await onCreateOutlet(alamatId, basePath, formData);
          }}
        />
      )}

      {editOutlet && (
        <OutletFormModal
          mode="edit"
          outlet={editOutlet}
          onClose={() => setEditOutlet(null)}
          onSubmit={async (formData) => {
            return await onUpdateOutlet(editOutlet.id, basePath, formData);
          }}
        />
      )}

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={async (formData) => {
            return await onUploadOutlets(alamatId, basePath, formData);
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
            <div className="text-center">
              <div className="w-12 h-12 rounded-full gradient-rose flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)] mb-2">
                Hapus Outlet?
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mb-6">
                Semua order terkait outlet ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="btn btn-secondary text-xs"
                  disabled={deleting}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="btn text-xs bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                  disabled={deleting}
                >
                  {deleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
