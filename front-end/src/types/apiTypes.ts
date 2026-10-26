export interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
  errors?: Record<string, string> | null;
  timestamp: string;
}

export type ValidationErrors = Record<string, string>;
