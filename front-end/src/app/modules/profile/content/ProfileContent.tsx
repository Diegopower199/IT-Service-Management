"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  const [profile, setProfile] = useState<UserResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [profileUpdated, setProfileUpdated] = useState(false);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getCurrentUser();

        setProfile(response);
      } catch (error) {
        logger.error("Failed to load profile", error, {
          component: "ProfileContent",
          action: "loadProfile",
        });

        const apiError = getApiError(error);

        setErrorMessage(apiError?.message ?? "Error loading profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthReady, user, router, profileUpdated]);

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
        My Profile
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
