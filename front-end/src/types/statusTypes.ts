export interface StatusRequest {
  name: string;
}

export interface StatusResponse {
  idStatus: number;
  name: string;
  active: boolean;
}
