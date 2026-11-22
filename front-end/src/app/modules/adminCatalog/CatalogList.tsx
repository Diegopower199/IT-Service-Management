"use client";

import { useId, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Alert, Button, Chip } from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import EditOutlined from "@mui/icons-material/EditOutlined";
import ToggleOffOutlined from "@mui/icons-material/ToggleOffOutlined";
import ToggleOnOutlined from "@mui/icons-material/ToggleOnOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridRowIdGetter,
  type GridValidRowModel,
} from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";

import { DATA_GRID_LOCALE_TEXT, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/utils/constans";
import sharedStyles from "./catalog.module.css";
import styles from "./CatalogList.module.css";

interface CatalogListProps<Row extends GridValidRowModel> {
  title: string;
  icon: ReactNode;
  rows: Row[];
  columns: GridColDef<Row>[];
  getRowId: GridRowIdGetter<Row>;
  loading: boolean;
  errorMessage: string;
  create?: { label: string; onClick: () => void };
  children?: ReactNode;
}

const getRowHeight = () => "auto" as const;
const initialState = {
  pagination: { paginationModel: { page: 0, pageSize: DEFAULT_PAGE_SIZE } },
};

export function CatalogList<Row extends GridValidRowModel>({
  title, icon, rows, columns, getRowId, loading, errorMessage, create, children,
}: CatalogListProps<Row>) {
  const headingId = useId();
  const locale = useLocale();
  const t = useTranslations("Common.AdminCatalog");
  const localeText = locale === "es" ? esES.components.MuiDataGrid.defaultProps.localeText : DATA_GRID_LOCALE_TEXT;

  return (
    <div className={sharedStyles.page}>
      <header className={styles.listHeader}>
        <div className={sharedStyles.heading}>
          <span className={sharedStyles.headingIcon} aria-hidden="true">{icon}</span>
          <h1 id={headingId}>{title}</h1>
        </div>
        {create && (
          <Button
            variant="contained"
            disableElevation
            startIcon={<AddRounded />}
            onClick={create.onClick}
            className={sharedStyles.primaryButton}
          >
            {create.label}
          </Button>
        )}
      </header>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <div className={styles.gridPanel}>
        <DataGrid
          className={styles.grid}
          aria-labelledby={headingId}
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          getRowHeight={getRowHeight}
          columnHeaderHeight={46}
          loading={loading}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          initialState={initialState}
          localeText={{ ...localeText, noRowsLabel: errorMessage ? "" : t("empty") }}
          slotProps={{ loadingOverlay: { variant: "linear-progress", noRowsVariant: "skeleton" } }}
        />
      </div>

      {children}
    </div>
  );
}

export function CatalogName({ name, protectedItem }: { name: string; protectedItem: boolean }) {
  const t = useTranslations("Common.AdminCatalog");

  return (
    <div className={styles.name}>
      <span>{name}</span>
      {protectedItem && <Chip size="small" label={t("protected")} className={sharedStyles.badge} />}
    </div>
  );
}

interface CatalogRowActions {
  view: string;
  edit: string;
  toggle: string;
  active: boolean;
  onView: () => void;
  onEdit: () => void;
  onToggle: () => void;
  disabledEdit?: boolean;
  disabledToggle?: boolean;
  protectedHint?: string;
}

export function catalogRowActions({
  view, edit, toggle, active, onView, onEdit, onToggle, disabledEdit, disabledToggle, protectedHint,
}: CatalogRowActions) {
  return [
    <GridActionsCellItem
      key="view"
      icon={<VisibilityOutlined />}
      label={view}
      title={view}
      onClick={onView}
      className={styles.viewAction}
    />,
    <GridActionsCellItem
      key="edit"
      icon={<EditOutlined />}
      label={edit}
      title={disabledEdit ? protectedHint : edit}
      onClick={onEdit}
      disabled={disabledEdit}
      className={`${styles.editAction} ${styles.action}`}
    />,
    <GridActionsCellItem
      key="status"
      icon={active ? <ToggleOffOutlined /> : <ToggleOnOutlined />}
      label={toggle}
      title={disabledToggle ? protectedHint : toggle}
      onClick={onToggle}
      disabled={disabledToggle}
      className={`${styles.editAction} ${styles.action}`}
    />,
  ];
}
