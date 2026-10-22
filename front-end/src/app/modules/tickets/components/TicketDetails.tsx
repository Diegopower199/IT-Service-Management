"use client";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";

import type { TicketResponse } from "@/types/ticketTypes";
import type { UserRole } from "@/types/roleTypes";
import TicketOverview from "./TicketOverview";
import TicketActions from "./TicketActions";
import TicketComments from "./TicketComments";
import TicketHistory from "./TicketHistory";

interface TicketDetailsProps {
  ticket: TicketResponse;
  userRole: UserRole;
  onClose: () => void;
  onEdit: () => void;
}

export default function TicketDetails({
  ticket,
  userRole,
  onClose,
  onEdit,
}: TicketDetailsProps) {
  return (
    <Box>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1">
          #{ticket.idTicket} - {ticket.title}
        </Typography>

        <Stack direction="row" spacing={2}>
          <Chip label={ticket.status.name} variant="outlined" />

          <Chip
            label={ticket.priority.name}
            color={
              ticket.priority.name === "CRITICAL"
                ? "error"
                : ticket.priority.name === "HIGH"
                  ? "warning"
                  : ticket.priority.name === "MEDIUM"
                    ? "info"
                    : "default"
            }
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

        <TicketActions ticket={ticket} userRole={userRole} onEdit={onEdit} />
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
