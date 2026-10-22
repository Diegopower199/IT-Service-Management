import api from "@/config/axios";
import { PageResponse } from "@/types/pageTypes";
import { TicketCommentResponse } from "@/types/ticketCommentTypes";

export const getAllTicketsCommentsById = async (
  ticketId: number,
  page: number,
  size: number,
  sort: string,
): Promise<PageResponse<TicketCommentResponse>> => {
  const response = await api.get<PageResponse<TicketCommentResponse>>(
    `/ticket-comments/${ticketId}`,
    {
      params: {
        page,
        size,
        sort,
      },
    },
  );

  return response.data;
};
