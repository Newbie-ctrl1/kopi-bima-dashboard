"use client";

import React, { useState, useEffect, useTransition } from "react";
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface PaymentFormModalProps {
  payment: {
    id: string;
    outletId: string;
    amount: number;
    paymentMethod: "Cash" | "Transfer";
    tglPayment: string;
    keterangan?: string;
  } | null;
  outlets: Array<{
    id: string;
    noInduk: string;
    outlet: string;
  }>;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
}

export default function PaymentFormModal({
  payment,
  outlets,
  onClose,
  onSave,
}: PaymentFormModalProps) {
  const [outletId, setOutletId] = useState(payment?.outletId ?? "");
  const [amount, setAmount] = useState<number | "">(payment?.amount ?? "");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Transfer">(
    payment?.paymentMethod ?? "Cash"
  );
  const [tglPayment, setTglPayment] = useState(
    payment?.tglPayment ?? new Date().toISOString().slice(0, 10)
  );
  const [keterangan, setKeterangan] = useState(payment?.keterangan ?? "");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (outletId) {
      const match = outlets.find((o) => o.id === outletId);
      if (match) {
        setSearchQuery(`${match.noInduk} — ${match.outlet}`);
      }
    } else {
      setSearchQuery("");
    }
  }, [outletId, outlets]);

  const filteredOutlets = outlets.filter(
    (o) =>
      o.outlet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.noInduk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (payment) {
      setOutletId(payment.outletId);
      setAmount(payment.amount);
      setPaymentMethod(payment.paymentMethod);
      setTglPayment(payment.tglPayment);
      setKeterangan(payment.keterangan ?? "");
    }
  }, [payment]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!outletId) {
      setError("Outlet harus dipilih");
      return;
    }
    if (!amount || amount <= 0) {
      setError("Nominal pembayaran harus lebih besar dari 0");
      return;
    }
    if (!tglPayment) {
      setError("Tanggal pembayaran tidak boleh kosong");
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.append("outletId", outletId);
    formData.append("amount", String(amount));
    formData.append("paymentMethod", paymentMethod);
    formData.append("tglPayment", tglPayment);
    if (keterangan.trim()) {
      formData.append("keterangan", keterangan.trim());
    }

    startTransition(async () => {
      const res = await onSave(formData);
      if (res.error) {
        setError(res.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#0d0d0c] border border-[var(--card-border)] rounded-xl overflow-hidden shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between">
          <h2 className="text-md font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <span className="text-[var(--accent)] text-lg">💰</span>
            {payment ? "Edit Pembayaran Piutang" : "Terima Pembayaran Piutang"}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                ⚠️ {error}
              </div>
            )}

            {/* Searchable Outlet Selection */}
            <div className="relative">
              <label
                htmlFor="outlet-search"
                className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5"
              >
                Pilih Outlet (Cari Nama / No Induk)
              </label>
              <div className="relative">
                <input
                  id="outlet-search"
                  type="text"
                  className="input pr-10"
                  placeholder="Ketik nama toko atau no induk..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (outletId) {
                      setOutletId(""); // Reset selection if they edit text
                    }
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  required={!outletId}
                  autoComplete="off"
                />
                {outletId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOutletId("");
                      setSearchQuery("");
                      setIsDropdownOpen(true);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    ✕
                  </button>
                ) : (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none">
                    🔍
                  </span>
                )}
              </div>

              {/* Hidden Input for Form Submission */}
              <input type="hidden" name="outletId" value={outletId} />

              {/* Dropdown Options */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg bg-[#0d0d0c] border border-[var(--card-border)] shadow-xl divide-y divide-[var(--card-border)]">
                  {filteredOutlets.length === 0 ? (
                    <div className="p-3 text-xs text-[var(--muted-foreground)] text-center">
                      Tidak ada outlet yang cocok
                    </div>
                  ) : (
                    filteredOutlets.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-xs text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-white transition-colors flex items-center justify-between"
                        onClick={() => {
                          setOutletId(o.id);
                          setSearchQuery(`${o.noInduk} — ${o.outlet}`);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span className="font-semibold">{o.outlet}</span>
                        <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                          {o.noInduk}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Payment Method */}
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
                  Metode Pembayaran
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  className="input cursor-pointer"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  required
                >
                  <option value="Cash">💵 Cash</option>
                  <option value="Transfer">🏦 Transfer</option>
                </select>
              </div>

              {/* Payment Date */}
              <div>
                <label htmlFor="tglPayment" className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
                  Tanggal Pembayaran
                </label>
                <input
                  id="tglPayment"
                  name="tglPayment"
                  type="date"
                  className="input"
                  value={tglPayment}
                  onChange={(e) => setTglPayment(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Payment Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
                Jumlah Pembayaran (Rupiah)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--muted)]">
                  Rp
                </span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  className="input pl-10"
                  placeholder="Contoh: 150000"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAmount(val === "" ? "" : parseFloat(val));
                  }}
                  required
                />
              </div>
              {amount !== "" && amount > 0 && (
                <p className="mt-1.5 text-[10px] text-[var(--success)] font-semibold uppercase tracking-wider">
                  Sama Dengan: {formatCurrency(amount)}
                </p>
              )}
            </div>

            {/* Keterangan */}
            <div>
              <label htmlFor="keterangan" className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
                Keterangan <span className="text-[var(--muted)] font-normal">(Opsional)</span>
              </label>
              <textarea
                id="keterangan"
                name="keterangan"
                className="input resize-none"
                rows={2}
                placeholder="Misal: Pembayaran cicilan, transfer BRI, dll..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-black/40 border-t border-[var(--card-border)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary py-2 text-xs uppercase tracking-wider font-bold"
              disabled={isPending}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary py-2 text-xs uppercase tracking-wider font-bold flex items-center gap-1.5"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Pembayaran"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
