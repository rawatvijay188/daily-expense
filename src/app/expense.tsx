import DateTimePicker from '@react-native-community/datetimepicker';
import { subDays } from 'date-fns';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Chip,
  Dialog,
  HelperText,
  Portal,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { getExpense } from '@/db/expenses';
import { formatDateKey, todayKey, toDateKey } from '@/lib/dates';
import { useExpenses } from '@/store/expenses';

export default function ExpenseScreen() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const { create, edit, remove } = useExpenses();

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORIES[0].id);
  const [note, setNote] = useState('');
  const [dateKey, setDateKey] = useState(todayKey());
  const [showPicker, setShowPicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit expense' : 'Add expense' });
  }, [navigation, isEditing]);

  // Load the existing expense when editing.
  useEffect(() => {
    if (!id) return;
    (async () => {
      const existing = await getExpense(id);
      if (existing) {
        setAmount(String(existing.amount));
        setCategoryId(existing.category_id);
        setNote(existing.note ?? '');
        setDateKey(existing.spent_at);
      }
    })();
  }, [id]);

  const parsedAmount = Number(amount.replace(',', '.'));
  const amountValid = amount.trim() !== '' && !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const yesterdayKey = toDateKey(subDays(new Date(), 1));

  const onSave = async () => {
    setSubmitted(true);
    if (!amountValid) return;
    const payload = {
      amount: Math.round(parsedAmount * 100) / 100,
      category_id: categoryId,
      note: note,
      spent_at: dateKey,
    };
    if (isEditing && id) await edit(id, payload);
    else await create(payload);
    router.back();
  };

  const onDelete = async () => {
    if (id) await remove(id);
    setConfirmDelete(false);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextInput
          mode="outlined"
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          autoFocus={!isEditing}
          left={<TextInput.Icon icon="cash" />}
          error={submitted && !amountValid}
        />
        <HelperText type="error" visible={submitted && !amountValid}>
          Enter an amount greater than zero.
        </HelperText>

        <Text variant="labelLarge" style={styles.label}>
          Category
        </Text>
        <View style={styles.chips}>
          {DEFAULT_CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              selected={c.id === categoryId}
              showSelectedOverlay
              onPress={() => setCategoryId(c.id)}
              icon={c.icon}>
              {c.name}
            </Chip>
          ))}
        </View>

        <Text variant="labelLarge" style={styles.label}>
          Date
        </Text>
        <View style={styles.dateChips}>
          <Chip
            selected={dateKey === todayKey()}
            showSelectedOverlay
            onPress={() => setDateKey(todayKey())}>
            Today
          </Chip>
          <Chip
            selected={dateKey === yesterdayKey}
            showSelectedOverlay
            onPress={() => setDateKey(yesterdayKey)}>
            Yesterday
          </Chip>
        </View>
        <Button
          mode="outlined"
          icon="calendar"
          onPress={() => setShowPicker(true)}
          style={styles.dateButton}>
          {formatDateKey(dateKey)}
        </Button>

        <TextInput
          mode="outlined"
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          style={styles.note}
          left={<TextInput.Icon icon="text" />}
        />

        <Button mode="contained" onPress={onSave} style={styles.save} contentStyle={styles.saveContent}>
          {isEditing ? 'Save changes' : 'Add expense'}
        </Button>

        {isEditing && (
          <Button
            mode="text"
            textColor={theme.colors.error}
            icon="delete-outline"
            onPress={() => setConfirmDelete(true)}>
            Delete expense
          </Button>
        )}
      </ScrollView>

      {showPicker && (
        <DateTimePicker
          value={new Date(dateKey)}
          mode="date"
          maximumDate={new Date()}
          onChange={(event, selected) => {
            setShowPicker(Platform.OS === 'ios');
            if (event.type === 'set' && selected) setDateKey(toDateKey(selected));
          }}
        />
      )}

      <Portal>
        <Dialog visible={confirmDelete} onDismiss={() => setConfirmDelete(false)}>
          <Dialog.Title>Delete expense?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This can&apos;t be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDelete(false)}>Cancel</Button>
            <Button textColor={theme.colors.error} onPress={onDelete}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  label: { marginTop: 8, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dateChips: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  dateButton: { alignSelf: 'flex-start' },
  note: { marginTop: 16 },
  save: { marginTop: 24 },
  saveContent: { paddingVertical: 6 },
});
