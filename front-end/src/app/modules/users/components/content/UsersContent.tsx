"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from "@mui/x-data-grid";

import { Alert, Chip } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";

import { useAuth } from "@/hooks/useAuth";

import type { UserResponse } from "@/types/userTypes";
import { USER_ROLES } from "@/types/roleTypes";

import {
  DATA_GRID_LOCALE_TEXT,
  DEFAULT_PAGE_SIZE,
  FORM_MODES,
  type FormMode,
  PAGE_SIZE_OPTIONS,
} from "@/utils/constans";

import { getAllUsers } from "../../services/userService";

import UserForm from "../form/UserForm";

import Button from "@/components/ui/Button";
import PageLoading from "@/components/ui/PageLoading";

import { getApiError } from "@/utils/apiErrorUtils";

export default function UsersContent() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formMode, setFormMode] = useState<FormMode>(FORM_MODES.CREATE);

  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  const [usersUpdated, setUsersUpdated] = useState(false);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

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

    const loadUsers = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getAllUsers(
          paginationModel.page,
          paginationModel.pageSize,
          "idUser,asc",
        );

        setUsers(response.content);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error("Error loading users:", error);

        const apiError = getApiError(error);

        setErrorMessage(apiError?.message ?? "Error loading users.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [isAuthReady, user, router, paginationModel, usersUpdated]);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormMode(FORM_MODES.CREATE);

    setShowForm(true);
  };

  const handleViewUser = (user: UserResponse) => {
    setSelectedUser(user);
    setFormMode(FORM_MODES.VIEW);

    setShowForm(true);
  };

  const handleEditUser = (user: UserResponse) => {
    setSelectedUser(user);
    setFormMode(FORM_MODES.EDIT);

    setShowForm(true);
  };

  const handleSubmitSuccess = () => {
    setUsersUpdated((previous) => !previous);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  const columns: GridColDef<UserResponse>[] = [
    {
      field: "username",
      headerName: "Username",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 180,
      valueGetter: (_, row) => `${row.firstName} ${row.lastName}`,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 220,
    },
    {
      field: "role",
      headerName: "Role",
      width: 150,
      valueGetter: (_, row) => row.role.name,
      renderCell: (params) => (
        <Chip
          label={params.row.role.name}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: "department",
      headerName: "Department",
      width: 170,
      valueGetter: (_, row) => row.department?.name ?? "",
      renderCell: (params) => params.row.department?.name ?? "-",
    },
    {
      field: "enabled",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.row.enabled ? "Enabled" : "Disabled"}
          color={params.row.enabled ? "success" : "default"}
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
      width: 120,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="View"
          onClick={() => handleViewUser(row)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditUser(row)}
        />,
      ],
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
      <UserForm
        formMode={formMode}
        selectedUser={selectedUser}
        onClose={handleCloseForm}
        onSubmitSuccess={handleSubmitSuccess}
      />
    );
  }

  return (
    <main>
      <h1>Users</h1>

      <Button onClick={handleCreateUser}>
        Create User <AddIcon />
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
        rows={users}
        columns={columns}
        getRowId={(row) => row.idUser}
        pagination
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={totalElements}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        localeText={DATA_GRID_LOCALE_TEXT}
        loading={loading}
      />
    </main>
  );
}
