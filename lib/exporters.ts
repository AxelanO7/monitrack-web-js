import type { Transaction } from "@/types/transaction";

export function toCSV(rows: Transaction[]): string {
  const header = "id,user,type,category,amount,note,createdAt";
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const lines = rows.map((row) => {
    const cells = [
      row.id,
      row.user,
      row.type,
      row.category,
      String(row.amount),
      row.note,
      row.createdAt,
    ].map((cell) => escape(String(cell ?? "")));

    return cells.join(",");
  });

  return [header, ...lines].join("\n");
}

export function downloadTextFile(contents: string, filename: string, mimeType = "text/plain;charset=utf-8"): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(rows: Transaction[]): void {
  const date = new Date().toISOString().slice(0, 10);
  const filename = `monitrack-backup-${date}.json`;
  downloadTextFile(JSON.stringify(rows, null, 2), filename, "application/json;charset=utf-8");
}

export function downloadCSV(rows: Transaction[]): void {
  const date = new Date().toISOString().slice(0, 10);
  const filename = `monitrack-export-${date}.csv`;
  downloadTextFile(toCSV(rows), filename, "text/csv;charset=utf-8");
}
