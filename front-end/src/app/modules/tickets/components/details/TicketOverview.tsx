"use client";

import { useTranslations } from "next-intl";

import { Paper } from "@mui/material";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

import type { TicketResponse } from "@/types/ticketTypes";

import TicketDate from "../shared/TicketDate";
import styles from "../../styles/ticketDetails.module.css";

interface TicketOverviewProps {
  ticket: TicketResponse;
}

export default function TicketOverview({ ticket }: TicketOverviewProps) {
  const t = useTranslations("Tickets.Overview");

  const fields = [
    { label: t("createdBy"), value: ticket.createdBy.username },
    { label: t("requestedFor"), value: ticket.requestedFor.username },
    { label: t("category"), value: ticket.category.name },
    { label: t("assignedTo"), value: ticket.assignedTo?.username ?? t("unassigned") },
    { label: t("createdAt"), value: <TicketDate value={ticket.createdAt} /> },
    { label: t("lastUpdated"), value: <TicketDate value={ticket.lastUpdated} /> },
  ];

  return (
    <Paper component="section" variant="outlined" className={styles.panel}>
      <h2 className={styles.panelTitle}>
        <InfoOutlined aria-hidden="true" />
        {t("title")}
      </h2>

      <div className={styles.description}>
        <h3>{t("description")}</h3>
        <p>{ticket.description}</p>
      </div>

      <dl className={styles.metadata}>
        {fields.map(({ label, value }) => (
          <div className={styles.metadataItem} key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </Paper>
  );
}
