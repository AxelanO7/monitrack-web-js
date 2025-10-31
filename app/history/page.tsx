"use client";

import { useEffect, useMemo, useState } from "react";

import { getTotalsForRange } from "@/lib/analytics";
import { getPredefinedRange, isWithinRange, type DateRange, type RangeKind } from "@/lib/dateRange";
import { formatDate, formatMoney } from "@/lib/format";
import { getAllTransactions } from "@/lib/db";
import { getCurrency } from "@/lib/settings";
import type { Transaction } from "@/types/transaction";

type ExtendedRange = RangeKind | "custom";

const rangeOptions: { label: string; value: ExtendedRange }[] = [
  { label: "Hari ini", value: "today" },
  { label: "Minggu ini", value: "this-week" },
  { label: "Bulan ini", value: "this-month" },
  { label: "Semua", value: "all" },
  { label: "Custom", value: "custom" },
];

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currency, setCurrency] = useState("IDR");
  const [rangeKind, setRangeKind] = useState<ExtendedRange>("all");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");

  useEffect(() => {
    let active = true;
    async function load() {
      setCurrency(getCurrency());
      const list = await getAllTransactions();
      if (!active) return;
      setTransactions(list);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const range: DateRange = useMemo(() => {
    if (rangeKind === "custom") {
      const fromDate = customFrom ? new Date(customFrom) : null;
      const toDate = customTo ? new Date(customTo) : null;

      if (fromDate && !Number.isNaN(fromDate.getTime())) {
        fromDate.setHours(0, 0, 0, 0);
      }

      if (toDate && !Number.isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
      }

      return {
        from: fromDate && !Number.isNaN(fromDate.getTime()) ? fromDate : null,
        to: toDate && !Number.isNaN(toDate.getTime()) ? toDate : null,
      };
    }
    return getPredefinedRange(rangeKind);
  }, [customFrom, customTo, rangeKind]);

  const filteredTransactions = useMemo(
    () => transactions.filter((tx) => isWithinRange(tx.createdAt, range)),
    [range, transactions],
  );

  const totals = useMemo(() => getTotalsForRange(transactions, range), [transactions, range]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">History</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Telusuri transaksi berdasarkan rentang waktu.
        </p>
      </header>

      <section className="card space-y-4">
        <div>
          <label className="card-label">Rentang Waktu</label>
          <select
            className="mt-2 w-full sm:w-60"
            value={rangeKind}
            onChange={(event) => setRangeKind(event.target.value as ExtendedRange)}
          >
            {rangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {rangeKind === "custom" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="card-label">Dari</label>
              <input
                type="date"
                className="mt-2 w-full"
                value={customFrom}
                onChange={(event) => setCustomFrom(event.target.value)}
              />
            </div>
            <div>
              <label className="card-label">Sampai</label>
              <input
                type="date"
                className="mt-2 w-full"
                value={customTo}
                onChange={(event) => setCustomTo(event.target.value)}
              />
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <div className="card-label">Pemasukan</div>
          <div className="mt-3 text-xl font-semibold text-emerald-600 dark:text-emerald-400">
            {formatMoney(totals.income, currency)}
          </div>
        </div>
        <div className="card">
          <div className="card-label">Pengeluaran</div>
          <div className="mt-3 text-xl font-semibold text-rose-600 dark:text-rose-400">
            {formatMoney(totals.expense, currency)}
          </div>
        </div>
        <div className="card">
          <div className="card-label">Saldo</div>
          <div className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
            {formatMoney(totals.balance, currency)}
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daftar Transaksi</h2>
        <div className="table-wrapper">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3 text-right">Nominal</th>
                <th className="px-4 py-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                    Tidak ada transaksi pada rentang ini.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="bg-white/70 dark:bg-slate-900/40">
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(tx.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          tx.type === "income"
                            ? "rounded px-2 py-0.5 text-xs font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "rounded px-2 py-0.5 text-xs font-medium bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        }
                      >
                        {tx.type === "income" ? "Income" : "Expense"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{tx.category}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                      {formatMoney(tx.amount, currency)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{tx.note || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
