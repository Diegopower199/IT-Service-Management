"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import FlagOutlined from "@mui/icons-material/FlagOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";

import { CatalogEntityDetails, CatalogNameForm } from "@/app/modules/adminCatalog/CatalogEntityView";

import { type PriorityResponse } from "@/types/priorityTypes";

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
  const t = useTranslations("Priorities.Form");
  const tPriorities = useTranslations("Common.Priorities");

  const [formData, setFormData] = useState<PriorityFormData>(
    getInitialFormData(formMode, selectedPriority),
  );

  const [loading, setLoading] = useState(false);

  const [requiredFieldsIncomplete, setRequiredFieldsIncomplete] = useState<
    Partial<Record<keyof PriorityFormData, string>>
  >({});

  const [errorMessage, setErrorMessage] = useState("");

  const isViewMode = formMode === FORM_MODES.VIEW;

  const getPriorityDisplayName = (priorityName: string) => {
    if (tPriorities.has(priorityName)) {
      return tPriorities(priorityName);
    }

    return priorityName;
  };

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
            ? t("createError")
            : t("updateError")),
      );
    } finally {
      setLoading(false);
    }
  };

  if (isViewMode) {
    return selectedPriority ? (
      <CatalogEntityDetails
        title={t("viewTitle")}
        icon={<FlagOutlined />}
        name={getPriorityDisplayName(formData.name)}
        active={selectedPriority.active}
        statusLabel={t(selectedPriority.active ? "active" : "inactive")}
        backLabel={t("back")}
        onClose={onClose}
      />
    ) : null;
  }

  const isCreate = formMode === FORM_MODES.CREATE;

  return (
    <CatalogNameForm
      title={t(isCreate ? "createTitle" : "editTitle")}
      icon={isCreate ? <FlagOutlined /> : <EditOutlined />}
      name={formData.name}
      nameLabel={t("name")}
      nameError={requiredFieldsIncomplete.name}
      errorMessage={errorMessage}
      loading={loading}
      cancelLabel={t("cancel")}
      submitLabel={t(loading ? "saving" : isCreate ? "createPriority" : "saveChanges")}
      onChange={handleFormChange}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
