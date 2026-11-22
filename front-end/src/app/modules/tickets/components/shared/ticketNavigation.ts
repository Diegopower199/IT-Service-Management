import { USER_ROLES, type UserRole } from "@/types/roleTypes";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/utils/constans";

type TicketSearchParams = Pick<URLSearchParams, "get">;

interface TicketListAccount {
  userId: number;
  role: UserRole;
}

interface TicketListPagination {
  page: number;
  pageSize: number;
}

const filterKeys = ["title", "status", "priority", "category"] as const;
const assignmentKey = "assignment";
const unassignedValue = "unassigned";
const ticketListListeners = new Set<() => void>();
const unassignedAccounts = new Set<number>();

function ticketAssignmentStorageKey(userId: number): string {
  return `tickets:assignment:${userId}`;
}

export function subscribeToTicketListAssignment(listener: () => void): () => void {
  ticketListListeners.add(listener);
  return () => {
    ticketListListeners.delete(listener);
  };
}

export function isUnassignedTicketList(account: TicketListAccount | null): boolean {
  if (account?.role !== USER_ROLES.TECHNICIAN) return false;

  try {
    return sessionStorage.getItem(ticketAssignmentStorageKey(account.userId)) === unassignedValue;
  } catch {
    return unassignedAccounts.has(account.userId);
  }
}

export function selectTicketList(account: TicketListAccount, showUnassigned: boolean): void {
  if (account.role !== USER_ROLES.TECHNICIAN) return;

  if (showUnassigned) {
    unassignedAccounts.add(account.userId);
  } else {
    unassignedAccounts.delete(account.userId);
  }

  try {
    const key = ticketAssignmentStorageKey(account.userId);
    if (showUnassigned) {
      sessionStorage.setItem(key, unassignedValue);
    } else {
      sessionStorage.removeItem(key);
    }
  } catch {
    // The selection remains available in memory if storage is disabled.
  }

  ticketListListeners.forEach((listener) => listener());
}

export function parseTicketId(value: string | undefined): number | null {
  if (value === undefined || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export function readTicketListPagination(searchParams: TicketSearchParams): TicketListPagination {
  const page = Number(searchParams.get("page"));
  const pageSize = Number(searchParams.get("pageSize"));

  return {
    page: Number.isSafeInteger(page) && page >= 0 ? page : 0,
    pageSize: PAGE_SIZE_OPTIONS.includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE,
  };
}

export function ticketDetailsHref(ticketId: number): string {
  return `/tickets/${ticketId}`;
}

export function ticketActivityHref(ticketId: number, activity: "comments" | "history"): string {
  return `${ticketDetailsHref(ticketId)}/${activity}`;
}

export function ticketListHref(
  searchParams: TicketSearchParams,
  { page, pageSize } = readTicketListPagination(searchParams),
): string {
  const params = new URLSearchParams();
  for (const key of filterKeys) {
    const value = searchParams.get(key);
    if (value) params.set(key, value);
  }
  if (page > 0) params.set("page", String(page));
  if (pageSize !== DEFAULT_PAGE_SIZE) params.set("pageSize", String(pageSize));

  const query = params.toString();
  return query ? `/tickets?${query}` : "/tickets";
}

function ticketListStorageKey(account: TicketListAccount, ticketId: number): string {
  return `tickets:list:${account.userId}:${account.role}:${ticketId}`;
}

export function rememberTicketList(
  account: TicketListAccount,
  ticketId: number,
  searchParams: TicketSearchParams,
): void {
  try {
    const query = new URLSearchParams(ticketListHref(searchParams).split("?")[1]);
    if (isUnassignedTicketList(account)) query.set(assignmentKey, unassignedValue);
    sessionStorage.setItem(ticketListStorageKey(account, ticketId), query.toString());
  } catch {
    // Storage may be disabled by the browser.
  }
}

export function restoreTicketList(account: TicketListAccount, ticketId: number): string {
  try {
    const saved = sessionStorage.getItem(ticketListStorageKey(account, ticketId));
    const query = new URLSearchParams(saved ?? "");
    selectTicketList(account, query.get(assignmentKey) === unassignedValue);
    return ticketListHref(query);
  } catch {
    return "/tickets";
  }
}
