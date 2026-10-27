import api from "@/config/axios";

import type { StatusRequest, StatusResponse } from "@/types/statusTypes";

export const getAllStatuses = async (): Promise<StatusResponse[]> => {
  const response = await api.get<StatusResponse[]>("/statuses");

  return response.data;
};

export const getAllActiveStatuses = async (): Promise<StatusResponse[]> => {
  const response = await api.get<StatusResponse[]>("/statuses/active");

  return response.data;
};

export const getStatusById = async (
  idStatus: number,
): Promise<StatusResponse> => {
  const response = await api.get<StatusResponse>(`/statuses/${idStatus}`);

  return response.data;
};

export const createStatus = async (
  status: StatusRequest,
): Promise<StatusResponse> => {
  const response = await api.post<StatusResponse>("/statuses", status);

  return response.data;
};

export const updateStatus = async (
  idStatus: number,
  status: StatusRequest,
): Promise<StatusResponse> => {
  const response = await api.put<StatusResponse>(
    `/statuses/${idStatus}`,
    status,
  );

  return response.data;
};

export const activateStatus = async (
  idStatus: number,
): Promise<StatusResponse> => {
  const response = await api.patch<StatusResponse>(
    `/statuses/${idStatus}/activate`,
  );

  return response.data;
};

export const deactivateStatus = async (
  idStatus: number,
): Promise<StatusResponse> => {
  const response = await api.patch<StatusResponse>(
    `/statuses/${idStatus}/deactivate`,
  );

  return response.data;
};
