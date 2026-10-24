"use client";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";

import type { TicketResponse } from "@/types/ticketTypes";
import type { UserRole } from "@/types/roleTypes";
import TicketOverview from "./TicketOverview";
import TicketActions from "./TicketActions";
import TicketComments from "../comments/TicketComments";
import TicketHistory from "../history/TicketHistory";
import {
  formatEnumName,
  getPriorityColor,
  getStatusColor,
} from "@/utils/ticketUiUtils";

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
  return (
    <Box>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1">
          #{ticket.idTicket} - {ticket.title}
        </Typography>

        <Stack direction="row" spacing={2}>
          <Chip
            label={formatEnumName(ticket.status.name)}
            color={getStatusColor(ticket.status.name)}
            variant="outlined"
            sx={{
              fontWeight: 600,
            }}
          />

          <Chip
            label={formatEnumName(ticket.priority.name)}
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
        <TicketComments ticketId={ticket.idTicket} />

        <TicketHistory ticketId={ticket.idTicket} />
      </Box>

      <Button variant="outlined" onClick={onClose}>
        Back to Tickets
      </Button>
    </Box>
  );
}
