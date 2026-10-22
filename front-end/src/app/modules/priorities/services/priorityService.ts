import api from "@/config/axios";
import type { PriorityResponse } from "@/types/priorityTypes";

export const getAllPriorities = async (): Promise<PriorityResponse[]> => {
  const response = await api.get<PriorityResponse[]>("/priorities");

  return response.data;
};
