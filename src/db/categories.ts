import * as Crypto from 'expo-crypto';

import { Category } from '@/constants/categories';
import { getDb } from '@/db';

export type NewCategory = {
  name: string;
  icon: string;
  color: string;
};

/** All categories (seeded defaults first, then custom ones by creation order). */
export async function listCategories(): Promise<Category[]> {
  const db = await getDb();
  return db.getAllAsync<Category>('SELECT id, name, icon, color FROM categories ORDER BY rowid ASC');
}

export async function addCategory(input: NewCategory): Promise<Category> {
  const db = await getDb();
  const category: Category = {
    id: Crypto.randomUUID(),
    name: input.name.trim(),
    icon: input.icon,
    color: input.color,
  };
  await db.runAsync(
    'INSERT INTO categories (id, name, icon, color) VALUES (?, ?, ?, ?)',
    [category.id, category.name, category.icon, category.color],
  );
  return category;
}
