"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import type { GridColDef } from "@mui/x-data-grid";
import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";

import { useAuth } from "@/hooks/useAuth";

import type { DepartmentResponse } from "@/types/departmentTypes";
import { USER_ROLES } from "@/types/roleTypes";

import { FORM_MODES, type FormMode } from "@/utils/constans";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import PageLoading from "@/components/ui/PageLoading";
import { CatalogList, catalogRowActions } from "@/app/modules/adminCatalog/CatalogList";
import { CatalogStatusBadge, CatalogStatusDialog } from "@/app/modules/adminCatalog/CatalogEntityView";

import {
  activateDepartment,
  deactivateDepartment,
  getAllDepartments,
} from "../../services/departmentService";

import DepartmentForm from "../form/DepartmentForm";

export default function DepartmentsContent() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  const t = useTranslations("Departments.Content");

  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [statusErrorMessage, setStatusErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formMode, setFormMode] = useState<FormMode>(FORM_MODES.CREATE);

  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentResponse | null>(null);

  const [departmentStatusToChange, setDepartmentStatusToChange] =
    useState<DepartmentResponse | null>(null);

  const [departmentsUpdated, setDepartmentsUpdated] = useState(false);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAllDepartments();

      setDepartments(response);
      setErrorMessage("");
    } catch (error) {
      logger.error("Failed to load departments", error, {
        component: "DepartmentsContent",
        action: "fetchDepartments",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const loadDepartments = async () => {
      if (!isAuthReady) {
        return;
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      if (user.role !== USER_ROLES.ADMIN) {
        router.replace("/403");
        return;
      }

      await fetchDepartments();
    };

    loadDepartments();
  }, [isAuthReady, user, router, departmentsUpdated, fetchDepartments]);

  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setFormMode(FORM_MODES.CREATE);
    setShowForm(true);
  };

  const handleViewDepartment = (department: DepartmentResponse) => {
    setSelectedDepartment(department);
    setFormMode(FORM_MODES.VIEW);
    setShowForm(true);
  };

  const handleEditDepartment = (department: DepartmentResponse) => {
    setSelectedDepartment(department);
    setFormMode(FORM_MODES.EDIT);
    setShowForm(true);
  };

  const handleOpenStatusDialog = (department: DepartmentResponse) => {
    setStatusErrorMessage("");
    setDepartmentStatusToChange(department);
  };

  const handleCloseStatusDialog = () => {
    if (changingStatus) {
      return;
    }

    setStatusErrorMessage("");
    setDepartmentStatusToChange(null);
  };

  const handleChangeDepartmentStatus = async () => {
    if (!departmentStatusToChange) {
      return;
    }

    try {
      setChangingStatus(true);
      setStatusErrorMessage("");

      if (departmentStatusToChange.active) {
        await deactivateDepartment(departmentStatusToChange.idDepartment);
      } else {
        await activateDepartment(departmentStatusToChange.idDepartment);
      }

      setDepartmentStatusToChange(null);

      setDepartmentsUpdated((previous) => !previous);
    } catch (error) {
      logger.error("Failed to change department status", error, {
        component: "DepartmentsContent",
        action: "handleChangeDepartmentStatus",
        departmentId: departmentStatusToChange.idDepartment,
      });

      const apiError = getApiError(error);

      setStatusErrorMessage(apiError?.message ?? t("statusChangeError"));
    } finally {
      setChangingStatus(false);
    }
  };

  const handleSubmitSuccess = () => {
    setDepartmentsUpdated((previous) => !previous);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedDepartment(null);
  };

  const columns: GridColDef<DepartmentResponse>[] = [
    {
      field: "idDepartment",
      headerName: t("id"),
      width: 80,
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 1,
      minWidth: 156,
    },
    {
      field: "active",
      headerName: t("status"),
      width: 112,
      renderCell: ({ row }) => <CatalogStatusBadge active={row.active} label={t(row.active ? "active" : "inactive")} />,
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("actions"),
      width: 138,
      getActions: ({ row }) => catalogRowActions({
        view: t("view"),
        edit: t("edit"),
        toggle: t(row.active ? "deactivate" : "activate"),
        active: row.active,
        onView: () => handleViewDepartment(row),
        onEdit: () => handleEditDepartment(row),
        onToggle: () => handleOpenStatusDialog(row),
      }),
    },
  ];

  if (!isAuthReady || !user) {
    return <PageLoading />;
  }

  if (user.role !== USER_ROLES.ADMIN) {
    return <PageLoading />;
  }

  if (showForm) {
    return (
      <DepartmentForm
        formMode={formMode}
        selectedDepartment={selectedDepartment}
        onClose={handleCloseForm}
        onSubmitSuccess={handleSubmitSuccess}
      />
    );
  }

  const deactivating = departmentStatusToChange?.active ?? false;

  return (
    <CatalogList
      title={t("title")}
      icon={<ApartmentOutlined />}
      rows={departments}
      columns={columns}
      getRowId={(row) => row.idDepartment}
      loading={loading}
      errorMessage={errorMessage}
      create={{ label: t("createDepartment"), onClick: handleCreateDepartment }}
    >
      <CatalogStatusDialog
        open={Boolean(departmentStatusToChange)}
        active={deactivating}
        title={t(deactivating ? "deactivateTitle" : "activateTitle")}
        message={departmentStatusToChange ? t(deactivating ? "deactivateConfirmation" : "activateConfirmation", { name: departmentStatusToChange.name }) : undefined}
        errorMessage={statusErrorMessage}
        saving={changingStatus}
        cancelLabel={t("cancel")}
        confirmLabel={t(changingStatus ? "saving" : deactivating ? "deactivate" : "activate")}
        onClose={handleCloseStatusDialog}
        onConfirm={handleChangeDepartmentStatus}
      />
    </CatalogList>
  );
}
