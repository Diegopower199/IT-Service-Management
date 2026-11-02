import { UserRole } from "@/types/roleTypes";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  role: UserRole;
}

export interface RefreshTokenResponse {
  token: string;
}
