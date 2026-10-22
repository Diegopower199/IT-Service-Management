import api from "@/config/axios";
import type { CategoryResponse } from "@/types/categoryTypes";

export const getAllCategories = async (): Promise<CategoryResponse[]> => {
  const response = await api.get<CategoryResponse[]>("/categories");

  return response.data;
};
