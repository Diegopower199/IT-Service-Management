import api from "@/config/axios";

import type { PriorityRequest, PriorityResponse } from "@/types/priorityTypes";

export const getAllPriorities = async (): Promise<PriorityResponse[]> => {
  const response = await api.get<PriorityResponse[]>("/priorities");

  return response.data;
};

export const getAllActivePriorities = async (): Promise<PriorityResponse[]> => {
  const response = await api.get<PriorityResponse[]>("/priorities/active");

  return response.data;
};

export const getPriorityById = async (
  idPriority: number,
): Promise<PriorityResponse> => {
  const response = await api.get<PriorityResponse>(`/priorities/${idPriority}`);

  return response.data;
};

export const createPriority = async (
  priority: PriorityRequest,
): Promise<PriorityResponse> => {
  const response = await api.post<PriorityResponse>("/priorities", priority);

  return response.data;
};

export const updatePriority = async (
  idPriority: number,
  priority: PriorityRequest,
): Promise<PriorityResponse> => {
  const response = await api.put<PriorityResponse>(
    `/priorities/${idPriority}`,
    priority,
  );

  return response.data;
};

export const activatePriority = async (
  idPriority: number,
): Promise<PriorityResponse> => {
  const response = await api.patch<PriorityResponse>(
    `/priorities/${idPriority}/activate`,
  );

  return response.data;
};

export const deactivatePriority = async (
  idPriority: number,
): Promise<PriorityResponse> => {
  const response = await api.patch<PriorityResponse>(
    `/priorities/${idPriority}/deactivate`,
  );

  return response.data;
};
