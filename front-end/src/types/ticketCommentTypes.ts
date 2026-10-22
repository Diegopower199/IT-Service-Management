import { UserSummaryResponse } from "./userTypes";

export interface TicketCommentResponse {
  idComment: number;
  ticketId: number;
  user: UserSummaryResponse;
  comment: string;
  internal: boolean;
  createdAt: string;
}
