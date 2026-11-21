"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import type { GridColDef } from "@mui/x-data-grid";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";

import { useAuth } from "@/hooks/useAuth";

import type { CategoryResponse } from "@/types/categoryTypes";
import { USER_ROLES } from "@/types/roleTypes";

import { FORM_MODES, type FormMode } from "@/utils/constans";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import PageLoading from "@/components/ui/PageLoading";
import { CatalogList, catalogRowActions } from "@/app/modules/adminCatalog/CatalogList";
import { CatalogStatusBadge, CatalogStatusDialog } from "@/app/modules/adminCatalog/CatalogEntityView";
import sharedStyles from "@/app/modules/tickets/styles/tickets.module.css";

import {
  activateCategory,
  deactivateCategory,
  getAllCategories,
} from "../../services/categoryService";

import CategoryForm from "../form/CategoryForm";

export default function CategoriesContent() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  const t = useTranslations("Categories.Content");

  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [statusErrorMessage, setStatusErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formMode, setFormMode] = useState<FormMode>(FORM_MODES.CREATE);

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryResponse | null>(null);

  const [categoryStatusToChange, setCategoryStatusToChange] =
    useState<CategoryResponse | null>(null);

  const [categoriesUpdated, setCategoriesUpdated] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAllCategories();

      setCategories(response);
      setErrorMessage("");
    } catch (error) {
      logger.error("Failed to load categories", error, {
        component: "CategoriesContent",
        action: "fetchCategories",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const loadCategories = async () => {
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

      await fetchCategories();
    };

    loadCategories();
  }, [isAuthReady, user, router, categoriesUpdated, fetchCategories]);

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setFormMode(FORM_MODES.CREATE);
    setShowForm(true);
  };

  const handleViewCategory = (category: CategoryResponse) => {
    setSelectedCategory(category);
    setFormMode(FORM_MODES.VIEW);
    setShowForm(true);
  };

  const handleEditCategory = (category: CategoryResponse) => {
    setSelectedCategory(category);
    setFormMode(FORM_MODES.EDIT);
    setShowForm(true);
  };

  const handleOpenStatusDialog = (category: CategoryResponse) => {
    setStatusErrorMessage("");
    setCategoryStatusToChange(category);
  };

  const handleCloseStatusDialog = () => {
    if (changingStatus) {
      return;
    }

    setStatusErrorMessage("");
    setCategoryStatusToChange(null);
  };

  const handleChangeCategoryStatus = async () => {
    if (!categoryStatusToChange) {
      return;
    }

    try {
      setChangingStatus(true);
      setStatusErrorMessage("");

      if (categoryStatusToChange.active) {
        await deactivateCategory(categoryStatusToChange.idCategory);
      } else {
        await activateCategory(categoryStatusToChange.idCategory);
      }

      setCategoryStatusToChange(null);

      setCategoriesUpdated((previous) => !previous);
    } catch (error) {
      logger.error("Failed to change category status", error, {
        component: "CategoriesContent",
        action: "handleChangeCategoryStatus",
        categoryId: categoryStatusToChange.idCategory,
      });

      const apiError = getApiError(error);

      setStatusErrorMessage(apiError?.message ?? t("statusChangeError"));
    } finally {
      setChangingStatus(false);
    }
  };

  const handleSubmitSuccess = () => {
    setCategoriesUpdated((previous) => !previous);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedCategory(null);
  };

  const columns: GridColDef<CategoryResponse>[] = [
    {
      field: "idCategory",
      headerName: t("id"),
      width: 80,
      cellClassName: sharedStyles.ticketId,
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 1,
      minWidth: 156,
      cellClassName: sharedStyles.ticketTitle,
    },
    {
      field: "active",
      headerName: t("status"),
      width: 112,
      renderCell: ({ row }) => <CatalogStatusBadge active={row.active} label={t(row.active ? "active" : "inactive")} />,
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("actions"),
      width: 138,
      getActions: ({ row }) => catalogRowActions({
        view: t("view"),
        edit: t("edit"),
        toggle: t(row.active ? "deactivate" : "activate"),
        active: row.active,
        onView: () => handleViewCategory(row),
        onEdit: () => handleEditCategory(row),
        onToggle: () => handleOpenStatusDialog(row),
      }),
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
      <CategoryForm
        formMode={formMode}
        selectedCategory={selectedCategory}
        onClose={handleCloseForm}
        onSubmitSuccess={handleSubmitSuccess}
      />
    );
  }

  const deactivating = categoryStatusToChange?.active ?? false;

  return (
    <CatalogList
      title={t("title")}
      icon={<CategoryOutlined />}
      rows={categories}
      columns={columns}
      getRowId={(row) => row.idCategory}
      loading={loading}
      errorMessage={errorMessage}
      create={{ label: t("createCategory"), onClick: handleCreateCategory }}
    >
      <CatalogStatusDialog
        open={Boolean(categoryStatusToChange)}
        active={deactivating}
        title={t(deactivating ? "deactivateTitle" : "activateTitle")}
        message={categoryStatusToChange ? t(deactivating ? "deactivateConfirmation" : "activateConfirmation", { name: categoryStatusToChange.name }) : undefined}
        errorMessage={statusErrorMessage}
        saving={changingStatus}
        cancelLabel={t("cancel")}
        confirmLabel={t(changingStatus ? "saving" : deactivating ? "deactivate" : "activate")}
        onClose={handleCloseStatusDialog}
        onConfirm={handleChangeCategoryStatus}
      />
    </CatalogList>
  );
}
