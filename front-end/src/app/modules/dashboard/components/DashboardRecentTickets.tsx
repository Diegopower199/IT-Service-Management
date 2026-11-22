"use client";

import { useLocale, useTranslations } from "next-intl";

import type { TicketResponse } from "@/types/ticketTypes";
import TicketClassificationChip from "@/components/ui/TicketClassificationChip";

import styles from "../styles/dashboard.module.css";

interface DashboardRecentTicketsProps {
  tickets: TicketResponse[];
}

export default function DashboardRecentTickets({
  tickets,
}: DashboardRecentTicketsProps) {
  const t = useTranslations("Dashboard.RecentTickets");
  const locale = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const timeFormatter = new Intl.DateTimeFormat(locale, { timeStyle: "short" });

  return (
    <section className={styles.recentTickets}>
      <h2 id="recent-tickets-heading" className={styles.sectionTitle}>
        {t("title")}
      </h2>

      <div
        className={styles.tableScroll}
        role="region"
        aria-labelledby="recent-tickets-heading"
        tabIndex={0}
      >
        <table className={styles.ticketTable} aria-labelledby="recent-tickets-heading">
          <thead>
            <tr>
              <th scope="col" className={styles.idColumn}>{t("id")}</th>
              <th scope="col">{t("ticketTitle")}</th>
              <th scope="col" className={styles.statusColumn}>{t("status")}</th>
              <th scope="col" className={styles.priorityColumn}>{t("priority")}</th>
              <th scope="col" className={styles.assignedColumn}>{t("assigned")}</th>
              <th scope="col" className={styles.updatedColumn}>{t("updated")}</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((ticket) => {
              const updatedAt = new Date(ticket.lastUpdated);
              const hasValidDate = !Number.isNaN(updatedAt.getTime());

              return (
                <tr key={ticket.idTicket}>
                  <td className={styles.ticketId}>#{ticket.idTicket}</td>
                  <td className={styles.ticketTitle}>{ticket.title}</td>
                  <td>
                    <TicketClassificationChip kind="status" name={ticket.status.name} className={styles.ticketBadge} />
                  </td>
                  <td>
                    <TicketClassificationChip kind="priority" name={ticket.priority.name} className={styles.ticketBadge} />
                  </td>
                  <td>{ticket.assignedTo?.username ?? "-"}</td>
                  <td>
                    {hasValidDate ? (
                      <time dateTime={ticket.lastUpdated} title={ticket.lastUpdated}>
                        <span>{dateFormatter.format(updatedAt)}</span>
                        <span className={styles.ticketTime}>
                          {timeFormatter.format(updatedAt)}
                        </span>
                      </time>
                    ) : (
                      ticket.lastUpdated
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
