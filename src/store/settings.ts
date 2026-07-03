import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { create } from 'zustand';

import { CURRENCIES } from '@/lib/format';

const STORAGE_KEY = 'settings.currency';

function deviceDefaultCurrency(): string {
  try {
    const code = getLocales()[0]?.currencyCode;
    if (code && CURRENCIES.some((c) => c.code === code)) return code;
  } catch {
    // ignore – fall through to default
  }
  return CURRENCIES[0].code;
}

type SettingsState = {
  currency: string;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setCurrency: (code: string) => Promise<void>;
};

export const useSettings = create<SettingsState>((set) => ({
  currency: CURRENCIES[0].code,
  hydrated: false,
  hydrate: async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    set({ currency: stored ?? deviceDefaultCurrency(), hydrated: true });
  },
  setCurrency: async (code: string) => {
    set({ currency: code });
    await AsyncStorage.setItem(STORAGE_KEY, code);
  },
}));
