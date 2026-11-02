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

import type { CategoryResponse } from "@/types/categoryTypes";
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

  const [loading, setLoading] = useState(false);
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

    const loadCategories = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getAllCategories();

        setCategories(response);
      } catch (error) {
        logger.error("Failed to load categories", error, {
          component: "CategoriesContent",
          action: "loadCategories",
        });

        const apiError = getApiError(error);

        setErrorMessage(apiError?.message ?? t("loadError"));
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [isAuthReady, user, router, categoriesUpdated, t]);

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
      width: 100,
    },
    {
      field: "name",
      headerName: t("name"),
      flex: 1,
      minWidth: 200,
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
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label={t("view")}
          onClick={() => handleViewCategory(row)}
        />,

        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label={t("edit")}
          onClick={() => handleEditCategory(row)}
        />,

        <GridActionsCellItem
          key="status"
          icon={<ChangeCircleIcon />}
          label={row.active ? t("deactivate") : t("activate")}
          onClick={() => handleOpenStatusDialog(row)}
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
      <CategoryForm
        formMode={formMode}
        selectedCategory={selectedCategory}
        onClose={handleCloseForm}
        onSubmitSuccess={handleSubmitSuccess}
      />
    );
  }

  return (
    <main>
      <h1>{t("title")}</h1>

      <Button variant="contained" onClick={handleCreateCategory}>
        {t("createCategory")} <AddIcon />
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
        rows={categories}
        columns={columns}
        getRowId={(row) => row.idCategory}
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
        open={Boolean(categoryStatusToChange)}
        onClose={handleCloseStatusDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {categoryStatusToChange?.active
            ? t("deactivateTitle")
            : t("activateTitle")}
        </DialogTitle>

        <DialogContent>
          {categoryStatusToChange && (
            <Typography>
              {categoryStatusToChange.active
                ? t("deactivateConfirmation", {
                    name: categoryStatusToChange.name,
                  })
                : t("activateConfirmation", {
                    name: categoryStatusToChange.name,
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
            onClick={handleChangeCategoryStatus}
            disabled={changingStatus}
          >
            {changingStatus
              ? t("saving")
              : categoryStatusToChange?.active
                ? t("deactivate")
                : t("activate")}
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
