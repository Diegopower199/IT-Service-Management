import { UserRole } from "@/types/roleTypes";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: UserRole;
}
