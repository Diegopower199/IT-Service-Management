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

import type { CategoryResponse } from "@/types/categoryTypes";

import { FORM_MODES, type FormMode } from "@/utils/constans";

import { getApiError } from "@/utils/apiErrorUtils";
import { createCategory, updateCategory } from "../../services/categoryService";


interface CategoryFormProps {
  formMode: FormMode;
  selectedCategory: CategoryResponse | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

interface CategoryFormData {
  name: string;
}

const INITIAL_FORM_DATA: CategoryFormData = {
  name: "",
};

const getInitialFormData = (
  formMode: FormMode,
  selectedCategory: CategoryResponse | null,
): CategoryFormData => {
  if (
    (formMode === FORM_MODES.EDIT || formMode === FORM_MODES.VIEW) &&
    selectedCategory
  ) {
    return {
      name: selectedCategory.name,
    };
  }

  return { ...INITIAL_FORM_DATA };
};

export default function CategoryForm({
  formMode,
  selectedCategory,
  onClose,
  onSubmitSuccess,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>(
    getInitialFormData(formMode, selectedCategory),
  );

  const [loading, setLoading] = useState(false);

  const [requiredFieldsIncomplete, setRequiredFieldsIncomplete] = useState<
    Partial<Record<keyof CategoryFormData, string>>
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
    const errorMissingFields: Partial<Record<keyof CategoryFormData, string>> =
      {};

    if (!formData.name.trim()) {
      errorMissingFields.name = "Please enter a category name.";
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
        await createCategory({
          name: formData.name,
        });
      }

      if (formMode === FORM_MODES.EDIT && selectedCategory) {
        await updateCategory(selectedCategory.idCategory, {
          name: formData.name,
        });
      }

      onSubmitSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);

      const apiError = getApiError(error);

      if (apiError?.errors?.name) {
        setRequiredFieldsIncomplete({
          name: apiError.errors.name,
        });

        return;
      }

      setErrorMessage(
        apiError?.message ??
          (formMode === FORM_MODES.CREATE
            ? "Error creating category."
            : "Error updating category."),
      );
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (formMode === FORM_MODES.CREATE) {
      return "Create Category";
    }

    if (formMode === FORM_MODES.VIEW) {
      return "Category Details";
    }

    return "Edit Category";
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

        {selectedCategory && formMode === FORM_MODES.VIEW && (
          <TextField
            label="Status"
            value={selectedCategory.active ? "Active" : "Inactive"}
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
                  ? "Create Category"
                  : "Save Changes"}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
