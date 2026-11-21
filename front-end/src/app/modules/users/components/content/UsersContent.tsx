"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";

import { Alert, Button, Chip } from "@mui/material";

import AddRounded from "@mui/icons-material/AddRounded";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import EditOutlined from "@mui/icons-material/EditOutlined";
import PeopleOutlineRounded from "@mui/icons-material/PeopleOutlineRounded";
import RemoveCircleOutlineRounded from "@mui/icons-material/RemoveCircleOutlineRounded";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";

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

import PageLoading from "@/components/ui/PageLoading";
import sharedStyles from "../../styles/users.module.css";

import styles from "./UsersContent.module.css";

const getUserRowHeight = () => "auto" as const;

function getRoleBadgeColor(role: string) {
  if (role === USER_ROLES.ADMIN) return "primary";
  if (role === USER_ROLES.TECHNICIAN) return "info";
  return "default";
}

export default function UsersContent() {
  const { user, isAuthReady } = useAuth();

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const router = useRouter();

  const t = useTranslations("Users.Content");
  const tRoles = useTranslations("Common.Roles");
  const locale = useLocale();
  const gridLocaleText = locale === "es"
    ? esES.components.MuiDataGrid.defaultProps.localeText
    : DATA_GRID_LOCALE_TEXT;

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

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
      minWidth: 126,
      cellClassName: styles.username,
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 1.15,
      minWidth: 156,
      cellClassName: styles.wrapCell,
      valueGetter: (_, row) => `${row.firstName} ${row.lastName}`,
    },
    {
      field: "email",
      headerName: t("email"),
      flex: 1.5,
      minWidth: 210,
      cellClassName: styles.wrapCell,
    },
    {
      field: "role",
      headerName: t("role"),
      width: 135,
      valueGetter: (_, row) => row.role.name,
      renderCell: (params) => (
        <Chip
          label={
            tRoles.has(params.row.role.name)
              ? tRoles(params.row.role.name)
              : params.row.role.name
          }
          size="small"
          color={getRoleBadgeColor(params.row.role.name)}
          className={sharedStyles.badge}
        />
      ),
    },
    {
      field: "department",
      headerName: t("department"),
      flex: 0.85,
      minWidth: 142,
      cellClassName: styles.wrapCell,
      valueGetter: (_, row) => row.department?.name ?? "",
      renderCell: (params) => params.row.department?.name ?? "-",
    },
    {
      field: "enabled",
      headerName: t("status"),
      width: 116,
      renderCell: (params) => (
        <Chip
          label={params.row.enabled ? t("enabled") : t("disabled")}
          color={params.row.enabled ? "success" : "default"}
          size="small"
          icon={params.row.enabled ? <CheckCircleOutlineRounded /> : <RemoveCircleOutlineRounded />}
          className={`${sharedStyles.badge} ${sharedStyles.statusBadge}`}
        />
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("actions"),
      width: 108,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityOutlined />}
          label={t("view")}
          title={t("view")}
          className={styles.viewAction}
          onClick={() => handleViewUser(row)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditOutlined />}
          label={t("edit")}
          title={t("edit")}
          className={styles.editAction}
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
    <div className={sharedStyles.page}>
      <header className={styles.listHeader}>
        <div className={sharedStyles.heading}>
          <span className={sharedStyles.headingIcon} aria-hidden="true">
            <PeopleOutlineRounded />
          </span>
          <h1 id="users-heading">{t("title")}</h1>
        </div>
        <Button
          variant="contained"
          disableElevation
          startIcon={<AddRounded />}
          onClick={handleCreateUser}
          className={sharedStyles.primaryButton}
        >
          {t("createUser")}
        </Button>
      </header>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <div className={styles.gridPanel}>
        <DataGrid
          className={styles.grid}
          aria-labelledby="users-heading"
          rows={users}
          columns={columns}
          getRowId={(row) => row.idUser}
          getRowHeight={getUserRowHeight}
          columnHeaderHeight={46}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={totalElements}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          localeText={{ ...gridLocaleText, noRowsLabel: errorMessage ? "" : t("empty") }}
          loading={loading}
          slotProps={{
            loadingOverlay: { variant: "linear-progress", noRowsVariant: "skeleton" },
          }}
        />
      </div>
    </div>
  );
}
