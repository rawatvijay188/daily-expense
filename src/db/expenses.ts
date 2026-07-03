import * as Crypto from 'expo-crypto';

import { getDb } from '@/db';

export type Expense = {
  id: string;
  amount: number;
  category_id: string;
  note: string | null;
  spent_at: string; // 'YYYY-MM-DD'
  created_at: string; // ISO timestamp
};

export type NewExpense = {
  amount: number;
  category_id: string;
  note?: string | null;
  spent_at: string;
};

export type CategoryTotal = {
  category_id: string;
  total: number;
};

export type DailyTotal = {
  spent_at: string;
  total: number;
};

export async function addExpense(input: NewExpense): Promise<Expense> {
  const db = await getDb();
  const expense: Expense = {
    id: Crypto.randomUUID(),
    amount: input.amount,
    category_id: input.category_id,
    note: input.note?.trim() ? input.note.trim() : null,
    spent_at: input.spent_at,
    created_at: new Date().toISOString(),
  };
  await db.runAsync(
    'INSERT INTO expenses (id, amount, category_id, note, spent_at, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [expense.id, expense.amount, expense.category_id, expense.note, expense.spent_at, expense.created_at],
  );
  return expense;
}

export async function updateExpense(
  id: string,
  input: NewExpense,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE expenses SET amount = ?, category_id = ?, note = ?, spent_at = ? WHERE id = ?',
    [input.amount, input.category_id, input.note?.trim() ? input.note.trim() : null, input.spent_at, id],
  );
}

export async function deleteExpense(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
}

export async function getExpense(id: string): Promise<Expense | null> {
  const db = await getDb();
  return db.getFirstAsync<Expense>('SELECT * FROM expenses WHERE id = ?', [id]);
}

/**
 * Lists expenses, optionally within an inclusive [from, to] date range.
 * Ordered newest first (by spent_at, then created_at).
 */
export async function listExpenses(range?: {
  from?: string;
  to?: string;
}): Promise<Expense[]> {
  const db = await getDb();
  const clauses: string[] = [];
  const params: string[] = [];
  if (range?.from) {
    clauses.push('spent_at >= ?');
    params.push(range.from);
  }
  if (range?.to) {
    clauses.push('spent_at <= ?');
    params.push(range.to);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return db.getAllAsync<Expense>(
    `SELECT * FROM expenses ${where} ORDER BY spent_at DESC, created_at DESC`,
    params,
  );
}

/** Sum of expense amounts within an inclusive [from, to] date range. */
export async function sumInRange(from: string, to: string): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(amount) AS total FROM expenses WHERE spent_at >= ? AND spent_at <= ?',
    [from, to],
  );
  return row?.total ?? 0;
}

/** Totals grouped by category within an inclusive [from, to] date range. */
export async function totalsByCategory(
  from: string,
  to: string,
): Promise<CategoryTotal[]> {
  const db = await getDb();
  return db.getAllAsync<CategoryTotal>(
    `SELECT category_id, SUM(amount) AS total
       FROM expenses
      WHERE spent_at >= ? AND spent_at <= ?
      GROUP BY category_id
      ORDER BY total DESC`,
    [from, to],
  );
}

/** Per-day totals within an inclusive [from, to] date range. */
export async function dailyTotals(
  from: string,
  to: string,
): Promise<DailyTotal[]> {
  const db = await getDb();
  return db.getAllAsync<DailyTotal>(
    `SELECT spent_at, SUM(amount) AS total
       FROM expenses
      WHERE spent_at >= ? AND spent_at <= ?
      GROUP BY spent_at
      ORDER BY spent_at ASC`,
    [from, to],
  );
}
