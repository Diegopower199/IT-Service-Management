"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Button from "@mui/material/Button";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";

import { ticketDetailsHref } from "./ticketNavigation";
import sharedStyles from "../../styles/tickets.module.css";
import styles from "../../styles/ticketActivity.module.css";

interface TicketActivityHeaderProps {
  ticketId: number;
  title: string;
  reference: string;
  icon: ReactNode;
}

export default function TicketActivityHeader({
  ticketId,
  title,
  reference,
  icon,
}: TicketActivityHeaderProps) {
  const t = useTranslations("Tickets.Details");

  return (
    <header className={styles.activityHeader}>
      <Button
        component={Link}
        href={ticketDetailsHref(ticketId)}
        variant="outlined"
        startIcon={<ArrowBackRounded />}
        className={sharedStyles.secondaryButton}
      >
        {t("backToTicket")}
      </Button>

      <div className={`${sharedStyles.heading} ${styles.activityHeading}`}>
        <span className={sharedStyles.headingIcon} aria-hidden="true">
          {icon}
        </span>
        <div>
          <h1 id="ticket-activity-title">{title}</h1>
          <p className={styles.ticketReference}>{reference}</p>
        </div>
      </div>
    </header>
  );
}
