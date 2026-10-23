"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { Typography } from "@mui/material";

import {
  DATA_GRID_LOCALE_TEXT,
  DEFAULT_TICKET_HISTORY_SORT,
  PAGE_SIZE_OPTIONS,
} from "@/utils/constans";

import { TicketHistoryResponse } from "@/types/ticketHistoryTypes";
import { getAllTicketHistoryById } from "../../services/ticketHistoryService";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface TicketHistoryContentProps {
  ticketId: number;
}

export default function TicketHistoryContent({
  ticketId,
}: TicketHistoryContentProps) {
  const [ticketHistory, setTicketHistory] = useState<TicketHistoryResponse[]>(
    [],
  );

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTicketHistory = async () => {
      try {
        setLoading(true);

        const response = await getAllTicketHistoryById(
          ticketId,
          paginationModel.page,
          paginationModel.pageSize,
          DEFAULT_TICKET_HISTORY_SORT,
        );

        setTicketHistory(response.content);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error("Error loading ticket history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTicketHistory();
  }, [ticketId, paginationModel]);

  const columns: GridColDef<TicketHistoryResponse>[] = [
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      valueFormatter: (value) => value ?? "-",
    },
    {
      field: "fieldName",
      headerName: "Field",
      flex: 1,
      valueFormatter: (value) => value ?? "-",
    },
    {
      field: "oldValue",
      headerName: "Old Value",
      flex: 1,
      valueFormatter: (value) => value ?? "-",
    },
    {
      field: "newValue",
      headerName: "New Value",
      flex: 1,
      valueFormatter: (value) => value ?? "-",
    },
    {
      field: "user",
      headerName: "User",
      flex: 1,
      valueGetter: (_, row) => row.user.username,
    },
    {
      field: "createdAt",
      headerName: "Date",
      flex: 1,
      valueFormatter: (value) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "",
    },
  ];

  return (
    <>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Ticket History
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ticket #{ticketId}
      </Typography>

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
