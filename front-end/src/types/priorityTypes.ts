export const PROTECTED_PRIORITIES = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export type ProtectedPriority =
  (typeof PROTECTED_PRIORITIES)[keyof typeof PROTECTED_PRIORITIES];

export const isProtectedPriority = (priorityName: string): boolean => {
  return Object.values(PROTECTED_PRIORITIES).includes(
    priorityName.toUpperCase() as ProtectedPriority,
  );
};

export interface PriorityRequest {
  name: string;
}

export interface PriorityResponse {
  idPriority: number;
  name: string;
  active: boolean;
}
