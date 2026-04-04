/**
 * Offline check-in queue using IndexedDB.
 * Queues check-ins when offline, syncs when connection returns.
 */

const DB_NAME = 'blackbelt-offline';
const STORE_NAME = 'pending-checkins';
const DB_VERSION = 1;

interface PendingCheckIn {
  id?: number;
  studentId: string;
  classId?: string;
  academyId: string;
  timestamp: string;
  synced: boolean;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function queueOfflineCheckIn(data: {
  studentId: string;
  classId?: string;
  academyId: string;
  timestamp: string;
}): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).add({ ...data, synced: false });

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const reg = await navigator.serviceWorker.ready;
    try {
      await (reg as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-checkins');
    } catch {
      // Background sync not available
    }
  }
}

export async function getPendingCheckIns(): Promise<PendingCheckIn[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as PendingCheckIn[]);
    req.onerror = () => reject(req.error);
  });
}

export async function markAsSynced(id: number): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const req = store.get(id);
  req.onsuccess = () => {
    const record = req.result as PendingCheckIn | undefined;
    if (record) {
      record.synced = true;
      store.put(record);
    }
  };
}

export async function clearSyncedCheckIns(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const req = store.getAll();
  req.onsuccess = () => {
    const all = req.result as PendingCheckIn[];
    for (const item of all) {
      if (item.synced && item.id !== undefined) {
        store.delete(item.id);
      }
    }
  };
}
