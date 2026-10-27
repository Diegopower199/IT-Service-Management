import api from "@/config/axios";

import type { PageResponse } from "@/types/pageTypes";

import type {
  ChangePasswordRequest,
  CreateUserRequest,
  UpdateProfileRequest,
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

export const getUserById = async (userId: number): Promise<UserResponse> => {
  const response = await api.get<UserResponse>(`/users/${userId}`);

  return response.data;
};

export const getCurrentUser = async (): Promise<UserResponse> => {
  const response = await api.get<UserResponse>("/users/me");

  return response.data;
};

export const getAllTechnicians = async (): Promise<UserSummaryResponse[]> => {
  const response = await api.get<UserSummaryResponse[]>("/users/technicians");

  return response.data;
};

export const createUser = async (
  request: CreateUserRequest,
): Promise<UserResponse> => {
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

export const updateCurrentUser = async (
  request: UpdateProfileRequest,
): Promise<UserResponse> => {
  const response = await api.put<UserResponse>("/users/me", request);

  return response.data;
};

export const changePassword = async (
  request: ChangePasswordRequest,
): Promise<void> => {
  await api.put("/users/change-password", request);
};
