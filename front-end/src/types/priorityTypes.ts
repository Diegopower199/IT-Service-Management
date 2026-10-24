export interface PriorityResponse {
  idPriority: number;
  name: string;
  active: boolean;
}

export interface ChangePriorityRequest {
  priorityId: number;
}
