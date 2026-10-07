"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import testUsers from "../../../fixtures/test-users.json";

/**
 * Demo sign-in for local dev and Vercel previews (spec 003 replaces it with Supabase Auth:
 * email link + Google). Only the seeded test accounts can sign in; favorites are kept in
 * this browser. Production shows no sign-in until real auth exists.
 */
export type User = { email: string; name: string; role: "member" | "owner" };

type AuthState = {
  enabled: boolean;
  user: User | null;
  ready: boolean;
  signIn: (email: string) => { ok: true } | { ok: false; error: string };
  signOut: () => void;
  favorites: string[];
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
};

const AuthContext = createContext<AuthState | null>(null);
const USER_KEY = "gh-demo-user";
const favKey = (email: string) => `gh-favorites:${email}`;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) — state still works for this visit */
  }
}

export default function AuthProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (enabled) {
      const stored = read<User | null>(USER_KEY, null);
      // Restoring a session from storage after mount is synchronizing with an external system.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(stored);
      setFavorites(stored ? read<string[]>(favKey(stored.email), []) : []);
    }
    setReady(true);
  }, [enabled]);

  const signIn = useCallback(
    (email: string) => {
      if (!enabled) return { ok: false as const, error: "Sign-in isn't available yet." };
      const match = (testUsers.users as User[]).find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!match) {
        return { ok: false as const, error: "In this preview only the test accounts can sign in." };
      }
      write(USER_KEY, match);
      setUser(match);
      setFavorites(read<string[]>(favKey(match.email), []));
      return { ok: true as const };
    },
    [enabled],
  );

  const signOut = useCallback(() => {
    write(USER_KEY, null);
    setUser(null);
    setFavorites([]);
  }, []);

  const toggleFavorite = useCallback(
    (slug: string) => {
      if (!user) return;
      setFavorites((prev) => {
        const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
        write(favKey(user.email), next);
        return next;
      });
    },
    [user],
  );

  const value = useMemo<AuthState>(
    () => ({
      enabled,
      user,
      ready,
      signIn,
      signOut,
      favorites,
      isFavorite: (slug) => favorites.includes(slug),
      toggleFavorite,
    }),
    [enabled, user, ready, signIn, signOut, favorites, toggleFavorite],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
