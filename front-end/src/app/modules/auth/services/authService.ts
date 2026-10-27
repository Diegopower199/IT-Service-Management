import api from "@/config/axios";
import type { AuthResponse, LoginRequest } from "../../../../types/authTypes";

export const login = async (
  loginRequest: LoginRequest,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", loginRequest);

  return response.data;
};
