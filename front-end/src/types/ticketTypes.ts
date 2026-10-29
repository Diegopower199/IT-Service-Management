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

export interface TicketStatisticsResponse {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  criticalTickets: number;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  requestedForId: number;
  categoryId: number;
  priorityId: number;
}

export interface UpdateTicketRequest {
  title: string;
  description: string;
  categoryId: number;
}

export interface ChangeStatusRequest {
  statusId: number;
}

export interface ChangePriorityRequest {
  priorityId: number;
}

export interface AssignTicketRequest {
  assignedToId: number;
}

export interface TicketFilters {
  title?: string | null;
  status?: string | null;
  priority?: string | null;
  category?: string | null;
}
