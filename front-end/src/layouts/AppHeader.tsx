"use client";

import { useAuth } from "@/hooks/useAuth";

import styles from "./appHeader.module.css";

export default function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>
        HELP DESK
      </h1>

      {user && (
        <div className={styles.userSection}>
          <span>{user.username}</span>

          <span className={styles.rol}>
            {user.rol}
          </span>

          <button
            type="button"
            onClick={logout}
            className={styles.logout}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}