"use client";

import { useState } from "react";
import ItemCard from "@/components/ItemCard";
import CreateModal from "@/components/CreateModal";
import type { Jalur } from "@/lib/types";
import { createJalurAction, deleteJalurAction, updateJalurAction } from "@/app/actions";

interface JalurListProps {
  dbId: string;
  jalurList: (Jalur & { alamatCount: number })[];
}

export default function JalurList({ dbId, jalurList }: JalurListProps) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
            Daftar Jalur
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {jalurList.length} jalur dalam database ini
          </p>
        </div>
        <button
          id="btn-tambah-jalur"
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
          Tambah Jalur
        </button>
      </div>

      {/* Jalur Cards */}
      {jalurList.length === 0 ? (
        <div className="empty-state py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl gradient-blue flex items-center justify-center mb-2">
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
              <circle cx="12" cy="10" r="3" />
              <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Belum Ada Jalur
          </h3>
          <p className="text-sm text-[var(--muted)] max-w-md">
            Tambahkan jalur pertama untuk mulai mengelola alamat dan data outlet.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary mt-2"
          >
            Tambah Jalur Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {jalurList.map((jalur) => (
            <ItemCard
              key={jalur.id}
              id={jalur.id}
              name={jalur.name}
              href={`/db/${dbId}/jalur/${jalur.id}`}
              subtitle={`Dibuat ${new Date(jalur.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`}
              count={jalur.alamatCount}
              countLabel="Alamat"
              gradient="gradient-blue"
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
                  <circle cx="12" cy="10" r="3" />
                  <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
                </svg>
              }
              onDelete={async (id) => {
                await deleteJalurAction(id, dbId);
              }}
              onUpdate={async (id, newName) => {
                const formData = new FormData();
                formData.append("name", newName);
                await updateJalurAction(id, dbId, formData);
              }}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Tambah Jalur Baru"
        placeholder="Contoh: Jalur 1"
        onSubmit={async (formData) => {
          return createJalurAction(dbId, formData);
        }}
      />
    </>
  );
}
