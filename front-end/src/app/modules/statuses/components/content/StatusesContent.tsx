"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

import { isSystemStatus, type StatusResponse } from "@/types/statusTypes";

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

        setErrorMessage(apiError?.message ?? "Error loading statuses.");
      } finally {
        setLoading(false);
      }
    };

    loadStatuses();
  }, [isAuthReady, user, router, statusesUpdated]);

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
    if (isSystemStatus(status.name)) {
      return;
    }

    setSelectedStatus(status);
    setFormMode(FORM_MODES.EDIT);
    setShowForm(true);
  };

  const handleOpenStatusDialog = (status: StatusResponse) => {
    if (status.active && isSystemStatus(status.name)) {
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

    if (statusToChange.active && isSystemStatus(statusToChange.name)) {
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

      setStatusErrorMessage(apiError?.message ?? "Error changing status.");
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
      headerName: "ID",
      width: 100,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "active",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.row.active ? "Active" : "Inactive"}
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
      headerName: "Actions",
      width: 170,
      getActions: ({ row }) => {
        const protectedStatus = isSystemStatus(row.name);

        return [
          <GridActionsCellItem
            key="view"
            icon={<VisibilityIcon />}
            label="View"
            onClick={() => handleViewStatus(row)}
          />,

          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            disabled={protectedStatus}
            onClick={() => handleEditStatus(row)}
          />,

          <GridActionsCellItem
            key="status"
            icon={<ChangeCircleIcon />}
            label={row.active ? "Deactivate" : "Activate"}
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
      <h1>Statuses</h1>

      <Button variant="contained" onClick={handleCreateStatus}>
        Create Status <AddIcon />
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
          {statusToChange?.active ? "Deactivate Status" : "Activate Status"}
        </DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to{" "}
            {statusToChange?.active ? "deactivate" : "activate"} status{" "}
            <strong>{statusToChange?.name}</strong>?
          </Typography>

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
            Cancel
          </Button>

          <Button
            type="button"
            variant="contained"
            onClick={handleChangeStatus}
            disabled={changingStatus}
          >
            {changingStatus
              ? "Saving..."
              : statusToChange?.active
                ? "Deactivate"
                : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
