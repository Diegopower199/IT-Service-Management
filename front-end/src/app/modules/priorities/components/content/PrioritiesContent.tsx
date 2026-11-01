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

import {
  isProtectedPriority,
  type PriorityResponse,
} from "@/types/priorityTypes";

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
  activatePriority,
  deactivatePriority,
  getAllPriorities,
} from "../../services/priorityService";

import PriorityForm from "../form/PriorityForm";

export default function PrioritiesContent() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  const t = useTranslations("Priorities.Content");
  const tPriorities = useTranslations("Common.Priorities");

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

    if (user.role !== USER_ROLES.ADMIN) {
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
        logger.error("Failed to load priorities", error, {
          component: "PrioritiesContent",
          action: "loadPriorities",
        });

        const apiError = getApiError(error);

        setErrorMessage(apiError?.message ?? t("loadError"));
      } finally {
        setLoading(false);
      }
    };

    loadPriorities();
  }, [isAuthReady, user, router, prioritiesUpdated, t]);

  const getPriorityDisplayName = (priorityName: string) => {
    if (isProtectedPriority(priorityName)) {
      return tPriorities(priorityName);
    }

    return priorityName;
  };

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
      width: 100,
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 1,
      minWidth: 200,
      renderCell: (params) => getPriorityDisplayName(params.row.name),
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
        const protectedPriority = isProtectedPriority(row.name);

        return [
          <GridActionsCellItem
            key="view"
            icon={<VisibilityIcon />}
            label={t("view")}
            onClick={() => handleViewPriority(row)}
          />,

          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label={t("edit")}
            disabled={protectedPriority}
            onClick={() => handleEditPriority(row)}
          />,

          <GridActionsCellItem
            key="status"
            icon={<ChangeCircleIcon />}
            label={row.active ? t("deactivate") : t("activate")}
            disabled={protectedPriority && row.active}
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
      <h1>{t("title")}</h1>

      <Button variant="contained" onClick={handleCreatePriority}>
        {t("createPriority")} <AddIcon />
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
            ? t("deactivateTitle")
            : t("activateTitle")}
        </DialogTitle>

        <DialogContent>
          {priorityStatusToChange && (
            <Typography>
              {priorityStatusToChange.active
                ? t("deactivateConfirmation", {
                    name: getPriorityDisplayName(priorityStatusToChange.name),
                  })
                : t("activateConfirmation", {
                    name: getPriorityDisplayName(priorityStatusToChange.name),
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
            onClick={handleChangePriorityStatus}
            disabled={changingStatus}
          >
            {changingStatus
              ? t("saving")
              : priorityStatusToChange?.active
                ? t("deactivate")
                : t("activate")}
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
