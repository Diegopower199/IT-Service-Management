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

        setErrorMessage(apiError?.message ?? "Error loading categories.");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [isAuthReady, user, router, categoriesUpdated]);

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

      setStatusErrorMessage(
        apiError?.message ?? "Error changing category status.",
      );
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
          onClick={() => handleViewCategory(row)}
        />,

        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditCategory(row)}
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
      <h1>Categories</h1>

      <Button variant="contained" onClick={handleCreateCategory}>
        Create Category <AddIcon />
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
            ? "Deactivate Category"
            : "Activate Category"}
        </DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to{" "}
            {categoryStatusToChange?.active ? "deactivate" : "activate"}{" "}
            category <strong>{categoryStatusToChange?.name}</strong>?
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
            onClick={handleChangeCategoryStatus}
            disabled={changingStatus}
          >
            {changingStatus
              ? "Saving..."
              : categoryStatusToChange?.active
                ? "Deactivate"
                : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
