import { openDB, type IDBPDatabase } from 'idb';

export interface PendingCheckin {
  id: string;
  academyId: string;
  studentId: string;
  classId: string;
  method: string;
  timestamp: string;
  synced: boolean;
}

export interface PendingFeedbackItem {
  id: string;
  academyId: string;
  profileId: string;
  type: string;
  message: string;
  rating: number;
  timestamp: string;
  synced: boolean;
}

export interface CachedItem {
  id: string;
  data: unknown;
  cachedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbInstance: IDBPDatabase<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getDB(): Promise<IDBPDatabase<any>> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB('blackbelt-offline', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 2) {
        if (db.objectStoreNames.contains('pending-checkins')) {
          db.deleteObjectStore('pending-checkins');
        }
        const checkins = db.createObjectStore('pending-checkins', { keyPath: 'id' });
        checkins.createIndex('by-synced', 'synced');
        const feedback = db.createObjectStore('pending-feedback', { keyPath: 'id' });
        feedback.createIndex('by-synced', 'synced');
        db.createObjectStore('cached-classes', { keyPath: 'id' });
        db.createObjectStore('cached-profile', { keyPath: 'id' });
      }
    },
  });
  return dbInstance;
}

export async function addPendingCheckin(data: Omit<PendingCheckin, 'synced'>) {
  const db = await getDB();
  await db.put('pending-checkins', { ...data, synced: false });
}

export async function getPendingCheckins(): Promise<PendingCheckin[]> {
  const db = await getDB();
  return db.getAllFromIndex('pending-checkins', 'by-synced', false);
}

export async function markCheckinSynced(id: string) {
  const db = await getDB();
  const item = await db.get('pending-checkins', id);
  if (item) await db.put('pending-checkins', { ...item, synced: true });
}

export async function addPendingFeedback(data: Omit<PendingFeedbackItem, 'synced'>) {
  const db = await getDB();
  await db.put('pending-feedback', { ...data, synced: false });
}

export async function getPendingFeedback(): Promise<PendingFeedbackItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('pending-feedback', 'by-synced', false);
}

export async function cacheClasses(classes: { id: string }[]) {
  const db = await getDB();
  for (const cls of classes) {
    await db.put('cached-classes', { id: cls.id, data: cls, cachedAt: new Date().toISOString() });
  }
}

export async function getCachedClasses(): Promise<CachedItem[]> {
  const db = await getDB();
  return db.getAll('cached-classes');
}

export async function clearSynced() {
  const db = await getDB();
  const synced: PendingCheckin[] = await db.getAllFromIndex('pending-checkins', 'by-synced', true);
  for (const item of synced) await db.delete('pending-checkins', item.id);
  const syncedFb: PendingFeedbackItem[] = await db.getAllFromIndex('pending-feedback', 'by-synced', true);
  for (const item of syncedFb) await db.delete('pending-feedback', item.id);
}
