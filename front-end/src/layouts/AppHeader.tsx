"use client";

import { useTranslations } from "next-intl";

import { useAuth } from "@/hooks/useAuth";

import styles from "./appHeader.module.css";

import Button from "@/components/ui/Button";
import LanguageSelector from "@/components/ui/LanguageSelector";

export default function AppHeader() {
  const { user, signOut } = useAuth();

  const t = useTranslations("Navigation.Header");

  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>HELP DESK</h1>

      {user && (
        <div className={styles.userSection}>
          <span>{user.username}</span>

          <span className={styles.role}>{t(`roles.${user.role}`)}</span>

          <LanguageSelector />

          <Button
            type="button"
            variant="logout"
            onClick={signOut}
            className={styles.logout}
          >
            {t("logout")}
          </Button>
        </div>
      )}
    </header>
  );
}
