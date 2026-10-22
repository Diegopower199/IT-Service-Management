"use client";

import { Divider, Paper, Typography } from "@mui/material";

interface TicketHistoryProps {
  ticketId: number;
}

export default function TicketHistory({ ticketId }: TicketHistoryProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        minHeight: 180,
      }}
    >
      <Typography variant="h6">History</Typography>

      <Divider sx={{ my: 2 }} />

      <Typography color="text.secondary">
        Created, status, priority, assignment and field changes.
      </Typography>
    </Paper>
  );
}
