import { create } from 'zustand';

import {
  addExpense,
  deleteExpense,
  Expense,
  listExpenses,
  NewExpense,
  updateExpense,
} from '@/db/expenses';

type ExpensesState = {
  expenses: Expense[];
  loading: boolean;
  loaded: boolean;
  refresh: () => Promise<void>;
  create: (input: NewExpense) => Promise<void>;
  edit: (id: string, input: NewExpense) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

/**
 * In-memory cache of all expenses, backed by SQLite. Screens read from
 * `expenses` and derive their own ranges/aggregates; mutations write to the
 * DB and then refresh the cache so every screen stays in sync.
 */
export const useExpenses = create<ExpensesState>((set, get) => ({
  expenses: [],
  loading: false,
  loaded: false,
  refresh: async () => {
    set({ loading: true });
    const expenses = await listExpenses();
    set({ expenses, loading: false, loaded: true });
  },
  create: async (input) => {
    await addExpense(input);
    await get().refresh();
  },
  edit: async (id, input) => {
    await updateExpense(id, input);
    await get().refresh();
  },
  remove: async (id) => {
    await deleteExpense(id);
    await get().refresh();
  },
}));
