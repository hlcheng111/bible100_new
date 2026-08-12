import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ensureFirebaseAuth, isFirebaseConfigured } from '../firebase/client';

export type AuthUser = { uid: string; email?: string | null };

interface AuthContextValue {
  user: AuthUser | null;
  userId: string;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const GUEST_ID = 'guest-local';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    let unsub: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const auth = await ensureFirebaseAuth();
      if (cancelled || !auth) {
        if (!cancelled) setLoading(false);
        return;
      }
      const { onAuthStateChanged } = await import('firebase/auth');
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u ? { uid: u.uid, email: u.email } : null);
        setIsGuest(false);
        setLoading(false);
      });
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = await ensureFirebaseAuth();
    if (!auth) throw new Error('Firebase not configured');
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const auth = await ensureFirebaseAuth();
    if (!auth) throw new Error('Firebase not configured');
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const signOut = useCallback(async () => {
    const auth = await ensureFirebaseAuth();
    if (auth) {
      const { signOut: fbSignOut } = await import('firebase/auth');
      await fbSignOut(auth);
    }
    setIsGuest(false);
  }, []);

  const continueAsGuest = useCallback(() => {
    setIsGuest(true);
    setUser(null);
    setLoading(false);
  }, []);

  const userId = user?.uid ?? (isGuest ? GUEST_ID : '');

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        loading,
        isGuest,
        signIn,
        signUp,
        signOut,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useFirebaseAvailable() {
  return isFirebaseConfigured();
}
