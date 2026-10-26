import axios from "axios";

import type { ApiErrorResponse } from "@/types/apiTypes";

export const getApiError = (error: unknown): ApiErrorResponse | null => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data ?? null;
  }

  return null;
};
