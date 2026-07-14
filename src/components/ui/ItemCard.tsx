"use client";

import Link from "next/link";
import { useState } from "react";

interface ItemCardProps {
  id: string;
  name: string;
  href: string;
  subtitle?: string;
  count?: number;
  countLabel?: string;
  icon: React.ReactNode;
  gradient: string;
  onDelete?: (id: string) => Promise<void>;
  onUpdate?: (id: string, newName: string) => Promise<void>;
}

export default function ItemCard({
  id,
  name,
  href,
  subtitle,
  count,
  countLabel,
  icon,
  onDelete,
  onUpdate,
}: ItemCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete?.(id);
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div className="card group relative animate-slide-up bg-[#0d0d0c]">
        {/* Dropdown Click-Outside Overlay */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-20 cursor-default"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDropdown(false);
            }}
          />
        )}

        <Link href={href} className="block p-6">
          <div className="mb-6">
            <div
              className="w-10 h-10 border border-[var(--card-border)] flex items-center justify-center text-white"
            >
              {icon}
            </div>
          </div>
          
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight font-serif-aww group-hover:text-[var(--accent)] transition-colors duration-300">
                {name}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-[var(--muted)] uppercase tracking-wider mt-1">{subtitle}</p>
              )}
            </div>
            {count !== undefined && (
              <div className="text-right shrink-0">
                <p className="text-3xl font-bold font-sans text-[var(--foreground)] tracking-tight leading-none">
                  {count}
                </p>
                <p className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-widest mt-1.5">
                  {countLabel}
                </p>
              </div>
            )}
          </div>
        </Link>

        {/* Three dots menu button */}
        {(onDelete || onUpdate) && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="absolute top-4 right-4 p-2 text-[var(--muted-foreground)] hover:text-white border border-[var(--card-border)] hover:border-[var(--card-border-hover)] bg-[#0d0d0c]/80 backdrop-blur-sm z-20"
            title="Menu"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        )}

        {/* Dropdown Menu */}
        {showDropdown && (
          <div
            className="absolute top-12 right-4 bg-[#0c0c0b] border border-[var(--card-border-hover)] py-1.5 min-w-[120px] shadow-[0_10px_30px_rgba(0,0,0,0.7)] z-30"
            onClick={(e) => e.stopPropagation()}
          >
            {onUpdate && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowDropdown(false);
                  setShowEdit(true);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-[var(--foreground)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] font-semibold uppercase tracking-wider"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowDropdown(false);
                  setShowConfirm(true);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-[var(--danger)] hover:bg-[var(--danger-bg)] font-semibold uppercase tracking-wider border-t border-[var(--card-border)]/50"
              >
                Hapus
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newName = formData.get("newName") as string;
              if (!newName || !newName.trim()) return;
              setUpdating(true);
              try {
                await onUpdate?.(id, newName.trim());
                setShowEdit(false);
              } finally {
                setUpdating(false);
              }
            }}
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold uppercase tracking-wider font-serif-aww text-[var(--foreground)] mb-6">
              Ubah Nama
            </h3>
            <div className="space-y-4 mb-8">
              <label className="block text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                Nama Baru
              </label>
              <input
                name="newName"
                type="text"
                defaultValue={name}
                className="input"
                required
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="btn btn-secondary"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={updating}
                className="btn btn-primary"
              >
                {updating ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-10 h-10 border border-[var(--danger)] flex items-center justify-center bg-[var(--danger-bg)]">
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
                <h3 className="text-base font-bold uppercase tracking-wider text-[var(--foreground)] font-serif-aww">
                  Hapus Data
                </h3>
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide">
                  Tindakan ini permanen
                </p>
              </div>
            </div>

            <p className="text-sm text-[var(--muted-foreground)] mb-8">
              Apakah Anda yakin ingin menghapus <strong className="text-[var(--foreground)]">&quot;{name}&quot;</strong>? 
              Seluruh data turunan di dalamnya juga akan terhapus.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
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
    </>
  );
}
