"use client";

import { useTranslations } from "next-intl";

import type { TicketResponse } from "@/types/ticketTypes";

import styles from "../styles/dashboard.module.css";

interface DashboardRecentTicketsProps {
  tickets: TicketResponse[];
}

export default function DashboardRecentTickets({
  tickets,
}: DashboardRecentTicketsProps) {
  const t = useTranslations("Dashboard.RecentTickets");

  const tStatuses = useTranslations("Common.Statuses");
  const tPriorities = useTranslations("Common.Priorities");

  const getStatusDisplayName = (statusName: string) => {
    if (tStatuses.has(statusName)) {
      return tStatuses(statusName);
    }

    return statusName;
  };

  const getPriorityDisplayName = (priorityName: string) => {
    if (tPriorities.has(priorityName)) {
      return tPriorities(priorityName);
    }

    return priorityName;
  };

  return (
    <section className={styles.recentTickets}>
      <h2 className={styles.sectionTitle}>{t("title")}</h2>

      <table className={styles.ticketTable}>
        <thead>
          <tr>
            <th>{t("id")}</th>
            <th>{t("ticketTitle")}</th>
            <th>{t("status")}</th>
            <th>{t("priority")}</th>
            <th>{t("assigned")}</th>
            <th>{t("updated")}</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.idTicket}>
              <td className={styles.ticketId}>#{ticket.idTicket}</td>

              <td>{ticket.title}</td>

              <td>{getStatusDisplayName(ticket.status.name)}</td>

              <td>{getPriorityDisplayName(ticket.priority.name)}</td>

              <td>{ticket.assignedTo?.username ?? "-"}</td>

              <td>{ticket.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
