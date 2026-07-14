"use client";

import { useState } from "react";
import type { Outlet, OrderWithRelations, PaymentWithRelations } from "@/lib/types";
import { useAuth } from "@/components/layout/AuthProvider";
import OrderFormModal from "@/components/order/OrderFormModal";
import PaymentFormModal from "@/components/payment/PaymentFormModal";
import { formatCurrency } from "@/lib/utils";

interface GlobalOrdersViewProps {
  initialOrders: OrderWithRelations[];
  initialPayments?: PaymentWithRelations[];
  outlets: Outlet[];
  basePath?: string;
  onCreateOrder: (basePath: string, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  onUpdateOrder: (orderId: string, basePath: string, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  onDeleteOrder: (orderId: string, basePath: string) => Promise<{ error?: string; success?: boolean }>;
  onCreatePayment?: (basePath: string, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  onUpdatePayment?: (paymentId: string, basePath: string, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  onDeletePayment?: (paymentId: string, basePath: string) => Promise<{ error?: string; success?: boolean }>;
}



export default function GlobalOrdersView({
  initialOrders,
  initialPayments = [],
  outlets,
  basePath = "/progres-order",
  onCreateOrder,
  onUpdateOrder,
  onDeleteOrder,
  onCreatePayment,
  onUpdatePayment,
  onDeletePayment,
}: GlobalOrdersViewProps) {
  const auth = useAuth();
  const isAdmin = auth?.role === "ADMIN";
  const [activeTab, setActiveTab] = useState<"orders" | "payments">("orders");
  const [search, setSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<"all" | "Sukses" | "Pending" | "Cancel" | "Proses">("all");
  
  // Modals for Order
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editOrder, setEditOrder] = useState<OrderWithRelations | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modals for Payment
  const [showPaymentCreateModal, setShowPaymentCreateModal] = useState(false);
  const [editPayment, setEditPayment] = useState<PaymentWithRelations | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [deletingPayment, setDeletingPayment] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  // Filter & Stats for Orders
  const activeOrders = initialOrders.filter(
    (o) =>
      o.tglOrder === today ||
      o.orderStatus === "Pending" ||
      o.orderStatus === "Proses" ||
      o.orderStatus === "Cancel"
  );

  const filteredOrders = activeOrders.filter((o) => {
    const matchesSearch =
      o.outletNoInduk.toLowerCase().includes(search.toLowerCase()) ||
      o.outletName.toLowerCase().includes(search.toLowerCase()) ||
      o.alamatName.toLowerCase().includes(search.toLowerCase());
    const matchesOrder = orderFilter === "all" ? true : o.orderStatus === orderFilter;
    return matchesSearch && matchesOrder;
  });

  const totalOrders = filteredOrders.length;
  const nonCancelledOrders = filteredOrders.filter((o) => o.orderStatus !== "Cancel");
  const totalVolume = nonCancelledOrders.reduce((sum, o) => sum + o.order, 0);
  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.order * o.harga, 0);
  const suksesCount = activeOrders.filter((o) => o.orderStatus === "Sukses").length;
  const prosesCount = activeOrders.filter((o) => o.orderStatus === "Proses").length;
  const pendingCount = activeOrders.filter((o) => o.orderStatus === "Pending").length;
  const cancelCount = activeOrders.filter((o) => o.orderStatus === "Cancel").length;

  // Filter & Stats for Payments
  const todayPayments = initialPayments.filter((p) => p.tglPayment === today);

  const filteredPayments = todayPayments.filter((p) => {
    return (
      p.outletNoInduk.toLowerCase().includes(search.toLowerCase()) ||
      p.outletName.toLowerCase().includes(search.toLowerCase()) ||
      p.alamatName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPaidAmount = todayPayments.reduce((sum, p) => sum + p.amount, 0);
  const cashPaidAmount = todayPayments.filter((p) => p.paymentMethod === "Cash").reduce((sum, p) => sum + p.amount, 0);
  const transferPaidAmount = todayPayments.filter((p) => p.paymentMethod === "Transfer").reduce((sum, p) => sum + p.amount, 0);
  const cashCount = todayPayments.filter((p) => p.paymentMethod === "Cash").length;
  const transferCount = todayPayments.filter((p) => p.paymentMethod === "Transfer").length;

  // Handlers for Order
  const handleDeleteOrder = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await onDeleteOrder(deleteId, basePath);
    setDeleting(false);
    setDeleteId(null);
  };

  // Handlers for Payment
  const handleDeletePayment = async () => {
    if (!deletePaymentId || !onDeletePayment) return;
    setDeletingPayment(true);
    await onDeletePayment(deletePaymentId, basePath);
    setDeletingPayment(false);
    setDeletePaymentId(null);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0d0d0c]/40 border border-[var(--card-border)] w-fit mb-4">
        <button
          onClick={() => {
            setActiveTab("orders");
            setSearch("");
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
            activeTab === "orders"
              ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/10"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          📦 Order Aktif ({activeOrders.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("payments");
            setSearch("");
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
            activeTab === "payments"
              ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/10"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          💸 Pembayaran Hari Ini ({todayPayments.length})
        </button>
      </div>

      {/* Stats Area */}
      {activeTab === "orders" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 animate-fade-in">
          <div className="stat-card p-4 flex flex-col justify-between h-[85px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">
              Order Aktif
            </span>
            <h3 className="text-lg font-bold font-serif-aww text-[var(--foreground)]">
              {totalOrders}
            </h3>
          </div>

          <div className="stat-card p-4 flex flex-col justify-between h-[85px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">
              Volume
            </span>
            <h3 className="text-lg font-bold font-serif-aww text-[var(--foreground)]">
              {totalVolume.toFixed(1)} <span className="text-xs text-[var(--muted)]">Krd</span>
            </h3>
          </div>

          <div className="stat-card p-4 flex flex-col justify-between h-[85px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">
              Omzet Order
            </span>
            <h3 className="text-sm font-bold font-serif-aww text-[var(--foreground)]">
              {formatCurrency(totalRevenue)}
            </h3>
          </div>

          <div className="stat-card p-4 flex flex-col justify-between h-[85px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500">
              Sukses
            </span>
            <h3 className="text-lg font-bold font-serif-aww text-emerald-500">
              {suksesCount}
            </h3>
          </div>

          <div className="stat-card p-4 flex flex-col justify-between h-[85px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500">
              Proses
            </span>
            <h3 className="text-lg font-bold font-serif-aww text-blue-500">
              {prosesCount}
            </h3>
          </div>

          <div className="stat-card p-4 flex flex-col justify-between h-[85px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">
              Pending
            </span>
            <h3 className="text-lg font-bold font-serif-aww text-amber-500">
              {pendingCount}
            </h3>
          </div>

          <div className="stat-card p-4 flex flex-col justify-between h-[85px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500">
              Cancel
            </span>
            <h3 className="text-lg font-bold font-serif-aww text-rose-500">
              {cancelCount}
            </h3>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
          <div className="stat-card p-4 flex flex-col justify-between h-[85px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">
              Total Pembayaran
            </span>
            <h3 className="text-sm font-bold font-serif-aww text-[var(--foreground)]">
              {formatCurrency(totalPaidAmount)}
            </h3>
          </div>

          <div className="stat-card p-4 flex flex-col justify-between h-[85px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">
              Bayar Cash
            </span>
            <h3 className="text-sm font-bold font-serif-aww text-amber-500">
              {formatCurrency(cashPaidAmount)} <span className="text-[10px] text-[var(--muted)]">({cashCount} trans)</span>
            </h3>
          </div>

          <div className="stat-card p-4 flex flex-col justify-between h-[85px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500 font-bold">
              Bayar Transfer
            </span>
            <h3 className="text-sm font-bold font-serif-aww text-blue-500">
              {formatCurrency(transferPaidAmount)} <span className="text-[10px] text-[var(--muted)]">({transferCount} trans)</span>
            </h3>
          </div>

          <div className="stat-card p-4 flex flex-col justify-between h-[85px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">
              Jumlah Transaksi
            </span>
            <h3 className="text-lg font-bold font-serif-aww text-[var(--foreground)]">
              {todayPayments.length}
            </h3>
          </div>
        </div>
      )}

      {/* Toolbar & Main Content Card */}
      <div className="animate-slide-up" style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}>
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 flex-1">
            {/* Search Input */}
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
                type="text"
                className="input pl-10 text-xs"
                placeholder="Cari Outlet, No Induk, atau Alamat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Order Status (Orders Tab Only) */}
            {activeTab === "orders" && (
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] w-fit">
                {(["all", "Sukses", "Proses", "Pending", "Cancel"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setOrderFilter(filter)}
                    className={`px-3 py-1.5 rounded-md text-[9px] uppercase font-bold tracking-wider transition-all duration-200 ${
                      orderFilter === filter
                        ? filter === "Sukses"
                          ? "bg-emerald-500/15 text-emerald-500 shadow-sm"
                          : filter === "Proses"
                          ? "bg-blue-500/15 text-blue-500 shadow-sm"
                          : filter === "Pending"
                          ? "bg-amber-500/15 text-amber-500 shadow-sm"
                          : filter === "Cancel"
                          ? "bg-rose-500/15 text-rose-500 shadow-sm"
                          : "bg-[var(--accent)] text-white shadow-sm"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
                    }`}
                  >
                    {filter === "all" ? "Semua" : filter}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isAdmin && (
            activeTab === "orders" ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary text-xs self-end lg:self-auto"
                disabled={outlets.length === 0}
              >
                Buat Order Baru
              </button>
            ) : (
              <button
                onClick={() => setShowPaymentCreateModal(true)}
                className="btn btn-primary text-xs self-end lg:self-auto"
                disabled={outlets.length === 0}
              >
                Terima Pembayaran
              </button>
            )
          )}
        </div>

        {outlets.length === 0 && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
            ⚠️ Belum ada outlet terdaftar di database ini. Daftarkan outlet terlebih dahulu di halaman Jalur & Alamat.
          </div>
        )}

        {/* Data Table */}
        <div className="card-static overflow-hidden border border-[var(--card-border)] bg-[#0d0d0c]">
          <div className="px-5 py-3 border-b border-[var(--card-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                {activeTab === "orders" ? `${filteredOrders.length} order` : `${filteredPayments.length} pembayaran`}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === "orders" ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="font-sans text-[10px] tracking-widest font-bold">Jalur / Alamat</th>
                    <th className="font-sans text-[10px] tracking-widest font-bold">No Induk</th>
                    <th className="font-sans text-[10px] tracking-widest font-bold">Outlet</th>
                    <th className="text-right font-sans text-[10px] tracking-widest font-bold">Order (Krd)</th>
                    <th className="text-right font-sans text-[10px] tracking-widest font-bold">Harga</th>
                    <th className="text-right font-sans text-[10px] tracking-widest font-bold">Total Harga</th>
                    <th className="text-center font-sans text-[10px] tracking-widest font-bold">Status</th>
                    <th className="font-sans text-[10px] tracking-widest font-bold">Keterangan</th>
                    {isAdmin && <th className="text-center font-sans text-[10px] tracking-widest font-bold">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 9 : 8}>
                        <div className="empty-state py-16">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--muted)] mb-2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <p className="text-xs text-[var(--muted-foreground)] font-medium">Belum ada order aktif</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="text-[var(--foreground)] font-semibold text-xs">
                          <div className="flex flex-col">
                            <span className="font-serif-aww text-[var(--accent)] text-xs">{o.jalurName}</span>
                            <span className="text-[9px] text-[var(--muted)] uppercase font-semibold">{o.alamatName}</span>
                            <span className="text-[8.5px] text-[var(--muted)] font-mono mt-0.5 flex items-center gap-1">{o.tglOrder}</span>
                          </div>
                        </td>
                        <td className="font-mono text-[var(--foreground)] font-semibold text-xs tracking-tight">
                          {o.outletNoInduk}
                        </td>
                        <td className="text-[var(--foreground)] font-semibold">{o.outletName}</td>
                        <td className="text-right font-mono text-xs font-semibold text-[var(--foreground)]">
                          {o.order} Krd
                        </td>
                        <td className="text-right font-mono text-xs">{formatCurrency(o.harga)}</td>
                        <td className="text-right font-mono text-xs font-semibold text-purple-400">
                          {formatCurrency(o.order * o.harga)}
                        </td>
                        <td className="text-center">
                          <span
                            className={`badge ${
                              o.orderStatus === "Sukses"
                                ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/15"
                                : o.orderStatus === "Proses"
                                ? "text-blue-500 bg-blue-500/5 border-blue-500/15"
                                : o.orderStatus === "Pending"
                                ? "text-amber-500 bg-amber-500/5 border-amber-500/15"
                                : "text-rose-500 bg-rose-500/5 border-rose-500/15"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                o.orderStatus === "Sukses"
                                  ? "bg-emerald-500"
                                  : o.orderStatus === "Proses"
                                  ? "bg-blue-500"
                                  : o.orderStatus === "Pending"
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                            />
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="text-xs text-[var(--muted-foreground)] max-w-[140px]">
                          {o.keterangan ? (
                            <span className="block truncate" title={o.keterangan}>{o.keterangan}</span>
                          ) : (
                            <span className="text-[var(--muted)] italic">—</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setEditOrder(o)}
                                className="p-2 border border-transparent hover:border-[var(--accent)] text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-300"
                                title="Edit Order"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeleteId(o.id)}
                                className="p-2 border border-transparent hover:border-rose-500/30 text-[var(--muted)] hover:text-rose-400 transition-all duration-300"
                                title="Hapus Order"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="font-sans text-[10px] tracking-widest font-bold">Jalur / Alamat</th>
                    <th className="font-sans text-[10px] tracking-widest font-bold">No Induk</th>
                    <th className="font-sans text-[10px] tracking-widest font-bold">Outlet</th>
                    <th className="text-right font-sans text-[10px] tracking-widest font-bold">Jumlah Bayar</th>
                    <th className="text-center font-sans text-[10px] tracking-widest font-bold">Metode</th>
                    <th className="font-sans text-[10px] tracking-widest font-bold">Keterangan</th>
                    {isAdmin && <th className="text-center font-sans text-[10px] tracking-widest font-bold">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6}>
                        <div className="empty-state py-16">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--muted)] mb-2">
                            <rect width="20" height="12" x="2" y="6" rx="2" />
                            <circle cx="12" cy="12" r="2" />
                            <path d="M6 12h.01M18 12h.01" />
                          </svg>
                          <p className="text-xs text-[var(--muted-foreground)] font-medium">Belum ada pembayaran hari ini</p>
                          {isAdmin && <p className="text-[10px] text-[var(--muted)] mt-1">Klik "Terima Pembayaran" untuk mencatat pembayaran baru</p>}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="text-[var(--foreground)] font-semibold text-xs">
                          <div className="flex flex-col">
                            <span className="font-serif-aww text-[var(--accent)] text-xs">{p.jalurName}</span>
                            <span className="text-[9px] text-[var(--muted)] uppercase font-semibold">{p.alamatName}</span>
                            <span className="text-[8.5px] text-[var(--muted)] font-mono mt-0.5 flex items-center gap-1">{p.tglPayment}</span>
                          </div>
                        </td>
                        <td className="font-mono text-[var(--foreground)] font-semibold text-xs tracking-tight">
                          {p.outletNoInduk}
                        </td>
                        <td className="text-[var(--foreground)] font-semibold">{p.outletName}</td>
                        <td className="text-right font-mono text-xs font-semibold text-[var(--success)]">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="text-center">
                          <span
                            className={`badge ${
                              p.paymentMethod === "Cash"
                                ? "text-amber-500 bg-amber-500/5 border-amber-500/15"
                                : "text-blue-500 bg-blue-500/5 border-blue-500/15"
                            }`}
                          >
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
                        {isAdmin && (
                          <td>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setEditPayment(p)}
                                className="p-2 border border-transparent hover:border-[var(--accent)] text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-300"
                                title="Edit Pembayaran"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeletePaymentId(p.id)}
                                className="p-2 border border-transparent hover:border-rose-500/30 text-[var(--muted)] hover:text-rose-400 transition-all duration-300"
                                title="Hapus Pembayaran"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Orders Modals */}
      {isAdmin && showCreateModal && (
        <OrderFormModal
          mode="create"
          outlets={outlets}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (formData) => {
            return await onCreateOrder(basePath, formData);
          }}
        />
      )}

      {isAdmin && editOrder && (
        <OrderFormModal
          mode="edit"
          outlets={outlets}
          order={editOrder}
          onClose={() => setEditOrder(null)}
          onSubmit={async (formData) => {
            return await onUpdateOrder(editOrder.id, basePath, formData);
          }}
        />
      )}

      {/* Delete Order Confirmation */}
      {isAdmin && deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full gradient-rose flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)] mb-2">Hapus Order?</h3>
              <p className="text-xs text-[var(--muted-foreground)] mb-6">
                Jika order berstatus Sukses, stok kopi akan dikembalikan. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setDeleteId(null)} className="btn btn-secondary text-xs" disabled={deleting}>
                  Batal
                </button>
                <button onClick={handleDeleteOrder} className="btn text-xs bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20" disabled={deleting}>
                  {deleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Modals */}
      {isAdmin && showPaymentCreateModal && onCreatePayment && (
        <PaymentFormModal
          payment={null}
          outlets={outlets}
          onClose={() => setShowPaymentCreateModal(false)}
          onSave={async (formData) => {
            return await onCreatePayment(basePath, formData);
          }}
        />
      )}

      {isAdmin && editPayment && onUpdatePayment && (
        <PaymentFormModal
          payment={editPayment}
          outlets={outlets}
          onClose={() => setEditPayment(null)}
          onSave={async (formData) => {
            return await onUpdatePayment(editPayment.id, basePath, formData);
          }}
        />
      )}

      {/* Delete Payment Confirmation */}
      {isAdmin && deletePaymentId && (
        <div className="modal-overlay" onClick={() => setDeletePaymentId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full gradient-rose flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)] mb-2">Hapus Pembayaran?</h3>
              <p className="text-xs text-[var(--muted-foreground)] mb-6">
                Tindakan ini akan menghapus riwayat pembayaran ini dan mengembalikan piutang outlet terkait.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setDeletePaymentId(null)} className="btn btn-secondary text-xs" disabled={deletingPayment}>
                  Batal
                </button>
                <button onClick={handleDeletePayment} className="btn text-xs bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20" disabled={deletingPayment}>
                  {deletingPayment ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
