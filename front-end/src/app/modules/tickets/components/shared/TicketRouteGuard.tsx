"use client";

import { Fragment, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import PageLoading from "@/components/ui/PageLoading";
import { useAuth } from "@/hooks/useAuth";

import TicketRouteError from "./TicketRouteError";

interface TicketRouteGuardProps {
  ticketId: number | null;
  children: ReactNode;
}

export default function TicketRouteGuard({ ticketId, children }: TicketRouteGuardProps) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthReady && !user) router.replace("/login");
  }, [isAuthReady, router, user]);

  if (!isAuthReady || !user) return <PageLoading />;
  if (ticketId === null) return <TicketRouteError kind="invalidId" />;

  return <Fragment key={`${user.userId}:${user.role}:${ticketId}`}>{children}</Fragment>;
}
