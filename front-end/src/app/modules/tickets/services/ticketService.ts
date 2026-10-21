import api from "@/config/axios";
import { PageResponse } from "@/types/pageTypes";
import { TicketResponse, TicketStatisticsResponse } from "@/types/ticketTypes";

export const getAllTickets = async (): Promise<
  PageResponse<TicketResponse>
> => {
  const response = await api.get<PageResponse<TicketResponse>>("/tickets");

  return response.data;
};

export const getOwnTickets = async (
  page: number,
  size: number,
  sort: string,
): Promise<PageResponse<TicketResponse>> => {
  const response = await api.get<PageResponse<TicketResponse>>("/tickets/my", {
    params: {
      page,
      size,
      sort,
    },
  });

  return response.data;
};

export const getTicketStatistics =
  async (): Promise<TicketStatisticsResponse> => {
    const response = await api.get<TicketStatisticsResponse>(
      "/tickets/statistics",
    );

    return response.data;
  };

/*
export const getTicketById = async (
  ticketId: number,
): Promise<TicketResponse> => {
  const response = await api.get<TicketResponse>(`/tickets/${ticketId}`);

  return response.data;
};

export const getOwnTickets = async (): Promise<TicketResponse[]> => {
  const response = await api.get<TicketResponse[]>("/tickets/my");

  return response.data;
};

export const createTicket = async (
  ticketRequest: CreateTicketRequest,
): Promise<TicketResponse> => {
  const response = await api.post<TicketResponse>("/tickets", ticketRequest);

  return response.data;
};

export const updateTicket = async (
  ticketId: number,
  ticketRequest: UpdateTicketRequest,
): Promise<TicketResponse> => {
  const response = await api.patch<TicketResponse>(
    `/tickets/${ticketId}`,
    ticketRequest,
  );

  return response.data;
};

export const assignTicket = async (
  ticketId: number,
  assignRequest: AssignTicketRequest,
): Promise<TicketResponse> => {
  const response = await api.patch<TicketResponse>(
    `/tickets/${ticketId}/assign`,
    assignRequest,
  );

  return response.data;
};

export const changeTicketPriority = async (
  ticketId: number,
  priorityRequest: ChangePriorityRequest,
): Promise<TicketResponse> => {
  const response = await api.patch<TicketResponse>(
    `/tickets/${ticketId}/priority`,
    priorityRequest,
  );

  return response.data;
};

export const changeTicketStatus = async (
  ticketId: number,
  statusRequest: ChangeStatusRequest,
): Promise<TicketResponse> => {
  const response = await api.patch<TicketResponse>(
    `/tickets/${ticketId}/status`,
    statusRequest,
  );

  return response.data;
};
*/
