import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthContext';

export default function LoginScreen() {
  const theme = useTheme();
  const { signInWithGoogle, continueOffline, signingIn, googleConfigured } = useAuth();

  const onGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch {
      // Errors surface via the button re-enabling; keep the screen simple.
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.hero}>
        <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
          <MaterialCommunityIcons name="wallet-outline" size={48} color="#fff" />
        </View>
        <Text variant="headlineMedium" style={styles.title}>
          Daily Expense
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          Track what you spend, every day. Your data stays on your device.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="google"
          onPress={onGoogle}
          loading={signingIn}
          disabled={signingIn || !googleConfigured}
          contentStyle={styles.buttonContent}>
          Sign in with Google
        </Button>

        {!googleConfigured && (
          <Card mode="contained" style={styles.notice}>
            <Card.Content>
              <Text variant="titleSmall">Google Sign-In not configured yet</Text>
              <Text variant="bodySmall" style={{ marginTop: 4 }}>
                Add your OAuth Web client ID in src/auth/config.ts to enable Google
                sign-in. For now you can continue in offline mode.
              </Text>
            </Card.Content>
          </Card>
        )}

        <Button mode="text" onPress={continueOffline} disabled={signingIn}>
          Continue without signing in
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 24 },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontWeight: '700' },
  actions: { gap: 12, paddingBottom: 12 },
  buttonContent: { paddingVertical: 6 },
  notice: { marginTop: 4 },
});
