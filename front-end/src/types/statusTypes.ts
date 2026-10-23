export interface StatusResponse {
  idStatus: number;
  name: string;
  active: boolean;
}

export interface ChangeStatusRequest {
  statusId: number;
}
