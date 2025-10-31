"use client";

import { ChangeEvent, useEffect, useState } from "react";

import { bulkImportTransactions, clearAllTransactions, getAllTransactions } from "@/lib/db";
import { downloadCSV, downloadJSON } from "@/lib/exporters";
import { resetKnownCategories } from "@/lib/settings";
import type { Transaction } from "@/types/transaction";

const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

export default function ExportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const list = await getAllTransactions();
      if (!active) return;
      setTransactions(list);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error("Format tidak valid");
      }
      const sanitized: Transaction[] = parsed
        .map((item) => ({
          id: String(item.id ?? generateId()),
          user: String(item.user ?? "default"),
          type: (item.type === "income" || item.type === "expense") ? item.type : "expense",
          category: String(item.category ?? "Lainnya"),
          amount: Number(item.amount ?? 0),
          note: String(item.note ?? ""),
          createdAt: new Date(item.createdAt ?? new Date()).toISOString(),
        }))
        .filter((item) => !Number.isNaN(item.amount));

      await bulkImportTransactions(sanitized);
      setStatus(`Berhasil mengimpor ${sanitized.length} transaksi.`);
      const refreshed = await getAllTransactions();
      setTransactions(refreshed);
    } catch (error) {
      console.error(error);
      setStatus("Gagal mengimpor file. Pastikan format JSON benar.");
    } finally {
      event.target.value = "";
    }
  };

  const handleClear = async () => {
    const confirmClear = window.confirm(
      "Hapus semua transaksi? Aksi ini tidak dapat dibatalkan. Kategori custom akan direset.",
    );
    if (!confirmClear) return;
    await clearAllTransactions();
    resetKnownCategories();
    setTransactions([]);
    setStatus("Semua transaksi telah dihapus.");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Export & Import</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Backup data transaksi kamu, impor dari file, atau hapus semua transaksi.
        </p>
      </header>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Export</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Total transaksi: {transactions.length}
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => downloadCSV(transactions)}>Unduh CSV</button>
          <button onClick={() => downloadJSON(transactions)} className="bg-slate-700 hover:bg-slate-800">
            Unduh JSON
          </button>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Import</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pilih file hasil export JSON sebelumnya untuk mengembalikan data.
        </p>
        <input type="file" accept="application/json" onChange={handleFile} />
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Danger Zone</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Menghapus semua transaksi tidak dapat dibatalkan. Data profil tetap aman.
        </p>
        <button
          type="button"
          onClick={handleClear}
          className="bg-rose-600 hover:bg-rose-700"
        >
          Hapus Semua Transaksi
        </button>
      </section>

      {status ? (
        <div className="card bg-slate-50 text-sm text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">{status}</div>
      ) : null}
    </div>
  );
}
