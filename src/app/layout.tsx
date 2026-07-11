import type { Metadata } from "next";
import { Outfit, Syne, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { cookies } from "next/headers";
import { getCurrentUser } from "@/app/actions";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Kopi Bima — Dashboard Admin",
  description:
    "Dashboard Admin untuk mengelola data outlet, jalur, dan keuangan Kopi Bima",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("admin-session");
  const user = await getCurrentUser();
  const authValue = user ? { role: user.role, username: user.username } : null;

  return (
    <html
      lang="id"
      className={`${outfit.variable} ${syne.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        <AuthProvider value={authValue}>
          {isAuthenticated && <Sidebar />}
          <main className={isAuthenticated ? "main-content" : ""}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

