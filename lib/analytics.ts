import type { Transaction } from "@/types/transaction";
import type { DateRange } from "@/lib/dateRange";
import { isWithinRange } from "@/lib/dateRange";

export function getTotalsForRange(transactions: Transaction[], range: DateRange) {
  return transactions.reduce(
    (acc, tx) => {
      if (!isWithinRange(tx.createdAt, range)) {
        return acc;
      }

      if (tx.type === "income") {
        acc.income += tx.amount;
        acc.balance += tx.amount;
      } else if (tx.type === "expense") {
        acc.expense += tx.amount;
        acc.balance -= tx.amount;
      }

      return acc;
    },
    { income: 0, expense: 0, balance: 0 },
  );
}

function toLocalKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDailySpendingLast7Days(transactions: Transaction[]) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const buckets = new Map<string, number>();

  for (let i = 0; i < 7; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = toLocalKey(date);
    buckets.set(key, 0);
  }

  transactions.forEach((tx) => {
    if (tx.type !== "expense") return;
    const txDate = new Date(tx.createdAt);
    if (Number.isNaN(txDate.getTime())) return;

    const dateKey = toLocalKey(txDate);
    if (buckets.has(dateKey)) {
      buckets.set(dateKey, (buckets.get(dateKey) ?? 0) + tx.amount);
    }
  });

  return Array.from(buckets.entries()).map(([date, totalExpense]) => ({ date, totalExpense }));
}
