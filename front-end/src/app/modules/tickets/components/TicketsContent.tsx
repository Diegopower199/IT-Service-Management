"use client";

import { useEffect, useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import { useAuth } from "@/hooks/useAuth";

import type { TicketResponse } from "@/types/ticketTypes";
import { USER_ROLES } from "@/types/roleTypes";

import {
  getAllTickets,
  getAssignedTickets,
  getOwnTickets,
} from "../services/ticketService";

import {
  DATA_GRID_LOCALE_TEXT,
  DEFAULT_PAGE_SIZE,
  DEFAULT_TICKET_SORT,
  PAGE_SIZE_OPTIONS,
} from "@/utils/constans";
import { useRouter } from "next/navigation";

export default function TicketsContent() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    const loadTickets = async () => {
      try {
        setLoading(true);

        let response;

        if (user.rol === USER_ROLES.ADMIN) {
          response = await getAllTickets(
            paginationModel.page,
            paginationModel.pageSize,
            DEFAULT_TICKET_SORT,
          );
        } else if (user.rol === USER_ROLES.TECHNICIAN) {
          response = await getAssignedTickets(
            paginationModel.page,
            paginationModel.pageSize,
            DEFAULT_TICKET_SORT,
          );
        } else {
          response = await getOwnTickets(
            paginationModel.page,
            paginationModel.pageSize,
            DEFAULT_TICKET_SORT,
          );
        }

        setTickets(response.content);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error("Error loading tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [isAuthReady, user, router, paginationModel]);

  const columns: GridColDef<TicketResponse>[] = [
    {
      field: "idTicket",
      headerName: "ID",
      width: 90,
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      valueGetter: (_, row) => row.status.name,
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 150,
      valueGetter: (_, row) => row.priority.name,
    },
    {
      field: "lastUpdated",
      headerName: "Last Updated",
      width: 190,
    },
  ];

  if (!isAuthReady || !user) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <h1>
        {user.rol === USER_ROLES.ADMIN
          ? "All Tickets"
          : user.rol === USER_ROLES.TECHNICIAN
            ? "Assigned Tickets"
            : "My Tickets"}
      </h1>

      <DataGrid
        rows={tickets}
        columns={columns}
        getRowId={(row) => row.idTicket}
        pagination
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={totalElements}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        localeText={DATA_GRID_LOCALE_TEXT}
        loading={loading}
      />
    </main>
  );
}
