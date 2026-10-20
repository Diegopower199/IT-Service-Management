export interface TicketSummary {
  id: number;
  title: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  updatedAt: string;
}
