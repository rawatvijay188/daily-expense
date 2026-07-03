import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/auth/AuthContext';
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
    }
  }, [user, hydrateSettings, refreshExpenses]);

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
  const theme = scheme === 'dark' ? DarkTheme : LightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider
          theme={theme}
          settings={{
            icon: (props) => <MaterialCommunityIcons {...props} />,
          }}>
          <AuthProvider>
            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
            <RootNavigator />
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
