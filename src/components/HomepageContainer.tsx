"use client";

import { useState } from "react";
import DatabaseList from "@/app/DatabaseList";
import GlobalAnalyticsTab from "./GlobalAnalyticsTab";
import CoffeeStockTab from "./CoffeeStockTab";
import CreateModal from "@/components/CreateModal";
import { createDatabaseAction } from "@/app/actions";

import type { Database } from "@/lib/types";

interface CoffeeStock {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  price: number;
}

interface HomepageContainerProps {
  databases: (Database & { jalurCount: number })[];
  globalSummary: any;
  globalPeriodSummary: any;
  stocks: CoffeeStock[];
  onCreateStock: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  onUpdateStock: (id: string, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  onDeleteStock: (id: string) => Promise<{ error?: string; success?: boolean }>;
}

export default function HomepageContainer({
  databases,
  globalSummary,
  globalPeriodSummary,
  stocks,
  onCreateStock,
  onUpdateStock,
  onDeleteStock,
}: HomepageContainerProps) {
  const [activeTab, setActiveTab] = useState<"analisa" | "databases" | "stok">("analisa");
  const [showCreateDbModal, setShowCreateDbModal] = useState(false);

  return (
    <>
      {/* Global Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
            Dashboard Utama
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Analisa finansial global, manajemen database, dan kendali persediaan stok kopi
          </p>
        </div>

        {/* Global tab options */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--card)] border border-[var(--card-border)] w-fit self-start md:self-auto">
          <button
            onClick={() => setActiveTab("analisa")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
              activeTab === "analisa"
                ? "bg-[var(--accent)] text-white shadow-lg"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
            }`}
          >
            Analisa Global
          </button>
          <button
            onClick={() => setActiveTab("databases")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
              activeTab === "databases"
                ? "bg-[var(--accent)] text-white shadow-lg"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
            }`}
          >
            Daftar Database
          </button>
          <button
            onClick={() => setActiveTab("stok")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
              activeTab === "stok"
                ? "bg-[var(--accent)] text-white shadow-lg"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
            }`}
          >
            Stok Kopi
          </button>
        </div>
      </div>

      {/* Conditionally Render Content */}
      <div className="animate-slide-up" style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}>
        {activeTab === "analisa" && (
          <GlobalAnalyticsTab
            summary={globalSummary}
            periodSummary={globalPeriodSummary}
          />
        )}

        {activeTab === "databases" && (
          <div className="space-y-6">
            {/* Database header actions inside the tab to keep layout clean */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider font-serif-aww text-[var(--foreground)]">
                  Semua Database Aktif
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Kelola struktur relasi data jalur, alamat, dan outlet
                </p>
              </div>
              <button
                onClick={() => setShowCreateDbModal(true)}
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
                Buat Database
              </button>
            </div>

            <DatabaseList databases={databases} hideHeader={true} />
          </div>
        )}

        {activeTab === "stok" && (
          <CoffeeStockTab
            stocks={stocks}
            onCreateStock={onCreateStock}
            onUpdateStock={onUpdateStock}
            onDeleteStock={onDeleteStock}
          />
        )}
      </div>

      {/* Create Database Modal inside parent */}
      <CreateModal
        isOpen={showCreateDbModal}
        onClose={() => setShowCreateDbModal(false)}
        title="Buat Database Baru"
        placeholder="Contoh: Database Rendi"
        onSubmit={createDatabaseAction}
      />
    </>
  );
}
