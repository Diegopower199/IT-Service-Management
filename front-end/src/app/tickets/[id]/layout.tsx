import type { ReactNode } from "react";

import TicketRouteGuard from "@/app/modules/tickets/components/shared/TicketRouteGuard";
import { parseTicketId } from "@/app/modules/tickets/components/shared/ticketNavigation";
import AppLayout from "@/layouts/AppLayout";

interface TicketLayoutProps {
  params: Promise<{ id: string }>;
  children: ReactNode;
}

export default async function TicketLayout({ params, children }: TicketLayoutProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <TicketRouteGuard ticketId={parseTicketId(id)}>{children}</TicketRouteGuard>
    </AppLayout>
  );
}
