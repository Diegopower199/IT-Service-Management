import api from "@/config/axios";

import type { RoleResponse } from "@/types/roleTypes";

export const getAllRoles = async (): Promise<RoleResponse[]> => {
  const response = await api.get<RoleResponse[]>("/roles");

  return response.data;
};

export const getRoleById = async (idRole: number): Promise<RoleResponse> => {
  const response = await api.get<RoleResponse>(`/roles/${idRole}`);

  return response.data;
};
