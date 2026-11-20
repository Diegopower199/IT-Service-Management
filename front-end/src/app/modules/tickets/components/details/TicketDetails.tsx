"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button, Chip } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ConfirmationNumberOutlined from "@mui/icons-material/ConfirmationNumberOutlined";

import type { TicketResponse } from "@/types/ticketTypes";
import type { UserRole } from "@/types/roleTypes";

import { getPriorityColor, getStatusColor } from "@/utils/ticketUiUtils";

import TicketOverview from "./TicketOverview";
import TicketActions from "./TicketActions";
import TicketComments from "../comments/TicketComments";
import TicketHistory from "../history/TicketHistory";
import TicketAttachments from "../attachments/TicketAttachments";

import sharedStyles from "../../styles/tickets.module.css";
import styles from "../../styles/ticketDetails.module.css";

interface TicketDetailsProps {
  ticket: TicketResponse;
  userRole: UserRole;
  onClose: () => void;
  onEdit: () => void;
  onTicketUpdated: () => void;
}

export default function TicketDetails({
  ticket,
  userRole,
  onClose,
  onEdit,
  onTicketUpdated,
}: TicketDetailsProps) {
  const t = useTranslations("Tickets.Details");
  const tStatuses = useTranslations("Common.Statuses");
  const tPriorities = useTranslations("Common.Priorities");

  const [commentsUpdated, setCommentsUpdated] = useState(false);
  const [historyUpdated, setHistoryUpdated] = useState(false);

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

  const handleCommentsUpdated = () => {
    setCommentsUpdated((previous) => !previous);
  };

  const handleHistoryUpdated = () => {
    setHistoryUpdated((previous) => !previous);
  };

  return (
    <div className={sharedStyles.page}>
      <div>
        <Button
          variant="outlined"
          startIcon={<ArrowBackRounded />}
          onClick={onClose}
          className={sharedStyles.secondaryButton}
        >
          {t("backToTickets")}
        </Button>
      </div>

      <header className={styles.hero}>
        <span className={sharedStyles.headingIcon} aria-hidden="true">
          <ConfirmationNumberOutlined />
        </span>
        <div className={styles.heroBody}>
          <h1>
            <span className={styles.ticketReference}>#{ticket.idTicket}</span>
            {" "}
            {ticket.title}
          </h1>
          <div className={styles.badges}>
            <Chip
              size="small"
              label={getStatusDisplayName(ticket.status.name)}
              color={getStatusColor(ticket.status.name)}
              className={sharedStyles.ticketBadge}
            />
            <Chip
              size="small"
              label={getPriorityDisplayName(ticket.priority.name)}
              color={getPriorityColor(ticket.priority.name)}
              className={sharedStyles.ticketBadge}
            />
          </div>
        </div>
      </header>

      <div className={styles.detailPrimary}>
        <TicketOverview ticket={ticket} />

        <TicketActions
          ticket={ticket}
          userRole={userRole}
          onEdit={onEdit}
          onTicketUpdated={onTicketUpdated}
          onCommentsUpdated={handleCommentsUpdated}
          onHistoryUpdated={handleHistoryUpdated}
        />
      </div>

      <div className={styles.detailActivity}>
        <TicketComments
          ticketId={ticket.idTicket}
          commentsUpdated={commentsUpdated}
        />

        <TicketHistory
          ticketId={ticket.idTicket}
          historyUpdated={historyUpdated}
        />
      </div>

      <TicketAttachments key={ticket.idTicket} ticketId={ticket.idTicket} />
    </div>
  );
}
