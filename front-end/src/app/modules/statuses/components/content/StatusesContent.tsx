"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from "@mui/x-data-grid";

import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";

import { useAuth } from "@/hooks/useAuth";

import { isProtectedStatus, type StatusResponse } from "@/types/statusTypes";

import { USER_ROLES } from "@/types/roleTypes";

import {
  DATA_GRID_LOCALE_TEXT,
  DEFAULT_PAGE_SIZE,
  FORM_MODES,
  PAGE_SIZE_OPTIONS,
  type FormMode,
} from "@/utils/constans";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import PageLoading from "@/components/ui/PageLoading";

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
  const tStatuses = useTranslations("Common.Statuses");

  const [statuses, setStatuses] = useState<StatusResponse[]>([]);

  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
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

    const loadStatuses = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getAllStatuses();

        setStatuses(response);
      } catch (error) {
        logger.error("Failed to load statuses", error, {
          component: "StatusesContent",
          action: "loadStatuses",
        });

        const apiError = getApiError(error);

        setErrorMessage(apiError?.message ?? t("loadError"));
      } finally {
        setLoading(false);
      }
    };

    loadStatuses();
  }, [isAuthReady, user, router, statusesUpdated, t]);

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
      width: 100,
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 1,
      minWidth: 200,
      renderCell: (params) => getStatusDisplayName(params.row.name),
    },
    {
      field: "active",
      headerName: t("status"),
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.row.active ? t("active") : t("inactive")}
          color={params.row.active ? "success" : "default"}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("actions"),
      width: 170,
      getActions: ({ row }) => {
        const protectedStatus = isProtectedStatus(row.name);

        return [
          <GridActionsCellItem
            key="view"
            icon={<VisibilityIcon />}
            label={t("view")}
            onClick={() => handleViewStatus(row)}
          />,

          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label={t("edit")}
            disabled={protectedStatus}
            onClick={() => handleEditStatus(row)}
          />,

          <GridActionsCellItem
            key="status"
            icon={<ChangeCircleIcon />}
            label={row.active ? t("deactivate") : t("activate")}
            disabled={protectedStatus && row.active}
            onClick={() => handleOpenStatusDialog(row)}
          />,
        ];
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

  return (
    <main>
      <h1>{t("title")}</h1>

      <Button variant="contained" onClick={handleCreateStatus}>
        {t("createStatus")} <AddIcon />
      </Button>

      {errorMessage && (
        <Alert
          severity="error"
          sx={{
            my: 2,
          }}
        >
          {errorMessage}
        </Alert>
      )}

      <DataGrid
        rows={statuses}
        columns={columns}
        getRowId={(row) => row.idStatus}
        loading={loading}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        initialState={{
          pagination: {
            paginationModel: {
              page: 0,
              pageSize: DEFAULT_PAGE_SIZE,
            },
          },
        }}
        localeText={DATA_GRID_LOCALE_TEXT}
      />

      <Dialog
        open={Boolean(statusToChange)}
        onClose={handleCloseStatusDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {statusToChange?.active ? t("deactivateTitle") : t("activateTitle")}
        </DialogTitle>

        <DialogContent>
          {statusToChange && (
            <Typography>
              {statusToChange.active
                ? t("deactivateConfirmation", {
                    name: getStatusDisplayName(statusToChange.name),
                  })
                : t("activateConfirmation", {
                    name: getStatusDisplayName(statusToChange.name),
                  })}
            </Typography>
          )}

          {statusErrorMessage && (
            <Alert
              severity="error"
              sx={{
                mt: 2,
              }}
            >
              {statusErrorMessage}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            type="button"
            variant="outlined"
            onClick={handleCloseStatusDialog}
            disabled={changingStatus}
          >
            {t("cancel")}
          </Button>

          <Button
            type="button"
            variant="contained"
            onClick={handleChangeStatus}
            disabled={changingStatus}
          >
            {changingStatus
              ? t("saving")
              : statusToChange?.active
                ? t("deactivate")
                : t("activate")}
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
