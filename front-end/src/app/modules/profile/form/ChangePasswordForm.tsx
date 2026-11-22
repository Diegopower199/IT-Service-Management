"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Alert, Button, Paper, TextField } from "@mui/material";
import LockOutlined from "@mui/icons-material/LockOutlined";

import { changePassword } from "@/app/modules/users/services/userService";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";
import styles from "../styles/profile.module.css";

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

export default function ChangePasswordForm({ readOnly = false }: { readOnly?: boolean }) {
  const t = useTranslations("Profile.ChangePassword");

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
      errors.currentPassword = t("currentPasswordRequired");
    }

    if (!formData.newPassword) {
      errors.newPassword = t("newPasswordRequired");
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = t("confirmPasswordRequired");
    }

    if (
      formData.newPassword &&
      formData.confirmPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      errors.confirmPassword = t("passwordsDoNotMatch");
    }

    setRequiredFieldsIncomplete(errors);

    return Object.keys(errors).length !== 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (readOnly) return;

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

      setSuccessMessage(t("success"));
    } catch (error) {
      logger.error("Failed to change password", error, {
        component: "ChangePasswordForm",
        action: "handleSubmit",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      component="form"
      variant="outlined"
      onSubmit={handleSubmit}
      aria-labelledby="change-password-heading"
      aria-busy={loading}
      className={styles.panel}
    >
      <h2 id="change-password-heading" className={styles.panelTitle}>
        <LockOutlined aria-hidden="true" />
        {t("title")}
      </h2>

      {readOnly && <Alert severity="info">{t("demoReadOnly")}</Alert>}

      <div className={styles.formFields}>
        <TextField
          className={styles.fullWidth}
          label={t("currentPassword")}
          name="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.currentPassword)}
          helperText={requiredFieldsIncomplete.currentPassword}
          disabled={loading || readOnly}
          fullWidth
        />

        <TextField
          className={styles.fullWidth}
          label={t("newPassword")}
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.newPassword)}
          helperText={requiredFieldsIncomplete.newPassword}
          disabled={loading || readOnly}
          fullWidth
        />

        <TextField
          className={styles.fullWidth}
          label={t("confirmPassword")}
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.confirmPassword)}
          helperText={requiredFieldsIncomplete.confirmPassword}
          disabled={loading || readOnly}
          fullWidth
        />
      </div>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <div className={styles.formActions}>
        <Button
          type="submit"
          variant="contained"
          disableElevation
          disabled={loading || readOnly}
          className={styles.primaryButton}
        >
          {loading ? t("saving") : t("submit")}
        </Button>
      </div>
    </Paper>
  );
}
