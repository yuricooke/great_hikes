"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import PillButton from "../PillButton/PillButton";
import { useAuth } from "./AuthProvider";
import styles from "./LoginForm.module.css";

type View = "signin" | "signup" | "forgot";

/**
 * Accounts (owner decision 2026-10-08): Google, or email + password with sign-up and password
 * reset. In local dev and previews the seeded test accounts sign in without a password.
 */
export default function LoginForm({
  onDone,
  next = "/favorites",
  linkError = false,
}: {
  onDone?: () => void;
  /** Where to go after sign-in / after confirming the email. */
  next?: string;
  /** Arrived from an expired or already-used email link. */
  linkError?: boolean;
}) {
  const { enabled, testLogin, google, user, signIn, signUp, resetPassword, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();
  const id = useId();
  const [view, setView] = useState<View>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(
    linkError ? "That link has expired or was already used. Sign in, or request a new link." : null,
  );
  const [sent, setSent] = useState<{ to: string; kind: "confirm" | "reset" } | null>(null);
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
          <PillButton href="/account/password" variant="outline" onClick={onDone}>
            Change password
          </PillButton>
          <PillButton variant="outline" icon="logout" onClick={() => void signOut()}>
            Sign out
          </PillButton>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className={styles.form} role="status">
        <h2 className={styles.title}>Check your email</h2>
        <p className={styles.lead}>
          {sent.kind === "confirm" ? (
            <>
              We sent a confirmation link to <strong>{sent.to}</strong>. Open it to activate your account —
              then you&apos;re signed in.
            </>
          ) : (
            <>
              If there&apos;s an account for <strong>{sent.to}</strong>, a link to choose a new password is on
              its way. It works once and expires in an hour.
            </>
          )}
        </p>
        <p className={styles.note}>No email after a few minutes? Check your spam folder.</p>
        <div className={styles.actions}>
          <PillButton
            variant="outline"
            onClick={() => {
              setSent(null);
              setView("signin");
            }}
          >
            Back to sign in
          </PillButton>
        </div>
      </div>
    );
  }

  function switchTo(v: View) {
    setView(v);
    setError(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const result =
      view === "signin"
        ? await signIn(email, password)
        : view === "signup"
          ? await signUp(email, password, name, next)
          : await resetPassword(email);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    if (result.emailSent) {
      setSent({ to: email.trim().toLowerCase(), kind: view === "forgot" ? "reset" : "confirm" });
      return;
    }
    if (onDone) onDone();
    else router.push(next);
  }

  async function withGoogle() {
    setBusy(true);
    const result = await signInWithGoogle(next);
    if (!result.ok) {
      setBusy(false);
      setError(result.error);
    }
    // On success the browser leaves for Google.
  }

  const titles = { signin: "Welcome back", signup: "Create your account", forgot: "Reset your password" };
  const leads = {
    signin: "Sign in to save your favorite hikes, review trails and share your own photos.",
    signup: "Join the community: save hikes, write reviews and share your photos — always credited to you.",
    forgot: "Enter your account email and we'll send you a link to choose a new password.",
  };
  const submitLabel = { signin: "Sign in", signup: "Create account", forgot: "Send reset link" };
  const testOnly = testLogin && view === "signin";

  return (
    <form className={styles.form} onSubmit={submit} noValidate aria-busy={busy}>
      <h2 className={styles.title}>{titles[view]}</h2>
      <p className={styles.lead}>{leads[view]}</p>

      {!enabled ? (
        <p className={styles.note}>Sign-in is coming soon.</p>
      ) : (
        <>
          {google && view !== "forgot" && (
            <>
              <button type="button" className={styles.google} onClick={withGoogle} disabled={busy}>
                <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 2.9-2.2 5.4-4.7 7.1l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.5z" />
                  <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z" />
                  <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
                </svg>
                Continue with Google
              </button>
              <p className={styles.divider}>
                <span>or with email</span>
              </p>
            </>
          )}

          {view === "signup" && (
            <>
              <label htmlFor={`${id}-name`} className={styles.label}>
                Your name
              </label>
              <input
                id={`${id}-name`}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                maxLength={60}
              />
            </>
          )}

          <label htmlFor={`${id}-email`} className={styles.label}>
            Email
          </label>
          <input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="you@example.com"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
          />

          {view !== "forgot" && (
            <>
              <div className={styles.labelRow}>
                <label htmlFor={`${id}-password`} className={styles.label}>
                  Password
                </label>
                {view === "signin" && (
                  <button type="button" className={styles.textButton} onClick={() => switchTo("forgot")}>
                    Forgot password?
                  </button>
                )}
              </div>
              <div className={styles.passwordWrap}>
                <input
                  id={`${id}-password`}
                  type={show ? "text" : "password"}
                  autoComplete={view === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  aria-describedby={view === "signup" ? `${id}-rules` : undefined}
                />
                <button
                  type="button"
                  className={styles.reveal}
                  onClick={() => setShow((v) => !v)}
                  aria-pressed={show}
                >
                  {show ? "Hide" : "Show"}
                  <span className="visually-hidden"> password</span>
                </button>
              </div>
              {view === "signup" && (
                <p id={`${id}-rules`} className={styles.note}>
                  At least 10 characters, with letters and numbers.
                </p>
              )}
            </>
          )}

          {error && (
            <p id={`${id}-error`} className={styles.error} role="alert">
              {error}
            </p>
          )}

          <PillButton type="submit" variant="accent" size="lg" className={styles.submit} disabled={busy}>
            {busy ? "One moment…" : submitLabel[view]}
          </PillButton>

          <p className={styles.switch}>
            {view === "signin" ? (
              <>
                New here?{" "}
                <button type="button" className={styles.textButton} onClick={() => switchTo("signup")}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                {view === "signup" ? "Already have an account?" : "Remembered it?"}{" "}
                <button type="button" className={styles.textButton} onClick={() => switchTo("signin")}>
                  Sign in
                </button>
              </>
            )}
          </p>

          {testOnly && (
            <p className={styles.demo}>
              Preview: <strong>hiker@greathikes.test</strong> signs in without a password.
            </p>
          )}
        </>
      )}
    </form>
  );
}
