"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import RuleOutlined from "@mui/icons-material/RuleOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";

import { CatalogEntityDetails, CatalogNameForm } from "@/app/modules/adminCatalog/CatalogEntityView";

import { type StatusResponse } from "@/types/statusTypes";

import { FORM_MODES, type FormMode } from "@/utils/constans";
import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";
import { getClassificationLabel } from "@/utils/ticketUiUtils";

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
  const t = useTranslations("Statuses.Form");
  const tStatuses = useTranslations("Common.Statuses");

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
            ? t("createError")
            : t("updateError")),
      );
    } finally {
      setLoading(false);
    }
  };

  if (isViewMode) {
    return selectedStatus ? (
      <CatalogEntityDetails
        title={t("viewTitle")}
        icon={<RuleOutlined />}
        name={getClassificationLabel(formData.name, tStatuses)}
        active={selectedStatus.active}
        statusLabel={t(selectedStatus.active ? "active" : "inactive")}
        backLabel={t("back")}
        onClose={onClose}
      />
    ) : null;
  }

  const isCreate = formMode === FORM_MODES.CREATE;

  return (
    <CatalogNameForm
      title={t(isCreate ? "createTitle" : "editTitle")}
      icon={isCreate ? <RuleOutlined /> : <EditOutlined />}
      name={formData.name}
      nameLabel={t("name")}
      nameError={requiredFieldsIncomplete.name}
      errorMessage={errorMessage}
      loading={loading}
      cancelLabel={t("cancel")}
      submitLabel={t(loading ? "saving" : isCreate ? "createStatus" : "saveChanges")}
      onChange={handleFormChange}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
