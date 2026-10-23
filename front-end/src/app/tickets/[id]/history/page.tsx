import TicketHistoryContent from "@/app/modules/tickets/components/history/TicketHistoryContent";
import AppLayout from "@/layouts/AppLayout";

interface TicketCommentsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TicketCommentsPage({
  params,
}: TicketCommentsPageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <TicketHistoryContent ticketId={Number(id)} />
    </AppLayout>
  );
}
