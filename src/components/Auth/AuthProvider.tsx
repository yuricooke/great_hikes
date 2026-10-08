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
  /** Email + password. Seeded test accounts sign in without a password in dev/previews. */
  signIn: (email: string, password: string) => Promise<SignInResult>;
  /** Create an account; usually needs the email confirmed before the first sign-in. */
  signUp: (email: string, password: string, name: string, next?: string) => Promise<SignInResult>;
  /** Send a reset link that lands on /account/password. */
  resetPassword: (email: string) => Promise<SignInResult>;
  updatePassword: (password: string) => Promise<SignInResult>;
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

/** Minimum password rules (Supabase enforces its own as well). */
export function passwordProblem(password: string): string | null {
  if (password.length < 10) return "Use at least 10 characters.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return "Mix letters and numbers.";
  return null;
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
    async (rawEmail: string, password: string): Promise<SignInResult> => {
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

      if (!password) return { ok: false, error: "Enter your password." };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.code === "email_not_confirmed") {
          return { ok: false, error: "Please confirm your email first — check your inbox for our link." };
        }
        if (error.status === 429) return { ok: false, error: "Too many attempts — please wait a minute and try again." };
        return { ok: false, error: "Email or password is incorrect." };
      }
      return { ok: true };
    },
    [mode, supabase, testLogin],
  );

  const signUp = useCallback(
    async (rawEmail: string, password: string, name: string, next?: string): Promise<SignInResult> => {
      const email = rawEmail.trim().toLowerCase();
      if (!supabase) return { ok: false, error: "Accounts aren't available right now." };
      if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
      if (name.trim().length < 2) return { ok: false, error: "Tell us your name (it's shown on your reviews)." };
      const weak = passwordProblem(password);
      if (weak) return { ok: false, error: weak };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callbackUrl(next), data: { name: name.trim() } },
      });
      if (error) {
        if (error.code === "user_already_exists") return { ok: false, error: "There's already an account with this email — sign in instead." };
        if (error.code === "weak_password") return { ok: false, error: "Choose a stronger password." };
        if (error.status === 429) return { ok: false, error: "Too many attempts — please wait a minute and try again." };
        return { ok: false, error: "We couldn't create your account. Please try again." };
      }
      // With email confirmation on, there's no session until the link is clicked.
      return data.session ? { ok: true } : { ok: true, emailSent: true };
    },
    [supabase],
  );

  const resetPassword = useCallback(
    async (rawEmail: string): Promise<SignInResult> => {
      const email = rawEmail.trim().toLowerCase();
      if (!supabase) return { ok: false, error: "Accounts aren't available right now." };
      if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callbackUrl("/account/password") });
      if (error?.status === 429) return { ok: false, error: "Too many attempts — please wait a minute and try again." };
      // Same answer whether or not the account exists (don't reveal who has an account).
      return { ok: true, emailSent: true };
    },
    [supabase],
  );

  const updatePassword = useCallback(
    async (password: string): Promise<SignInResult> => {
      if (!supabase) return { ok: false, error: "Accounts aren't available right now." };
      const weak = passwordProblem(password);
      if (weak) return { ok: false, error: weak };
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        if (error.code === "same_password") return { ok: false, error: "Choose a password you haven't used here before." };
        return { ok: false, error: "Your reset link has expired — request a new one." };
      }
      return { ok: true };
    },
    [supabase],
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
      signUp,
      resetPassword,
      updatePassword,
      signInWithGoogle,
      signOut,
      favorites,
      isFavorite: (slug) => favorites.includes(slug),
      toggleFavorite,
    }),
    [mode, google, testLogin, user, ready, signIn, signUp, resetPassword, updatePassword, signInWithGoogle, signOut, favorites, toggleFavorite],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
