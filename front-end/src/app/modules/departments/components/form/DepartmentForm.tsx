"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";

import { CatalogEntityDetails, CatalogNameForm } from "@/app/modules/adminCatalog/CatalogEntityView";

import type { DepartmentResponse } from "@/types/departmentTypes";

import { FORM_MODES, type FormMode } from "@/utils/constans";
import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import {
  createDepartment,
  updateDepartment,
} from "../../services/departmentService";

interface DepartmentFormProps {
  formMode: FormMode;
  selectedDepartment: DepartmentResponse | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

interface DepartmentFormData {
  name: string;
}

const INITIAL_FORM_DATA: DepartmentFormData = {
  name: "",
};

const getInitialFormData = (
  formMode: FormMode,
  selectedDepartment: DepartmentResponse | null,
): DepartmentFormData => {
  if (
    (formMode === FORM_MODES.EDIT || formMode === FORM_MODES.VIEW) &&
    selectedDepartment
  ) {
    return {
      name: selectedDepartment.name,
    };
  }

  return { ...INITIAL_FORM_DATA };
};

export default function DepartmentForm({
  formMode,
  selectedDepartment,
  onClose,
  onSubmitSuccess,
}: DepartmentFormProps) {
  const t = useTranslations("Departments.Form");

  const [formData, setFormData] = useState<DepartmentFormData>(
    getInitialFormData(formMode, selectedDepartment),
  );

  const [loading, setLoading] = useState(false);

  const [requiredFieldsIncomplete, setRequiredFieldsIncomplete] = useState<
    Partial<Record<keyof DepartmentFormData, string>>
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
    const errorMissingFields: Partial<
      Record<keyof DepartmentFormData, string>
    > = {};

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
        await createDepartment({
          name: formData.name,
        });
      }

      if (formMode === FORM_MODES.EDIT && selectedDepartment) {
        await updateDepartment(selectedDepartment.idDepartment, {
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
          ? "Failed to create department"
          : "Failed to update department",
        error,
        {
          component: "DepartmentForm",
          action: "handleSubmit",
          formMode,
          ...(selectedDepartment && {
            departmentId: selectedDepartment.idDepartment,
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
    return selectedDepartment ? (
      <CatalogEntityDetails
        title={t("viewTitle")}
        icon={<ApartmentOutlined />}
        name={formData.name}
        active={selectedDepartment.active}
        statusLabel={t(selectedDepartment.active ? "active" : "inactive")}
        backLabel={t("back")}
        onClose={onClose}
      />
    ) : null;
  }

  const isCreate = formMode === FORM_MODES.CREATE;

  return (
    <CatalogNameForm
      title={t(isCreate ? "createTitle" : "editTitle")}
      icon={isCreate ? <ApartmentOutlined /> : <EditOutlined />}
      name={formData.name}
      nameLabel={t("name")}
      nameError={requiredFieldsIncomplete.name}
      errorMessage={errorMessage}
      loading={loading}
      cancelLabel={t("cancel")}
      submitLabel={t(loading ? "saving" : isCreate ? "createDepartment" : "saveChanges")}
      onChange={handleFormChange}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
