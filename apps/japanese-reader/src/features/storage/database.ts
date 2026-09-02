import { openDB, type IDBPDatabase } from 'idb';
import type { LearningText } from '../../models/text';

const DB_NAME = 'japanese-reader';
const DB_VERSION = 1;
const STORE_NAME = 'texts';

let dbInstance: IDBPDatabase | null = null;

export async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
        store.createIndex('updatedAt', 'updatedAt');
      }
    },
  });

  return dbInstance;
}

export async function saveText(text: LearningText): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, text);
  console.log('✅ Текст сохранён:', text.id);
}

export async function loadText(id: string): Promise<LearningText | undefined> {
  const db = await getDB();
  const text = await db.get(STORE_NAME, id);
  console.log('📖 Текст загружен:', id);
  return text;
}

export async function loadAllTexts(): Promise<LearningText[]> {
  const db = await getDB();
  const texts = await db.getAll(STORE_NAME);
  // Сортируем по дате обновления (новые сверху)
  return texts.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function deleteText(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
  console.log('🗑 Текст удалён:', id);
}

export function createNewText(japanese: string, russian: string): LearningText {
  const now = new Date().toISOString();
  return {
    id: `text-${Date.now()}`,
    japanese,
    russian,
    createdAt: now,
    updatedAt: now,
  };
}
