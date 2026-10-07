"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import PillButton from "../PillButton/PillButton";
import { useAuth } from "./AuthProvider";
import styles from "./LoginForm.module.css";

/**
 * Passwordless sign-in (owner decision: email link + Google). Real accounts get a sign-in link by
 * email; in local dev and previews the seeded test accounts sign in straight away.
 */
export default function LoginForm({
  onDone,
  next = "/favorites",
  linkError = false,
}: {
  onDone?: () => void;
  /** Where the email link lands after sign-in. */
  next?: string;
  /** Arrived from an expired or already-used email link. */
  linkError?: boolean;
}) {
  const { enabled, testLogin, google, user, signIn, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();
  const emailId = useId();
  const errorId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(
    linkError ? "That sign-in link has expired or was already used. Send a new one below." : null,
  );
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) {
    return (
      <div className={styles.form}>
        <h2 className={styles.title}>Welcome, {user.name}</h2>
        <p className={styles.lead}>You&apos;re signed in as {user.email}.</p>
        <div className={styles.actions}>
          <PillButton href="/favorites" variant="accent" icon="favorite" onClick={onDone}>
            My favorites
          </PillButton>
          <PillButton variant="outline" icon="logout" onClick={() => void signOut()}>
            Sign out
          </PillButton>
        </div>
      </div>
    );
  }

  if (sentTo) {
    return (
      <div className={styles.form} role="status">
        <h2 className={styles.title}>Check your email</h2>
        <p className={styles.lead}>
          We sent a sign-in link to <strong>{sentTo}</strong>. Open it on this device to continue —
          it works once and expires in an hour.
        </p>
        <p className={styles.note}>No email? Check your spam folder, or try again in a minute.</p>
        <div className={styles.actions}>
          <PillButton variant="outline" onClick={() => setSentTo(null)}>
            Use a different email
          </PillButton>
        </div>
      </div>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const result = await signIn(email, next);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    if (result.emailSent) {
      setSentTo(email.trim().toLowerCase());
      return;
    }
    if (onDone) onDone();
    else router.push(next);
  }

  async function google_() {
    setBusy(true);
    const result = await signInWithGoogle(next);
    if (!result.ok) {
      setBusy(false);
      setError(result.error);
    }
    // On success the browser leaves for Google.
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate aria-busy={busy}>
      <h2 className={styles.title}>Welcome back</h2>
      <p className={styles.lead}>Sign in to save your favorite hikes and share your own.</p>

      {!enabled ? (
        <p className={styles.note}>Sign-in is coming soon.</p>
      ) : (
        <>
          {google && (
            <>
              <button type="button" className={styles.google} onClick={google_} disabled={busy}>
                <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 2.9-2.2 5.4-4.7 7.1l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.5z" />
                  <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z" />
                  <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
                </svg>
                Continue with Google
              </button>
              <p className={styles.divider}>
                <span>or</span>
              </p>
            </>
          )}
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
          <PillButton type="submit" variant="accent" size="lg" className={styles.submit} disabled={busy}>
            {busy ? "Sending…" : "Continue with email"}
          </PillButton>
          <p className={styles.note}>We&apos;ll email you a sign-in link — no password needed.</p>
          {testLogin && (
            <p className={styles.demo}>
              Preview: <strong>hiker@greathikes.test</strong> signs in without email.
            </p>
          )}
        </>
      )}
    </form>
  );
}
