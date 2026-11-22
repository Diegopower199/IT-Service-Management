import type { TicketHistoryAction } from "@/types/ticketHistoryTypes";

type ClassificationTranslator = ((key: string) => string) & {
  has(key: string): boolean;
};

const legacyHistoryStatuses: Record<string, string> = {
  WAITING: "BLOCKED",
  PENDING_CUSTOMER: "BLOCKED",
  PENDING_VENDOR: "BLOCKED",
  CANCELLED: "CLOSED",
};

function splitClassificationName(name: string): string {
  return name.replace(/[\s_-]+/g, " ").trim();
}

export function getClassificationKey(name: string): string {
  return splitClassificationName(name).replaceAll(" ", "_").toUpperCase();
}

export function getClassificationLabel(name: string, translate: ClassificationTranslator): string {
  const key = getClassificationKey(name);
  if (key && translate.has(key)) return translate(key);

  const label = splitClassificationName(name).toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getHistoryValueLabel(
  action: TicketHistoryAction,
  value: string | null | undefined,
  translateStatus: ClassificationTranslator,
  translatePriority: ClassificationTranslator,
): string {
  if (value == null) return "-";
  if (action === "STATUS_CHANGED") {
    const currentName = legacyHistoryStatuses[getClassificationKey(value)] ?? value;
    return getClassificationLabel(currentName, translateStatus);
  }
  if (action === "PRIORITY_CHANGED") return getClassificationLabel(value, translatePriority);
  return value;
}
