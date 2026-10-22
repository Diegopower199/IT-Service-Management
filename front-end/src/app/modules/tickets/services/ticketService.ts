import api from "@/config/axios";
import { PageResponse } from "@/types/pageTypes";
import {
  CreateTicketRequest,
  TicketResponse,
  TicketStatisticsResponse,
  UpdateTicketRequest,
} from "@/types/ticketTypes";

export const getAllTickets = async (
  page: number,
  size: number,
  sort: string,
  status?: string | null,
  priority?: string | null,
): Promise<PageResponse<TicketResponse>> => {
  const response = await api.get<PageResponse<TicketResponse>>("/tickets", {
    params: {
      page,
      size,
      sort,
      status,
      priority,
    },
  });

  return response.data;
};

export const getOwnTickets = async (
  page: number,
  size: number,
  sort: string,
  status?: string | null,
  priority?: string | null,
): Promise<PageResponse<TicketResponse>> => {
  const response = await api.get<PageResponse<TicketResponse>>("/tickets/my", {
    params: {
      page,
      size,
      sort,
      status,
      priority,
    },
  });

  return response.data;
};

export const getAssignedTickets = async (
  page: number,
  size: number,
  sort: string,
  status?: string | null,
  priority?: string | null,
): Promise<PageResponse<TicketResponse>> => {
  const response = await api.get<PageResponse<TicketResponse>>(
    "/tickets/assigned",
    {
      params: {
        page,
        size,
        sort,
        status,
        priority,
      },
    },
  );

  return response.data;
};

export const getTicketStatistics =
  async (): Promise<TicketStatisticsResponse> => {
    const response = await api.get<TicketStatisticsResponse>(
      "/tickets/statistics",
    );

    return response.data;
  };

export const createTicket = async (
  ticketData: CreateTicketRequest,
): Promise<TicketResponse> => {
  const response = await api.post<TicketResponse>("/tickets", ticketData);

  return response.data;
};

export const updateTicket = async (
  ticketId: number,
  ticketData: UpdateTicketRequest,
): Promise<TicketResponse> => {
  const response = await api.patch<TicketResponse>(
    `/tickets/${ticketId}`,
    ticketData,
  );

  return response.data;
};
