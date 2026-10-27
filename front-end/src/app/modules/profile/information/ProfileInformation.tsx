"use client";

import { useState } from "react";

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
        Account Information
      </Typography>

      <Stack spacing={2} sx={{ mt: 3 }}>
        <ProfileRow label="Username" value={profile.username} />

        <ProfileRow label="Role" value={profile.rol.name} />

        <ProfileRow label="First name" value={profile.firstName} />

        <ProfileRow label="Last name" value={profile.lastName} />

        <ProfileRow label="Email" value={profile.email} />

        <ProfileRow
          label="Department"
          value={profile.department?.name ?? "No department"}
        />
      </Stack>

      <Button variant="contained" sx={{ mt: 3 }} onClick={handleEditProfile}>
        Edit Profile
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
