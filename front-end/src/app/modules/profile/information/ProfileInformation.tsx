"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Box, Button, Paper, Stack, Typography } from "@mui/material";

import type { UserResponse } from "@/types/userTypes";

import ProfileForm from "../form/ProfileForm";

interface ProfileInformationProps {
  profile: UserResponse;
  onSubmitSuccess: () => void;
}

export default function ProfileInformation({
  profile,
  onSubmitSuccess,
}: ProfileInformationProps) {
  const t = useTranslations("Profile.Information");
  const tRoles = useTranslations("Common.Roles");

  const [editing, setEditing] = useState(false);

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
