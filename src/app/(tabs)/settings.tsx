import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Dialog,
  Divider,
  List,
  Portal,
  RadioButton,
  Text,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthContext';
import { clearAllExpenses } from '@/db';
import { CURRENCIES, currencyByCode } from '@/lib/format';
import { useExpenses } from '@/store/expenses';
import { useSettings } from '@/store/settings';

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const { currency, setCurrency } = useSettings();
  const refresh = useExpenses((s) => s.refresh);

  const [currencyDialog, setCurrencyDialog] = useState(false);
  const [clearDialog, setClearDialog] = useState(false);

  const initials = (user?.name ?? user?.email ?? 'G').slice(0, 1).toUpperCase();

  const onClearData = async () => {
    await clearAllExpenses();
    await refresh();
    setClearDialog(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Settings
        </Text>

        <View style={styles.profile}>
          {user?.photo ? (
            <Avatar.Image size={56} source={{ uri: user.photo }} />
          ) : (
            <Avatar.Text size={56} label={initials} />
          )}
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium">{user?.name ?? 'Guest'}</Text>
            {user?.email ? (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {user.email}
              </Text>
            ) : (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Signed in offline
              </Text>
            )}
          </View>
        </View>

        <Divider style={styles.divider} />

        <List.Item
          title="Currency"
          description={`${currencyByCode(currency).label} (${currencyByCode(currency).symbol})`}
          left={(props) => <List.Icon {...props} icon="currency-usd" />}
          onPress={() => setCurrencyDialog(true)}
        />
        <List.Item
          title="Clear all expenses"
          description="Permanently delete every recorded expense"
          left={(props) => <List.Icon {...props} icon="delete-outline" color={theme.colors.error} />}
          onPress={() => setClearDialog(true)}
        />

        <Divider style={styles.divider} />

        <Button
          mode="outlined"
          icon="logout"
          onPress={signOut}
          style={styles.signOut}
          textColor={theme.colors.error}>
          Sign out
        </Button>

        <Text variant="bodySmall" style={styles.version}>
          Daily Expense v1.0.0
        </Text>
      </ScrollView>

      <Portal>
        <Dialog visible={currencyDialog} onDismiss={() => setCurrencyDialog(false)}>
          <Dialog.Title>Currency</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <RadioButton.Group
                value={currency}
                onValueChange={async (v) => {
                  await setCurrency(v);
                  setCurrencyDialog(false);
                }}>
                {CURRENCIES.map((c) => (
                  <RadioButton.Item key={c.code} label={`${c.label} (${c.symbol})`} value={c.code} />
                ))}
              </RadioButton.Group>
            </ScrollView>
          </Dialog.ScrollArea>
        </Dialog>

        <Dialog visible={clearDialog} onDismiss={() => setClearDialog(false)}>
          <Dialog.Title>Clear all expenses?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This permanently deletes every expense on this device. This cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setClearDialog(false)}>Cancel</Button>
            <Button textColor={theme.colors.error} onPress={onClearData}>
              Delete all
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  title: { fontWeight: '700', marginBottom: 16 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  divider: { marginVertical: 12 },
  signOut: { marginTop: 8 },
  version: { textAlign: 'center', marginTop: 24, opacity: 0.5 },
});
