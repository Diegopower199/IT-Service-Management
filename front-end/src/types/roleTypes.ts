export const USER_ROLES = {
  USER: "USER",
  TECHNICIAN: "TECHNICIAN",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface RoleResponse {
  idRol: number;
  name: string;
}
