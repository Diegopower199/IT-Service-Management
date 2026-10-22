"use client";

import { Divider, Paper, Typography } from "@mui/material";

interface TicketCommentsProps {
  ticketId: number;
}

export default function TicketComments({ ticketId }: TicketCommentsProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        minHeight: 180,
      }}
    >
      <Typography variant="h6">Comments</Typography>

      <Divider sx={{ my: 2 }} />

      <Typography color="text.secondary">
        Latest public/internal comments appear here.
      </Typography>
    </Paper>
  );
}
