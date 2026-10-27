import api from "@/config/axios";

import type { RoleResponse } from "@/types/roleTypes";

export const getAllRoles = async (): Promise<RoleResponse[]> => {
  const response = await api.get<RoleResponse[]>("/roles");

  return response.data;
};

export const getRolById = async (idRol: number): Promise<RoleResponse> => {
  const response = await api.get<RoleResponse>(`/roles/${idRol}`);

  return response.data;
};

export const getAllActiveRoles = async (): Promise<RoleResponse[]> => {
  const response = await api.get<RoleResponse[]>("/roles/active");

  return response.data;
};
