"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/app/actions";
import { useRouter } from "next/navigation";

import LogoBima from "@/components/layout/LogoBima";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginAction(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        // Redirect to dashboard homepage
        router.push("/");
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--accent)]/5 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="w-full max-w-md bg-[#0d0d0c]/70 backdrop-blur-md border border-[var(--card-border)] rounded-2xl p-8 shadow-2xl relative z-10 animate-scale-up">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-40" />

        {/* Brand / Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 border border-[var(--accent)] flex items-center justify-center mx-auto mb-4 relative overflow-hidden group shadow-[0_0_25px_rgba(201,154,107,0.2)] bg-black/50 p-2">
            <LogoBima className="w-11 h-11 text-[var(--accent)] group-hover:scale-110 transition-transform duration-500" />
          </div>

          <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight font-serif-aww">
            Kopi Bima
          </h1>
          <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-[0.25em] mt-1">
            Portal Admin Kopi Bima
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-fade-in flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="username"
              className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="input"
              placeholder="Ketik username admin..."
              required
              disabled={isPending}
              autoComplete="username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="Ketik password admin..."
              required
              disabled={isPending}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full py-3 text-xs font-bold uppercase tracking-widest mt-6 flex items-center justify-center gap-2"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Mengotentikasi...
              </>
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
