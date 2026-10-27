"use client";

import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { changePassword } from "@/app/modules/users/services/userService";

import { getApiError } from "@/utils/apiErrorUtils";

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const INITIAL_FORM_DATA: ChangePasswordFormData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ChangePasswordForm() {
  const [formData, setFormData] =
    useState<ChangePasswordFormData>(INITIAL_FORM_DATA);

  const [loading, setLoading] = useState(false);

  const [requiredFieldsIncomplete, setRequiredFieldsIncomplete] = useState<
    Partial<Record<keyof ChangePasswordFormData, string>>
  >({});

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setRequiredFieldsIncomplete((previousErrors) => ({
      ...previousErrors,
      [name]: undefined,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const validateRequiredFields = () => {
    const errors: Partial<Record<keyof ChangePasswordFormData, string>> = {};

    if (!formData.currentPassword) {
      errors.currentPassword = "Please enter your current password.";
    }

    if (!formData.newPassword) {
      errors.newPassword = "Please enter a new password.";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password.";
    }

    if (
      formData.newPassword &&
      formData.confirmPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setRequiredFieldsIncomplete(errors);

    return Object.keys(errors).length !== 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredFieldsError = validateRequiredFields();

    if (requiredFieldsError) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      setRequiredFieldsIncomplete({});

      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setFormData(INITIAL_FORM_DATA);

      setSuccessMessage("Password changed successfully.");
    } catch (error) {
      console.error("Error changing password:", error);

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? "Error changing password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Change Password
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="Current Password"
          name="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.currentPassword)}
          helperText={requiredFieldsIncomplete.currentPassword}
          disabled={loading}
          fullWidth
        />

        <TextField
          label="New Password"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.newPassword)}
          helperText={requiredFieldsIncomplete.newPassword}
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.confirmPassword)}
          helperText={requiredFieldsIncomplete.confirmPassword}
          disabled={loading}
          fullWidth
        />

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Saving..." : "Change Password"}
        </Button>
      </Stack>
    </Box>
  );
}
