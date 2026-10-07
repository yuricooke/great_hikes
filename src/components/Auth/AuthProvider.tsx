"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import testUsers from "../../../fixtures/test-users.json";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * Sign-in and favorites.
 * - "supabase": real accounts (email link + Google), favorites in the `favorites` table.
 *   In local dev and previews the seeded test accounts sign in without email (/auth/test-login).
 * - "demo": no Supabase configured (CI, fresh clones) — test accounts only, favorites in this browser.
 * - "off": production without real auth — no sign-in shown.
 */
export type AuthMode = "supabase" | "demo" | "off";
export type User = { id?: string; email: string; name: string; role: "member" | "owner" };
export type SignInResult = { ok: true; emailSent?: boolean } | { ok: false; error: string };

type AuthState = {
  enabled: boolean;
  mode: AuthMode;
  google: boolean;
  /** Seeded test accounts sign in without email here. */
  testLogin: boolean;
  user: User | null;
  ready: boolean;
  signIn: (email: string, next?: string) => Promise<SignInResult>;
  signInWithGoogle: (next?: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  favorites: string[];
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
};

const AuthContext = createContext<AuthState | null>(null);
const USER_KEY = "gh-demo-user";
const favKey = (email: string) => `gh-favorites:${email}`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEST_USERS = testUsers.users as User[];

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

function callbackUrl(next = "/favorites") {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

async function loadAccount(supabase: SupabaseClient, id: string, email: string) {
  const [{ data: profile }, { data: favs }] = await Promise.all([
    supabase.from("profiles").select("display_name, role").eq("id", id).maybeSingle(),
    supabase.from("favorites").select("hike_slug").order("created_at"),
  ]);
  const user: User = {
    id,
    email,
    name: profile?.display_name || email.split("@")[0],
    role: profile?.role === "owner" ? "owner" : "member",
  };
  return { user, favorites: (favs ?? []).map((f) => f.hike_slug as string) };
}

export default function AuthProvider({
  mode,
  testLogin,
  google = false,
  children,
}: {
  mode: AuthMode;
  /** Test accounts may sign in without email (local dev and previews only). */
  testLogin: boolean;
  google?: boolean;
  children: ReactNode;
}) {
  const [supabase] = useState(() => (mode === "supabase" ? supabaseBrowser() : null));
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(mode === "off");

  useEffect(() => {
    if (mode === "demo") {
      const stored = read<User | null>(USER_KEY, null);
      // Restoring a session from storage after mount is synchronizing with an external system.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(stored);
      setFavorites(stored ? read<string[]>(favKey(stored.email), []) : []);
      setReady(true);
      return;
    }
    if (!supabase) {
      setReady(true);
      return;
    }
    let active = true;
    const sync = async (id: string | undefined, email: string | undefined) => {
      if (!id || !email) {
        if (!active) return;
        setUser(null);
        setFavorites([]);
        setReady(true);
        return;
      }
      const account = await loadAccount(supabase, id, email);
      if (!active) return;
      setUser(account.user);
      setFavorites(account.favorites);
      setReady(true);
    };
    supabase.auth.getUser().then(({ data }) => sync(data.user?.id, data.user?.email));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        // Deferred: Supabase forbids awaiting its own calls inside this callback.
        setTimeout(() => sync(session?.user.id, session?.user.email), 0);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [mode, supabase]);

  const signIn = useCallback(
    async (rawEmail: string, next?: string): Promise<SignInResult> => {
      const email = rawEmail.trim().toLowerCase();
      if (mode === "off") return { ok: false, error: "Sign-in isn't available yet." };
      if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
      const testUser = TEST_USERS.find((u) => u.email === email);

      if (mode === "demo") {
        if (!testUser) return { ok: false, error: "In this preview only the test accounts can sign in." };
        write(USER_KEY, testUser);
        setUser(testUser);
        setFavorites(read<string[]>(favKey(testUser.email), []));
        return { ok: true };
      }
      if (!supabase) return { ok: false, error: "Sign-in isn't available right now." };

      if (testUser && testLogin) {
        const res = await fetch("/auth/test-login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) return { ok: false, error: "Couldn't sign in the test account." };
        // The route set the session cookies; pick them up in this tab.
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const account = await loadAccount(supabase, data.user.id, email);
          setUser(account.user);
          setFavorites(account.favorites);
        }
        return { ok: true };
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callbackUrl(next) },
      });
      if (error) {
        return {
          ok: false,
          error: error.status === 429 ? "Too many attempts — please wait a minute and try again." : "We couldn't send the link. Please try again.",
        };
      }
      return { ok: true, emailSent: true };
    },
    [mode, supabase, testLogin],
  );

  const signInWithGoogle = useCallback(
    async (next?: string): Promise<SignInResult> => {
      if (!supabase || !google) return { ok: false, error: "Google sign-in isn't available yet." };
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl(next) },
      });
      return error ? { ok: false, error: "Couldn't reach Google. Please try again." } : { ok: true };
    },
    [supabase, google],
  );

  const signOut = useCallback(async () => {
    if (mode === "demo") write(USER_KEY, null);
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setFavorites([]);
  }, [mode, supabase]);

  const toggleFavorite = useCallback(
    (slug: string) => {
      if (!user) return;
      const saved = favorites.includes(slug);
      const next = saved ? favorites.filter((s) => s !== slug) : [...favorites, slug];
      setFavorites(next);
      if (mode === "demo") {
        write(favKey(user.email), next);
        return;
      }
      if (!supabase || !user.id) return;
      const request = saved
        ? supabase.from("favorites").delete().eq("user_id", user.id).eq("hike_slug", slug)
        : supabase.from("favorites").insert({ user_id: user.id, hike_slug: slug });
      request.then(({ error }) => {
        // Roll back the optimistic change if the database refused it.
        if (error) setFavorites((cur) => (saved ? [...cur, slug] : cur.filter((s) => s !== slug)));
      });
    },
    [user, favorites, mode, supabase],
  );

  const value = useMemo<AuthState>(
    () => ({
      enabled: mode !== "off",
      mode,
      google: google && mode === "supabase",
      testLogin: mode === "demo" || (mode === "supabase" && testLogin),
      user,
      ready,
      signIn,
      signInWithGoogle,
      signOut,
      favorites,
      isFavorite: (slug) => favorites.includes(slug),
      toggleFavorite,
    }),
    [mode, google, testLogin, user, ready, signIn, signInWithGoogle, signOut, favorites, toggleFavorite],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
