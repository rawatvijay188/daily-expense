import { create } from 'zustand';

import {
  Category,
  DEFAULT_CATEGORIES,
  getCategory as fallbackGetCategory,
} from '@/constants/categories';
import { addCategory, listCategories, NewCategory } from '@/db/categories';

type CategoriesState = {
  categories: Category[];
  loaded: boolean;
  refresh: () => Promise<void>;
  create: (input: NewCategory) => Promise<Category>;
};

/**
 * In-memory list of categories (defaults + user-created), backed by SQLite.
 * Falls back to DEFAULT_CATEGORIES until the DB has loaded.
 */
export const useCategories = create<CategoriesState>((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  loaded: false,
  refresh: async () => {
    const rows = await listCategories();
    set({ categories: rows.length ? rows : DEFAULT_CATEGORIES, loaded: true });
  },
  create: async (input) => {
    const category = await addCategory(input);
    await get().refresh();
    return category;
  },
}));

/** Resolve a category by id reactively, falling back to a default. */
export function useCategory(id: string): Category {
  const categories = useCategories((s) => s.categories);
  return categories.find((c) => c.id === id) ?? fallbackGetCategory(id);
}
