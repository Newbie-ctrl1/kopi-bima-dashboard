"use client";

import { useState } from "react";

interface DataPoint {
  label: string;
  order: number;
  pendapatan: number;
  bayar: number;
  piutang: number;
  pemasukan: number;
}

interface PeriodSummary {
  harian: DataPoint[];
  bulanan: DataPoint[];
  tahunan: DataPoint[];
}

interface GlobalSummary {
  totalOutlet: number;
  totalOrder: number;
  totalPendapatan: number;
  totalBayar: number;
  totalPiutang: number;
  pemasukan: number;
  lunas: number;
  piutang: number;
}

interface GlobalAnalyticsTabProps {
  summary: GlobalSummary;
  periodSummary: PeriodSummary;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function GlobalAnalyticsTab({
  summary,
  periodSummary,
}: GlobalAnalyticsTabProps) {
  const [timeframe, setTimeframe] = useState<"harian" | "bulanan" | "tahunan">("bulanan");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = periodSummary[timeframe] || [];

  // Find max value for Y scaling
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.pendapatan, d.pemasukan, d.piutang)),
    100000 // avoid division by zero
  );

  // SVG dimensions
  const width = 800;
  const height = 300;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Generate coordinates
  const getCoordinates = (field: "pendapatan" | "pemasukan" | "piutang") => {
    if (data.length === 0) return [];
    return data.map((d, i) => {
      const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * chartWidth;
      const y = height - paddingBottom - (d[field] / maxVal) * chartHeight;
      return { x, y };
    });
  };

  const pPendapatan = getCoordinates("pendapatan");
  const pPemasukan = getCoordinates("pemasukan");
  const pPiutang = getCoordinates("piutang");

  const buildPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");
  };

  const buildAreaPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    const linePath = buildPath(points);
    const bottomY = height - paddingBottom;
    return `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
  };

  // Aggregated stats for the global view
  const statsCards = [
    {
      label: "Total Outlet",
      value: summary.totalOutlet,
      desc: "di semua database",
      gradient: "gradient-amber",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
          <path d="M2 7h20" />
        </svg>
      ),
    },
    {
      label: "Total Order",
      value: `${summary.totalOrder.toFixed(1)} Krd`,
      desc: "Volume distribusi",
      gradient: "gradient-blue",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      label: "Total Pendapatan",
      value: formatCurrency(summary.totalPendapatan),
      desc: "Omzet Kotor",
      gradient: "gradient-purple",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: "Pemasukan Bersih",
      value: formatCurrency(summary.pemasukan),
      desc: "Pendapatan - Piutang",
      gradient: "gradient-emerald",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: "Total Piutang",
      value: formatCurrency(summary.totalPiutang),
      desc: "Menunggu pembayaran",
      gradient: "gradient-rose",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statsCards.map((card, i) => (
          <div
            key={card.label}
            className="stat-card p-4 flex flex-col justify-between h-[105px] animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex justify-between items-start gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">
                {card.label}
              </span>
              <div className={`w-7 h-7 rounded-lg ${card.gradient} flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif-aww text-[var(--foreground)] truncate">
                {card.value}
              </h3>
              <p className="text-[9px] text-[var(--muted)] truncate uppercase font-semibold">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="stat-card p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider font-serif-aww text-[var(--foreground)]">
              Grafik Analisa Finansial Global
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Akumulasi performa transaksi dari seluruh database aktif
            </p>
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] self-end sm:self-auto">
            {(["harian", "bulanan", "tahunan"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTimeframe(t);
                  setHoveredIndex(null);
                }}
                className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all duration-200 ${
                  timeframe === t
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {data.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center border border-dashed border-[var(--card-border)] rounded-xl">
            <svg
              className="text-[var(--muted)] mb-2"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18M9 21V9M14 9v12" />
            </svg>
            <p className="text-xs text-[var(--muted-foreground)] font-medium">
              Belum ada data transaksi untuk visualisasi grafik
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Legend */}
            <div className="flex gap-4 justify-start mb-4 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                Pendapatan
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Pemasukan Bersih
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                Piutang
              </div>
            </div>

            {/* SVG Chart */}
            <div className="overflow-x-auto">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto min-w-[640px]"
              >
                <defs>
                  {/* Gradients */}
                  <linearGradient id="grad-pendapatan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="grad-pemasukan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="grad-piutang" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = paddingTop + ratio * chartHeight;
                  return (
                    <line
                      key={ratio}
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="var(--card-border)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Y Axis Labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const val = maxVal * (1 - ratio);
                  const y = paddingTop + ratio * chartHeight + 4;
                  return (
                    <text
                      key={ratio}
                      x={paddingLeft - 10}
                      y={y}
                      textAnchor="end"
                      fill="var(--muted-foreground)"
                      fontSize="9"
                      fontWeight="bold"
                      className="font-mono"
                    >
                      {val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${(val / 1000).toFixed(0)}K`}
                    </text>
                  );
                })}

                {/* Area Fills */}
                <path d={buildAreaPath(pPendapatan)} fill="url(#grad-pendapatan)" />
                <path d={buildAreaPath(pPemasukan)} fill="url(#grad-pemasukan)" />
                <path d={buildAreaPath(pPiutang)} fill="url(#grad-piutang)" />

                {/* Line Strokes */}
                <path d={buildPath(pPendapatan)} fill="none" stroke="#a855f7" strokeWidth="2" />
                <path d={buildPath(pPemasukan)} fill="none" stroke="#10b981" strokeWidth="2" />
                <path d={buildPath(pPiutang)} fill="none" stroke="#f43f5e" strokeWidth="2" />

                {/* Interactive X Points Grid & Hover Bars */}
                {data.map((d, i) => {
                  const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * chartWidth;
                  return (
                    <g key={i}>
                      {/* Vertical line helper on hover */}
                      {hoveredIndex === i && (
                        <line
                          x1={x}
                          y1={paddingTop}
                          x2={x}
                          y2={height - paddingBottom}
                          stroke="var(--accent)"
                          strokeWidth="1"
                        />
                      )}

                      {/* X label */}
                      <text
                        x={x}
                        y={height - paddingBottom + 18}
                        textAnchor="middle"
                        fill={hoveredIndex === i ? "var(--accent)" : "var(--muted-foreground)"}
                        fontSize="8"
                        fontWeight="bold"
                        className="font-mono uppercase"
                      >
                        {timeframe === "harian" ? d.label.slice(8) : timeframe === "bulanan" ? d.label.slice(5) : d.label}
                      </text>

                      {/* Invisible hover area box */}
                      <rect
                        x={x - chartWidth / Math.max(data.length, 1) / 2}
                        y={paddingTop}
                        width={chartWidth / Math.max(data.length, 1)}
                        height={chartHeight}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Hover Tooltip Overlay */}
            {hoveredIndex !== null && data[hoveredIndex] && (
              <div className="absolute top-10 left-16 p-3 rounded-lg bg-[var(--card)] border border-[var(--card-border)] shadow-xl text-xs space-y-1.5 animate-fade-in z-10 min-w-44">
                <p className="font-bold text-[var(--accent)] border-b border-[var(--card-border)] pb-1 mb-1 font-mono">
                  {data[hoveredIndex].label}
                </p>
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--muted-foreground)]">Pendapatan:</span>
                  <span className="font-bold text-purple-400 font-mono">
                    {formatCurrency(data[hoveredIndex].pendapatan)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--muted-foreground)]">Pemasukan:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatCurrency(data[hoveredIndex].pemasukan)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--muted-foreground)]">Piutang:</span>
                  <span className="font-bold text-rose-400 font-mono">
                    {formatCurrency(data[hoveredIndex].piutang)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--muted-foreground)]">Order:</span>
                  <span className="font-bold text-blue-400 font-mono">
                    {data[hoveredIndex].order.toFixed(1)} Krd
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
