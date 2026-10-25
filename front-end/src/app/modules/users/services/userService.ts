import api from "@/config/axios";
import { PageResponse } from "@/types/pageTypes";
import type { UserResponse, UserSummaryResponse } from "@/types/userTypes";

export const getAllUsers = async (
  page: number,
  size: number,
  sort: string,
): Promise<PageResponse<UserResponse>> => {
  const response = await api.get<PageResponse<UserResponse>>("/users", {
    params: {
      page,
      size,
      sort,
    },
  });

  return response.data;
};

export const getAllTechnicians = async (): Promise<UserSummaryResponse[]> => {
  const response = await api.get<UserSummaryResponse[]>("/users/technicians");

  return response.data;
};
