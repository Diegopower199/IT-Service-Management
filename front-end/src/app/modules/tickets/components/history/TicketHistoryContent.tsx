"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import dayjs from "dayjs";

import { Alert, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import {
  DATA_GRID_LOCALE_TEXT,
  DEFAULT_TICKET_HISTORY_SORT,
  PAGE_SIZE_OPTIONS,
} from "@/utils/constans";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import type { TicketHistoryResponse } from "@/types/ticketHistoryTypes";

import { getAllTicketHistoryById } from "../../services/ticketHistoryService";

interface TicketHistoryContentProps {
  ticketId: number;
}

export default function TicketHistoryContent({
  ticketId,
}: TicketHistoryContentProps) {
  const t = useTranslations("Tickets.HistoryContent");

  const [ticketHistory, setTicketHistory] = useState<TicketHistoryResponse[]>(
    [],
  );

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

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

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("loadError"));
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
      valueFormatter: (value) => value ?? "-",
    },
    {
      field: "fieldName",
      headerName: t("field"),
      flex: 1,
      valueFormatter: (value) => value ?? "-",
    },
    {
      field: "oldValue",
      headerName: t("oldValue"),
      flex: 1,
      valueFormatter: (value) => value ?? "-",
    },
    {
      field: "newValue",
      headerName: t("newValue"),
      flex: 1,
      valueFormatter: (value) => value ?? "-",
    },
    {
      field: "user",
      headerName: t("user"),
      flex: 1,
      valueGetter: (_, row) => row.user.username,
    },
    {
      field: "createdAt",
      headerName: t("date"),
      flex: 1,
      valueFormatter: (value) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "",
    },
  ];

  return (
    <>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {t("title")}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("ticket", { ticketId })}
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <DataGrid
        rows={ticketHistory}
        columns={columns}
        getRowId={(row) => row.idHistory}
        pagination
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={totalElements}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        localeText={DATA_GRID_LOCALE_TEXT}
        loading={loading}
      />
    </>
  );
}
