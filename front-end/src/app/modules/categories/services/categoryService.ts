import api from "@/config/axios";

import type { CategoryRequest, CategoryResponse } from "@/types/categoryTypes";

export const getAllCategories = async (): Promise<CategoryResponse[]> => {
  const response = await api.get<CategoryResponse[]>("/categories");

  return response.data;
};

export const getAllActiveCategories = async (): Promise<CategoryResponse[]> => {
  const response = await api.get<CategoryResponse[]>("/categories/active");

  return response.data;
};

export const getCategoryById = async (
  idCategory: number,
): Promise<CategoryResponse> => {
  const response = await api.get<CategoryResponse>(`/categories/${idCategory}`);

  return response.data;
};

export const createCategory = async (
  category: CategoryRequest,
): Promise<CategoryResponse> => {
  const response = await api.post<CategoryResponse>("/categories", category);

  return response.data;
};

export const updateCategory = async (
  idCategory: number,
  category: CategoryRequest,
): Promise<CategoryResponse> => {
  const response = await api.put<CategoryResponse>(
    `/categories/${idCategory}`,
    category,
  );

  return response.data;
};

export const activateCategory = async (
  idCategory: number,
): Promise<CategoryResponse> => {
  const response = await api.patch<CategoryResponse>(
    `/categories/${idCategory}/activate`,
  );

  return response.data;
};

export const deactivateCategory = async (
  idCategory: number,
): Promise<CategoryResponse> => {
  const response = await api.patch<CategoryResponse>(
    `/categories/${idCategory}/deactivate`,
  );

  return response.data;
};
