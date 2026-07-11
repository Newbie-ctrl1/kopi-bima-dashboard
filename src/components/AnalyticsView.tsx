"use client";

import { useState } from "react";

import type { AnalyticsPeriod } from "@/lib/store";

interface AnalyticsViewProps {
  harianData: AnalyticsPeriod[];
  bulananData: AnalyticsPeriod[];
  tahunanData: AnalyticsPeriod[];
  summary: {
    totalOutlet: number;
    totalOrder: number;
    totalPendapatan: number;
    totalBayar: number;
    totalPiutang: number;
    lunas: number;
    piutang: number;
  };
}

type TabMode = "harian" | "bulanan" | "tahunan";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AnalyticsView({
  harianData,
  bulananData,
  tahunanData,
  summary,
}: AnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState<TabMode>("harian");
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);

  const dataMap: Record<TabMode, AnalyticsPeriod[]> = {
    harian: harianData,
    bulanan: bulananData,
    tahunan: tahunanData,
  };

  const currentData = dataMap[activeTab];

  const tabs: { key: TabMode; label: string; icon: React.ReactNode }[] = [
    {
      key: "harian",
      label: "Harian",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      key: "bulanan",
      label: "Bulanan",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="M8 14h.01" />
          <path d="M12 14h.01" />
          <path d="M16 14h.01" />
          <path d="M8 18h.01" />
          <path d="M12 18h.01" />
          <path d="M16 18h.01" />
        </svg>
      ),
    },
    {
      key: "tahunan",
      label: "Tahunan",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  // Calculate percentage for progress bars
  const getPercentage = (value: number, total: number) =>
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {[
          {
            label: "Total Outlet",
            value: summary.totalOutlet,
            gradient: "gradient-amber",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                <path d="M2 7h20" />
              </svg>
            ),
          },
          {
            label: "Total Pendapatan",
            value: formatCurrency(summary.totalPendapatan),
            gradient: "gradient-emerald",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            ),
          },
          {
            label: "Pemasukan",
            value: formatCurrency(summary.totalPendapatan - summary.totalPiutang),
            gradient: "gradient-teal",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="12" y1="4" x2="12" y2="20" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            ),
          },
          {
            label: "Total Piutang",
            value: formatCurrency(summary.totalPiutang),
            gradient: "gradient-rose",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            ),
          },
          {
            label: "Total Order",
            value: `${summary.totalOrder} Kardus`,
            gradient: "gradient-purple",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m7.5 4.27 9 5.15" />
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            ),
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="card-static p-6 animate-slide-up bg-[#0d0d0c] border border-[var(--card-border)] relative overflow-hidden"
            style={{ animationDelay: `${index * 0.08}s`, animationFillMode: "backwards" }}
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-20" />
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">{stat.label}</p>
              <div className="w-8 h-8 border border-[var(--card-border)] flex items-center justify-center text-[var(--accent)] bg-black/40">
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold font-sans text-[var(--foreground)] tracking-tight font-mono">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Lunas vs Piutang Bar */}
      <div className="card-static p-6 mb-8 animate-slide-up bg-[#0d0d0c] border border-[var(--card-border)] relative overflow-hidden" style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}>
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-20" />
        <h3 className="text-xs uppercase font-bold text-[var(--muted-foreground)] tracking-widest mb-5">Rasio Kepatuhan Pembayaran (Lunas vs Piutang)</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="h-2 bg-[#050505] border border-[var(--card-border)] overflow-hidden flex">
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${getPercentage(summary.lunas, summary.totalOutlet)}%`,
                  background: "linear-gradient(90deg, #10b981, #059669)",
                }}
              />
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${getPercentage(summary.piutang, summary.totalOutlet)}%`,
                  background: "linear-gradient(90deg, #f43f5e, #e11d48)",
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--success)]" />
            <span className="text-xs text-[var(--muted-foreground)]">
              Lunas: <strong className="text-[var(--success)] font-mono">{summary.lunas}</strong> ({getPercentage(summary.lunas, summary.totalOutlet)}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--danger)]" />
            <span className="text-xs text-[var(--muted-foreground)]">
              Piutang: <strong className="text-[var(--danger)] font-mono">{summary.piutang}</strong> ({getPercentage(summary.piutang, summary.totalOutlet)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex items-center gap-3 mb-6 animate-slide-up" style={{ animationDelay: "0.35s", animationFillMode: "backwards" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            onClick={() => {
              setActiveTab(tab.key);
              setExpandedPeriod(null);
            }}
            className={`flex items-center gap-2.5 px-5 py-3 border text-xs uppercase tracking-wider font-bold transition-all duration-300 ${
              activeTab === tab.key
                ? "border-[var(--accent)] text-[var(--accent)] bg-gradient-to-r from-[rgba(201,154,107,0.03)] to-transparent"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--card-border)]"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Period List */}
      <div className="space-y-4 animate-slide-up" style={{ animationDelay: "0.4s", animationFillMode: "backwards" }}>
        {currentData.length === 0 ? (
          <div className="empty-state py-16">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Belum ada data untuk periode ini</p>
          </div>
        ) : (
          currentData.map((period) => (
            <div key={period.key} className="card-static overflow-hidden border border-[var(--card-border)] bg-[#0d0d0c]">
              {/* Period header */}
              <button
                onClick={() =>
                  setExpandedPeriod(
                    expandedPeriod === period.key ? null : period.key
                  )
                }
                className="w-full p-5 flex items-center justify-between hover:bg-[var(--card-hover)] transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-[var(--card-border)] flex items-center justify-center shrink-0 text-[var(--accent)] bg-black/40">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight font-serif-aww text-[var(--foreground)]">
                      {period.label}
                    </h3>
                    <p className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider mt-0.5">
                      {period.totalOutlet} outlet • {period.totalOrder} kardus
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[9px] uppercase font-bold text-[var(--muted)] tracking-wider">Pendapatan</p>
                      <p className="text-sm font-bold font-mono text-[var(--success)]">
                        {formatCurrency(period.totalBayar)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase font-bold text-[var(--muted)] tracking-wider">Piutang</p>
                      <p className="text-sm font-bold font-mono text-[var(--danger)]">
                        {formatCurrency(period.totalPiutang)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="badge badge-lunas">{period.lunas}</span>
                      <span className="badge badge-piutang">{period.piutang}</span>
                    </div>
                  </div>

                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--muted)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-300 ${
                      expandedPeriod === period.key ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              {/* Mobile stats (visible on small screens) */}
              <div className="sm:hidden px-5 pb-4 flex items-center gap-3 border-t border-[var(--card-border)]/30 pt-3">
                <span className="text-xs font-bold font-mono text-[var(--success)]">{formatCurrency(period.totalBayar)}</span>
                <span className="text-xs text-[var(--muted)]">/</span>
                <span className="text-xs font-bold font-mono text-[var(--danger)]">{formatCurrency(period.totalPiutang)}</span>
                <span className="badge badge-lunas text-[9px]">{period.lunas}</span>
                <span className="badge badge-piutang text-[9px]">{period.piutang}</span>
              </div>

              {/* Expanded detail summary & orders list */}
              {expandedPeriod === period.key && (
                <div className="border-t border-[var(--card-border)] bg-[#090909]">
                  {/* Period Stats Summary Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 border-b border-[var(--card-border)] bg-black/20">
                    <div>
                      <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider mb-1">Total Order</p>
                      <p className="text-xs font-bold font-mono text-[var(--foreground)]">{period.totalOrder.toFixed(1)} Krd</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider mb-1">Pendapatan</p>
                      <p className="text-xs font-bold font-mono text-purple-400">{formatCurrency(period.totalPendapatan)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider mb-1">Terbayar</p>
                      <p className="text-xs font-bold font-mono text-[var(--success)]">{formatCurrency(period.totalBayar)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider mb-1">Piutang</p>
                      <p className="text-xs font-bold font-mono text-[var(--danger)]">{formatCurrency(period.totalPiutang)}</p>
                    </div>
                  </div>

                  {/* Table Headers */}
                  <div className="px-5 py-3 border-b border-[var(--card-border)] bg-black/10">
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                      <span>📦</span> Daftar Transaksi Order
                    </h4>
                  </div>

                  {/* Orders Detail Table */}
                  <div className="overflow-x-auto">
                    <table className="data-table border-x-0 border-t-0">
                      <thead>
                        <tr>
                          <th className="font-sans text-[10px] tracking-widest font-bold">Jalur / Alamat</th>
                          <th className="font-sans text-[10px] tracking-widest font-bold">No Induk</th>
                          <th className="font-sans text-[10px] tracking-widest font-bold">Outlet</th>
                          <th className="text-right font-sans text-[10px] tracking-widest font-bold">Order (Krd)</th>
                          <th className="text-right font-sans text-[10px] tracking-widest font-bold">Harga</th>
                          <th className="text-right font-sans text-[10px] tracking-widest font-bold">Total</th>
                          <th className="text-right font-sans text-[10px] tracking-widest font-bold">Bayar</th>
                          <th className="text-center font-sans text-[10px] tracking-widest font-bold">Metode</th>
                          <th className="text-center font-sans text-[10px] tracking-widest font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {period.orders.map((o) => (
                          <tr key={o.id}>
                            <td className="text-[var(--foreground)] font-semibold text-xs">
                              <div className="flex flex-col">
                                <span className="font-serif-aww text-[var(--accent)] text-xs">{o.jalurName}</span>
                                <span className="text-[9px] text-[var(--muted)] uppercase font-semibold">{o.alamatName}</span>
                              </div>
                            </td>
                            <td className="font-mono text-xs text-[var(--foreground)] font-semibold">{o.outletNoInduk}</td>
                            <td className="text-[var(--foreground)] font-semibold">{o.outletName}</td>
                            <td className="text-right font-mono text-xs font-semibold text-[var(--foreground)]">{o.order} Krd</td>
                            <td className="text-right font-mono text-xs">{formatCurrency(o.harga)}</td>
                            <td className="text-right font-mono text-xs font-semibold text-purple-400">{formatCurrency(o.order * o.harga)}</td>
                            <td className="text-right font-mono text-xs font-semibold text-[var(--success)]">{formatCurrency(o.totalBayar)}</td>
                            <td className="text-center">
                              <span className={`badge ${o.paymentMethod === "Cash" ? "text-amber-500 bg-amber-500/5 border-amber-500/15" : "text-blue-500 bg-blue-500/5 border-blue-500/15"}`}>
                                {o.paymentMethod === "Cash" ? "💵 Cash" : "🏦 Transfer"}
                              </span>
                            </td>
                            <td className="text-center">
                              <span
                                className={`badge ${
                                  o.status === "Lunas"
                                    ? "badge-lunas"
                                    : "badge-piutang"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    o.status === "Lunas"
                                      ? "bg-[var(--success)]"
                                      : "bg-[var(--danger)]"
                                  }`}
                                />
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Payments Header */}
                  <div className="px-5 py-3 border-t border-b border-[var(--card-border)] bg-black/10">
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                      <span>💸</span> Daftar Transaksi Pembayaran
                    </h4>
                  </div>

                  {/* Payments Detail Table */}
                  <div className="overflow-x-auto">
                    <table className="data-table border-x-0 border-t-0 border-b-0">
                      <thead>
                        <tr>
                          <th className="font-sans text-[10px] tracking-widest font-bold">Jalur / Alamat</th>
                          <th className="font-sans text-[10px] tracking-widest font-bold">No Induk</th>
                          <th className="font-sans text-[10px] tracking-widest font-bold">Outlet</th>
                          <th className="text-right font-sans text-[10px] tracking-widest font-bold">Jumlah Bayar</th>
                          <th className="text-center font-sans text-[10px] tracking-widest font-bold">Metode</th>
                        </tr>
                      </thead>
                      <tbody>
                        {period.payments.length === 0 ? (
                          <tr>
                            <td colSpan={5}>
                              <div className="empty-state py-8 text-center text-xs text-[var(--muted-foreground)]">
                                Tidak ada transaksi pembayaran pada periode ini
                              </div>
                            </td>
                          </tr>
                        ) : (
                          period.payments.map((p) => (
                            <tr key={p.id}>
                              <td className="text-[var(--foreground)] font-semibold text-xs">
                                <div className="flex flex-col">
                                  <span className="font-serif-aww text-[var(--accent)] text-xs">{p.jalurName}</span>
                                  <span className="text-[9px] text-[var(--muted)] uppercase font-semibold">{p.alamatName}</span>
                                </div>
                              </td>
                              <td className="font-mono text-xs text-[var(--foreground)] font-semibold">{p.outletNoInduk}</td>
                              <td className="text-[var(--foreground)] font-semibold">{p.outletName}</td>
                              <td className="text-right font-mono text-xs font-semibold text-[var(--success)]">{formatCurrency(p.amount)}</td>
                              <td className="text-center">
                                <span className={`badge ${p.paymentMethod === "Cash" ? "text-amber-500 bg-amber-500/5 border-amber-500/15" : "text-blue-500 bg-blue-500/5 border-blue-500/15"}`}>
                                  {p.paymentMethod === "Cash" ? "💵 Cash" : "🏦 Transfer"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
