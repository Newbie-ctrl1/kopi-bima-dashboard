"use client";

import { useState } from "react";
import ItemCard from "@/components/ui/ItemCard";
import CreateModal from "@/components/ui/CreateModal";
import type { Alamat } from "@/lib/types";
import { useAuth } from "@/components/layout/AuthProvider";
import { createAlamatAction, deleteAlamatAction, updateAlamatAction } from "@/app/actions";

interface AlamatListProps {
  dbId: string;
  jalurId: string;
  alamatList: (Alamat & { outletCount: number })[];
}

export default function AlamatList({
  dbId,
  jalurId,
  alamatList,
}: AlamatListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const auth = useAuth();
  const isAdmin = auth?.role === "ADMIN";

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
            Daftar Alamat
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {alamatList.length} alamat dalam jalur ini
          </p>
        </div>
        {isAdmin && (
          <button
            id="btn-tambah-alamat"
            onClick={() => setShowCreate(true)}
            className="btn btn-primary"
          >
            <svg
              width="16"
              height="16"
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
            Tambah Alamat
          </button>
        )}
      </div>

      {/* Alamat Cards */}
      {alamatList.length === 0 ? (
        <div className="empty-state py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl gradient-teal flex items-center justify-center mb-2">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-1.912 5.886H3.82l4.816 3.5H6.724L12 16l5.276-3.614h-1.912l4.816-3.5h-6.268Z" />
              <path d="M12 16v6M9 19h6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Belum Ada Alamat
          </h3>
          <p className="text-sm text-[var(--muted)] max-w-md">
            {isAdmin 
              ? "Tambahkan alamat pertama untuk mulai mengelola data outlet."
              : "Tidak ada alamat yang terdaftar dalam jalur ini."}
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn btn-primary mt-2"
            >
              Tambah Alamat Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {alamatList.map((alamat) => (
            <ItemCard
              key={alamat.id}
              id={alamat.id}
              name={alamat.name}
              href={`/db/${dbId}/jalur/${jalurId}/alamat/${alamat.id}`}
              subtitle={`Dibuat ${new Date(alamat.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`}
              count={alamat.outletCount}
              countLabel="Outlet"
              gradient="gradient-teal"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              }
              onDelete={isAdmin ? async (id) => {
                await deleteAlamatAction(id, jalurId, dbId);
              } : undefined}
              onUpdate={isAdmin ? async (id, newName) => {
                const formData = new FormData();
                formData.append("name", newName);
                await updateAlamatAction(id, jalurId, dbId, formData);
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
          title="Tambah Alamat Baru"
          placeholder="Contoh: Jl. Diponegoro No. 1"
          onSubmit={async (formData) => {
            return createAlamatAction(jalurId, dbId, formData);
          }}
        />
      )}
    </>
  );
}
