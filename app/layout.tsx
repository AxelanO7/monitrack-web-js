import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

import NavUserInfo from "@/components/NavUserInfo";

export const metadata: Metadata = {
  title: "Monitrack",
  description: "Personal finance tracker that lives entirely in your browser.",
};

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/add", label: "Add" },
  { href: "/history", label: "History" },
  { href: "/export", label: "Export" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-slate-100 dark:bg-slate-950">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <div className="flex min-h-screen flex-col">
          <nav className="flex items-center justify-between border-b border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
              <span className="text-lg font-semibold text-slate-900 dark:text-white">Monitrack</span>
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-sky-600 dark:hover:text-sky-400"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <NavUserInfo />
          </nav>
          <main className="flex-1 space-y-6 p-4 sm:p-8">{children}</main>
          <footer className="border-t border-slate-200 bg-white p-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            Data kamu hanya disimpan di browser ini.
          </footer>
        </div>
      </body>
    </html>
  );
}
