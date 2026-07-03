import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Divider, FAB, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthContext';
import { EmptyState } from '@/components/EmptyState';
import { ExpenseRow } from '@/components/ExpenseRow';
import { monthRange, todayKey } from '@/lib/dates';
import { formatMoney } from '@/lib/format';
import { useExpenses } from '@/store/expenses';
import { useSettings } from '@/store/settings';

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { expenses, loading, refresh } = useExpenses();
  const currency = useSettings((s) => s.currency);

  const { todayTotal, monthTotal, recent } = useMemo(() => {
    const today = todayKey();
    const { from, to } = monthRange();
    let todaySum = 0;
    let monthSum = 0;
    for (const e of expenses) {
      if (e.spent_at === today) todaySum += e.amount;
      if (e.spent_at >= from && e.spent_at <= to) monthSum += e.amount;
    }
    return { todayTotal: todaySum, monthTotal: monthSum, recent: expenses.slice(0, 8) };
  }, [expenses]);

  const firstName = user?.name?.split(' ')[0];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {firstName ? `Hi ${firstName} 👋` : 'Welcome 👋'}
        </Text>
        <Text variant="headlineSmall" style={styles.heading}>
          Your spending
        </Text>

        <View style={styles.summaryRow}>
          <SummaryCard label="Today" value={formatMoney(todayTotal, currency)} />
          <SummaryCard label="This month" value={formatMoney(monthTotal, currency)} />
        </View>

        <Card mode="contained" style={styles.listCard}>
          <Card.Title title="Recent" titleVariant="titleMedium" />
          {recent.length === 0 ? (
            <EmptyState
              icon="receipt"
              title="No expenses yet"
              subtitle="Tap + to add your first expense."
            />
          ) : (
            recent.map((e, i) => (
              <View key={e.id}>
                {i > 0 && <Divider />}
                <ExpenseRow
                  expense={e}
                  currency={currency}
                  onPress={() => router.push({ pathname: '/expense', params: { id: e.id } })}
                />
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      <FAB icon="plus" label="Add" style={styles.fab} onPress={() => router.push('/expense')} />
    </SafeAreaView>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <Card mode="contained" style={styles.summaryCard}>
      <Card.Content>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {label}
        </Text>
        <Text variant="headlineSmall" style={styles.summaryValue}>
          {value}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 96, gap: 8 },
  heading: { fontWeight: '700', marginBottom: 8 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  summaryCard: { flex: 1 },
  summaryValue: { fontWeight: '700', marginTop: 4 },
  listCard: { paddingBottom: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
