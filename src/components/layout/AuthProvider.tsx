"use client";

import { createContext, useContext } from "react";

interface AuthValue {
  role: string;
  username: string;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AuthValue | null;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
