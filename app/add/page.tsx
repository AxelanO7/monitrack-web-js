"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { addTransaction } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import {
  addKnownCategory,
  getCurrency,
  getKnownCategories,
  getUserName,
} from "@/lib/settings";
import type { Transaction } from "@/types/transaction";

const incomePresets = ["Gaji", "Bonus", "Reimbursement", "Lainnya"];
const expensePresets = ["Makan", "Transport", "Belanja", "Entertainment", "Tagihan", "Lainnya"];

type TransactionType = "income" | "expense";

export default function AddTransactionPage() {
  const router = useRouter();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryPreset, setCategoryPreset] = useState(expensePresets[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [currency, setCurrency] = useState("IDR");
  const [knownCategories, setKnownCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrency(getCurrency());
    setKnownCategories(getKnownCategories());
  }, []);

  useEffect(() => {
    setCategoryPreset(type === "income" ? incomePresets[0] : expensePresets[0]);
  }, [type]);

  const availableCategories = useMemo(() => {
    const presets = type === "income" ? incomePresets : expensePresets;
    return Array.from(new Set([...presets, ...knownCategories]));
  }, [knownCategories, type]);

  const previewAmount = useMemo(() => formatMoney(Number(amount || 0), currency), [amount, currency]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);
    const finalCategory = customCategory.trim() || categoryPreset;

    if (!finalCategory) {
      setError("Kategori harus diisi.");
      return;
    }

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Nominal harus lebih besar dari 0.");
      return;
    }

    const when = new Date(date);
    if (Number.isNaN(when.getTime())) {
      setError("Tanggal tidak valid.");
      return;
    }

    const transaction: Transaction = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      user: getUserName() ?? "default",
      type,
      category: finalCategory,
      amount: parsedAmount,
      note: note.trim(),
      createdAt: when.toISOString(),
    };

    try {
      await addTransaction(transaction);
      addKnownCategory(finalCategory);
      router.push("/history");
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan transaksi. Coba lagi.");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Add Transaction</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Catat pemasukan atau pengeluaran baru.
        </p>
      </header>

      <form className="card space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="card-label">Jenis Transaksi</label>
          <div className="mt-2 flex gap-2">
            {(["income", "expense"] as TransactionType[]).map((option) => (
              <button
                key={option}
                type="button"
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  type === option
                    ? "border-sky-500 bg-sky-500 text-white"
                    : "border-slate-200 bg-transparent text-slate-600 dark:border-slate-700 dark:text-slate-300"
                }`}
                onClick={() => setType(option)}
              >
                {option === "income" ? "Pemasukan" : "Pengeluaran"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="card-label">Nominal</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{previewAmount}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="card-label">Kategori</label>
            <select
              className="mt-2 w-full"
              value={categoryPreset}
              onChange={(event) => setCategoryPreset(event.target.value)}
            >
              {availableCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="card-label">Kategori Custom (opsional)</label>
            <input
              className="mt-2 w-full"
              placeholder="Tulis kategori baru"
              value={customCategory}
              onChange={(event) => setCustomCategory(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="card-label">Tanggal & Waktu</label>
          <input
            className="mt-2 w-full"
            type="datetime-local"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>

        <div>
          <label className="card-label">Catatan</label>
          <textarea
            className="mt-2 w-full"
            placeholder="Contoh: makan siang dengan teman"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}

        <div className="flex justify-end">
          <button type="submit">Simpan &rarr;</button>
        </div>
      </form>
    </div>
  );
}
