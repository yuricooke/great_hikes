"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import PillButton from "../PillButton/PillButton";
import { useAuth } from "./AuthProvider";
import styles from "./LoginForm.module.css";

export default function NewPasswordForm() {
  const { user, ready, updatePassword } = useAuth();
  const router = useRouter();
  const id = useId();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!ready) return null;
  if (!user) {
    return (
      <p className={styles.note}>
        This page needs the link from your reset email (it expires after an hour).{" "}
        <Link href="/login">Request a new link</Link>.
      </p>
    );
  }
  if (done) {
    return (
      <div className={styles.form} role="status">
        <h2 className={styles.title}>Password updated</h2>
        <PillButton href="/favorites" variant="accent" icon="favorite">
          Go to my favorites
        </PillButton>
      </div>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password !== repeat) return setError("The two passwords don't match.");
    setBusy(true);
    const result = await updatePassword(password);
    setBusy(false);
    if (!result.ok) return setError(result.error);
    setDone(true);
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <p className={styles.lead}>Signed in as {user.email}.</p>
      <label htmlFor={`${id}-new`} className={styles.label}>
        New password
      </label>
      <div className={styles.passwordWrap}>
        <input
          id={`${id}-new`}
          type={show ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          aria-describedby={`${id}-rules`}
        />
        <button type="button" className={styles.reveal} onClick={() => setShow((v) => !v)} aria-pressed={show}>
          {show ? "Hide" : "Show"}
          <span className="visually-hidden"> password</span>
        </button>
      </div>
      <p id={`${id}-rules`} className={styles.note}>
        At least 10 characters, with letters and numbers.
      </p>
      <label htmlFor={`${id}-repeat`} className={styles.label}>
        Repeat new password
      </label>
      <input
        id={`${id}-repeat`}
        type={show ? "text" : "password"}
        autoComplete="new-password"
        value={repeat}
        onChange={(e) => setRepeat(e.target.value)}
        className={styles.input}
      />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <PillButton type="submit" variant="accent" size="lg" disabled={busy}>
        {busy ? "Saving…" : "Save new password"}
      </PillButton>
    </form>
  );
}
