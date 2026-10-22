import { UserSummaryResponse } from "./userTypes";

export interface TicketCommentResponse {
  idComment: number;
  ticketId: number;
  user: UserSummaryResponse;
  comment: string;
  internal: boolean;
  createdAt: string;
}

export interface CreateTicketCommentRequest {
  comment: string;
  internal: boolean;
}

export interface TicketCommentResponse {
  idComment: number;
  ticketId: number;
  user: UserSummaryResponse;
  comment: string;
  internal: boolean;
  createdAt: string;
}
