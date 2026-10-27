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

import type { PriorityResponse } from "@/types/priorityTypes";
import { USER_ROLES } from "@/types/roleTypes";

import {
  DATA_GRID_LOCALE_TEXT,
  DEFAULT_PAGE_SIZE,
  FORM_MODES,
  PAGE_SIZE_OPTIONS,
  type FormMode,
} from "@/utils/constans";

import {
  activatePriority,
  deactivatePriority,
  getAllPriorities,
} from "../../services/priorityService";

import { getApiError } from "@/utils/apiErrorUtils";

import PageLoading from "@/components/ui/PageLoading";
import PriorityForm from "../form/PriorityForm";

export default function PrioritiesContent() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  const [priorities, setPriorities] = useState<PriorityResponse[]>([]);

  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.rol !== USER_ROLES.ADMIN) {
      router.replace("/403");
      return;
    }

    const loadPriorities = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getAllPriorities();

        setPriorities(response);
      } catch (error) {
        console.error("Error loading priorities:", error);

        const apiError = getApiError(error);

        setErrorMessage(apiError?.message ?? "Error loading priorities.");
      } finally {
        setLoading(false);
      }
    };

    loadPriorities();
  }, [isAuthReady, user, router, prioritiesUpdated]);

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
    setSelectedPriority(priority);
    setFormMode(FORM_MODES.EDIT);
    setShowForm(true);
  };

  const handleOpenStatusDialog = (priority: PriorityResponse) => {
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
      console.error("Error changing priority status:", error);

      const apiError = getApiError(error);

      setStatusErrorMessage(
        apiError?.message ?? "Error changing priority status.",
      );
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
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="View"
          onClick={() => handleViewPriority(row)}
        />,

        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditPriority(row)}
        />,

        <GridActionsCellItem
          key="status"
          icon={<ChangeCircleIcon />}
          label={row.active ? "Deactivate" : "Activate"}
          onClick={() => handleOpenStatusDialog(row)}
        />,
      ],
    },
  ];

  if (!isAuthReady || !user) {
    return <PageLoading />;
  }

  if (user.rol !== USER_ROLES.ADMIN) {
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

  return (
    <main>
      <h1>Priorities</h1>

      <Button variant="contained" onClick={handleCreatePriority}>
        Create Priority <AddIcon />
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
        rows={priorities}
        columns={columns}
        getRowId={(row) => row.idPriority}
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
        open={Boolean(priorityStatusToChange)}
        onClose={handleCloseStatusDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {priorityStatusToChange?.active
            ? "Deactivate Priority"
            : "Activate Priority"}
        </DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to{" "}
            {priorityStatusToChange?.active ? "deactivate" : "activate"}{" "}
            priority <strong>{priorityStatusToChange?.name}</strong>?
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
            onClick={handleChangePriorityStatus}
            disabled={changingStatus}
          >
            {changingStatus
              ? "Saving..."
              : priorityStatusToChange?.active
                ? "Deactivate"
                : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
