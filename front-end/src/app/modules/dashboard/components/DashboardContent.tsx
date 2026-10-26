"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@mui/material";

import { useAuth } from "@/hooks/useAuth";

import type {
  TicketResponse,
  TicketStatisticsResponse,
} from "@/types/ticketTypes";

import {
  getOwnTickets,
  getTicketStatistics,
} from "../../tickets/services/ticketService";

import { getApiError } from "@/utils/apiErrorUtils";

import PageLoading from "@/components/ui/PageLoading";

import DashboardHeader from "./DashboardHeader";
import DashboardTicketStatistics from "./DashboardTicketStatistics";
import DashboardRecentTickets from "./DashboardRecentTickets";
import DashboardQuickActions from "./DashboardQuickActions";

import styles from "../styles/dashboard.module.css";

export default function DashboardContent() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<TicketResponse[]>([]);

  const [statistics, setStatistics] = useState<TicketStatisticsResponse | null>(
    null,
  );

  const [ticketsErrorMessage, setTicketsErrorMessage] = useState("");
  const [statisticsErrorMessage, setStatisticsErrorMessage] = useState("");

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    const loadTickets = async () => {
      try {
        setTicketsErrorMessage("");

        const response = await getOwnTickets(0, 20, "lastUpdated,desc");

        setTickets(response.content);
      } catch (error) {
        console.error("Error loading tickets:", error);

        const apiError = getApiError(error);

        setTicketsErrorMessage(apiError?.message ?? "Error loading tickets.");
      }
    };

    const loadStatistics = async () => {
      try {
        setStatisticsErrorMessage("");

        const response = await getTicketStatistics();

        setStatistics(response);
      } catch (error) {
        console.error("Error loading statistics:", error);

        const apiError = getApiError(error);

        setStatisticsErrorMessage(
          apiError?.message ?? "Error loading statistics.",
        );
      }
    };

    loadTickets();
    loadStatistics();
  }, [isAuthReady, user, router]);

  if (!isAuthReady || !user) {
    return <PageLoading />;
  }

  return (
    <main>
      <DashboardHeader username={user.username} rol={user.rol} />

      {statisticsErrorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {statisticsErrorMessage}
        </Alert>
      )}

      {statistics && (
        <DashboardTicketStatistics rol={user.rol} statistics={statistics} />
      )}

      {ticketsErrorMessage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {ticketsErrorMessage}
        </Alert>
      )}

      <div className={styles.dashboardBottom}>
        <DashboardRecentTickets tickets={tickets} />

        <DashboardQuickActions rol={user.rol} />
      </div>
    </main>
  );
}
