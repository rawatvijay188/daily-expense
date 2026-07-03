import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { isGoogleConfigured, WEB_CLIENT_ID } from '@/auth/config';

export type AppUser = {
  id: string;
  name: string | null;
  email: string | null;
  photo: string | null;
};

type AuthContextValue = {
  user: AppUser | null;
  initializing: boolean;
  signingIn: boolean;
  googleConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  /** Local-only "demo" sign in, used when Google isn't configured yet. */
  continueOffline: () => Promise<void>;
  signOut: () => Promise<void>;
};

const STORAGE_KEY = 'auth.user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

if (isGoogleConfigured()) {
  GoogleSignin.configure({ webClientId: WEB_CLIENT_ID, offlineAccess: false });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  // Restore a persisted session on launch so returning users skip the login screen.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw) as AppUser);
      } catch {
        // ignore corrupt storage
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: AppUser | null) => {
    setUser(next);
    if (next) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setSigningIn(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      // google-signin v13+ returns { type, data }; older returns the user directly.
      const info = 'data' in response ? response.data : (response as any);
      if (!info) return; // cancelled
      await persist({
        id: info.user.id,
        name: info.user.name ?? null,
        email: info.user.email ?? null,
        photo: info.user.photo ?? null,
      });
    } catch (err: any) {
      if (err?.code === statusCodes.SIGN_IN_CANCELLED) return;
      throw err;
    } finally {
      setSigningIn(false);
    }
  }, [persist]);

  const continueOffline = useCallback(async () => {
    await persist({ id: 'offline', name: 'Guest', email: null, photo: null });
  }, [persist]);

  const signOut = useCallback(async () => {
    try {
      if (isGoogleConfigured()) await GoogleSignin.signOut();
    } catch {
      // ignore – still clear the local session
    }
    await persist(null);
  }, [persist]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      signingIn,
      googleConfigured: isGoogleConfigured(),
      signInWithGoogle,
      continueOffline,
      signOut,
    }),
    [user, initializing, signingIn, signInWithGoogle, continueOffline, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
