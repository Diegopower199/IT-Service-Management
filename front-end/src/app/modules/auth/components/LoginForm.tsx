"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useTranslations } from "next-intl";

import { Alert, Box, Paper, Stack, TextField, Typography } from "@mui/material";

import Button from "@/components/ui/Button";
import LanguageSelector from "@/components/ui/LanguageSelector";

import { useAuth } from "@/hooks/useAuth";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import { login } from "../services/authService";

import type { LoginRequest } from "../../../../types/authTypes";

interface RequiredFieldsErrors {
  username?: string;
  password?: string;
}

export default function LoginForm() {
  const router = useRouter();

  const t = useTranslations("Auth.Login");

  const { setAuthentication } = useAuth();

  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  });

  const [requiredFieldsIncomplete, setRequiredFieldsIncomplete] =
    useState<RequiredFieldsErrors>({});

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    setError("");
  };

  const validateRequiredFields = () => {
    const errorMissingFields: RequiredFieldsErrors = {};

    if (!formData.username.trim()) {
      errorMissingFields.username = t("usernameRequired");
    }

    if (!formData.password.trim()) {
      errorMissingFields.password = t("passwordRequired");
    }

    setRequiredFieldsIncomplete(errorMissingFields);

    return Object.keys(errorMissingFields).length !== 0;
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setError("");

    if (validateRequiredFields()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(formData);

      setAuthentication(response.token, response.userId, response.username, response.role);

      router.replace("/dashboard");
    } catch (error) {
      const apiError = getApiError(error);

      if (apiError?.status === 403) {
        setError(t("invalidCredentials"));
        return;
      }

      logger.error("Login request failed", error, {
        component: "LoginForm",
        action: "handleSubmit",
      });

      setError(apiError?.message ?? t("serverError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f7fb",
        px: 2,
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 24,
          right: 24,
        }}
      >
        <LanguageSelector />
      </Box>

      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              {t("title")}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {t("subtitle")}
            </Typography>
          </Box>

          <TextField
            label={t("username")}
            name="username"
            type="text"
            value={formData.username}
            onChange={handleFormChange}
            error={Boolean(requiredFieldsIncomplete.username)}
            helperText={requiredFieldsIncomplete.username}
            disabled={isLoading}
            fullWidth
            autoComplete="username"
          />

          <TextField
            label={t("password")}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleFormChange}
            error={Boolean(requiredFieldsIncomplete.password)}
            helperText={requiredFieldsIncomplete.password}
            disabled={isLoading}
            fullWidth
            autoComplete="current-password"
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? t("loggingIn") : t("login")}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
