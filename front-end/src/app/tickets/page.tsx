import { redirect } from "next/navigation";

import AppLayout from "@/layouts/AppLayout";
import TicketsContent from "../modules/tickets/components/content/TicketsContent";
import { parseTicketId, ticketDetailsHref } from "../modules/tickets/components/shared/ticketNavigation";

export default async function TicketsPage({ searchParams }: {
  searchParams: Promise<{ ticketId?: string | string[] }>;
}) {
  const { ticketId } = await searchParams;
  const id = parseTicketId(typeof ticketId === "string" ? ticketId : undefined);
  if (id !== null) redirect(ticketDetailsHref(id));

  return (
    <AppLayout>
      <TicketsContent />
    </AppLayout>
  );
}
