"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";

import type { TicketResponse } from "@/types/ticketTypes";
import type { UserRole } from "@/types/roleTypes";

import { isProtectedStatus } from "@/types/statusTypes";
import { isProtectedPriority } from "@/types/priorityTypes";

import { getPriorityColor, getStatusColor } from "@/utils/ticketUiUtils";

import TicketOverview from "./TicketOverview";
import TicketActions from "./TicketActions";
import TicketComments from "../comments/TicketComments";
import TicketHistory from "../history/TicketHistory";

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
    <Box>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1">
          #{ticket.idTicket} - {ticket.title}
        </Typography>

        <Stack direction="row" spacing={2}>
          <Chip
            label={getStatusDisplayName(ticket.status.name)}
            color={getStatusColor(ticket.status.name)}
            variant="outlined"
            sx={{
              fontWeight: 600,
            }}
          />

          <Chip
            label={getPriorityDisplayName(ticket.priority.name)}
            color={getPriorityColor(ticket.priority.name)}
            sx={{
              fontWeight: 600,
            }}
          />
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "2fr 1fr",
          },
          gap: 3,
          mb: 3,
        }}
      >
        <TicketOverview ticket={ticket} />

        <TicketActions
          ticket={ticket}
          userRole={userRole}
          onEdit={onEdit}
          onTicketUpdated={onTicketUpdated}
          onCommentsUpdated={handleCommentsUpdated}
          onHistoryUpdated={handleHistoryUpdated}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 3,
          mb: 3,
        }}
      >
        <TicketComments
          ticketId={ticket.idTicket}
          commentsUpdated={commentsUpdated}
        />

        <TicketHistory
          ticketId={ticket.idTicket}
          historyUpdated={historyUpdated}
        />
      </Box>

      <Button variant="outlined" onClick={onClose}>
        {t("backToTickets")}
      </Button>
    </Box>
  );
}
