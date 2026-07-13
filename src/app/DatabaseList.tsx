"use client";

import { useState } from "react";

import ItemCard from "@/components/ItemCard";
import CreateModal from "@/components/CreateModal";
import type { Database } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import {
  createDatabaseAction,
  deleteDatabaseAction,
  updateDatabaseAction,
} from "./actions";

interface DatabaseListProps {
  databases: (Database & { jalurCount: number })[];
  hideHeader?: boolean;
}

export default function DatabaseList({ databases, hideHeader }: DatabaseListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const auth = useAuth();
  const isAdmin = auth?.role === "ADMIN";

  return (
    <>
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
              Dashboard
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Kelola database, jalur, dan data outlet Anda
            </p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-3">
              <button
                id="btn-buat-database"
                onClick={() => setShowCreate(true)}
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
          )}
        </div>
      )}

      {/* Database Cards */}
      {databases.length === 0 ? (
        <div className="empty-state py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl gradient-amber flex items-center justify-center mb-2">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0c0a09"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5V19A9 3 0 0 0 21 19V5" />
              <path d="M3 12A9 3 0 0 0 21 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Belum Ada Database
          </h3>
          <p className="text-sm text-[var(--muted)] max-w-md">
            {isAdmin 
              ? "Buat database pertama Anda untuk mulai mengelola data jalur dan outlet." 
              : "Tidak ada database yang terdaftar saat ini."}
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn btn-primary mt-2"
            >
              Buat Database Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {databases.map((db) => (
            <ItemCard
              key={db.id}
              id={db.id}
              name={db.name}
              href={`/db/${db.id}`}
              subtitle={`Dibuat ${new Date(db.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`}
              count={db.jalurCount}
              countLabel="Jalur"
              gradient="gradient-amber"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                  <path d="M3 12A9 3 0 0 0 21 12" />
                </svg>
              }
              onDelete={isAdmin ? async (id) => {
                await deleteDatabaseAction(id);
              } : undefined}
              onUpdate={isAdmin ? async (id, newName) => {
                const formData = new FormData();
                formData.append("name", newName);
                await updateDatabaseAction(id, formData);
              } : undefined}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isAdmin && showCreate && (
        <CreateModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          title="Buat Database Baru"
          placeholder="Contoh: Database Rendi"
          onSubmit={createDatabaseAction}
        />
      )}
    </>
  );
}

