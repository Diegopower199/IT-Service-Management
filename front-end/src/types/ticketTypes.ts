import { CategoryResponse } from "./categoryTypes";
import { PriorityResponse } from "./priorityTypes";
import { StatusResponse } from "./statusTypes";
import { UserSummaryResponse } from "./userTypes";


export interface TicketSummary {
  id: number;
  title: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  updatedAt: string;
}

export interface TicketResponse {
  idTicket: number;
  title: string;
  description: string | null;

  createdAt: string;
  lastUpdated: string;

  createdBy: UserSummaryResponse;
  requestedFor: UserSummaryResponse;
  assignedTo: UserSummaryResponse | null;

  category: CategoryResponse;
  priority: PriorityResponse;
  status: StatusResponse;
}
