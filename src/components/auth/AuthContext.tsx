'use client';

// ============================================================================
// AuthContext — Mock Auth Provider (SaaS-ready, no OAuth dependencies)
// Provides: user state, signIn (modal), signOut, saved trips stub
// ============================================================================

import {
  createContext, useContext, useState, useCallback,
  useEffect, type ReactNode,
} from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  plan: 'free' | 'pro' | 'enterprise';
}

interface AuthContextValue {
  user: AuthUser | null;
  isSignInOpen: boolean;
  isLoading: boolean;
  openSignIn: () => void;
  closeSignIn: () => void;
  signIn: (email: string, name: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'aetheria_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openSignIn = useCallback(() => setIsSignInOpen(true), []);
  const closeSignIn = useCallback(() => setIsSignInOpen(false), []);

  const signIn = useCallback(async (email: string, name: string) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      avatarInitials: (name || email)
        .split(' ')
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() ?? '')
        .join(''),
      plan: 'pro',
    };
    setUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setIsSignInOpen(false);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isSignInOpen, isLoading, openSignIn, closeSignIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
