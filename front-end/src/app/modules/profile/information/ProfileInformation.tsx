"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useTranslations } from "next-intl";

import { Alert, Button, Chip, CircularProgress, Paper } from "@mui/material";

import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlined from "@mui/icons-material/EditOutlined";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";

import type { UserResponse } from "@/types/userTypes";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import ProfileForm from "../form/ProfileForm";
import UserAvatar from "@/app/modules/users/components/avatar/UserAvatar";
import sharedStyles from "@/app/modules/tickets/styles/tickets.module.css";
import detailStyles from "@/app/modules/tickets/styles/ticketDetails.module.css";
import styles from "../styles/profile.module.css";

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
  const photoInput = useRef<HTMLInputElement>(null);

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
      component="section"
      variant="outlined"
      aria-labelledby="profile-account-heading"
      className={detailStyles.panel}
    >
      <h2 id="profile-account-heading" className={detailStyles.panelTitle}>
        <BadgeOutlined aria-hidden="true" />
        {t("title")}
      </h2>

      <div className={styles.identity}>
        <div className={styles.avatarFrame}>
          <UserAvatar
            key={avatarVersion}
            userId={profile.idUser}
            size={80}
            onAvatarStatusChange={setHasAvatar}
          />
        </div>
        <div className={styles.identityDetails}>
          <h3>{profile.firstName} {profile.lastName}</h3>
          <p><span>{t("username")}</span> {profile.username}</p>
          <Chip
            size="small"
            color="primary"
            label={tRoles(profile.role.name)}
            className={sharedStyles.ticketBadge}
          />
        </div>
      </div>

      <div className={styles.photoActions} aria-busy={avatarBusy}>
        <input
          ref={photoInput}
          type="file"
          hidden
          accept=".jpg,.jpeg,.png"
          onChange={handleAvatarChange}
          disabled={avatarBusy}
        />
        <Button
          type="button"
          variant="outlined"
          startIcon={uploadingAvatar ? <CircularProgress size={16} color="inherit" /> : <UploadFileOutlined />}
          onClick={() => photoInput.current?.click()}
          disabled={avatarBusy}
          className={sharedStyles.secondaryButton}
        >
          {uploadingAvatar ? t("uploadingAvatar") : hasAvatar ? t("changeAvatar") : t("uploadAvatar")}
        </Button>

        {hasAvatar && (
          <Button
            type="button"
            variant="outlined"
            color="error"
            startIcon={deletingAvatar ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineRounded />}
            onClick={handleDeleteAvatar}
            disabled={avatarBusy}
            className={`${sharedStyles.secondaryButton} ${styles.deletePhoto}`}
          >
            {deletingAvatar ? t("deletingAvatar") : t("deleteAvatar")}
          </Button>
        )}
      </div>

      {avatarError && <Alert severity="error">{avatarError}</Alert>}
      {avatarSuccess && <Alert severity="success" role="status">{avatarSuccess}</Alert>}
      <dl className={`${detailStyles.metadata} ${styles.metadata}`}>
        <ProfileRow label={t("firstName")} value={profile.firstName} />
        <ProfileRow label={t("lastName")} value={profile.lastName} />
        <ProfileRow label={t("email")} value={profile.email} />
        <ProfileRow
          label={t("department")}
          value={profile.department?.name ?? t("noDepartment")}
        />
      </dl>

      <div className={sharedStyles.formActions}>
        <Button
          type="button"
          variant="contained"
          disableElevation
          startIcon={<EditOutlined />}
          onClick={handleEditProfile}
          className={sharedStyles.primaryButton}
        >
          {t("editProfile")}
        </Button>
      </div>
    </Paper>
  );
}

interface ProfileRowProps {
  label: string;
  value: string;
}

function ProfileRow({ label, value }: ProfileRowProps) {
  return (
    <div className={detailStyles.metadataItem}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
