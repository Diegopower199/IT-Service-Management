import api from "@/config/axios";

import type { PageResponse } from "@/types/pageTypes";
import type { TicketHistoryResponse } from "@/types/ticketHistoryTypes";

export const getAllTicketHistoryById = async (
  ticketId: number,
  page: number,
  size: number,
  sort: string,
): Promise<PageResponse<TicketHistoryResponse>> => {
  const response = await api.get<PageResponse<TicketHistoryResponse>>(
    `/ticket-history/ticket/${ticketId}`,
    {
      params: {
        page,
        size,
        sort,
      },
    },
  );

  console.log(response)

  return response.data;
};
