"use client";

import { useState } from "react";
import type { Outlet } from "@/lib/types";
import OutletFormModal from "./OutletFormModal";
import UploadModal from "./UploadModal";

interface DataTableProps {
  outlets: Outlet[];
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editOutlet, setEditOutlet] = useState<Outlet | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = outlets.filter((o) => {
    const matchesSearch =
      o.noInduk.toLowerCase().includes(search.toLowerCase()) ||
      o.outlet.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
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
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] w-fit self-start sm:self-auto">
            {(["all", "Lunas", "Piutang"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3.5 py-2 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all duration-200 ${
                  statusFilter === filter
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
                }`}
              >
                {filter === "all" ? "Semua" : filter}
              </button>
            ))}
          </div>
        </div>

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
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Data
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card-static overflow-hidden border border-[var(--card-border)] bg-[#0d0d0c]">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="font-sans text-[10px] tracking-widest font-bold">No Induk</th>
                <th className="font-sans text-[10px] tracking-widest font-bold">Outlet</th>
                <th className="font-sans text-[10px] tracking-widest font-bold">Kunjungan</th>
                <th className="text-right font-sans text-[10px] tracking-widest font-bold">Order (Kardus)</th>
                <th className="text-right font-sans text-[10px] tracking-widest font-bold">Harga</th>
                <th className="text-right font-sans text-[10px] tracking-widest font-bold">Total Bayar</th>
                <th className="text-right font-sans text-[10px] tracking-widest font-bold">Total Piutang</th>
                <th className="font-sans text-[10px] tracking-widest font-bold">Status</th>
                <th className="text-center font-sans text-[10px] tracking-widest font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state py-16">
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--muted)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                        <path d="M14 2v6h6" />
                        <path d="M9 15h6" />
                      </svg>
                      <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                        {search
                          ? "Data tidak ditemukan"
                          : "Belum ada data outlet"}
                      </p>
                      {!search && (
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="btn btn-primary btn-sm text-[10px] mt-4"
                        >
                          Tambah Data Baru
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id}>
                    <td className="font-mono text-[var(--foreground)] font-semibold text-xs tracking-tight">
                      {o.noInduk}
                    </td>
                    <td className="text-[var(--foreground)] font-semibold">
                      {o.outlet}
                    </td>
                    <td className="text-xs uppercase tracking-wide">
                      {o.kunjungan
                        ? new Date(o.kunjungan).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="text-right font-mono text-xs font-semibold text-[var(--foreground)]">{o.order}</td>
                    <td className="text-right font-mono text-xs">{formatCurrency(o.harga)}</td>
                    <td className="text-right font-mono text-xs font-semibold text-[var(--success)]">
                      {formatCurrency(o.totalBayar)}
                    </td>
                    <td className="text-right font-mono text-xs font-semibold text-[var(--danger)]">
                      {formatCurrency(o.totalPiutang)}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          o.status === "Lunas"
                            ? "badge-lunas"
                            : "badge-piutang"
                        }`}
                      >
                        <span
                          className={`w-1 h-1 ${
                            o.status === "Lunas"
                              ? "bg-[var(--success)]"
                              : "bg-[var(--danger)]"
                          }`}
                        />
                        {o.status}
                      </span>
                    </td>
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
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteId(o.id)}
                          className="p-2 border border-transparent hover:border-[var(--danger)] text-[var(--muted)] hover:text-[var(--danger)] transition-all duration-300"
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
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-[var(--card-border)] bg-[#090909] flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">
              Menampilkan {filtered.length} dari {outlets.length} data outlet
            </p>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <OutletFormModal
          mode="create"
          nextNoInduk={nextNoInduk}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (formData: FormData) => {
            const result = await onCreateOutlet(alamatId, basePath, formData);
            return result;
          }}
        />
      )}

      {editOutlet && (
        <OutletFormModal
          mode="edit"
          outlet={editOutlet}
          onClose={() => setEditOutlet(null)}
          onSubmit={async (formData: FormData) => {
            const result = await onUpdateOutlet(
              editOutlet.id,
              basePath,
              formData
            );
            return result;
          }}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={async (formData: FormData) => {
            const result = await onUploadOutlets(
              alamatId,
              basePath,
              formData
            );
            return result;
          }}
        />
      )}

      {/* Delete confirmation */}
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
                <h3 className="text-base font-bold uppercase tracking-wider font-serif-aww text-[var(--foreground)]">Hapus Data Outlet</h3>
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide">
                  Tindakan ini bersifat permanen
                </p>
              </div>
            </div>

            <p className="text-sm text-[var(--muted-foreground)] mb-8">
              Apakah Anda yakin ingin menghapus data outlet terpilih ini? Data keuangan dan order outlet ini akan hilang sepenuhnya.
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
