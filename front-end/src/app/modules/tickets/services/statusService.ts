import api from "@/config/axios";
import type { StatusResponse } from "@/types/statusTypes";
import { ChangeStatusRequest, TicketResponse } from "@/types/ticketTypes";

export const getAllStatuses = async (): Promise<StatusResponse[]> => {
  const response = await api.get<StatusResponse[]>("/statuses");

  return response.data;
};

export const getAllStatusesActives = async (): Promise<StatusResponse[]> => {
  const response = await api.get<StatusResponse[]>("/statuses/actives");

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
