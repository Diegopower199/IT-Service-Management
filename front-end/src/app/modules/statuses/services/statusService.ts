import api from "@/config/axios";
import type { StatusResponse } from "@/types/statusTypes";

export const getAllStatuses = async (): Promise<StatusResponse[]> => {
  const response = await api.get<StatusResponse[]>("/statuses");

  return response.data;
};

export const getAllActiveStatuses = async (): Promise<StatusResponse[]> => {
  const response = await api.get<StatusResponse[]>("/statuses/active");

  return response.data;
};
