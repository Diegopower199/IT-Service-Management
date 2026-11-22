"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import SupportAgentOutlined from "@mui/icons-material/SupportAgentOutlined";

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
      <div className={styles.brand}>
        <span className={styles.brandIcon}>
          <SupportAgentOutlined aria-hidden="true" />
        </span>
        <span className={styles.wordmark}>HELP DESK</span>
      </div>

      {user && (
        <div className={styles.userSection}>
          <div className={styles.userIdentity}>
            <UserAvatar key={avatarVersion} userId={user.userId} size={40} />
            <div className={styles.userDetails}>
              <span className={styles.username}>{user.username}</span>
              <span className={styles.role}>{tRoles(user.role)}</span>
            </div>
          </div>

          <div className={styles.language}>
            <LanguageSelector />
          </div>

          <Button
            type="button"
            variant="logout"
            onClick={signOut}
            className={styles.logout}
          >
            <LogoutRounded aria-hidden="true" fontSize="small" />
            {t("logout")}
          </Button>
        </div>
      )}
    </header>
  );
}
