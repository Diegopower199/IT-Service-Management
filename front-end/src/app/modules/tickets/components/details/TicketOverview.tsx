"use client";

import dayjs from "dayjs";
import { useTranslations } from "next-intl";

import { Box, Divider, Paper, Stack, Typography } from "@mui/material";

import type { TicketResponse } from "@/types/ticketTypes";

interface TicketOverviewProps {
  ticket: TicketResponse;
}

export default function TicketOverview({ ticket }: TicketOverviewProps) {
  const t = useTranslations("Tickets.Overview");

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
      }}
    >
      <Typography variant="h6">{t("title")}</Typography>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={3}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t("description")}
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
            {t("createdBy")}
          </Typography>

          <Typography>{ticket.createdBy.username}</Typography>

          <Typography variant="body2" color="text.secondary">
            {t("requestedFor")}
          </Typography>

          <Typography>{ticket.requestedFor.username}</Typography>

          <Typography variant="body2" color="text.secondary">
            {t("category")}
          </Typography>

          <Typography>{ticket.category.name}</Typography>

          <Typography variant="body2" color="text.secondary">
            {t("assignedTo")}
          </Typography>

          <Typography>
            {ticket.assignedTo?.username ?? t("unassigned")}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {t("createdAt")}
          </Typography>

          <Typography>
            {dayjs(ticket.createdAt).format("DD/MM/YYYY HH:mm")}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {t("lastUpdated")}
          </Typography>

          <Typography>
            {dayjs(ticket.lastUpdated).format("DD/MM/YYYY HH:mm")}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
