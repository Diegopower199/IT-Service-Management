"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Alert, Box, Typography } from "@mui/material";

import { useAuth } from "@/hooks/useAuth";

import type { UserResponse } from "@/types/userTypes";

import { getCurrentUser } from "../../users/services/userService";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import PageLoading from "@/components/ui/PageLoading";

import ChangePasswordForm from "../form/ChangePasswordForm";
import ProfileInformation from "../information/ProfileInformation";

export default function ProfileContent() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  const t = useTranslations("Profile.Content");

  const [profile, setProfile] = useState<UserResponse | null>(null);

  const [loading, setLoading] = useState(false);

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

  if (loading && !profile) {
    return <PageLoading />;
  }

  return (
    <main>
      <Typography variant="h4" component="h1" gutterBottom>
        {t("title")}
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {profile && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
            },
            gap: 4,
            mt: 4,
          }}
        >
          <ProfileInformation
            profile={profile}
            onSubmitSuccess={handleProfileUpdated}
          />

          <ChangePasswordForm />
        </Box>
      )}
    </main>
  );
}
