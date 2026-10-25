import { DepartmentResponse } from "./departmentTypes";
import { RoleResponse } from "./roleTypes";

export interface UserSummaryResponse {
  idUser: number;
  username: string;
}

export interface UserResponse {
  idUser: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  rol: RoleResponse;
  department: DepartmentResponse | null;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
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
