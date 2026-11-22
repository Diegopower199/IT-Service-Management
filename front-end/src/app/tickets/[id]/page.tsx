import TicketDetailsContent from "@/app/modules/tickets/components/details/TicketDetailsContent";

export default async function TicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TicketDetailsContent ticketId={Number(id)} />;
}
