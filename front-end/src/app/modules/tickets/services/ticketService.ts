import api from "@/config/axios";
import { TicketResponse } from "@/types/ticketTypes";



export const getAllTickets = async (): Promise<TicketResponse[]> => {
  const response = await api.get<TicketResponse[]>("/tickets");

  return response.data;
};

export const getOwnTickets = async (): Promise<TicketResponse[]> => {
  const response = await api.get<TicketResponse[]>("/tickets/my");

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
