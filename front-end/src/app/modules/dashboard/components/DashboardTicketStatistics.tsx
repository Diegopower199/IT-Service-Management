"use client";

import { useTranslations } from "next-intl";

import { USER_ROLES, type UserRole } from "@/types/roleTypes";
import type { TicketStatisticsResponse } from "@/types/ticketTypes";

import DashboardTicketStatisticCard from "./DashboardTicketStatisticCard";
import styles from "../styles/dashboard.module.css";

interface DashboardTicketStatisticsProps {
  role: UserRole;
  statistics: TicketStatisticsResponse;
}

const totalTitleByRole = {
  [USER_ROLES.ADMIN]: "totalTickets",
  [USER_ROLES.TECHNICIAN]: "assignedTickets",
  [USER_ROLES.USER]: "myTickets",
} as const;

export default function DashboardTicketStatistics({
  role,
  statistics,
}: DashboardTicketStatisticsProps) {
  const t = useTranslations("Dashboard.Statistics");
  const tStatuses = useTranslations("Common.Statuses");
  const tPriorities = useTranslations("Common.Priorities");

  const { totalTickets, openTickets, inProgressTickets, criticalTickets } =
    statistics;
  const totalTitle = totalTitleByRole[role];

  if (!totalTitle) {
    return null;
  }

  return (
    <ul className={styles.statistics}>
      <li>
        <DashboardTicketStatisticCard
          kind="total"
          title={t(totalTitle)}
          value={totalTickets}
          href="/tickets"
        />
      </li>
      <li>
        <DashboardTicketStatisticCard
          kind="open"
          title={tStatuses("OPEN")}
          value={openTickets}
          href="/tickets?status=OPEN"
        />
      </li>
      <li>
        <DashboardTicketStatisticCard
          kind="inProgress"
          title={tStatuses("IN_PROGRESS")}
          value={inProgressTickets}
          href="/tickets?status=IN_PROGRESS"
        />
      </li>
      <li>
        <DashboardTicketStatisticCard
          kind="critical"
          title={tPriorities("CRITICAL")}
          value={criticalTickets}
          href="/tickets?priority=CRITICAL"
        />
      </li>
    </ul>
  );
}
