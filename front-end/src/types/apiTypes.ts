export interface ApiErrorResponse {
  status: number;
  message: string;
  timestamp: string;
}

export type ValidationErrors = Record<string, string>;
