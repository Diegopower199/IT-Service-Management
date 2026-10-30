export const PROTECTED_STATUSES = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  WAITING: "WAITING",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export type ProtectedStatus =
  (typeof PROTECTED_STATUSES)[keyof typeof PROTECTED_STATUSES];

export const isProtectedStatus = (statusName: string): boolean => {
  return Object.values(PROTECTED_STATUSES).includes(
    statusName.toUpperCase() as ProtectedStatus,
  );
};

export interface StatusRequest {
  name: string;
}

export interface StatusResponse {
  idStatus: number;
  name: string;
  active: boolean;
}
