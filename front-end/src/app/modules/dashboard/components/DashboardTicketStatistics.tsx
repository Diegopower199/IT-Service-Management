"use client";

import { useTranslations } from "next-intl";

import DashboardTicketStatisticCard from "./DashboardTicketStatisticCard";

import { USER_ROLES, type UserRole } from "@/types/roleTypes";
import type { TicketStatisticsResponse } from "@/types/ticketTypes";

import styles from "../styles/dashboard.module.css";

interface DashboardTicketStatisticsProps {
  role: UserRole;
  statistics: TicketStatisticsResponse;
}

export default function DashboardTicketStatistics({
  role,
  statistics,
}: DashboardTicketStatisticsProps) {
  const t = useTranslations("Dashboard.Statistics");
  const tStatuses = useTranslations("Common.Statuses");
  const tPriorities = useTranslations("Common.Priorities");

  const { totalTickets, openTickets, inProgressTickets, criticalTickets } =
    statistics;

  if (role === USER_ROLES.USER) {
    return (
      <section className={styles.statistics}>
        <DashboardTicketStatisticCard
          title={t("myTickets")}
          value={totalTickets}
          href="/tickets"
        />

        <DashboardTicketStatisticCard
          title={tStatuses("OPEN")}
          value={openTickets}
          href="/tickets?status=OPEN"
        />

        <DashboardTicketStatisticCard
          title={tStatuses("IN_PROGRESS")}
          value={inProgressTickets}
          href="/tickets?status=IN_PROGRESS"
        />

        <DashboardTicketStatisticCard
          title={tPriorities("CRITICAL")}
          value={criticalTickets}
          href="/tickets?priority=CRITICAL"
        />
      </section>
    );
  }

  if (role === USER_ROLES.TECHNICIAN) {
    return (
      <section className={styles.statistics}>
        <DashboardTicketStatisticCard
          title={t("assignedTickets")}
          value={totalTickets}
          href="/tickets"
        />

        <DashboardTicketStatisticCard
          title={tStatuses("OPEN")}
          value={openTickets}
          href="/tickets?status=OPEN"
        />

        <DashboardTicketStatisticCard
          title={tStatuses("IN_PROGRESS")}
          value={inProgressTickets}
          href="/tickets?status=IN_PROGRESS"
        />

        <DashboardTicketStatisticCard
          title={tPriorities("CRITICAL")}
          value={criticalTickets}
          href="/tickets?priority=CRITICAL"
        />
      </section>
    );
  }

  if (role === USER_ROLES.ADMIN) {
    return (
      <section className={styles.statistics}>
        <DashboardTicketStatisticCard
          title={t("totalTickets")}
          value={totalTickets}
          href="/tickets"
        />

        <DashboardTicketStatisticCard
          title={tStatuses("OPEN")}
          value={openTickets}
          href="/tickets?status=OPEN"
        />

        <DashboardTicketStatisticCard
          title={tStatuses("IN_PROGRESS")}
          value={inProgressTickets}
          href="/tickets?status=IN_PROGRESS"
        />

        <DashboardTicketStatisticCard
          title={tPriorities("CRITICAL")}
          value={criticalTickets}
          href="/tickets?priority=CRITICAL"
        />
      </section>
    );
  }

  return null;
}
