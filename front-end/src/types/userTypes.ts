import type { DepartmentResponse } from "./departmentTypes";
import type { RoleResponse } from "./roleTypes";

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  rolId: number;
  departmentId: number;
  enabled: boolean;
}

export interface UpdateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  rolId: number;
  departmentId: number;
  enabled: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserResponse {
  idUser: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  rol: RoleResponse;
  department: DepartmentResponse;
}

export interface UserSummaryResponse {
  idUser: number;
  username: string;
}

export interface UpdateProfileRequest {
  email: string;
  firstName: string;
  lastName: string;
}
