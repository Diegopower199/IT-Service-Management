import TicketHistoryContent from "@/app/modules/tickets/components/history/TicketHistoryContent";

interface TicketHistoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TicketHistoryPage({
  params,
}: TicketHistoryPageProps) {
  const { id } = await params;

  return <TicketHistoryContent ticketId={Number(id)} />;
}
