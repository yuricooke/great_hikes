"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import PillButton from "../PillButton/PillButton";
import { useAuth } from "./AuthProvider";
import styles from "./LoginForm.module.css";

/**
 * Passwordless sign-in (owner decision: email link + Google). In previews it signs the seeded
 * test accounts in directly; spec 003 sends a real email link via Supabase Auth.
 */
export default function LoginForm({ onDone }: { onDone?: () => void }) {
  const { enabled, user, signIn, signOut } = useAuth();
  const router = useRouter();
  const emailId = useId();
  const errorId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return (
      <div className={styles.form}>
        <h2 className={styles.title}>Welcome, {user.name}</h2>
        <p className={styles.lead}>You&apos;re signed in as {user.email}.</p>
        <div className={styles.actions}>
          <PillButton href="/favorites" variant="accent" icon="favorite" onClick={onDone}>
            My favorites
          </PillButton>
          <PillButton variant="outline" icon="logout" onClick={signOut}>
            Sign out
          </PillButton>
        </div>
      </div>
    );
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const result = signIn(email);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    if (onDone) onDone();
    else router.push("/favorites");
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <h2 className={styles.title}>Welcome back</h2>
      <p className={styles.lead}>Sign in to save your favorite hikes and share your own.</p>

      {!enabled ? (
        <p className={styles.note}>Sign-in is coming soon.</p>
      ) : (
        <>
          <label htmlFor={emailId} className={styles.label}>
            Email
          </label>
          <input
            id={emailId}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="you@example.com"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
          />
          {error && (
            <p id={errorId} className={styles.error} role="alert">
              {error}
            </p>
          )}
          <PillButton type="submit" variant="accent" size="lg" className={styles.submit}>
            Continue with email
          </PillButton>
          <p className={styles.note}>
            We&apos;ll email you a sign-in link — no password needed. Google sign-in arrives with
            real accounts.
          </p>
          <p className={styles.demo}>
            Preview: use the test account <strong>hiker@greathikes.test</strong>.
          </p>
        </>
      )}
    </form>
  );
}
