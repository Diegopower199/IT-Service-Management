"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { useTranslations } from "next-intl";

import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";

import type { UserResponse } from "@/types/userTypes";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import ProfileForm from "../form/ProfileForm";
import UserAvatar from "@/app/modules/users/components/avatar/UserAvatar";

import {
  deleteUserAvatar,
  uploadUserAvatar,
} from "../../users/services/userAvatarService";

interface ProfileInformationProps {
  profile: UserResponse;
  onSubmitSuccess: () => void;
}

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png"];

export default function ProfileInformation({
  profile,
  onSubmitSuccess,
}: ProfileInformationProps) {
  const t = useTranslations("Profile.Information");
  const tRoles = useTranslations("Common.Roles");

  const [editing, setEditing] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);

  const [hasAvatar, setHasAvatar] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(0);

  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");

  const avatarBusy = uploadingAvatar || deletingAvatar;

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleCloseEdit = () => {
    setEditing(false);
  };

  const handleSubmitSuccess = () => {
    onSubmitSuccess();
    setEditing(false);
  };

  /**
   * Uploads or replaces the authenticated user's avatar.
   */
  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setAvatarError("");
    setAvatarSuccess("");

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError(t("avatarTooLarge"));
      return;
    }

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError(t("avatarInvalidType"));
      return;
    }

    try {
      setUploadingAvatar(true);

      await uploadUserAvatar(file);

      setHasAvatar(true);
      setAvatarVersion((previousVersion) => previousVersion + 1);

      window.dispatchEvent(new Event("user-avatar-updated"));

      setAvatarSuccess(t("avatarUploadSuccess"));
    } catch (error) {
      logger.error("Failed to upload user avatar", error, {
        component: "ProfileInformation",
        action: "handleAvatarChange",
        userId: profile.idUser,
      });

      const apiError = getApiError(error);

      setAvatarError(apiError?.message ?? t("avatarUploadError"));
    } finally {
      setUploadingAvatar(false);
    }
  };

  /**
   * Deletes the authenticated user's avatar.
   */
  const handleDeleteAvatar = async () => {
    try {
      setDeletingAvatar(true);
      setAvatarError("");
      setAvatarSuccess("");

      await deleteUserAvatar();

      setHasAvatar(false);
      setAvatarVersion((previousVersion) => previousVersion + 1);

      window.dispatchEvent(new Event("user-avatar-updated"));

      setAvatarSuccess(t("avatarDeleteSuccess"));
    } catch (error) {
      logger.error("Failed to delete user avatar", error, {
        component: "ProfileInformation",
        action: "handleDeleteAvatar",
        userId: profile.idUser,
      });

      const apiError = getApiError(error);

      setAvatarError(apiError?.message ?? t("avatarDeleteError"));
    } finally {
      setDeletingAvatar(false);
    }
  };

  if (editing) {
    return (
      <ProfileForm
        profile={profile}
        onClose={handleCloseEdit}
        onSubmitSuccess={handleSubmitSuccess}
      />
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 3,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {t("title")}
      </Typography>

      <Stack spacing={2} sx={{ mt: 3, alignItems: "center" }}>
        <UserAvatar
          key={avatarVersion}
          userId={profile.idUser}
          size={100}
          onAvatarStatusChange={setHasAvatar}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: "center" }}
        >
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            disabled={avatarBusy}
          >
            {uploadingAvatar
              ? t("uploadingAvatar")
              : hasAvatar
                ? t("changeAvatar")
                : t("uploadAvatar")}

            <input
              type="file"
              hidden
              accept=".jpg,.jpeg,.png"
              onChange={handleAvatarChange}
              disabled={avatarBusy}
            />
          </Button>

          {hasAvatar && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteAvatar}
              disabled={avatarBusy}
            >
              {deletingAvatar ? t("deletingAvatar") : t("deleteAvatar")}
            </Button>
          )}
        </Stack>

        {avatarError && (
          <Alert severity="error" sx={{ width: "100%" }}>
            {avatarError}
          </Alert>
        )}

        {avatarSuccess && (
          <Alert severity="success" sx={{ width: "100%" }}>
            {avatarSuccess}
          </Alert>
        )}
      </Stack>

      <Stack spacing={2} sx={{ mt: 3 }}>
        <ProfileRow label={t("username")} value={profile.username} />

        <ProfileRow label={t("role")} value={tRoles(profile.role.name)} />

        <ProfileRow label={t("firstName")} value={profile.firstName} />

        <ProfileRow label={t("lastName")} value={profile.lastName} />

        <ProfileRow label={t("email")} value={profile.email} />

        <ProfileRow
          label={t("department")}
          value={profile.department?.name ?? t("noDepartment")}
        />
      </Stack>

      <Button variant="contained" sx={{ mt: 3 }} onClick={handleEditProfile}>
        {t("editProfile")}
      </Button>
    </Paper>
  );
}

interface ProfileRowProps {
  label: string;
  value: string;
}

function ProfileRow({ label, value }: ProfileRowProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        gap: 2,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
