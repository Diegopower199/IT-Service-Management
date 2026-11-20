import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/utils/constans";

type TicketSearchParams = Pick<URLSearchParams, "get" | "toString">;

export function readTicketListPagination(searchParams: TicketSearchParams) {
  const page = Number(searchParams.get("listPage"));
  const pageSize = Number(searchParams.get("listPageSize"));

  return {
    page: Number.isSafeInteger(page) && page >= 0 ? page : 0,
    pageSize: PAGE_SIZE_OPTIONS.includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE,
  };
}

function pathWithQuery(path: string, params: URLSearchParams): string {
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function ticketDetailsHref(
  ticketId: number,
  searchParams: TicketSearchParams,
  pagination?: { page: number; pageSize: number },
): string {
  const params = new URLSearchParams(searchParams.toString());
  params.set("ticketId", String(ticketId));

  if (pagination) {
    params.set("listPage", String(pagination.page));
    params.set("listPageSize", String(pagination.pageSize));
  }

  return pathWithQuery("/tickets", params);
}

export function ticketActivityHref(
  ticketId: number,
  activity: "comments" | "history",
  searchParams: TicketSearchParams,
): string {
  const params = new URLSearchParams(searchParams.toString());
  params.delete("ticketId");
  return pathWithQuery(`/tickets/${ticketId}/${activity}`, params);
}

export function ticketListHref(searchParams: TicketSearchParams): string {
  const params = new URLSearchParams(searchParams.toString());
  params.delete("ticketId");
  params.delete("listPage");
  params.delete("listPageSize");
  return pathWithQuery("/tickets", params);
}
