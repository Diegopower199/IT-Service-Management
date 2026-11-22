"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useTranslations } from "next-intl";

import {
  Alert,
  Box,
  Button,
  GlobalStyles,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import ConfirmationNumberOutlined from "@mui/icons-material/ConfirmationNumberOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import PersonOutlineRounded from "@mui/icons-material/PersonOutlineRounded";
import SupportAgentOutlined from "@mui/icons-material/SupportAgentOutlined";

import LanguageSelector from "@/components/ui/LanguageSelector";

import { useAuth } from "@/hooks/useAuth";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import { login } from "../services/authService";

import type { LoginRequest } from "../../../../types/authTypes";
import styles from "./LoginForm.module.css";

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
    <Box component="main" className={styles.login}>
      <GlobalStyles styles={{ body: { margin: 0 } }} />

      <Box aria-hidden="true" className={styles.brandPanel}>
        <div className={styles.illustration}>
          <div className={styles.rearTicket} />
          <div className={styles.ticket}>
            <div className={styles.ticketIcon}>
              <ConfirmationNumberOutlined />
            </div>
            <div className={styles.ticketLines}>
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className={styles.status}>
            <CheckRounded />
          </div>
        </div>
      </Box>

      <Stack
        direction="row"
        spacing={1.25}
        className={styles.brand}
      >
        <Box className={styles.brandIcon}>
          <SupportAgentOutlined aria-hidden="true" />
        </Box>
        <Typography component="span" className={styles.wordmark}>
          HELP DESK
        </Typography>
      </Stack>

      <Box className={styles.language}>
        <LanguageSelector />
      </Box>

      <Box className={styles.formPanel}>
        <Stack
          component="form"
          onSubmit={handleSubmit}
          aria-labelledby="login-title"
          spacing={3.5}
          sx={{ width: "100%", maxWidth: 420 }}
        >
          <Stack spacing={1}>
            <Typography id="login-title" component="h1" className={styles.title}>
              {t("title")}
            </Typography>
            <Typography variant="body1" sx={{ color: "#52627d" }}>
              {t("subtitle")}
            </Typography>
          </Stack>

          <Stack spacing={2.5}>
            <Stack spacing={0.75}>
              <Typography
                component="label"
                htmlFor="login-username"
                variant="body2"
                className={styles.label}
              >
                {t("username")}
              </Typography>
              <TextField
                id="login-username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleFormChange}
                error={Boolean(requiredFieldsIncomplete.username)}
                helperText={requiredFieldsIncomplete.username}
                disabled={isLoading}
                fullWidth
                autoComplete="username"
                className={styles.field}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineRounded fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>

            <Stack spacing={0.75}>
              <Typography
                component="label"
                htmlFor="login-password"
                variant="body2"
                className={styles.label}
              >
                {t("password")}
              </Typography>
              <TextField
                id="login-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                error={Boolean(requiredFieldsIncomplete.password)}
                helperText={requiredFieldsIncomplete.password}
                disabled={isLoading}
                fullWidth
                autoComplete="current-password"
                className={styles.field}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>

          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            disableElevation
            endIcon={<ArrowForwardRounded />}
            className={styles.submit}
          >
            {isLoading ? t("loggingIn") : t("login")}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
