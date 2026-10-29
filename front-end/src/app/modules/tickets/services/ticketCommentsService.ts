import api from "@/config/axios";
import { PageResponse, PaginationParams } from "@/types/paginationTypes";
import {
  CreateTicketCommentRequest,
  TicketCommentResponse,
} from "@/types/ticketCommentTypes";

export const getAllTicketsCommentsById = async (
  ticketId: number,
  pagination: PaginationParams,
): Promise<PageResponse<TicketCommentResponse>> => {
  const response = await api.get<PageResponse<TicketCommentResponse>>(
    `/ticket-comments/ticket/${ticketId}`,
    {
      params: pagination,
    },
  );

  return response.data;
};

export const createTicketComment = async (
  ticketId: number,
  request: CreateTicketCommentRequest,
): Promise<TicketCommentResponse> => {
  const response = await api.post<TicketCommentResponse>(
    `/ticket-comments/ticket/${ticketId}`,
    request,
  );

  return response.data;
};
