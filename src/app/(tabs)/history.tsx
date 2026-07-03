import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { Divider, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ExpenseRow } from '@/components/ExpenseRow';
import { Expense } from '@/db/expenses';
import { dayRange, formatDateKey, monthRange, weekRange } from '@/lib/dates';
import { formatMoney } from '@/lib/format';
import { useExpenses } from '@/store/expenses';
import { useSettings } from '@/store/settings';

type Period = 'day' | 'week' | 'month' | 'all';

export default function HistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { expenses } = useExpenses();
  const currency = useSettings((s) => s.currency);
  const [period, setPeriod] = useState<Period>('month');

  const { sections, total } = useMemo(() => {
    const range =
      period === 'day'
        ? dayRange()
        : period === 'week'
          ? weekRange()
          : period === 'month'
            ? monthRange()
            : null;

    const filtered = range
      ? expenses.filter((e) => e.spent_at >= range.from && e.spent_at <= range.to)
      : expenses;

    const sum = filtered.reduce((acc, e) => acc + e.amount, 0);

    // Group by date (expenses already sorted newest first).
    const groups: { title: string; key: string; data: Expense[] }[] = [];
    const index = new Map<string, number>();
    for (const e of filtered) {
      if (!index.has(e.spent_at)) {
        index.set(e.spent_at, groups.length);
        groups.push({ title: formatDateKey(e.spent_at), key: e.spent_at, data: [] });
      }
      groups[index.get(e.spent_at)!].data.push(e);
    }
    return { sections: groups, total: sum };
  }, [expenses, period]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          History
        </Text>
        <SegmentedButtons
          value={period}
          onValueChange={(v) => setPeriod(v as Period)}
          buttons={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'all', label: 'All' },
          ]}
        />
        <View style={styles.totalRow}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Total
          </Text>
          <Text variant="titleLarge" style={styles.total}>
            {formatMoney(total, currency)}
          </Text>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={sections.length ? styles.list : styles.emptyList}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-blank-outline"
            title="Nothing here"
            subtitle="No expenses recorded for this period."
          />
        }
        renderSectionHeader={({ section }) => (
          <Text
            variant="labelLarge"
            style={[styles.sectionHeader, { color: theme.colors.onSurfaceVariant }]}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <ExpenseRow
            expense={item}
            currency={currency}
            onPress={() => router.push({ pathname: '/expense', params: { id: item.id } })}
          />
        )}
        ItemSeparatorComponent={Divider}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, gap: 12 },
  title: { fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  total: { fontWeight: '700' },
  list: { paddingBottom: 32 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
});
