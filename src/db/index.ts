import * as SQLite from 'expo-sqlite';

import { DEFAULT_CATEGORIES } from '@/constants/categories';

const DB_NAME = 'daily-expense.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Returns a memoized, initialized database connection. The schema is created
 * and default categories are seeded exactly once per app launch.
 */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await migrate(db);
      return db;
    })();
  }
  return dbPromise;
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id    TEXT PRIMARY KEY NOT NULL,
      name  TEXT NOT NULL,
      icon  TEXT NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id          TEXT PRIMARY KEY NOT NULL,
      amount      REAL NOT NULL,
      category_id TEXT NOT NULL,
      note        TEXT,
      spent_at    TEXT NOT NULL,   -- 'YYYY-MM-DD'
      created_at  TEXT NOT NULL    -- ISO timestamp
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_spent_at ON expenses (spent_at);
  `);

  // Seed default categories (id is stable, so this is idempotent).
  for (const c of DEFAULT_CATEGORIES) {
    await db.runAsync(
      'INSERT OR IGNORE INTO categories (id, name, icon, color) VALUES (?, ?, ?, ?)',
      [c.id, c.name, c.icon, c.color],
    );
  }
}

/** Deletes every expense. Categories are preserved. */
export async function clearAllExpenses(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM expenses');
}
