import { DB_NAME, DB_VERSION, STORES } from "./schema.js";

let dbPromise = null;

export function openDatabase() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => console.warn("IndexedDB upgrade is blocked by another tab.");
  });

  return dbPromise;
}

async function transaction(storeName, mode, action) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = action(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSetting(key) {
  const result = await transaction(STORES.settings, "readonly", (store) => store.get(key));
  return result?.value;
}

export async function setSetting(key, value) {
  return transaction(STORES.settings, "readwrite", (store) =>
    store.put({ id: key, value, updatedAt: new Date().toISOString() })
  );
}

export async function putRecord(storeName, record) {
  if (!Object.values(STORES).includes(storeName)) {
    throw new Error(`Unknown store: ${storeName}`);
  }
  return transaction(storeName, "readwrite", (store) => store.put(record));
}

export async function getRecord(storeName, id) {
  if (!Object.values(STORES).includes(storeName)) {
    throw new Error(`Unknown store: ${storeName}`);
  }
  return transaction(storeName, "readonly", (store) => store.get(id));
}
