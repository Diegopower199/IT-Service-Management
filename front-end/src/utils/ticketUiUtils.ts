import type { ChipProps } from "@mui/material";

export const formatEnumName = (value: string) => {
  return value.replace(/_/g, " ");
};

export const getStatusColor = (statusName: string): ChipProps["color"] => {
  switch (statusName) {
    case "OPEN":
      return "info";

    case "IN_PROGRESS":
      return "warning";

    case "WAITING":
      return "secondary";

    case "RESOLVED":
      return "success";

    case "CLOSED":
      return "default";

    default:
      return "default";
  }
};

export const getPriorityColor = (priorityName: string): ChipProps["color"] => {
  switch (priorityName) {
    case "LOW":
      return "success";

    case "MEDIUM":
      return "info";

    case "HIGH":
      return "warning";

    case "CRITICAL":
      return "error";

    default:
      return "default";
  }
};
