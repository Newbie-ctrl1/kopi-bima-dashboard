"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { logoutAction } from "@/app/actions";
import LogoBima from "@/components/LogoBima";
import { useAuth } from "@/components/AuthProvider";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const isAdmin = auth?.role === "ADMIN";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar / logout?")) {
      startTransition(async () => {
        await logoutAction();
        router.push("/login");
        router.refresh();
      });
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        id="sidebar-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 p-2.5 bg-[#080808] border border-[var(--card-border)] md:hidden transition-colors hover:border-[var(--accent)]"
        aria-label="Toggle sidebar"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {mobileOpen ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        {/* Brand */}
        <div className="px-6 py-8 border-b border-[var(--card-border)]">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 border border-[var(--accent)] flex items-center justify-center relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(201,154,107,0.3)] transition-all duration-500 bg-black/40 p-1">
              <LogoBima className="w-7 h-7 text-[var(--accent)] group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight font-serif-aww group-hover:text-[var(--accent)] transition-colors duration-500">
                Kopi Bima
              </h1>
              <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-[0.25em]">
                System Admin
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2.5">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-3 border transition-all duration-300 ${
              isActive("/")
                ? "border-[var(--accent)] text-[var(--accent)] bg-gradient-to-r from-[rgba(201,154,107,0.03)] to-transparent"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--card-border)]"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5V19A9 3 0 0 0 21 19V5" />
              <path d="M3 12A9 3 0 0 0 21 12" />
            </svg>
            <span className="text-xs uppercase tracking-wider font-semibold">Daftar Database</span>
          </Link>

          <Link
            href="/analisa-global"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-3 border transition-all duration-300 ${
              isActive("/analisa-global")
                ? "border-[var(--accent)] text-[var(--accent)] bg-gradient-to-r from-[rgba(201,154,107,0.03)] to-transparent"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--card-border)]"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span className="text-xs uppercase tracking-wider font-semibold">Analisa Global</span>
          </Link>

          <Link
            href="/stok"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-3 border transition-all duration-300 ${
              isActive("/stok")
                ? "border-[var(--accent)] text-[var(--accent)] bg-gradient-to-r from-[rgba(201,154,107,0.03)] to-transparent"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--card-border)]"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            </svg>
            <span className="text-xs uppercase tracking-wider font-semibold">Stok Kopi</span>
          </Link>

          {isAdmin && (
            <Link
              href="/kelola-user"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 border transition-all duration-300 ${
                isActive("/kelola-user")
                  ? "border-[var(--accent)] text-[var(--accent)] bg-gradient-to-r from-[rgba(201,154,107,0.03)] to-transparent"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--card-border)]"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span className="text-xs uppercase tracking-wider font-semibold">Kelola User</span>
            </Link>
          )}

          {/* Contextual Database Navigation */}
          {pathname.startsWith("/db/") && (
            <div className="pt-6 mt-6 border-t border-[var(--card-border)] space-y-2">
              <p className="px-3 text-[9px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] mb-3">
                Database Active
              </p>
              
              {(() => {
                const parts = pathname.split("/");
                const dbId = parts[2];
                const isAnalisaActive = pathname.includes("/analisa");
                const isProgresActive = pathname.includes("/progres-order");
                const isJalurActive = !isAnalisaActive && !isProgresActive;

                return (
                  <>
                    <Link
                      href={`/db/${dbId}`}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 border transition-all duration-300 ${
                        isJalurActive
                          ? "border-[var(--accent)] text-[var(--accent)] bg-gradient-to-r from-[rgba(201,154,107,0.03)] to-transparent"
                          : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--card-border)]"
                      }`}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="text-xs uppercase tracking-wider font-semibold">Jalur & Alamat</span>
                    </Link>

                    <Link
                      href={`/db/${dbId}/analisa`}
                      id="nav-analisa"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 border transition-all duration-300 ${
                        isAnalisaActive
                          ? "border-[var(--accent)] text-[var(--accent)] bg-gradient-to-r from-[rgba(201,154,107,0.03)] to-transparent"
                          : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--card-border)]"
                      }`}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                      </svg>
                      <span className="text-xs uppercase tracking-wider font-semibold">Analisa Data</span>
                    </Link>

                    <Link
                      href={`/db/${dbId}/progres-order`}
                      id="nav-progres-order"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 border transition-all duration-300 ${
                        isProgresActive
                          ? "border-[var(--accent)] text-[var(--accent)] bg-gradient-to-r from-[rgba(201,154,107,0.03)] to-transparent"
                          : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--card-border)]"
                      }`}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      <span className="text-xs uppercase tracking-wider font-semibold">Progres Order</span>
                    </Link>
                  </>
                );
              })()}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="px-6 py-6 border-t border-[var(--card-border)] bg-[#070707]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 border border-[var(--accent)] flex items-center justify-center text-xs font-semibold text-[var(--accent)]">
                {(auth?.username || "A").substring(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  {auth?.username || "Admin"}
                </p>
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide">{auth?.role || "USER"}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isPending}
              className="p-2 border border-transparent hover:border-rose-500/30 text-[var(--muted)] hover:text-rose-400 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
              title="Keluar / Logout"
            >
              {isPending ? (
                <span className="w-3.5 h-3.5 border-2 border-rose-400/20 border-t-rose-400 rounded-full animate-spin block" />
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
