"use client";

import { useAuth } from "@/hooks/useAuth";
import DashboardHeader from "./DashboardHeader";
import DashboardTicketStatistics from "./DashboardTicketStatistics";
import DashboardRecentTickets from "./DashboardRecentTickets";
import DashboardQuickActions from "./DashboardQuickActions";
import styles from "../styles/dashboard.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TicketResponse } from "@/types/ticketTypes";
import { getOwnTickets } from "../../tickets/services/ticketService";

export default function DashboardContent() {
  const { user, isAuthReady } = useAuth();
  const [tickets, setTickets] = useState<TicketResponse[]>([]);

  const router = useRouter();

  useEffect(() => {
    if (isAuthReady && !user) {
      router.replace("/login");
    }

    const loadTickets = async () => {
      try {
        const response = await getOwnTickets();

        setTickets(response);
      } catch (error) {
        console.error("Error loading tickets:", error);
      }
    };

    loadTickets();
  }, [isAuthReady, user, router]);

  if (!isAuthReady || !user) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      {user && (
        <>
          <DashboardHeader username={user.username} rol={user.rol} />

          <DashboardTicketStatistics rol={user.rol} tickets={tickets} />

          <div className={styles.dashboardBottom}>
            <DashboardRecentTickets tickets={tickets} />
            <DashboardQuickActions rol={user.rol} />
          </div>
        </>
      )}
    </main>
  );
}
