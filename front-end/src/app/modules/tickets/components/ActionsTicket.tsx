"use client";

import dayjs from "dayjs";

import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import type { TicketResponse } from "@/types/ticketTypes";

interface TicketDetailsProps {
  ticket: TicketResponse;
  onClose: () => void;
}

export default function TicketDetails({ ticket, onClose }: TicketDetailsProps) {
  return (
    <Box>
      {/* HEADER */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          #{ticket.idTicket} - {ticket.title}
        </Typography>

        <Stack direction="row" spacing={1}>
          <Chip label={ticket.status.name} variant="outlined" />

          <Chip label={ticket.priority.name} variant="outlined" />
        </Stack>
      </Stack>

      {/* OVERVIEW */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mb: 3,
        }}
      >
        <Typography variant="h6">Overview</Typography>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={3}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Description
            </Typography>

            <Typography>{ticket.description}</Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "200px 1fr",
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

            <Typography>
              {ticket.assignedTo?.username ?? "Unassigned"}
            </Typography>

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

      {/* FUTURE SECTIONS */}
      {/*
        Actions

        Comments

        History
      */}

      <Button variant="outlined" onClick={onClose}>
        Back to Tickets
      </Button>
    </Box>
  );
}
