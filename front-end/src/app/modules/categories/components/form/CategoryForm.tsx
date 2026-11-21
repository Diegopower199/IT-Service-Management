"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import CategoryOutlined from "@mui/icons-material/CategoryOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";

import { CatalogEntityDetails, CatalogNameForm } from "@/app/modules/adminCatalog/CatalogEntityView";

import type { CategoryResponse } from "@/types/categoryTypes";

import { FORM_MODES, type FormMode } from "@/utils/constans";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

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
  const t = useTranslations("Categories.Form");

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
      errorMissingFields.name = t("nameRequired");
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
      const apiError = getApiError(error);

      if (apiError?.errors?.name) {
        setRequiredFieldsIncomplete({
          name: apiError.errors.name,
        });

        return;
      }

      logger.error(
        formMode === FORM_MODES.CREATE
          ? "Failed to create category"
          : "Failed to update category",
        error,
        {
          component: "CategoryForm",
          action: "handleSubmit",
          formMode,
          ...(selectedCategory && {
            categoryId: selectedCategory.idCategory,
          }),
        },
      );

      setErrorMessage(
        apiError?.message ??
          (formMode === FORM_MODES.CREATE
            ? t("createError")
            : t("updateError")),
      );
    } finally {
      setLoading(false);
    }
  };

  if (isViewMode) {
    return selectedCategory ? (
      <CatalogEntityDetails
        title={t("viewTitle")}
        icon={<CategoryOutlined />}
        name={formData.name}
        active={selectedCategory.active}
        statusLabel={t(selectedCategory.active ? "active" : "inactive")}
        backLabel={t("back")}
        onClose={onClose}
      />
    ) : null;
  }

  const isCreate = formMode === FORM_MODES.CREATE;

  return (
    <CatalogNameForm
      title={t(isCreate ? "createTitle" : "editTitle")}
      icon={isCreate ? <CategoryOutlined /> : <EditOutlined />}
      name={formData.name}
      nameLabel={t("name")}
      nameError={requiredFieldsIncomplete.name}
      errorMessage={errorMessage}
      loading={loading}
      cancelLabel={t("cancel")}
      submitLabel={t(loading ? "saving" : isCreate ? "createCategory" : "saveChanges")}
      onChange={handleFormChange}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
