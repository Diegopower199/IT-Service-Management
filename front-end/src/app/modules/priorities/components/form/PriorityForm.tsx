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

import type { PriorityResponse } from "@/types/priorityTypes";

import { FORM_MODES, type FormMode } from "@/utils/constans";
import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import { createPriority, updatePriority } from "../../services/priorityService";

interface PriorityFormProps {
  formMode: FormMode;
  selectedPriority: PriorityResponse | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

interface PriorityFormData {
  name: string;
}

const INITIAL_FORM_DATA: PriorityFormData = {
  name: "",
};

const getInitialFormData = (
  formMode: FormMode,
  selectedPriority: PriorityResponse | null,
): PriorityFormData => {
  if (
    (formMode === FORM_MODES.EDIT || formMode === FORM_MODES.VIEW) &&
    selectedPriority
  ) {
    return {
      name: selectedPriority.name,
    };
  }

  return { ...INITIAL_FORM_DATA };
};

export default function PriorityForm({
  formMode,
  selectedPriority,
  onClose,
  onSubmitSuccess,
}: PriorityFormProps) {
  const [formData, setFormData] = useState<PriorityFormData>(
    getInitialFormData(formMode, selectedPriority),
  );

  const [loading, setLoading] = useState(false);

  const [requiredFieldsIncomplete, setRequiredFieldsIncomplete] = useState<
    Partial<Record<keyof PriorityFormData, string>>
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
    const errorMissingFields: Partial<Record<keyof PriorityFormData, string>> =
      {};

    if (!formData.name.trim()) {
      errorMissingFields.name = "Please enter a priority name.";
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
        await createPriority({
          name: formData.name,
        });
      }

      if (formMode === FORM_MODES.EDIT && selectedPriority) {
        await updatePriority(selectedPriority.idPriority, {
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
          ? "Failed to create priority"
          : "Failed to update priority",
        error,
        {
          component: "PriorityForm",
          action: "handleSubmit",
          formMode,
          ...(selectedPriority && {
            priorityId: selectedPriority.idPriority,
          }),
        },
      );

      setErrorMessage(
        apiError?.message ??
          (formMode === FORM_MODES.CREATE
            ? "Error creating priority."
            : "Error updating priority."),
      );
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (formMode === FORM_MODES.CREATE) {
      return "Create Priority";
    }

    if (formMode === FORM_MODES.VIEW) {
      return "Priority Details";
    }

    return "Edit Priority";
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

        {selectedPriority && formMode === FORM_MODES.VIEW && (
          <TextField
            label="Status"
            value={selectedPriority.active ? "Active" : "Inactive"}
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
                  ? "Create Priority"
                  : "Save Changes"}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
