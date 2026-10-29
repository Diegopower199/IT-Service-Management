"use client";

import { useState } from "react";

import {
  Alert,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import type { UpdateProfileRequest, UserResponse } from "@/types/userTypes";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import { updateCurrentUser } from "../../users/services/userService";

interface ProfileFormProps {
  profile: UserResponse;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export default function ProfileForm({
  profile,
  onClose,
  onSubmitSuccess,
}: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
  });

  const [loading, setLoading] = useState(false);

  const [requiredFieldsIncomplete, setRequiredFieldsIncomplete] = useState<
    Partial<Record<keyof ProfileFormData, string>>
  >({});

  const [errorMessage, setErrorMessage] = useState("");

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
  };

  const validateRequiredFields = () => {
    const errors: Partial<Record<keyof ProfileFormData, string>> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "Please enter a first name.";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Please enter a last name.";
    }

    if (!formData.email.trim()) {
      errors.email = "Please enter an email.";
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
      setRequiredFieldsIncomplete({});

      const request: UpdateProfileRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      };

      await updateCurrentUser(request);

      onSubmitSuccess();
    } catch (error) {
      const apiError = getApiError(error);

      if (apiError?.errors) {
        setRequiredFieldsIncomplete({
          firstName: apiError.errors.firstName,
          lastName: apiError.errors.lastName,
          email: apiError.errors.email,
        });

        return;
      }

      logger.error("Failed to update profile", error, {
        component: "ProfileForm",
        action: "handleSubmit",
      });

      setErrorMessage(apiError?.message ?? "Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      component="form"
      variant="outlined"
      onSubmit={handleSubmit}
      sx={{
        p: 3,
        borderRadius: 3,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Edit Profile
      </Typography>

      <Stack spacing={3} sx={{ mt: 3 }}>
        <TextField
          label="First name"
          name="firstName"
          value={formData.firstName}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.firstName)}
          helperText={requiredFieldsIncomplete.firstName}
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Last name"
          name="lastName"
          value={formData.lastName}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.lastName)}
          helperText={requiredFieldsIncomplete.lastName}
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.email)}
          helperText={requiredFieldsIncomplete.email}
          disabled={loading}
          fullWidth
        />

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Stack direction="row" spacing={2}>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
