export const SYSTEM_STATUSES = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  WAITING: "WAITING",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export type SystemStatus =
  (typeof SYSTEM_STATUSES)[keyof typeof SYSTEM_STATUSES];

export const isSystemStatus = (statusName: string): boolean => {
  return Object.values(SYSTEM_STATUSES).includes(
    statusName.toUpperCase() as SystemStatus,
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
