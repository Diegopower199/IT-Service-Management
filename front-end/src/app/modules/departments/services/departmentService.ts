import api from "@/config/axios";

import type {
  DepartmentRequest,
  DepartmentResponse,
} from "@/types/departmentTypes";

export const getAllDepartments = async (): Promise<DepartmentResponse[]> => {
  const response = await api.get<DepartmentResponse[]>("/departments");

  return response.data;
};

export const getAllActiveDepartments = async (): Promise<
  DepartmentResponse[]
> => {
  const response = await api.get<DepartmentResponse[]>("/departments/active");

  return response.data;
};

export const createDepartment = async (
  request: DepartmentRequest,
): Promise<DepartmentResponse> => {
  const response = await api.post<DepartmentResponse>("/departments", request);

  return response.data;
};

export const updateDepartment = async (
  departmentId: number,
  request: DepartmentRequest,
): Promise<DepartmentResponse> => {
  const response = await api.put<DepartmentResponse>(
    `/departments/${departmentId}`,
    request,
  );

  return response.data;
};

export const activateDepartment = async (
  departmentId: number,
): Promise<void> => {
  await api.patch(`/departments/${departmentId}/activate`);
};

export const deactivateDepartment = async (
  departmentId: number,
): Promise<void> => {
  await api.patch(`/departments/${departmentId}/deactivate`);
};
