"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import type { GridColDef } from "@mui/x-data-grid";
import FlagOutlined from "@mui/icons-material/FlagOutlined";

import { useAuth } from "@/hooks/useAuth";

import {
  isProtectedPriority,
  type PriorityResponse,
} from "@/types/priorityTypes";

import { USER_ROLES } from "@/types/roleTypes";

import { FORM_MODES, type FormMode } from "@/utils/constans";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";
import { getClassificationLabel } from "@/utils/ticketUiUtils";

import PageLoading from "@/components/ui/PageLoading";
import { CatalogList, catalogRowActions, CatalogName } from "@/app/modules/adminCatalog/CatalogList";
import { CatalogStatusBadge, CatalogStatusDialog } from "@/app/modules/adminCatalog/CatalogEntityView";

import {
  activatePriority,
  deactivatePriority,
  getAllPriorities,
} from "../../services/priorityService";

import PriorityForm from "../form/PriorityForm";

export default function PrioritiesContent() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  const t = useTranslations("Priorities.Content");
  const tCatalog = useTranslations("Common.AdminCatalog");
  const tPriorities = useTranslations("Common.Priorities");

  const [priorities, setPriorities] = useState<PriorityResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [statusErrorMessage, setStatusErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formMode, setFormMode] = useState<FormMode>(FORM_MODES.CREATE);

  const [selectedPriority, setSelectedPriority] =
    useState<PriorityResponse | null>(null);

  const [priorityStatusToChange, setPriorityStatusToChange] =
    useState<PriorityResponse | null>(null);

  const [prioritiesUpdated, setPrioritiesUpdated] = useState(false);

  const fetchPriorities = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAllPriorities();

      setPriorities(response);
      setErrorMessage("");
    } catch (error) {
      logger.error("Failed to load priorities", error, {
        component: "PrioritiesContent",
        action: "fetchPriorities",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const loadPriorities = async () => {
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

      await fetchPriorities();
    };

    loadPriorities();
  }, [isAuthReady, user, router, prioritiesUpdated, fetchPriorities]);

  const handleCreatePriority = () => {
    setSelectedPriority(null);
    setFormMode(FORM_MODES.CREATE);
    setShowForm(true);
  };

  const handleViewPriority = (priority: PriorityResponse) => {
    setSelectedPriority(priority);
    setFormMode(FORM_MODES.VIEW);
    setShowForm(true);
  };

  const handleEditPriority = (priority: PriorityResponse) => {
    if (isProtectedPriority(priority.name)) {
      return;
    }

    setSelectedPriority(priority);
    setFormMode(FORM_MODES.EDIT);
    setShowForm(true);
  };

  const handleOpenStatusDialog = (priority: PriorityResponse) => {
    if (priority.active && isProtectedPriority(priority.name)) {
      return;
    }

    setStatusErrorMessage("");
    setPriorityStatusToChange(priority);
  };

  const handleCloseStatusDialog = () => {
    if (changingStatus) {
      return;
    }

    setStatusErrorMessage("");
    setPriorityStatusToChange(null);
  };

  const handleChangePriorityStatus = async () => {
    if (!priorityStatusToChange) {
      return;
    }

    if (
      priorityStatusToChange.active &&
      isProtectedPriority(priorityStatusToChange.name)
    ) {
      return;
    }

    try {
      setChangingStatus(true);
      setStatusErrorMessage("");

      if (priorityStatusToChange.active) {
        await deactivatePriority(priorityStatusToChange.idPriority);
      } else {
        await activatePriority(priorityStatusToChange.idPriority);
      }

      setPriorityStatusToChange(null);

      setPrioritiesUpdated((previous) => !previous);
    } catch (error) {
      logger.error("Failed to change priority status", error, {
        component: "PrioritiesContent",
        action: "handleChangePriorityStatus",
        priorityId: priorityStatusToChange.idPriority,
      });

      const apiError = getApiError(error);

      setStatusErrorMessage(apiError?.message ?? t("statusChangeError"));
    } finally {
      setChangingStatus(false);
    }
  };

  const handleSubmitSuccess = () => {
    setPrioritiesUpdated((previous) => !previous);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPriority(null);
  };

  const columns: GridColDef<PriorityResponse>[] = [
    {
      field: "idPriority",
      headerName: t("id"),
      width: 80,
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 1,
      minWidth: 156,
      renderCell: ({ row }) => (
        <CatalogName name={getClassificationLabel(row.name, tPriorities)} protectedItem={isProtectedPriority(row.name)} />
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
        const protectedItem = isProtectedPriority(row.name);

        return catalogRowActions({
          view: t("view"),
          edit: t("edit"),
          toggle: t(row.active ? "deactivate" : "activate"),
          active: row.active,
          onView: () => handleViewPriority(row),
          onEdit: () => handleEditPriority(row),
          onToggle: () => handleOpenStatusDialog(row),
          disabledEdit: protectedItem,
          disabledToggle: protectedItem && row.active,
          protectedHint: tCatalog("protectedPriority"),
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
      <PriorityForm
        formMode={formMode}
        selectedPriority={selectedPriority}
        onClose={handleCloseForm}
        onSubmitSuccess={handleSubmitSuccess}
      />
    );
  }

  const deactivating = priorityStatusToChange?.active ?? false;

  return (
    <CatalogList
      title={t("title")}
      icon={<FlagOutlined />}
      rows={priorities}
      columns={columns}
      getRowId={(row) => row.idPriority}
      loading={loading}
      errorMessage={errorMessage}
      create={{ label: t("createPriority"), onClick: handleCreatePriority }}
    >
      <CatalogStatusDialog
        open={Boolean(priorityStatusToChange)}
        active={deactivating}
        title={t(deactivating ? "deactivateTitle" : "activateTitle")}
        message={priorityStatusToChange ? t(deactivating ? "deactivateConfirmation" : "activateConfirmation", {
          name: getClassificationLabel(priorityStatusToChange.name, tPriorities),
        }) : undefined}
        errorMessage={statusErrorMessage}
        saving={changingStatus}
        cancelLabel={t("cancel")}
        confirmLabel={t(changingStatus ? "saving" : deactivating ? "deactivate" : "activate")}
        onClose={handleCloseStatusDialog}
        onConfirm={handleChangePriorityStatus}
      />
    </CatalogList>
  );
}
