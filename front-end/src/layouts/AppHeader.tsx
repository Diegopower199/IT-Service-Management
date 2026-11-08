"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/hooks/useAuth";

import styles from "./appHeader.module.css";

import Button from "@/components/ui/Button";
import LanguageSelector from "@/components/ui/LanguageSelector";

import UserAvatar from "@/app/modules/users/components/avatar/UserAvatar";

export default function AppHeader() {
  const { user, signOut } = useAuth();

  const t = useTranslations("Navigation.Header");
  const tRoles = useTranslations("Common.Roles");

  const [avatarVersion, setAvatarVersion] = useState(0);

  /**
   * Listens for avatar updates triggered from the user profile.
   */
  useEffect(() => {
    const handleAvatarUpdated = () => {
      setAvatarVersion((previousVersion) => previousVersion + 1);
    };

    window.addEventListener("user-avatar-updated", handleAvatarUpdated);

    return () => {
      window.removeEventListener("user-avatar-updated", handleAvatarUpdated);
    };
  }, []);

  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>HELP DESK</h1>

      {user && (
        <div className={styles.userSection}>
          <div className={styles.userIdentity}>
            <UserAvatar key={avatarVersion} userId={user.userId} size={40} />

            <span>{user.username}</span>
          </div>

          <span className={styles.role}>{tRoles(user.role)}</span>

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
