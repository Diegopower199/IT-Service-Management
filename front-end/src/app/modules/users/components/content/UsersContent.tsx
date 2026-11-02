"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

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

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import { getAllUsers } from "../../services/userService";

import UserForm from "../form/UserForm";

import Button from "@/components/ui/Button";
import PageLoading from "@/components/ui/PageLoading";

export default function UsersContent() {
  const { user, isAuthReady } = useAuth();

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const router = useRouter();

  const t = useTranslations("Users.Content");
  const tRoles = useTranslations("Common.Roles");

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

  const fetchUsers = useCallback(async () => {
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
      logger.error("Failed to load users", error, {
        component: "UsersContent",
        action: "fetchUsers",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [paginationModel, t]);

  useEffect(() => {
    const loadUsers = async () => {
      if (!isAuthReady) {
        return;
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      if (!isAdmin) {
        router.replace("/403");
        return;
      }

      await fetchUsers();
    };

    loadUsers();
  }, [isAuthReady, user, isAdmin, router, usersUpdated, fetchUsers]);

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
      headerName: t("username"),
      flex: 1,
      minWidth: 150,
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 1,
      minWidth: 180,
      valueGetter: (_, row) => `${row.firstName} ${row.lastName}`,
    },
    {
      field: "email",
      headerName: t("email"),
      flex: 1,
      minWidth: 220,
    },
    {
      field: "role",
      headerName: t("role"),
      width: 150,
      valueGetter: (_, row) => row.role.name,
      renderCell: (params) => (
        <Chip
          label={
            tRoles.has(params.row.role.name)
              ? tRoles(params.row.role.name)
              : params.row.role.name
          }
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
      headerName: t("department"),
      width: 170,
      valueGetter: (_, row) => row.department?.name ?? "",
      renderCell: (params) => params.row.department?.name ?? "-",
    },
    {
      field: "enabled",
      headerName: t("status"),
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.row.enabled ? t("enabled") : t("disabled")}
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
      headerName: t("actions"),
      width: 120,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label={t("view")}
          onClick={() => handleViewUser(row)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label={t("edit")}
          onClick={() => handleEditUser(row)}
        />,
      ],
    },
  ];

  if (!isAuthReady || !user) {
    return <PageLoading />;
  }

  if (!isAdmin) {
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
      <h1>{t("title")}</h1>

      <Button onClick={handleCreateUser}>
        {t("createUser")} <AddIcon />
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
