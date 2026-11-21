"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Alert } from "@mui/material";
import PersonOutlineRounded from "@mui/icons-material/PersonOutlineRounded";

import { useAuth } from "@/hooks/useAuth";

import type { UserResponse } from "@/types/userTypes";

import { getCurrentUser } from "../../users/services/userService";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import PageLoading from "@/components/ui/PageLoading";

import ChangePasswordForm from "../form/ChangePasswordForm";
import ProfileInformation from "../information/ProfileInformation";
import sharedStyles from "@/app/modules/tickets/styles/tickets.module.css";
import styles from "../styles/profile.module.css";

export default function ProfileContent() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  const t = useTranslations("Profile.Content");

  const [profile, setProfile] = useState<UserResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [profileUpdated, setProfileUpdated] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getCurrentUser();

      setProfile(response);
      setErrorMessage("");
    } catch (error) {
      logger.error("Failed to load profile", error, {
        component: "ProfileContent",
        action: "fetchProfile",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthReady) {
        return;
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      await fetchProfile();
    };

    loadProfile();
  }, [isAuthReady, user, router, profileUpdated, fetchProfile]);

  const handleProfileUpdated = () => {
    setProfileUpdated((previous) => !previous);
  };

  if (!isAuthReady || !user) {
    return <PageLoading />;
  }

  return (
    <div className={`${sharedStyles.page} ${styles.profile}`}>
      <header className={sharedStyles.heading}>
        <span className={sharedStyles.headingIcon} aria-hidden="true">
          <PersonOutlineRounded />
        </span>
        <h1>{t("title")}</h1>
      </header>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {profile ? (
        <div className={styles.layout}>
          <ProfileInformation
            profile={profile}
            onSubmitSuccess={handleProfileUpdated}
          />

          <ChangePasswordForm />
        </div>
      ) : loading && <PageLoading />}
    </div>
  );
}
