"use client";

import { useState } from "react";

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  placeholder: string;
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}

export default function CreateModal({
  isOpen,
  onClose,
  title,
  placeholder,
  onSubmit,
}: CreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="btn-icon btn-ghost rounded-lg"
            aria-label="Tutup"
          >
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
          <div className="mb-5">
            <label
              htmlFor="create-name"
              className="block text-sm font-medium text-[var(--muted-foreground)] mb-2"
            >
              Nama
            </label>
            <input
              id="create-name"
              name="name"
              type="text"
              className="input"
              placeholder={placeholder}
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[var(--danger-bg)] border border-[var(--danger)]/20 text-sm text-[var(--danger)]">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
