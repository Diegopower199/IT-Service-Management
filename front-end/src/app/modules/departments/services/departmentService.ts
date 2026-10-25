import api from "@/config/axios";
import type { DepartmentResponse } from "@/types/departmentTypes";

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
