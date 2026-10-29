import api from "@/config/axios";
import type { AuthResponse, LoginRequest } from "@/types/authTypes";

/**
 * Authenticates a user using their credentials.
 *
 * The backend returns the access token in the response body and stores the
 * refresh token in an HttpOnly cookie.
 *
 * @param loginRequest user credentials
 * @returns authenticated user information and access token
 */
export const login = async (
  loginRequest: LoginRequest,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", loginRequest);

  return response.data;
};

/**
 * Logs out the current authenticated session.
 *
 * The browser automatically sends the HttpOnly refresh token cookie to the
 * backend, where the corresponding refresh token is revoked and the cookie is
 * removed.
 */
export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};
