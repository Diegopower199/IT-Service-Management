"use client";

import dayjs from "dayjs";

import { Box, Divider, Paper, Stack, Typography } from "@mui/material";

import type { TicketResponse } from "@/types/ticketTypes";

interface TicketOverviewProps {
  ticket: TicketResponse;
}

export default function TicketOverview({ ticket }: TicketOverviewProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        
      }}
    >
      <Typography variant="h6">Overview</Typography>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={3}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Description
          </Typography>

          <Typography>{ticket.description}</Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "150px 1fr",
            },
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Created By
          </Typography>

          <Typography>{ticket.createdBy.username}</Typography>

          <Typography variant="body2" color="text.secondary">
            Requested For
          </Typography>

          <Typography>{ticket.requestedFor.username}</Typography>

          <Typography variant="body2" color="text.secondary">
            Category
          </Typography>

          <Typography>{ticket.category.name}</Typography>

          <Typography variant="body2" color="text.secondary">
            Assigned To
          </Typography>

          <Typography>{ticket.assignedTo?.username ?? "Unassigned"}</Typography>

          <Typography variant="body2" color="text.secondary">
            Created At
          </Typography>

          <Typography>
            {dayjs(ticket.createdAt).format("DD/MM/YYYY HH:mm")}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Last Updated
          </Typography>

          <Typography>
            {dayjs(ticket.lastUpdated).format("DD/MM/YYYY HH:mm")}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
