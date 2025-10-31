"use client";

import { useEffect, useMemo, useRef } from "react";

type ChartData = {
  date: string;
  totalExpense: number;
};

type Props = {
  data: ChartData[];
  currencyCode: string;
};

export default function SpendingChart({ data, currencyCode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<any>(null);

  const labels = useMemo(
    () =>
      data.map((item) => {
        const [yearRaw, monthRaw, dayRaw] = item.date.split("-");
        const year = Number(yearRaw);
        const monthIndex = Number(monthRaw) - 1;
        const day = Number(dayRaw);
        const date = new Date(
          Number.isNaN(year) ? 0 : year,
          Number.isNaN(monthIndex) ? 0 : monthIndex,
          Number.isNaN(day) ? 1 : day,
        );
        return new Intl.DateTimeFormat("id-ID", {
          day: "2-digit",
          month: "short",
        }).format(date);
      }),
    [data],
  );
  const values = useMemo(() => data.map((item) => item.totalExpense), [data]);

  useEffect(() => {
    let isMounted = true;

    async function loadChart() {
      const ChartModule = await import("chart.js/auto");
      if (!isMounted || !canvasRef.current) return;

      const { default: Chart } = ChartModule;
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      chartRef.current = new Chart(canvasRef.current, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Pengeluaran",
              data: values,
              backgroundColor: "rgba(239, 68, 68, 0.5)",
              borderRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: {
                color: "#94a3b8",
              },
              grid: {
                display: false,
              },
            },
            y: {
              ticks: {
                color: "#94a3b8",
                callback: (value) =>
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: currencyCode,
                    maximumFractionDigits: 0,
                  }).format(Number(value)),
              },
              grid: {
                color: "rgba(148, 163, 184, 0.2)",
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const value = ctx.parsed.y ?? 0;
                  return new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: currencyCode,
                  }).format(value);
                },
              },
            },
            legend: {
              display: false,
            },
          },
        },
      });
    }

    if (labels.length > 0) {
      loadChart();
    } else if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    return () => {
      isMounted = false;
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [currencyCode, labels, values]);

  return (
    <div className="card h-80">
      <div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Pengeluaran 7 Hari Terakhir
      </div>
      {labels.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
          Belum ada data pengeluaran.
        </div>
      ) : (
        <canvas ref={canvasRef} className="h-full w-full" />
      )}
    </div>
  );
}
