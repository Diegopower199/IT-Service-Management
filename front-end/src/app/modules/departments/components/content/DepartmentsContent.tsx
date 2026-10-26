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
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

import { useAuth } from "@/hooks/useAuth";

import type { DepartmentResponse } from "@/types/departmentTypes";
import { USER_ROLES } from "@/types/roleTypes";

import {
  DATA_GRID_LOCALE_TEXT,
  DEFAULT_PAGE_SIZE,
  FORM_MODES,
  PAGE_SIZE_OPTIONS,
  type FormMode,
} from "@/utils/constans";

import {
  activateDepartment,
  deactivateDepartment,
  getAllDepartments,
} from "../../services/departmentService";

import { getApiError } from "@/utils/apiErrorUtils";

import PageLoading from "@/components/ui/PageLoading";

import DepartmentForm from "../form/DepartmentForm";

export default function DepartmentsContent() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);

  const [loading, setLoading] = useState(false);
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

    const loadDepartments = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getAllDepartments();

        setDepartments(response);
      } catch (error) {
        console.error("Error loading departments:", error);

        const apiError = getApiError(error);

        setErrorMessage(apiError?.message ?? "Error loading departments.");
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, [isAuthReady, user, router, departmentsUpdated]);

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
      console.error("Error changing department status:", error);

      const apiError = getApiError(error);

      setStatusErrorMessage(
        apiError?.message ?? "Error changing department status.",
      );
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
          onClick={() => handleViewDepartment(row)}
        />,

        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditDepartment(row)}
        />,

        <GridActionsCellItem
          key="status"
          icon={
            row.active ? (
              <ToggleOffIcon color="error" />
            ) : (
              <ToggleOnIcon color="success" />
            )
          }
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
      <DepartmentForm
        formMode={formMode}
        selectedDepartment={selectedDepartment}
        onClose={handleCloseForm}
        onSubmitSuccess={handleSubmitSuccess}
      />
    );
  }

  return (
    <main>
      <h1>Departments</h1>

      <Button onClick={handleCreateDepartment}>
        Create Department <AddIcon />
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
        rows={departments}
        columns={columns}
        getRowId={(row) => row.idDepartment}
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
        open={Boolean(departmentStatusToChange)}
        onClose={handleCloseStatusDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {departmentStatusToChange?.active
            ? "Deactivate Department"
            : "Activate Department"}
        </DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to{" "}
            {departmentStatusToChange?.active ? "deactivate" : "activate"}{" "}
            department <strong>{departmentStatusToChange?.name}</strong>?
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
            onClick={handleChangeDepartmentStatus}
            disabled={changingStatus}
          >
            {changingStatus
              ? "Saving..."
              : departmentStatusToChange?.active
                ? "Deactivate"
                : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
