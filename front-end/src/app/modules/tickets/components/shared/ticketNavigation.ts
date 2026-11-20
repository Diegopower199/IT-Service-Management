import type { UserRole } from "@/types/roleTypes";
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
    const query = ticketListHref(searchParams).split("?")[1] ?? "";
    sessionStorage.setItem(ticketListStorageKey(account, ticketId), query);
  } catch {
    // Storage may be disabled by the browser.
  }
}

export function restoreTicketListHref(account: TicketListAccount, ticketId: number): string {
  try {
    const query = sessionStorage.getItem(ticketListStorageKey(account, ticketId));
    return ticketListHref(new URLSearchParams(query ?? ""));
  } catch {
    return "/tickets";
  }
}
