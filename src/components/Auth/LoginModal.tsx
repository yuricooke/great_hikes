"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import Icon from "../Icon";
import LoginForm from "./LoginForm";
import styles from "./LoginModal.module.css";

/** Glass pop-up over the current page (opened by in-app links to /login). */
export default function LoginModal() {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const close = () => router.back();

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label="Sign in"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className={styles.body}>
        <button type="button" className={styles.close} onClick={close}>
          <Icon name="close" size={24} />
          <span className="visually-hidden">Close</span>
        </button>
        <LoginForm onDone={close} />
      </div>
    </dialog>
  );
}
