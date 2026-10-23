"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from "@mui/x-data-grid";

import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";

import dayjs from "dayjs";

import { useAuth } from "@/hooks/useAuth";

import type { TicketResponse } from "@/types/ticketTypes";
import { USER_ROLES } from "@/types/roleTypes";

import {
  getAllTickets,
  getAssignedTickets,
  getOwnTickets,
  getTicketById,
} from "../../services/ticketService";

import {
  DATA_GRID_LOCALE_TEXT,
  DEFAULT_PAGE_SIZE,
  DEFAULT_TICKET_SORT,
  FORM_MODES,
  type FormMode,
  PAGE_SIZE_OPTIONS,
} from "@/utils/constans";

import TicketForm from "../form/TicketForm";

import Button from "@/components/ui/Button";
import PageLoading from "@/components/ui/PageLoading";
import TicketDetails from "../details/TicketDetails";

export default function TicketsContent() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  const searchParams = useSearchParams();

  const statusFilter = searchParams.get("status");
  const priorityFilter = searchParams.get("priority");

  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [formMode, setFormMode] = useState<FormMode>(FORM_MODES.CREATE);

  const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(
    null,
  );

  const [ticketsUpdated, setTicketsUpdated] = useState(false);

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
            statusFilter,
            priorityFilter,
          );
        } else if (user.rol === USER_ROLES.TECHNICIAN) {
          response = await getAssignedTickets(
            paginationModel.page,
            paginationModel.pageSize,
            DEFAULT_TICKET_SORT,
            statusFilter,
            priorityFilter,
          );
        } else {
          response = await getOwnTickets(
            paginationModel.page,
            paginationModel.pageSize,
            DEFAULT_TICKET_SORT,
            statusFilter,
            priorityFilter,
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
  }, [
    isAuthReady,
    user,
    router,
    paginationModel,
    ticketsUpdated,
    statusFilter,
    priorityFilter,
  ]);

  const handleCreateTicket = () => {
    setSelectedTicket(null);
    setFormMode(FORM_MODES.CREATE);

    setShowDetails(false);
    setShowForm(true);
  };

  const handleViewTicket = (ticket: TicketResponse) => {
    setSelectedTicket(ticket);

    setShowForm(false);
    setShowDetails(true);
  };

  const handleEditTicket = (ticket: TicketResponse) => {
    setSelectedTicket(ticket);
    setFormMode(FORM_MODES.EDIT);

    setShowDetails(false);
    setShowForm(true);
  };

  const handleSubmitSuccess = () => {
    setTicketsUpdated((previous) => !previous);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedTicket(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedTicket(null);
  };

  const handleTicketUpdated = async () => {
    if (!selectedTicket) {
      return;
    }

    try {
      const updatedTicket = await getTicketById(selectedTicket.idTicket);

      setSelectedTicket(updatedTicket);

      setTicketsUpdated((previous) => !previous);
    } catch (error) {
      console.error("Error updating ticket details:", error);
    }
  };

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
      valueFormatter: (value) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="View"
          onClick={() => handleViewTicket(row)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditTicket(row)}
        />,
      ],
    },
  ];

  if (!isAuthReady || !user) {
    return <PageLoading />;
  }

  if (showDetails && selectedTicket) {
    return (
      <TicketDetails
        ticket={selectedTicket}
        userRole={user.rol}
        onClose={handleCloseDetails}
        onEdit={() => handleEditTicket(selectedTicket)}
        onTicketUpdated={handleTicketUpdated}
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
    <main>
      <h1>
        {user.rol === USER_ROLES.ADMIN
          ? "All Tickets"
          : user.rol === USER_ROLES.TECHNICIAN
            ? "Assigned Tickets"
            : "My Tickets"}
      </h1>

      <Button onClick={handleCreateTicket}>
        Create Ticket <AddIcon />
      </Button>

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
