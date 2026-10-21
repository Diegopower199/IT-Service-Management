"use client";

import { useAuth } from "@/hooks/useAuth";
import DashboardHeader from "./DashboardHeader";
import DashboardTicketStatistics from "./DashboardTicketStatistics";
import DashboardRecentTickets from "./DashboardRecentTickets";
import DashboardQuickActions from "./DashboardQuickActions";
import styles from "../styles/dashboard.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TicketResponse, TicketStatisticsResponse } from "@/types/ticketTypes";
import {
  getOwnTickets,
  getTicketStatistics,
} from "../../tickets/services/ticketService";

export default function DashboardContent() {
  const { user, isAuthReady } = useAuth();
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [statistics, setStatistics] = useState<TicketStatisticsResponse | null>(
    null,
  );

  const router = useRouter();

  useEffect(() => {
    if (isAuthReady && !user) {
      router.replace("/login");
    }

    const loadTickets = async () => {
      try {
        const response = await getOwnTickets(0, 20, "lastUpdated,desc");

        setTickets(response.content);
      } catch (error) {
        console.error("Error loading tickets:", error);
      }
    };

    const loadStatistics = async () => {
      try {
        const response = await getTicketStatistics();

        setStatistics(response);
      } catch (error) {
        console.error("Error loading statistics:", error);
      }
    };

    loadTickets();
    loadStatistics();
  }, [isAuthReady, user, router]);

  if (!isAuthReady || !user) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      {user && (
        <>
          <DashboardHeader username={user.username} rol={user.rol} />

          {statistics && (
            <DashboardTicketStatistics rol={user.rol} statistics={statistics} />
          )}

          <div className={styles.dashboardBottom}>
            <DashboardRecentTickets tickets={tickets} />
            <DashboardQuickActions rol={user.rol} />
          </div>
        </>
      )}
    </main>
  );
}
