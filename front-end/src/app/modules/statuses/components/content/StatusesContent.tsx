"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import type { GridColDef } from "@mui/x-data-grid";
import RuleOutlined from "@mui/icons-material/RuleOutlined";

import { useAuth } from "@/hooks/useAuth";

import { isProtectedStatus, type StatusResponse } from "@/types/statusTypes";

import { USER_ROLES } from "@/types/roleTypes";

import { FORM_MODES, type FormMode } from "@/utils/constans";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import PageLoading from "@/components/ui/PageLoading";
import { CatalogList, catalogRowActions, CatalogName } from "@/app/modules/adminCatalog/CatalogList";
import { CatalogStatusBadge, CatalogStatusDialog } from "@/app/modules/adminCatalog/CatalogEntityView";

import {
  activateStatus,
  deactivateStatus,
  getAllStatuses,
} from "../../services/statusService";

import StatusForm from "../form/StatusForm";

export default function StatusesContent() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  const t = useTranslations("Statuses.Content");
  const tCatalog = useTranslations("Common.AdminCatalog");
  const tStatuses = useTranslations("Common.Statuses");

  const [statuses, setStatuses] = useState<StatusResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [statusErrorMessage, setStatusErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formMode, setFormMode] = useState<FormMode>(FORM_MODES.CREATE);

  const [selectedStatus, setSelectedStatus] = useState<StatusResponse | null>(
    null,
  );

  const [statusToChange, setStatusToChange] = useState<StatusResponse | null>(
    null,
  );

  const [statusesUpdated, setStatusesUpdated] = useState(false);

  const fetchStatuses = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAllStatuses();

      setStatuses(response);
      setErrorMessage("");
    } catch (error) {
      logger.error("Failed to load statuses", error, {
        component: "StatusesContent",
        action: "fetchStatuses",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const loadStatuses = async () => {
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

      await fetchStatuses();
    };

    loadStatuses();
  }, [isAuthReady, user, router, statusesUpdated, fetchStatuses]);

  const getStatusDisplayName = (statusName: string) => {
    if (tStatuses.has(statusName)) {
      return tStatuses(statusName);
    }

    return statusName;
  };

  const handleCreateStatus = () => {
    setSelectedStatus(null);
    setFormMode(FORM_MODES.CREATE);
    setShowForm(true);
  };

  const handleViewStatus = (status: StatusResponse) => {
    setSelectedStatus(status);
    setFormMode(FORM_MODES.VIEW);
    setShowForm(true);
  };

  const handleEditStatus = (status: StatusResponse) => {
    if (isProtectedStatus(status.name)) {
      return;
    }

    setSelectedStatus(status);
    setFormMode(FORM_MODES.EDIT);
    setShowForm(true);
  };

  const handleOpenStatusDialog = (status: StatusResponse) => {
    if (status.active && isProtectedStatus(status.name)) {
      return;
    }

    setStatusErrorMessage("");
    setStatusToChange(status);
  };

  const handleCloseStatusDialog = () => {
    if (changingStatus) {
      return;
    }

    setStatusErrorMessage("");
    setStatusToChange(null);
  };

  const handleChangeStatus = async () => {
    if (!statusToChange) {
      return;
    }

    if (statusToChange.active && isProtectedStatus(statusToChange.name)) {
      return;
    }

    try {
      setChangingStatus(true);
      setStatusErrorMessage("");

      if (statusToChange.active) {
        await deactivateStatus(statusToChange.idStatus);
      } else {
        await activateStatus(statusToChange.idStatus);
      }

      setStatusToChange(null);

      setStatusesUpdated((previous) => !previous);
    } catch (error) {
      logger.error("Failed to change status", error, {
        component: "StatusesContent",
        action: "handleChangeStatus",
        statusId: statusToChange.idStatus,
      });

      const apiError = getApiError(error);

      setStatusErrorMessage(apiError?.message ?? t("statusChangeError"));
    } finally {
      setChangingStatus(false);
    }
  };

  const handleSubmitSuccess = () => {
    setStatusesUpdated((previous) => !previous);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedStatus(null);
  };

  const columns: GridColDef<StatusResponse>[] = [
    {
      field: "idStatus",
      headerName: t("id"),
      width: 80,
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 1,
      minWidth: 156,
      renderCell: ({ row }) => (
        <CatalogName name={getStatusDisplayName(row.name)} protectedItem={isProtectedStatus(row.name)} />
      ),
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
      getActions: ({ row }) => {
        const protectedItem = isProtectedStatus(row.name);

        return catalogRowActions({
          view: t("view"),
          edit: t("edit"),
          toggle: t(row.active ? "deactivate" : "activate"),
          active: row.active,
          onView: () => handleViewStatus(row),
          onEdit: () => handleEditStatus(row),
          onToggle: () => handleOpenStatusDialog(row),
          disabledEdit: protectedItem,
          disabledToggle: protectedItem && row.active,
          protectedHint: tCatalog("protectedStatus"),
        });
      },
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
      <StatusForm
        formMode={formMode}
        selectedStatus={selectedStatus}
        onClose={handleCloseForm}
        onSubmitSuccess={handleSubmitSuccess}
      />
    );
  }

  const deactivating = statusToChange?.active ?? false;

  return (
    <CatalogList
      title={t("title")}
      icon={<RuleOutlined />}
      rows={statuses}
      columns={columns}
      getRowId={(row) => row.idStatus}
      loading={loading}
      errorMessage={errorMessage}
      create={{ label: t("createStatus"), onClick: handleCreateStatus }}
    >
      <CatalogStatusDialog
        open={Boolean(statusToChange)}
        active={deactivating}
        title={t(deactivating ? "deactivateTitle" : "activateTitle")}
        message={statusToChange ? t(deactivating ? "deactivateConfirmation" : "activateConfirmation", { name: statusToChange.name }) : undefined}
        errorMessage={statusErrorMessage}
        saving={changingStatus}
        cancelLabel={t("cancel")}
        confirmLabel={t(changingStatus ? "saving" : deactivating ? "deactivate" : "activate")}
        onClose={handleCloseStatusDialog}
        onConfirm={handleChangeStatus}
      />
    </CatalogList>
  );
}
