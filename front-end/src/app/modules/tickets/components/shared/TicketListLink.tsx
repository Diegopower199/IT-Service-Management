"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { useAuth } from "@/hooks/useAuth";
import { selectTicketList } from "./ticketNavigation";

type TicketListLinkProps = Omit<ComponentProps<typeof Link>, "onNavigate"> & {
  showUnassigned?: boolean;
};

export default function TicketListLink({ showUnassigned = false, ...props }: TicketListLinkProps) {
  const { user } = useAuth();

  return (
    <Link
      {...props}
      onNavigate={() => {
        if (user) selectTicketList(user, showUnassigned);
      }}
    />
  );
}
