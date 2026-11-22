"use client";

import { Chip, type ChipProps } from "@mui/material";
import { useTranslations } from "next-intl";

import { getClassificationKey, getClassificationLabel } from "@/utils/ticketUiUtils";

type Classification = "status" | "priority";
type TicketChipColor = NonNullable<ChipProps["color"]> | { color: string; backgroundColor: string };

const colors: Record<Classification, Record<string, TicketChipColor>> = {
  status: {
    OPEN: "info",
    IN_PROGRESS: "warning",
    BLOCKED: { color: "#7e3b57", backgroundColor: "#f7e5ee" },
    RESOLVED: "success",
    CLOSED: { color: "#34465d", backgroundColor: "#dce5f1" },
  },
  priority: {
    LOW: "success",
    MEDIUM: "info",
    HIGH: "warning",
    CRITICAL: "error",
    VERY_LOW: { color: "#52623a", backgroundColor: "#eef2df" },
    URGENT: { color: "#8a421a", backgroundColor: "#fde6d4" },
  },
};

interface TicketClassificationChipProps {
  kind: Classification;
  name: string;
  className?: string;
  dot?: boolean;
}

export default function TicketClassificationChip({ kind, name, className, dot }: TicketClassificationChipProps) {
  const t = useTranslations(kind === "status" ? "Common.Statuses" : "Common.Priorities");
  const color = colors[kind][getClassificationKey(name)] ?? "default";
  const style = typeof color === "object" ? (dot ? { backgroundColor: color.color } : color) : undefined;

  return (
    <Chip
      aria-hidden={dot}
      className={className}
      size="small"
      color={typeof color === "string" ? color : "default"}
      label={dot ? undefined : getClassificationLabel(name, t)}
      style={style}
      sx={dot ? { width: 10, height: 10, "& .MuiChip-label": { display: "none" } } : undefined}
    />
  );
}
