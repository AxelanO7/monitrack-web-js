import type { Transaction } from "@/types/transaction";

const DB_NAME = "monitrack-db";
const DB_VERSION = 1;
const STORE_NAME = "transactions";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

export function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB request failed"));
  });
}

async function openDB(): Promise<IDBDatabase> {
  if (!isBrowser()) {
    throw new Error("IndexedDB is only available in the browser");
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("by_createdAt", "createdAt");
        store.createIndex("by_user", "user");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });
}

export async function addTransaction(tx: Transaction): Promise<void> {
  const db = await openDB();
  const store = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME);
  await reqToPromise(store.add(tx));
  db.close();
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await openDB();
  const store = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME);
  const result = await reqToPromise(store.getAll());
  db.close();
  return (result ?? []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function bulkImportTransactions(list: Transaction[]): Promise<void> {
  if (list.length === 0) return;
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  await Promise.all(list.map((item) => reqToPromise(store.put(item))));

  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Failed to import transactions"));
    transaction.onabort = () => reject(transaction.error ?? new Error("Import aborted"));
  });

  db.close();
}

export async function clearAllTransactions(): Promise<void> {
  const db = await openDB();
  const store = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME);
  await reqToPromise(store.clear());
  db.close();
}
