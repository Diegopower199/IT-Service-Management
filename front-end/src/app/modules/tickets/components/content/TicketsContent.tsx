"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { Alert, Button, Chip } from "@mui/material";

import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";

import AddRounded from "@mui/icons-material/AddRounded";
import ConfirmationNumberOutlined from "@mui/icons-material/ConfirmationNumberOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";

import { useAuth } from "@/hooks/useAuth";

import type { TicketFilters, TicketResponse } from "@/types/ticketTypes";
import type { CategoryResponse } from "@/types/categoryTypes";
import type { StatusResponse } from "@/types/statusTypes";
import type { PriorityResponse } from "@/types/priorityTypes";

import { USER_ROLES } from "@/types/roleTypes";

import {
  getAllTickets,
  getAssignedTickets,
  getOwnTickets,
} from "../../services/ticketService";

import {
  DATA_GRID_LOCALE_TEXT,
  DEFAULT_TICKET_SORT,
  FORM_MODES,
  type FormMode,
  PAGE_SIZE_OPTIONS,
} from "@/utils/constans";

import { getPriorityColor, getStatusColor } from "@/utils/ticketUiUtils";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import TicketForm from "../form/TicketForm";
import TicketDetailsContent from "../details/TicketDetailsContent";
import TicketFiltersBar from "./TicketFiltersBar";
import {
  readTicketListPagination,
  ticketDetailsHref,
  ticketListHref,
} from "../shared/ticketNavigation";

import PageLoading from "@/components/ui/PageLoading";

import { getAllActiveStatuses } from "@/app/modules/statuses/services/statusService";
import { getAllActivePriorities } from "@/app/modules/priorities/services/priorityService";
import { getAllActiveCategories } from "@/app/modules/categories/services/categoryService";

import styles from "../../styles/tickets.module.css";

const getTicketRowHeight = () => "auto" as const;

export default function TicketsContent() {
  const { user, isAuthReady } = useAuth();

  const isTechnician = user?.role === USER_ROLES.TECHNICIAN;
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const isUser = user?.role === USER_ROLES.USER;

  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTicketId = Number(searchParams.get("ticketId"));
  const detailTicketId =
    Number.isSafeInteger(requestedTicketId) && requestedTicketId > 0
      ? requestedTicketId
      : null;

  const t = useTranslations("Tickets.Content");
  const tStatuses = useTranslations("Common.Statuses");
  const tPriorities = useTranslations("Common.Priorities");
  const locale = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const titleFilter = searchParams.get("title");
  const statusFilter = searchParams.get("status");
  const priorityFilter = searchParams.get("priority");
  const categoryFilter = searchParams.get("category");

  const filters: TicketFilters = {
    title: titleFilter,
    status: statusFilter,
    priority: priorityFilter,
    category: categoryFilter,
  };

  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [statuses, setStatuses] = useState<StatusResponse[]>([]);
  const [priorities, setPriorities] = useState<PriorityResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  const [errorMessage, setErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formMode, setFormMode] = useState<FormMode>(FORM_MODES.CREATE);

  const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(
    null,
  );

  const [ticketsUpdated, setTicketsUpdated] = useState(false);

  const [paginationModel, setPaginationModel] = useState(() =>
    readTicketListPagination(searchParams),
  );

  const fetchStatuses = useCallback(async (): Promise<boolean> => {
    try {
      const response = await getAllActiveStatuses();

      setStatuses(response);

      return true;
    } catch (error) {
      logger.error("Failed to load statuses", error, {
        component: "TicketsContent",
        action: "fetchStatuses",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("statusesLoadError"));

      return false;
    }
  }, [t]);

  const fetchPriorities = useCallback(async (): Promise<boolean> => {
    try {
      const response = await getAllActivePriorities();

      setPriorities(response);

      return true;
    } catch (error) {
      logger.error("Failed to load priorities", error, {
        component: "TicketsContent",
        action: "fetchPriorities",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("prioritiesLoadError"));

      return false;
    }
  }, [t]);

  const fetchCategories = useCallback(async (): Promise<boolean> => {
    try {
      const response = await getAllActiveCategories();

      setCategories(response);

      return true;
    } catch (error) {
      logger.error("Failed to load categories", error, {
        component: "TicketsContent",
        action: "fetchCategories",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("categoriesLoadError"));

      return false;
    }
  }, [t]);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      let response;

      if (isAdmin) {
        response = await getAllTickets({
          page: paginationModel.page,
          size: paginationModel.pageSize,
          sort: DEFAULT_TICKET_SORT,
          title: titleFilter,
          status: statusFilter,
          priority: priorityFilter,
          category: categoryFilter,
        });
      } else if (isTechnician) {
        response = await getAssignedTickets({
          page: paginationModel.page,
          size: paginationModel.pageSize,
          sort: DEFAULT_TICKET_SORT,
          title: titleFilter,
          status: statusFilter,
          priority: priorityFilter,
          category: categoryFilter,
        });
      } else {
        response = await getOwnTickets({
          page: paginationModel.page,
          size: paginationModel.pageSize,
          sort: DEFAULT_TICKET_SORT,
          title: titleFilter,
          status: statusFilter,
          priority: priorityFilter,
          category: categoryFilter,
        });
      }

      setTickets(response.content);
      setTotalElements(response.totalElements);
    } catch (error) {
      logger.error("Failed to load tickets", error, {
        component: "TicketsContent",
        action: "fetchTickets",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("ticketsLoadError"));
    } finally {
      setLoading(false);
    }
  }, [
    isAdmin,
    isTechnician,
    paginationModel,
    titleFilter,
    statusFilter,
    priorityFilter,
    categoryFilter,
    t,
  ]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      if (!isAuthReady || !user || detailTicketId !== null) {
        return;
      }

      const categoriesLoaded = await fetchCategories();

      if (!categoriesLoaded) {
        return;
      }

      if (!isUser) {
        const statusesLoaded = await fetchStatuses();

        if (!statusesLoaded) {
          return;
        }

        const prioritiesLoaded = await fetchPriorities();

        if (!prioritiesLoaded) {
          return;
        }
      }
    };

    fetchFilterOptions();
  }, [
    isAuthReady,
    user,
    isUser,
    detailTicketId,
    fetchCategories,
    fetchStatuses,
    fetchPriorities,
  ]);

  useEffect(() => {
    const loadTickets = async () => {
      if (!isAuthReady) {
        return;
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      if (detailTicketId === null) {
        await fetchTickets();
      }
    };

    loadTickets();
  }, [isAuthReady, user, router, detailTicketId, ticketsUpdated, fetchTickets]);

  const getStatusDisplayName = (statusName: string) => {
    if (tStatuses.has(statusName)) {
      return tStatuses(statusName);
    }

    return statusName;
  };

  const getPriorityDisplayName = (priorityName: string) => {
    if (tPriorities.has(priorityName)) {
      return tPriorities(priorityName);
    }

    return priorityName;
  };

  const handleApplyFilters = (nextFilters: TicketFilters) => {
    const params = new URLSearchParams(searchParams.toString());

    const updateParam = (key: keyof TicketFilters, value?: string | null) => {
      const normalizedValue = value?.trim();

      if (normalizedValue) {
        params.set(key, normalizedValue);
      } else {
        params.delete(key);
      }
    };

    updateParam("title", nextFilters.title);
    updateParam("status", nextFilters.status);
    updateParam("priority", nextFilters.priority);
    updateParam("category", nextFilters.category);

    setPaginationModel((previous) => ({
      ...previous,
      page: 0,
    }));

    const query = params.toString();

    router.replace(query ? `/tickets?${query}` : "/tickets");
  };

  const handleClearFilters = () => {
    setPaginationModel((previous) => ({
      ...previous,
      page: 0,
    }));

    router.replace("/tickets");
  };

  const handleCreateTicket = () => {
    setSelectedTicket(null);
    setFormMode(FORM_MODES.CREATE);

    setErrorMessage("");

    setShowForm(true);
  };

  const handleViewTicket = (ticket: TicketResponse) => {
    router.push(ticketDetailsHref(ticket.idTicket, searchParams, paginationModel));
  };

  const handleEditTicket = (ticket: TicketResponse) => {
    setSelectedTicket(ticket);
    setFormMode(FORM_MODES.EDIT);

    setErrorMessage("");

    setShowForm(true);
  };

  const handleSubmitSuccess = () => {
    setTicketsUpdated((previous) => !previous);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedTicket(null);
    setErrorMessage("");
  };

  const columns: GridColDef<TicketResponse>[] = [
    {
      field: "idTicket",
      headerName: t("id"),
      width: 72,
      cellClassName: styles.ticketId,
    },
    {
      field: "title",
      headerName: t("title"),
      flex: 1.6,
      minWidth: 220,
      cellClassName: styles.ticketTitle,
    },
    {
      field: "category",
      headerName: t("category"),
      flex: 1,
      minWidth: 134,
      cellClassName: styles.wrapCell,
      valueGetter: (_, row) => row.category.name,
    },
    {
      field: "status",
      headerName: t("status"),
      width: 134,
      valueGetter: (_, row) => row.status.name,
      renderCell: (params) => (
        <Chip
          label={getStatusDisplayName(params.row.status.name)}
          color={getStatusColor(params.row.status.name)}
          size="small"
          className={styles.ticketBadge}
        />
      ),
    },
    {
      field: "priority",
      headerName: t("priority"),
      width: 112,
      valueGetter: (_, row) => row.priority.name,
      renderCell: (params) => (
        <Chip
          label={getPriorityDisplayName(params.row.priority.name)}
          color={getPriorityColor(params.row.priority.name)}
          size="small"
          className={styles.ticketBadge}
        />
      ),
    },
    {
      field: "lastUpdated",
      headerName: t("lastUpdated"),
      width: 174,
      cellClassName: styles.ticketDate,
      valueFormatter: (value: string | undefined) => {
        if (!value) return "";

        const updatedAt = new Date(value);
        return Number.isNaN(updatedAt.getTime()) ? value : dateFormatter.format(updatedAt);
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("actions"),
      width: 112,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityOutlined />}
          label={t("view")}
          title={t("view")}
          className={styles.viewAction}
          onClick={() => handleViewTicket(row)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditOutlined />}
          label={t("edit")}
          title={t("edit")}
          className={styles.editAction}
          onClick={() => handleEditTicket(row)}
        />,
      ],
    },
  ];

  if (!isAuthReady || !user) {
    return <PageLoading />;
  }

  if (detailTicketId !== null) {
    return (
      <TicketDetailsContent
        key={`${user.userId}:${user.role}:${detailTicketId}`}
        ticketId={detailTicketId}
        userRole={user.role}
        onClose={() => router.replace(ticketListHref(searchParams))}
        onUpdated={handleSubmitSuccess}
      />
    );
  }

  if (showForm) {
    return (
      <TicketForm
        formMode={formMode}
        selectedTicket={selectedTicket}
        onClose={handleCloseForm}
        onSubmitSuccess={handleSubmitSuccess}
      />
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.listHeader}>
        <div className={styles.heading}>
          <span className={styles.headingIcon}>
            <ConfirmationNumberOutlined aria-hidden="true" />
          </span>
          <h1 id="tickets-heading">
            {isAdmin
              ? t("allTickets")
              : isTechnician
                ? t("assignedTickets")
                : t("myTickets")}
          </h1>
        </div>
        <Button
          variant="contained"
          disableElevation
          startIcon={<AddRounded />}
          onClick={handleCreateTicket}
          className={styles.primaryButton}
        >
          {t("createTicket")}
        </Button>
      </header>

      <TicketFiltersBar
        filters={filters}
        statusOptions={statuses.map((status) => status.name)}
        priorityOptions={priorities.map((priority) => priority.name)}
        categoryOptions={categories.map((category) => category.name)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <div className={styles.gridPanel}>
        <DataGrid
          className={styles.grid}
          aria-labelledby="tickets-heading"
          rows={tickets}
          columns={columns}
          getRowId={(row) => row.idTicket}
          getRowHeight={getTicketRowHeight}
          columnHeaderHeight={46}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={totalElements}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          localeText={
            locale === "es"
              ? esES.components.MuiDataGrid.defaultProps.localeText
              : DATA_GRID_LOCALE_TEXT
          }
          loading={loading}
          slotProps={{
            loadingOverlay: { variant: "linear-progress", noRowsVariant: "skeleton" },
          }}
        />
      </div>
    </div>
  );
}
