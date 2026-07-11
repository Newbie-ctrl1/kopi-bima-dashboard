"use client";

import { useState, useRef } from "react";

interface UploadModalProps {
  onClose: () => void;
  onUpload: (formData: FormData) => Promise<{
    error?: string;
    success?: boolean;
    imported?: number;
    warnings?: string[];
  }>;
}

export default function UploadModal({ onClose, onUpload }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    imported?: number;
    warnings?: string[];
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent =
      "noInduk,outlet,kunjungan,order,harga,totalBayar\n" +
      "#DRJ1SN006,Toko Contoh Sederhana,2026-07-11,2.5,100000,250000\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_outlet.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (f: File) => {
    const name = f.name.toLowerCase();
    if (
      !name.endsWith(".csv") &&
      !name.endsWith(".xlsx") &&
      !name.endsWith(".xls")
    ) {
      setError("Format file harus CSV atau Excel (.xlsx/.xls)");
      return;
    }
    setFile(f);
    setError("");
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await onUpload(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setResult({ imported: res.imported, warnings: res.warnings });
      setLoading(false);
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
            <div className="w-9 h-9 rounded-lg gradient-emerald flex items-center justify-center">
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Upload Data
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Import data dari file CSV atau Excel
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

        {/* Success result */}
        {result ? (
          <div>
            <div className="rounded-xl bg-[var(--success-bg)] border border-[var(--success)]/20 p-5 mb-5 text-center">
              <svg
                className="mx-auto mb-3"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--success)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-base font-semibold text-[var(--success)] mb-1">
                Upload Berhasil!
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {result.imported} data berhasil diimport
              </p>
            </div>

            {result.warnings && result.warnings.length > 0 && (
              <div className="rounded-xl bg-[var(--warning-bg)] border border-[var(--warning)]/20 p-4 mb-5">
                <p className="text-sm font-medium text-[var(--warning)] mb-2">
                  Peringatan:
                </p>
                <ul className="text-xs text-[var(--muted-foreground)] space-y-1">
                  {result.warnings.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={onClose} className="btn btn-primary">
                Selesai
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Dropzone */}
            <div
              className={`dropzone mb-5 ${dragActive ? "active" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) validateAndSetFile(f);
                }}
              />

              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                    <path d="M14 2v6h6" />
                    <path d="M12 18v-6" />
                    <path d="m9 15 3-3 3 3" />
                  </svg>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {file.name}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-xs text-[var(--danger)] hover:underline mt-1"
                  >
                    Hapus file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--muted)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    <span className="text-[var(--accent)] font-medium">
                      Klik untuk memilih
                    </span>{" "}
                    atau drag & drop file
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Format: CSV, Excel (.xlsx, .xls)
                  </p>
                </div>
              )}
            </div>

            {/* Format Guide */}
            <div className="rounded-xl bg-[var(--background)] border border-[var(--card-border)] p-4 mb-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                  Format Kolom yang Didukung
                </h4>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 font-medium transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Unduh Template CSV
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  "noInduk / no_induk",
                  "outlet",
                  "kunjungan",
                  "order",
                  "harga (opsional)",
                  "totalBayar / total_bayar",
                ].map((col) => (
                  <div
                    key={col}
                    className="px-2 py-1.5 rounded-md bg-[var(--card)] text-[var(--muted-foreground)] font-mono"
                  >
                    {col}
                  </div>
                ))}
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
              <button onClick={onClose} className="btn btn-secondary">
                Batal
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="btn btn-primary disabled:opacity-50"
              >
                {loading ? "Mengupload..." : "Upload & Import"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
