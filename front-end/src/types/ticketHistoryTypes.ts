import type { UserSummaryResponse } from "./userTypes";

export type TicketHistoryAction =
  | "TICKET_CREATED"
  | "TITLE_CHANGED"
  | "DESCRIPTION_CHANGED"
  | "CATEGORY_CHANGED"
  | "PRIORITY_CHANGED"
  | "STATUS_CHANGED"
  | "ASSIGNED"
  | "REASSIGNED";

export interface TicketHistoryResponse {
  idHistory: number;
  ticketId: number;
  user: UserSummaryResponse;
  action: TicketHistoryAction;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}
