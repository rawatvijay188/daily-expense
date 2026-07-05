import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  Stack,
  ThemeProvider,
  useRouter,
  useSegments,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { useCategories } from '@/store/categories';
import { useExpenses } from '@/store/expenses';
import { useSettings } from '@/store/settings';
import { DarkTheme, LightTheme } from '@/theme/paper';

SplashScreen.preventAutoHideAsync();

/**
 * Routes the user between the auth stack and the app based on session state.
 * Also hydrates persisted settings and the expense cache once signed in.
 */
function RootNavigator() {
  const { user, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const hydrateSettings = useSettings((s) => s.hydrate);
  const refreshExpenses = useExpenses((s) => s.refresh);
  const refreshCategories = useCategories((s) => s.refresh);

  useEffect(() => {
    if (initializing) return;
    const inAuthGroup = segments[0] === 'login';
    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
    SplashScreen.hideAsync().catch(() => {});
  }, [user, initializing, segments, router]);

  useEffect(() => {
    if (user) {
      hydrateSettings();
      refreshExpenses();
      refreshCategories();
    }
  }, [user, hydrateSettings, refreshExpenses, refreshCategories]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen
        name="expense"
        options={{ presentation: 'modal', headerShown: true, title: 'Expense' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  // Keep React Navigation's colors in sync with the Paper theme so the screen
  // background and text follow light/dark mode (otherwise dark-mode text lands
  // on a light navigation background and looks faded).
  const navBase = isDark ? NavDarkTheme : NavLightTheme;
  const navTheme = {
    ...navBase,
    colors: {
      ...navBase.colors,
      background: theme.colors.background,
      card: theme.colors.elevation.level2,
      text: theme.colors.onSurface,
      border: theme.colors.outlineVariant,
      primary: theme.colors.primary,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider
          theme={theme}
          settings={{
            icon: (props) => <MaterialCommunityIcons {...props} />,
          }}>
          <ThemeProvider value={navTheme}>
            <AuthProvider>
              <StatusBar style={isDark ? 'light' : 'dark'} />
              <RootNavigator />
            </AuthProvider>
          </ThemeProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
