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

import type { StatusResponse } from "@/types/statusTypes";

import { FORM_MODES, type FormMode } from "@/utils/constans";
import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import { createStatus, updateStatus } from "../../services/statusService";

interface StatusFormProps {
  formMode: FormMode;
  selectedStatus: StatusResponse | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

interface StatusFormData {
  name: string;
}

const INITIAL_FORM_DATA: StatusFormData = {
  name: "",
};

const getInitialFormData = (
  formMode: FormMode,
  selectedStatus: StatusResponse | null,
): StatusFormData => {
  if (
    (formMode === FORM_MODES.EDIT || formMode === FORM_MODES.VIEW) &&
    selectedStatus
  ) {
    return {
      name: selectedStatus.name,
    };
  }

  return { ...INITIAL_FORM_DATA };
};

export default function StatusForm({
  formMode,
  selectedStatus,
  onClose,
  onSubmitSuccess,
}: StatusFormProps) {
  const [formData, setFormData] = useState<StatusFormData>(
    getInitialFormData(formMode, selectedStatus),
  );

  const [loading, setLoading] = useState(false);

  const [requiredFieldsIncomplete, setRequiredFieldsIncomplete] = useState<
    Partial<Record<keyof StatusFormData, string>>
  >({});

  const [errorMessage, setErrorMessage] = useState("");

  const isViewMode = formMode === FORM_MODES.VIEW;

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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
    const errorMissingFields: Partial<Record<keyof StatusFormData, string>> =
      {};

    if (!formData.name.trim()) {
      errorMissingFields.name = "Please enter a status name.";
    }

    setRequiredFieldsIncomplete(errorMissingFields);

    return Object.keys(errorMissingFields).length !== 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isViewMode) {
      return;
    }

    const requiredFieldsError = validateRequiredFields();

    if (requiredFieldsError) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setRequiredFieldsIncomplete({});

      if (formMode === FORM_MODES.CREATE) {
        await createStatus({
          name: formData.name,
        });
      }

      if (formMode === FORM_MODES.EDIT && selectedStatus) {
        await updateStatus(selectedStatus.idStatus, {
          name: formData.name,
        });
      }

      onSubmitSuccess();
      onClose();
    } catch (error) {
      const apiError = getApiError(error);

      if (apiError?.errors?.name) {
        setRequiredFieldsIncomplete({
          name: apiError.errors.name,
        });

        return;
      }

      logger.error(
        formMode === FORM_MODES.CREATE
          ? "Failed to create status"
          : "Failed to update status",
        error,
        {
          component: "StatusForm",
          action: "handleSubmit",
          formMode,
          ...(selectedStatus && {
            statusId: selectedStatus.idStatus,
          }),
        },
      );

      setErrorMessage(
        apiError?.message ??
          (formMode === FORM_MODES.CREATE
            ? "Error creating status."
            : "Error updating status."),
      );
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (formMode === FORM_MODES.CREATE) {
      return "Create Status";
    }

    if (formMode === FORM_MODES.VIEW) {
      return "Status Details";
    }

    return "Edit Status";
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4" component="h1" gutterBottom>
        {getTitle()}
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.name)}
          helperText={requiredFieldsIncomplete.name}
          disabled={isViewMode || loading}
          fullWidth
        />

        {selectedStatus && formMode === FORM_MODES.VIEW && (
          <TextField
            label="Status"
            value={selectedStatus.active ? "Active" : "Inactive"}
            disabled
            fullWidth
          />
        )}

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Stack direction="row" spacing={2}>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={loading}
          >
            {isViewMode ? "Back" : "Cancel"}
          </Button>

          {!isViewMode && (
            <Button type="submit" variant="contained" disabled={loading}>
              {loading
                ? "Saving..."
                : formMode === FORM_MODES.CREATE
                  ? "Create Status"
                  : "Save Changes"}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
