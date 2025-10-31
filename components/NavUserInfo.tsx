"use client";

import { useEffect, useState } from "react";

import { getCurrency, getUserName } from "@/lib/settings";

export default function NavUserInfo() {
  const [profile, setProfile] = useState<{ name: string | null; currency: string }>(
    { name: null, currency: "IDR" },
  );

  useEffect(() => {
    const name = getUserName();
    const currency = getCurrency();
    setProfile({ name, currency });
  }, []);

  if (!profile.name) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
        No Profile
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
      {profile.name} · {profile.currency}
    </div>
  );
}
