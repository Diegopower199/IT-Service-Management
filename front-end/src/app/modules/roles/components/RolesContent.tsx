"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert, Chip } from "@mui/material";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import { useAuth } from "@/hooks/useAuth";

import { RoleResponse, USER_ROLES } from "@/types/roleTypes";

import {
  DATA_GRID_LOCALE_TEXT,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/utils/constans";

import { getApiError } from "@/utils/apiErrorUtils";

import PageLoading from "@/components/ui/PageLoading";
import { getAllRoles } from "../services/rolesService";

export default function RolesContent() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  const [roles, setRoles] = useState<RoleResponse[]>([]);

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

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

    const loadRoles = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getAllRoles();

        setRoles(response);
      } catch (error) {
        console.error("Error loading roles:", error);

        const apiError = getApiError(error);

        setErrorMessage(apiError?.message ?? "Error loading roles.");
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, [isAuthReady, user, router]);

  const columns: GridColDef<RoleResponse>[] = [
    {
      field: "idRol",
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
  ];

  if (!isAuthReady || !user) {
    return <PageLoading />;
  }

  if (user.rol !== USER_ROLES.ADMIN) {
    return <PageLoading />;
  }

  return (
    <main>
      <h1>Roles</h1>

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
        rows={roles}
        columns={columns}
        getRowId={(row) => row.idRol}
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
    </main>
  );
}
