"use client";

import { FormEvent, useEffect, useState } from "react";

import { getCurrency, getUserName, setCurrency, setUserName } from "@/lib/settings";

const presetCurrencies = ["IDR", "USD", "EUR"];

type Selection = "preset" | "custom";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [currency, setCurrencyState] = useState("IDR");
  const [mode, setMode] = useState<Selection>("preset");
  const [customCurrency, setCustomCurrency] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const userName = getUserName();
    const currentCurrency = getCurrency();
    setName(userName ?? "");
    if (presetCurrencies.includes(currentCurrency)) {
      setMode("preset");
      setCurrencyState(currentCurrency);
    } else {
      setMode("custom");
      setCurrencyState(currentCurrency);
      setCustomCurrency(currentCurrency);
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const finalName = name.trim();
    const chosenCurrency = mode === "custom" ? customCurrency.trim().toUpperCase() : currency;
    setUserName(finalName);
    if (chosenCurrency) {
      setCurrency(chosenCurrency);
    }
    setStatus("Profil berhasil disimpan.");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Atur nama dan mata uang utama kamu.
        </p>
      </header>

      <form className="card space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="card-label" htmlFor="name">
            Nama Kamu
          </label>
          <input
            id="name"
            className="mt-2 w-full"
            placeholder="Contoh: Axel"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="card-label">Mata Uang</div>
          <div className="flex flex-wrap gap-2">
            {presetCurrencies.map((code) => (
              <button
                key={code}
                type="button"
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "preset" && currency === code
                    ? "border-sky-500 bg-sky-500 text-white"
                    : "border-slate-200 bg-transparent text-slate-600 dark:border-slate-700 dark:text-slate-300"
                }`}
                onClick={() => {
                  setMode("preset");
                  setCurrencyState(code);
                }}
              >
                {code}
              </button>
            ))}
            <button
              type="button"
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                mode === "custom"
                  ? "border-sky-500 bg-sky-500 text-white"
                  : "border-slate-200 bg-transparent text-slate-600 dark:border-slate-700 dark:text-slate-300"
              }`}
              onClick={() => {
                setMode("custom");
                setCustomCurrency((value) => value || currency);
              }}
            >
              Custom
            </button>
          </div>
          {mode === "custom" ? (
            <input
              className="w-full"
              placeholder="Misal: SGD"
              value={customCurrency}
              onChange={(event) => setCustomCurrency(event.target.value.toUpperCase())}
            />
          ) : null}
        </div>

        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-900/40 dark:text-slate-300">
          Data kamu disimpan di browser ini. Gunakan export JSON untuk backup.
        </div>

        <div className="flex justify-end">
          <button type="submit">Simpan</button>
        </div>
      </form>

      {status ? (
        <div className="card bg-slate-50 text-sm text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">{status}</div>
      ) : null}
    </div>
  );
}
