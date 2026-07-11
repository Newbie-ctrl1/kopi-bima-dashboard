"use client";

import { useState, useTransition } from "react";

interface UserItem {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

interface UserListClientProps {
  initialUsers: UserItem[];
  currentUserId: string;
  onCreateUser: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  onDeleteUser: (id: string) => Promise<{ error?: string; success?: boolean }>;
}

export default function UserListClient({
  initialUsers,
  currentUserId,
  onCreateUser,
  onDeleteUser,
}: UserListClientProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isCreating, startCreateTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    startCreateTransition(async () => {
      const res = await onCreateUser(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setShowCreateModal(false);
        setError(null);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setError(null);

    startDeleteTransition(async () => {
      const res = await onDeleteUser(deleteId);
      if (res?.error) {
        alert(res.error);
      } else {
        setDeleteId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
            Kelola Pengguna
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Daftar admin dan pengguna yang dapat mengakses aplikasi Kopi Bima
          </p>
        </div>
        <button
          onClick={() => {
            setError(null);
            setShowCreateModal(true);
          }}
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="16" y1="11" x2="22" y2="11" />
          </svg>
          Tambah User Baru
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card-static overflow-hidden border border-[var(--card-border)] bg-[#0d0d0c] animate-slide-up">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="font-sans text-[10px] tracking-widest font-bold">Username</th>
                <th className="font-sans text-[10px] tracking-widest font-bold">Role / Hak Akses</th>
                <th className="font-sans text-[10px] tracking-widest font-bold">Tgl Ditambahkan</th>
                <th className="text-center font-sans text-[10px] tracking-widest font-bold w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {initialUsers.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state py-16">
                      <p className="text-xs text-[var(--muted-foreground)] font-medium">
                        Belum ada pengguna terdaftar
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                initialUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--card)]/40 transition-colors">
                    <td className="text-[var(--foreground)] font-semibold flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-black/40 border border-[var(--card-border)] flex items-center justify-center text-[10px] font-bold text-[var(--accent)] font-mono">
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                      {user.username}
                      {user.id === currentUserId && (
                        <span className="text-[8px] bg-[var(--accent)]/10 text-[var(--accent)] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Anda
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === "ADMIN" ? "badge-lunas" : "badge-piutang"
                        } text-[9px] font-bold uppercase tracking-wider`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.role === "ADMIN" ? "bg-[var(--success)]" : "bg-[var(--danger)]"
                          }`}
                        />
                        {user.role}
                      </span>
                    </td>
                    <td className="text-xs text-[var(--muted-foreground)] font-mono">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => setDeleteId(user.id)}
                          disabled={user.id === currentUserId}
                          className="p-2 border border-transparent hover:border-rose-500/30 text-[var(--muted)] hover:text-rose-400 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:hover:border-transparent disabled:hover:text-[var(--muted)]"
                          title={user.id === currentUserId ? "Anda sedang masuk menggunakan akun ini" : "Hapus Pengguna"}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
      </div>

      {/* Add User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <form
            onSubmit={handleCreateSubmit}
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold uppercase tracking-wider font-serif-aww text-[var(--foreground)] mb-6">
              Tambah Pengguna Baru
            </h3>

            {error && (
              <div className="mb-5 p-3 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-fade-in flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                  Username
                </label>
                <input
                  name="username"
                  type="text"
                  className="input text-xs"
                  placeholder="Ketik username..."
                  required
                  disabled={isCreating}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                  Role / Hak Akses
                </label>
                <select
                  name="role"
                  className="input text-xs bg-[#050505] cursor-pointer"
                  required
                  disabled={isCreating}
                >
                  <option value="USER">USER (Hanya Lihat / Read-Only)</option>
                  <option value="ADMIN">ADMIN (Akses Penuh CRUD)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  className="input text-xs"
                  placeholder="Ketik password..."
                  required
                  disabled={isCreating}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                  Konfirmasi Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  className="input text-xs"
                  placeholder="Ulangi password..."
                  required
                  disabled={isCreating}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end border-t border-[var(--card-border)]/50 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary text-xs"
                disabled={isCreating}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="btn btn-primary text-xs flex items-center gap-1.5"
              >
                {isCreating ? "Menyimpan..." : "Tambah User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
                <h3 className="text-base font-bold uppercase tracking-wider font-serif-aww text-[var(--foreground)]">
                  Hapus Pengguna
                </h3>
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide">
                  Tindakan ini bersifat permanen
                </p>
              </div>
            </div>

            <p className="text-sm text-[var(--muted-foreground)] mb-8">
              Apakah Anda yakin ingin menghapus pengguna ini? Pengguna terpilih tidak akan dapat lagi masuk ke dashboard Kopi Bima.
            </p>

            <div className="flex gap-3 justify-end pt-4 border-t border-[var(--card-border)]/50">
              <button
                onClick={() => setDeleteId(null)}
                className="btn btn-secondary text-xs"
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn btn-danger text-xs flex items-center gap-1.5"
              >
                {isDeleting ? "Menghapus..." : "Hapus Pengguna"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
