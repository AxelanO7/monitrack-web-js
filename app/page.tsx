"use client";

import { useEffect, useMemo, useState } from "react";

import SpendingChart from "@/components/SpendingChart";
import { getDailySpendingLast7Days, getTotalsForRange } from "@/lib/analytics";
import { getPredefinedRange } from "@/lib/dateRange";
import { formatMoney } from "@/lib/format";
import { getAllTransactions } from "@/lib/db";
import { getCurrency } from "@/lib/settings";
import type { Transaction } from "@/types/transaction";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currency, setCurrency] = useState("IDR");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setCurrency(getCurrency());
        const txList = await getAllTransactions();
        if (!active) return;
        setTransactions(txList);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const totalsAll = useMemo(
    () => getTotalsForRange(transactions, getPredefinedRange("all")),
    [transactions],
  );
  const totalsMonth = useMemo(
    () => getTotalsForRange(transactions, getPredefinedRange("this-month")),
    [transactions],
  );
  const totalsMonthOnlyExpense = totalsMonth.expense;
  const chartData = useMemo(() => getDailySpendingLast7Days(transactions), [transactions]);

  const cards = [
    {
      label: "Saldo Total",
      value: formatMoney(totalsAll.balance, currency),
    },
    {
      label: "Pemasukan Bulan Ini",
      value: formatMoney(totalsMonth.income, currency),
    },
    {
      label: "Pengeluaran Bulan Ini",
      value: formatMoney(totalsMonthOnlyExpense, currency),
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Lihat ringkasan keuangan pribadi kamu.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="card">
            <div className="card-label">{card.label}</div>
            <div className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
              {loading ? "…" : card.value}
            </div>
          </div>
        ))}
      </section>

      <section>
        <SpendingChart data={chartData} currencyCode={currency} />
      </section>

      {transactions.length === 0 && !loading ? (
        <div className="card">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Belum ada transaksi. Tambahkan transaksi pertama kamu pada menu <strong>Add</strong>.
          </div>
        </div>
      ) : null}
    </div>
  );
}
