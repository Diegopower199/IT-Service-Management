import api from "@/config/axios";

import type { PageResponse, PaginationParams } from "@/types/paginationTypes";

import type { TicketHistoryResponse } from "@/types/ticketHistoryTypes";

export const getAllTicketHistoryById = async (
  ticketId: number,
  pagination: PaginationParams,
): Promise<PageResponse<TicketHistoryResponse>> => {
  const response = await api.get<PageResponse<TicketHistoryResponse>>(
    `/ticket-history/ticket/${ticketId}`,
    {
      params: pagination,
    },
  );

  return response.data;
};
