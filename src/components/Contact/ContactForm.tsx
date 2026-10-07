"use client";

import { useActionState, useId } from "react";

import { sendMessage, type ContactState } from "@/app/contact/actions";
import PillButton from "../PillButton/PillButton";
import styles from "./ContactForm.module.css";

const TOPICS = [
  ["hiker", "A question about a hike"],
  ["photographer", "I'm a photographer"],
  ["partner", "Partnerships & brands"],
  ["privacy", "My data or account"],
  ["other", "Something else"],
] as const;

export default function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, { status: "idle" });
  const id = useId();
  const f = state.fields ?? {};

  if (state.status === "sent") {
    return (
      <div role="status" className={styles.sent}>
        <h2>Thanks — message received.</h2>
        <p>We usually reply within a few days.</p>
      </div>
    );
  }

  return (
    <form action={action} className={styles.form} aria-busy={pending}>
      <div className={styles.field}>
        <label htmlFor={`${id}-name`}>Name</label>
        <input id={`${id}-name`} name="name" autoComplete="name" required maxLength={120} defaultValue={f.name} />
      </div>
      <div className={styles.field}>
        <label htmlFor={`${id}-email`}>Email</label>
        <input id={`${id}-email`} name="email" type="email" autoComplete="email" required defaultValue={f.email} />
      </div>
      <div className={styles.field}>
        <label htmlFor={`${id}-topic`}>Topic</label>
        <select id={`${id}-topic`} name="topic" defaultValue={f.topic || "hiker"}>
          {TOPICS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor={`${id}-message`}>Message</label>
        <textarea id={`${id}-message`} name="message" rows={6} required minLength={10} maxLength={5000} defaultValue={f.message} />
      </div>
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.status === "error" && (
        <p role="alert" className={styles.error}>
          {state.message}
        </p>
      )}
      <PillButton type="submit" variant="accent" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </PillButton>
      <p className={styles.note}>We use your details only to reply. See our privacy policy.</p>
    </form>
  );
}
