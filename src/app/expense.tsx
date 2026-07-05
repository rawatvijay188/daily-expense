import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { type CSSProperties, useEffect, useLayoutEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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

import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_CATEGORIES,
} from '@/constants/categories';
import { getExpense } from '@/db/expenses';
import { formatDateKey, todayKey, toDateKey } from '@/lib/dates';
import { useCategories } from '@/store/categories';
import { useExpenses } from '@/store/expenses';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function ExpenseScreen() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const { create, edit, remove } = useExpenses();
  const categories = useCategories((s) => s.categories);
  const createCategory = useCategories((s) => s.create);

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORIES[0].id);
  const [note, setNote] = useState('');
  const [dateKey, setDateKey] = useState(todayKey());
  const [showPicker, setShowPicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // New-category dialog state.
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState(CATEGORY_ICONS[0]);
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0]);

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

  const webDateInputStyle: CSSProperties = {
    padding: 14,
    fontSize: 16,
    borderRadius: 8,
    border: `1px solid ${theme.colors.outline}`,
    color: theme.colors.onSurface,
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
  };

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

  const onCreateCategory = async () => {
    const name = newCatName.trim();
    if (!name) return;
    const category = await createCategory({ name, icon: newCatIcon, color: newCatColor });
    setCategoryId(category.id); // auto-select the new category
    setNewCatName('');
    setNewCatIcon(CATEGORY_ICONS[0]);
    setNewCatColor(CATEGORY_COLORS[0]);
    setCategoryDialog(false);
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
          {categories.map((c) => (
            <Chip
              key={c.id}
              selected={c.id === categoryId}
              showSelectedOverlay
              onPress={() => setCategoryId(c.id)}
              icon={c.icon}>
              {c.name}
            </Chip>
          ))}
          <Chip icon="plus" mode="outlined" onPress={() => setCategoryDialog(true)}>
            New
          </Chip>
        </View>

        <Text variant="labelLarge" style={styles.label}>
          Date
        </Text>
        {Platform.OS === 'web' ? (
          // The native date picker isn't supported on web, so use the
          // browser's built-in date input (value format matches our dateKey).
          <input
            type="date"
            value={dateKey}
            onChange={(e) => {
              if (e.target.value) setDateKey(e.target.value);
            }}
            style={webDateInputStyle}
          />
        ) : (
          <Button mode="outlined" icon="calendar" onPress={() => setShowPicker(true)}>
            {formatDateKey(dateKey)}
          </Button>
        )}

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

      {showPicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={new Date(dateKey)}
          mode="date"
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

        <Dialog visible={categoryDialog} onDismiss={() => setCategoryDialog(false)}>
          <Dialog.Title>New category</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.dialogScroll} keyboardShouldPersistTaps="handled">
              <TextInput
                mode="outlined"
                label="Name"
                value={newCatName}
                onChangeText={setNewCatName}
                autoFocus
              />

              <Text variant="labelLarge" style={styles.dialogLabel}>
                Icon
              </Text>
              <View style={styles.pickerGrid}>
                {CATEGORY_ICONS.map((ic) => (
                  <Pressable
                    key={ic}
                    onPress={() => setNewCatIcon(ic)}
                    style={[
                      styles.iconOption,
                      {
                        backgroundColor: theme.colors.surfaceVariant,
                        borderColor: newCatIcon === ic ? newCatColor : 'transparent',
                      },
                    ]}>
                    <MaterialCommunityIcons
                      name={ic as IconName}
                      size={22}
                      color={newCatIcon === ic ? newCatColor : theme.colors.onSurface}
                    />
                  </Pressable>
                ))}
              </View>

              <Text variant="labelLarge" style={styles.dialogLabel}>
                Color
              </Text>
              <View style={styles.pickerGrid}>
                {CATEGORY_COLORS.map((col) => (
                  <Pressable
                    key={col}
                    onPress={() => setNewCatColor(col)}
                    style={[
                      styles.colorOption,
                      {
                        backgroundColor: col,
                        borderColor: newCatColor === col ? theme.colors.onSurface : 'transparent',
                      },
                    ]}
                  />
                ))}
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setCategoryDialog(false)}>Cancel</Button>
            <Button onPress={onCreateCategory} disabled={!newCatName.trim()}>
              Add
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
  note: { marginTop: 16 },
  save: { marginTop: 24 },
  saveContent: { paddingVertical: 6 },
  dialogScroll: { paddingBottom: 8 },
  dialogLabel: { marginTop: 20, marginBottom: 10 },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconOption: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOption: { width: 38, height: 38, borderRadius: 19, borderWidth: 3 },
});
