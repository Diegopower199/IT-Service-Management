"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Alert } from "@mui/material";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";

import {
  DATA_GRID_LOCALE_TEXT,
  DEFAULT_TICKET_HISTORY_SORT,
  PAGE_SIZE_OPTIONS,
} from "@/utils/constans";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";
import { getHistoryValueLabel } from "@/utils/ticketUiUtils";

import type { TicketHistoryResponse } from "@/types/ticketHistoryTypes";

import { getAllTicketHistoryById } from "../../services/ticketHistoryService";
import TicketActivityHeader from "../shared/TicketActivityHeader";
import TicketDate from "../shared/TicketDate";
import TicketRouteError, { getTicketAccessError } from "../shared/TicketRouteError";
import sharedStyles from "../../styles/tickets.module.css";
import styles from "../../styles/ticketActivity.module.css";

interface TicketHistoryContentProps {
  ticketId: number;
}

const getHistoryRowHeight = () => "auto" as const;

export default function TicketHistoryContent({
  ticketId,
}: TicketHistoryContentProps) {
  const t = useTranslations("Tickets.HistoryContent");
  const tStatuses = useTranslations("Common.Statuses");
  const tPriorities = useTranslations("Common.Priorities");
  const locale = useLocale();
  const localeText =
    locale === "es"
      ? esES.components.MuiDataGrid.defaultProps.localeText
      : DATA_GRID_LOCALE_TEXT;

  const [ticketHistory, setTicketHistory] = useState<TicketHistoryResponse[]>(
    [],
  );

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [accessError, setAccessError] = useState<ReturnType<typeof getTicketAccessError>>(null);

  const fetchTicketHistory = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getAllTicketHistoryById(ticketId, {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort: DEFAULT_TICKET_HISTORY_SORT,
      });

      setTicketHistory(response.content);
      setTotalElements(response.totalElements);
    } catch (error) {
      logger.error("Failed to load ticket history", error, {
        component: "TicketHistoryContent",
        action: "fetchTicketHistory",
        ticketId,
      });

      const kind = getTicketAccessError(error);
      if (kind) {
        setTicketHistory([]);
        setTotalElements(0);
        setAccessError(kind);
      } else {
        setErrorMessage(getApiError(error)?.message ?? t("loadError"));
      }
    } finally {
      setLoading(false);
    }
  }, [ticketId, paginationModel.page, paginationModel.pageSize, t]);

  useEffect(() => {
    const loadTicketHistory = async () => {
      await fetchTicketHistory();
    };

    loadTicketHistory();
  }, [fetchTicketHistory]);

  const columns: GridColDef<TicketHistoryResponse>[] = [
    {
      field: "action",
      headerName: t("action"),
      flex: 1,
      minWidth: 158,
      cellClassName: `${sharedStyles.wrapCell} ${styles.historyAction}`,
      valueFormatter: (value) => value ?? "-",
    },
    {
      field: "fieldName",
      headerName: t("field"),
      flex: 0.7,
      minWidth: 110,
      cellClassName: sharedStyles.wrapCell,
      valueFormatter: (value) => value ?? "-",
    },
    {
      field: "oldValue",
      headerName: t("oldValue"),
      flex: 1.35,
      minWidth: 172,
      cellClassName: `${sharedStyles.wrapCell} ${styles.historyPrevious}`,
      valueFormatter: (value, row) => getHistoryValueLabel(row.action, value, tStatuses, tPriorities),
    },
    {
      field: "newValue",
      headerName: t("newValue"),
      flex: 1.35,
      minWidth: 172,
      cellClassName: sharedStyles.wrapCell,
      valueFormatter: (value, row) => getHistoryValueLabel(row.action, value, tStatuses, tPriorities),
    },
    {
      field: "user",
      headerName: t("user"),
      flex: 0.8,
      minWidth: 116,
      cellClassName: sharedStyles.wrapCell,
      valueGetter: (_, row) => row.user.username,
    },
    {
      field: "createdAt",
      headerName: t("date"),
      width: 181,
      cellClassName: sharedStyles.ticketDate,
      renderCell: ({ value }) => value ? <TicketDate value={value} /> : null,
    },
  ];

  if (accessError) return <TicketRouteError kind={accessError} ticketId={ticketId} />;

  return (
    <div className={sharedStyles.page}>
      <TicketActivityHeader
        ticketId={ticketId}
        title={t("title")}
        reference={t("ticket", { ticketId })}
        icon={<HistoryRounded />}
      />

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <div className={sharedStyles.gridPanel}>
        <DataGrid
          className={`${sharedStyles.grid} ${styles.historyGrid}`}
          aria-labelledby="ticket-activity-title"
          rows={ticketHistory}
          columns={columns}
          getRowId={(row) => row.idHistory}
          getRowHeight={getHistoryRowHeight}
          columnHeaderHeight={46}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={totalElements}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          localeText={{ ...localeText, noRowsLabel: errorMessage ? "" : t("empty") }}
          loading={loading}
          slotProps={{
            loadingOverlay: { variant: "linear-progress", noRowsVariant: "skeleton" },
          }}
        />
      </div>
    </div>
  );
}
