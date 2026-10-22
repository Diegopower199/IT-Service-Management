import TicketCommentsContent from "@/app/modules/tickets/components/TicketCommentsContent";
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
      <TicketCommentsContent ticketId={Number(id)} />
    </AppLayout>
  );
}
