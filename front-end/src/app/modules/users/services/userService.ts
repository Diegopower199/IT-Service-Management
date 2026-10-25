import api from "@/config/axios";
import { PageResponse } from "@/types/pageTypes";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  UserSummaryResponse,
} from "@/types/userTypes";

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

export const createUser = async (
  request: CreateUserRequest,
): Promise<UserResponse> => {
  console.log("Request: ", request)
  const response = await api.post<UserResponse>("/users", request);

  return response.data;
};

export const updateUser = async (
  userId: number,
  request: UpdateUserRequest,
): Promise<UserResponse> => {
  const response = await api.put<UserResponse>(`/users/${userId}`, request);

  return response.data;
};
