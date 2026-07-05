import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';

import { CategoryIcon } from '@/components/CategoryIcon';
import { Expense } from '@/db/expenses';
import { formatMoney } from '@/lib/format';
import { useCategory } from '@/store/categories';

type Props = {
  expense: Expense;
  currency: string;
  onPress?: () => void;
};

export function ExpenseRow({ expense, currency, onPress }: Props) {
  const category = useCategory(expense.category_id);
  return (
    <TouchableRipple onPress={onPress}>
      <View style={styles.row}>
        <CategoryIcon categoryId={expense.category_id} />
        <View style={styles.middle}>
          <Text variant="titleSmall">{category.name}</Text>
          {expense.note ? (
            <Text variant="bodySmall" numberOfLines={1} style={styles.note}>
              {expense.note}
            </Text>
          ) : null}
        </View>
        <Text variant="titleMedium" style={styles.amount}>
          {formatMoney(expense.amount, currency)}
        </Text>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  middle: { flex: 1 },
  note: { opacity: 0.6 },
  amount: { fontWeight: '700' },
});
