"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import type { GridColDef } from "@mui/x-data-grid";
import AdminPanelSettingsOutlined from "@mui/icons-material/AdminPanelSettingsOutlined";

import { useAuth } from "@/hooks/useAuth";

import type { RoleResponse } from "@/types/roleTypes";
import { USER_ROLES } from "@/types/roleTypes";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import PageLoading from "@/components/ui/PageLoading";
import { CatalogList } from "@/app/modules/adminCatalog/CatalogList";

import { getAllRoles } from "../services/rolesService";

export default function RolesContent() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  const t = useTranslations("Roles.Content");
  const tRoles = useTranslations("Common.Roles");

  const [roles, setRoles] = useState<RoleResponse[]>([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAllRoles();

      setRoles(response);
      setErrorMessage("");
    } catch (error) {
      logger.error("Failed to load roles", error, {
        component: "RolesContent",
        action: "fetchRoles",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const loadRoles = async () => {
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

      await fetchRoles();
    };

    loadRoles();
  }, [isAuthReady, user, router, fetchRoles]);

  const columns: GridColDef<RoleResponse>[] = [
    {
      field: "idRole",
      headerName: t("id"),
      width: 80,
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 1,
      minWidth: 160,
      renderCell: (params) => tRoles(params.row.name),
    },
  ];

  if (!isAuthReady || !user) {
    return <PageLoading />;
  }

  if (user.role !== USER_ROLES.ADMIN) {
    return <PageLoading />;
  }

  return (
    <CatalogList
      title={t("title")}
      icon={<AdminPanelSettingsOutlined />}
      rows={roles}
      columns={columns}
      getRowId={(row) => row.idRole}
      loading={loading}
      errorMessage={errorMessage}
    />
  );
}
