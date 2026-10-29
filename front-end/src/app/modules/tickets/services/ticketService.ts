import api from "@/config/axios";
import { PageResponse } from "@/types/pageTypes";
import { PaginationParams } from "@/types/paginationTypes";
import {
  AssignTicketRequest,
  ChangePriorityRequest,
  ChangeStatusRequest,
  CreateTicketRequest,
  TicketFilters,
  TicketResponse,
  TicketStatisticsResponse,
  UpdateTicketRequest,
} from "@/types/ticketTypes";

export interface TicketQueryParams extends PaginationParams, TicketFilters {}

export const getAllTickets = async (
  params: TicketQueryParams,
): Promise<PageResponse<TicketResponse>> => {
  const response = await api.get<PageResponse<TicketResponse>>("/tickets", {
    params,
  });

  return response.data;
};

export const getOwnTickets = async (
  params: TicketQueryParams,
): Promise<PageResponse<TicketResponse>> => {
  const response = await api.get<PageResponse<TicketResponse>>("/tickets/my", {
    params,
  });

  return response.data;
};

export const getAssignedTickets = async (
  params: TicketQueryParams,
): Promise<PageResponse<TicketResponse>> => {
  const response = await api.get<PageResponse<TicketResponse>>(
    "/tickets/assigned",
    {
      params,
    },
  );

  return response.data;
};

export const getTicketById = async (
  ticketId: number,
): Promise<TicketResponse> => {
  const response = await api.get<TicketResponse>(`/tickets/${ticketId}`);

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

export const assignTicketTechnician = async (
  ticketId: number,
  request: AssignTicketRequest,
): Promise<TicketResponse> => {
  const response = await api.patch<TicketResponse>(
    `/tickets/${ticketId}/assign`,
    request,
  );

  return response.data;
};

export const changeTicketStatus = async (
  ticketId: number,
  request: ChangeStatusRequest,
): Promise<TicketResponse> => {
  const response = await api.patch<TicketResponse>(
    `/tickets/${ticketId}/status`,
    request,
  );

  return response.data;
};

export const changeTicketPriority = async (
  ticketId: number,
  request: ChangePriorityRequest,
): Promise<TicketResponse> => {
  const response = await api.patch<TicketResponse>(
    `/tickets/${ticketId}/priority`,
    request,
  );

  return response.data;
};
