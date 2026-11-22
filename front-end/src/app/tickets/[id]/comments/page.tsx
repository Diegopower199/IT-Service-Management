import TicketCommentsContent from "@/app/modules/tickets/components/comments/TicketCommentsContent";

interface TicketCommentsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TicketCommentsPage({
  params,
}: TicketCommentsPageProps) {
  const { id } = await params;

  return <TicketCommentsContent ticketId={Number(id)} />;
}
