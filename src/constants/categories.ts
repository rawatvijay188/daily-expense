/**
 * Default expense categories seeded into the database on first launch.
 * `icon` values are MaterialCommunityIcons names (via @expo/vector-icons).
 */
export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Drink', icon: 'silverware-fork-knife', color: '#EF5350' },
  { id: 'transport', name: 'Transport', icon: 'bus', color: '#42A5F5' },
  { id: 'groceries', name: 'Groceries', icon: 'cart', color: '#66BB6A' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'file-document-outline', color: '#FFA726' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping', color: '#AB47BC' },
  { id: 'health', name: 'Health', icon: 'heart-pulse', color: '#EC407A' },
  { id: 'entertainment', name: 'Entertainment', icon: 'movie-open', color: '#26C6DA' },
  { id: 'other', name: 'Other', icon: 'dots-horizontal', color: '#78909C' },
];

export function getCategory(id: string): Category {
  return DEFAULT_CATEGORIES.find((c) => c.id === id) ?? DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
}

/** Icon choices (MaterialCommunityIcons names) offered when creating a category. */
export const CATEGORY_ICONS: string[] = [
  'tag',
  'silverware-fork-knife',
  'bus',
  'cart',
  'file-document-outline',
  'shopping',
  'heart-pulse',
  'movie-open',
  'home',
  'airplane',
  'gift',
  'coffee',
  'cellphone',
  'school',
  'dumbbell',
  'paw',
  'gas-station',
  'music',
  'baby-carriage',
  'cash',
];

/** Color swatches offered when creating a category. */
export const CATEGORY_COLORS: string[] = [
  '#EF5350',
  '#42A5F5',
  '#66BB6A',
  '#FFA726',
  '#AB47BC',
  '#EC407A',
  '#26C6DA',
  '#78909C',
  '#8D6E63',
  '#5C6BC0',
  '#26A69A',
  '#D4AC0D',
];
