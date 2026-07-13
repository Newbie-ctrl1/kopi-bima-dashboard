"use client";

import { useState } from "react";

import type { AnalyticsPeriod } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

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

export default function AnalyticsView({
  harianData,
  bulananData,
  tahunanData,
  summary,
}: AnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState<TabMode>("harian");
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const ITEMS_PER_PAGE: Record<TabMode, number> = {
    harian: 5,
    bulanan: 5,
    tahunan: 5,
  };

  const dataMap: Record<TabMode, AnalyticsPeriod[]> = {
    harian: harianData,
    bulanan: bulananData,
    tahunan: tahunanData,
  };

  const currentData = dataMap[activeTab];
  const itemsPerPage = ITEMS_PER_PAGE[activeTab];
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const startIndex = (validPage - 1) * itemsPerPage;
  const paginatedData = currentData.slice(startIndex, startIndex + itemsPerPage);

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

  const downloadSummaryCSV = () => {
    const headers = [
      activeTab === "harian" ? "Tanggal" : activeTab === "bulanan" ? "Bulan" : "Tahun",
      "Total Outlet",
      "Volume Order (Krd)",
      "Total Pendapatan (Rp)",
      "Total Terbayar (Rp)",
      "Sisa Piutang (Rp)",
      "Jumlah Lunas",
      "Jumlah Piutang"
    ];

    const rows = currentData.map(p => [
      p.label,
      p.totalOutlet,
      p.totalOrder,
      p.totalPendapatan,
      p.totalBayar,
      p.totalPiutang,
      p.lunas,
      p.piutang
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_${activeTab}_kopi_bima_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPeriodDetailsCSV = (periodData: AnalyticsPeriod) => {
    // Generate CSV for orders
    const orderLines = [
      "--- DAFTAR TRANSAKSI ORDER ---",
      ["Jalur/Alamat", "No Induk", "Nama Outlet", "Volume Order (Krd)", "Harga (Rp)", "Total Harga (Rp)", "Jumlah Bayar (Rp)", "Status", "Keterangan"].join(",")
    ];
    
    periodData.orders.forEach(o => {
      orderLines.push([
        `"${o.jalurName} - ${o.alamatName}"`,
        `"${o.outletNoInduk}"`,
        `"${o.outletName}"`,
        o.order,
        o.harga,
        o.order * o.harga,
        o.totalBayar,
        o.status,
        `"${o.keterangan ?? ""}"`
      ].join(","));
    });

    // Generate CSV for payments
    const paymentLines = [
      "",
      "--- DAFTAR TRANSAKSI PEMBAYARAN ---",
      ["Jalur/Alamat", "No Induk", "Nama Outlet", "Jumlah Bayar (Rp)", "Metode Pembayaran", "Keterangan"].join(",")
    ];

    periodData.payments.forEach(p => {
      paymentLines.push([
        `"${p.jalurName} - ${p.alamatName}"`,
        `"${p.outletNoInduk}"`,
        `"${p.outletName}"`,
        p.amount,
        p.paymentMethod,
        `"${p.keterangan ?? ""}"`
      ].join(","));
    });

    const csvContent = [...orderLines, ...paymentLines].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Detail_${activeTab}_${periodData.label}_kopi_bima.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-xs uppercase font-bold text-[var(--muted-foreground)] tracking-widest">
              Rasio Kepatuhan Pembayaran
            </h3>
            <p className="text-[9px] text-[var(--muted)] uppercase font-semibold mt-1">
              Persentase Kepatuhan Pelunasan Outlet
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-semibold text-[var(--success)] uppercase tracking-wider">
            Kepatuhan: {getPercentage(summary.lunas, summary.totalOutlet)}%
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="h-6 bg-[#070707] border border-[var(--card-border)] rounded-full overflow-hidden flex p-0.5">
              {summary.lunas > 0 && (
                <div
                  className="h-full rounded-full transition-all duration-700 flex items-center justify-center text-[10px] font-bold text-white font-mono shadow-inner"
                  style={{
                    width: `${getPercentage(summary.lunas, summary.totalOutlet)}%`,
                    background: "linear-gradient(90deg, #10b981, #059669)",
                  }}
                >
                  {getPercentage(summary.lunas, summary.totalOutlet) >= 12 && (
                    <span>Lunas ({getPercentage(summary.lunas, summary.totalOutlet)}%)</span>
                  )}
                </div>
              )}
              {summary.piutang > 0 && (
                <div
                  className="h-full rounded-full transition-all duration-700 flex items-center justify-center text-[10px] font-bold text-white font-mono shadow-inner -ml-1.5"
                  style={{
                    width: `${getPercentage(summary.piutang, summary.totalOutlet)}%`,
                    background: "linear-gradient(90deg, #f43f5e, #e11d48)",
                  }}
                >
                  {getPercentage(summary.piutang, summary.totalOutlet) >= 12 && (
                    <span>Piutang ({getPercentage(summary.piutang, summary.totalOutlet)}%)</span>
                  )}
                </div>
              )}
              {summary.totalOutlet === 0 && (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--muted-foreground)] font-semibold">
                  Belum ada outlet terdaftar
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)] shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span className="text-xs text-[var(--muted-foreground)]">
                  Lunas / Aman: <strong className="text-[var(--success)] font-mono font-bold">{summary.lunas}</strong> dari {summary.totalOutlet} Outlet
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--danger)] shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                <span className="text-xs text-[var(--muted-foreground)]">
                  Memiliki Piutang: <strong className="text-[var(--danger)] font-mono font-bold">{summary.piutang}</strong> dari {summary.totalOutlet} Outlet
                </span>
              </div>
            </div>
            
            <div className="text-[10px] text-[var(--muted)] font-mono font-semibold uppercase">
              Total: {summary.totalOutlet} Outlet
            </div>
          </div>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 animate-slide-up" style={{ animationDelay: "0.35s", animationFillMode: "backwards" }}>
        <div className="flex items-center gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
                setExpandedPeriod(null);
              }}
              className={`flex items-center gap-2.5 px-5 py-3 border text-xs uppercase tracking-wider font-bold transition-all duration-300 ${
                activeTab === tab.key
                  ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/15"
                  : "bg-[#0d0d0c] border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--muted)]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {currentData.length > 0 && (
          <button
            onClick={downloadSummaryCSV}
            className="btn btn-secondary text-xs flex items-center gap-2 py-3 px-4 border border-[var(--card-border)] bg-[#0d0d0c] hover:bg-[#121211] text-[var(--foreground)] font-bold uppercase tracking-wider"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Unduh Rekap {activeTab === "harian" ? "Harian" : activeTab === "bulanan" ? "Bulanan" : "Tahunan"} (.csv)
          </button>
        )}
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
          paginatedData.map((period) => (
            <div key={period.key} className="card-static overflow-hidden border border-[var(--card-border)] bg-[#0d0d0c]">
              {/* Period header — div to avoid nested <button> */}
              <div
                role="button"
                tabIndex={0}
                onClick={() =>
                  setExpandedPeriod(
                    expandedPeriod === period.key ? null : period.key
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpandedPeriod(
                      expandedPeriod === period.key ? null : period.key
                    );
                  }
                }}
                className="w-full p-5 flex items-center justify-between hover:bg-[var(--card-hover)] transition-colors text-left cursor-pointer select-none"
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

                  {/* Instantly Download CSV */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadPeriodDetailsCSV(period);
                    }}
                    className="p-1.5 rounded-lg border border-[var(--card-border)] bg-black/40 text-[var(--muted-foreground)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all flex items-center justify-center shrink-0"
                    title={`Unduh Rincian CSV (${period.label})`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>

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
              </div>

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
                <ExpandedPeriodDetails
                  period={period}
                  onDownloadCSV={downloadPeriodDetailsCSV}
                />
              )}
            </div>
          ))
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--card-border)]/60">
            <p className="text-xs text-[var(--muted-foreground)]">
              Menampilkan <strong className="text-[var(--foreground)] font-mono">{startIndex + 1}</strong>–
              <strong className="text-[var(--foreground)] font-mono">
                {Math.min(startIndex + itemsPerPage, currentData.length)}
              </strong> dari{" "}
              <strong className="text-[var(--foreground)] font-mono">{currentData.length}</strong> {activeTab === "harian" ? "hari" : activeTab === "bulanan" ? "bulan" : "tahun"}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentPage((prev) => Math.max(1, prev - 1));
                  setExpandedPeriod(null);
                }}
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
                    onClick={() => {
                      setCurrentPage(page);
                      setExpandedPeriod(null);
                    }}
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
                onClick={() => {
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                  setExpandedPeriod(null);
                }}
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
      </div>
    </div>
  );
}

function ExpandedPeriodDetails({
  period,
  onDownloadCSV,
}: {
  period: AnalyticsPeriod;
  onDownloadCSV: (period: AnalyticsPeriod) => void;
}) {
  const [orderPage, setOrderPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const LIMIT = 5;

  const orderTotalPages = Math.ceil(period.orders.length / LIMIT);
  const validOrderPage = Math.max(1, Math.min(orderPage, orderTotalPages || 1));
  const orderStartIndex = (validOrderPage - 1) * LIMIT;
  const paginatedOrders = period.orders.slice(orderStartIndex, orderStartIndex + LIMIT);

  const paymentTotalPages = Math.ceil(period.payments.length / LIMIT);
  const validPaymentPage = Math.max(1, Math.min(paymentPage, paymentTotalPages || 1));
  const paymentStartIndex = (validPaymentPage - 1) * LIMIT;
  const paginatedPayments = period.payments.slice(paymentStartIndex, paymentStartIndex + LIMIT);

  return (
    <div className="border-t border-[var(--card-border)] bg-[#090909]">
      {/* Period Stats Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-[var(--card-border)] bg-black/20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
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

        <button
          onClick={() => onDownloadCSV(period)}
          className="btn btn-secondary text-[10px] flex items-center gap-1.5 py-2 px-3 border border-[var(--card-border)] bg-[#0d0d0c] hover:bg-[#121211] text-[var(--foreground)] font-bold uppercase tracking-wider h-fit self-end sm:self-center"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Unduh CSV Rincian
        </button>
      </div>

      {/* Table Headers */}
      <div className="px-5 py-3 border-b border-[var(--card-border)] bg-black/10 flex items-center justify-between">
        <h4 className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
          <span>📦</span> Daftar Transaksi Order ({period.orders.length})
        </h4>
        {orderTotalPages > 1 && (
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[var(--muted-foreground)] font-mono">
              Hal {validOrderPage}/{orderTotalPages}
            </span>
            <button
              onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
              disabled={validOrderPage === 1}
              className="px-2 py-0.5 border border-[var(--card-border)] bg-black/40 text-[var(--foreground)] hover:border-[var(--accent)] disabled:opacity-30 disabled:hover:border-[var(--card-border)] rounded text-[9px]"
            >
              ‹ Prev
            </button>
            <button
              onClick={() => setOrderPage((p) => Math.min(orderTotalPages, p + 1))}
              disabled={validOrderPage === orderTotalPages}
              className="px-2 py-0.5 border border-[var(--card-border)] bg-black/40 text-[var(--foreground)] hover:border-[var(--accent)] disabled:opacity-30 disabled:hover:border-[var(--card-border)] rounded text-[9px]"
            >
              Next ›
            </button>
          </div>
        )}
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
              <th className="font-sans text-[10px] tracking-widest font-bold">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((o) => (
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
                <td className="text-xs text-[var(--muted-foreground)] max-w-[140px]">
                  {o.keterangan ? (
                    <span className="block truncate" title={o.keterangan}>{o.keterangan}</span>
                  ) : (
                    <span className="text-[var(--muted)] italic">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payments Header */}
      <div className="px-5 py-3 border-t border-b border-[var(--card-border)] bg-black/10 flex items-center justify-between">
        <h4 className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
          <span>💸</span> Daftar Transaksi Pembayaran ({period.payments.length})
        </h4>
        {paymentTotalPages > 1 && (
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[var(--muted-foreground)] font-mono">
              Hal {validPaymentPage}/{paymentTotalPages}
            </span>
            <button
              onClick={() => setPaymentPage((p) => Math.max(1, p - 1))}
              disabled={validPaymentPage === 1}
              className="px-2 py-0.5 border border-[var(--card-border)] bg-black/40 text-[var(--foreground)] hover:border-[var(--accent)] disabled:opacity-30 disabled:hover:border-[var(--card-border)] rounded text-[9px]"
            >
              ‹ Prev
            </button>
            <button
              onClick={() => setPaymentPage((p) => Math.min(paymentTotalPages, p + 1))}
              disabled={validPaymentPage === paymentTotalPages}
              className="px-2 py-0.5 border border-[var(--card-border)] bg-black/40 text-[var(--foreground)] hover:border-[var(--accent)] disabled:opacity-30 disabled:hover:border-[var(--card-border)] rounded text-[9px]"
            >
              Next ›
            </button>
          </div>
        )}
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
              <th className="font-sans text-[10px] tracking-widest font-bold">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPayments.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state py-8 text-center text-xs text-[var(--muted-foreground)]">
                    Tidak ada transaksi pembayaran pada periode ini
                  </div>
                </td>
              </tr>
            ) : (
              paginatedPayments.map((p) => (
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
                  <td className="text-xs text-[var(--muted-foreground)] max-w-[140px]">
                    {p.keterangan ? (
                      <span className="block truncate" title={p.keterangan}>{p.keterangan}</span>
                    ) : (
                      <span className="text-[var(--muted)] italic">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
