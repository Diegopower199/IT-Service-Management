"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import dayjs from "dayjs";

import { Alert, Box, Button, Divider, Paper, Typography } from "@mui/material";

import type { TicketHistoryResponse } from "@/types/ticketHistoryTypes";

import { DEFAULT_TICKET_HISTORY_SORT } from "@/utils/constans";
import { getApiError } from "@/utils/apiErrorUtils";

import { getAllTicketHistoryById } from "../../services/ticketHistoryService";

import PageLoading from "@/components/ui/PageLoading";

interface TicketHistoryProps {
  ticketId: number;
  historyUpdated: boolean;
}

export default function TicketHistory({
  ticketId,
  historyUpdated,
}: TicketHistoryProps) {
  const router = useRouter();

  const [ticketHistory, setTicketHistory] = useState<TicketHistoryResponse[]>(
    [],
  );

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadTicketHistory = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getAllTicketHistoryById(
          ticketId,
          0,
          5,
          DEFAULT_TICKET_HISTORY_SORT,
        );

        setTicketHistory(response.content);
      } catch (error) {
        console.error("Error loading ticket history:", error);

        const apiError = getApiError(error);

        setErrorMessage(apiError?.message ?? "Error loading ticket history.");
      } finally {
        setLoading(false);
      }
    };

    loadTicketHistory();
  }, [ticketId, historyUpdated]);

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

      {errorMessage && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
        >
          {errorMessage}
        </Alert>
      )}

      {loading ? (
        <PageLoading />
      ) : ticketHistory.length === 0 ? (
        <Typography color="text.secondary">
          No history has been recorded yet.
        </Typography>
      ) : (
        ticketHistory.map((history) => (
          <Paper
            key={history.idHistory}
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
            }}
          >
            <Typography variant="subtitle1">{history.action}</Typography>

            <Typography variant="body2" color="text.secondary">
              {history.user.username} ·{" "}
              {dayjs(history.createdAt).format("DD/MM/YYYY HH:mm")}
            </Typography>

            {history.fieldName && (
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                }}
              >
                Field: {history.fieldName}
              </Typography>
            )}

            {(history.oldValue || history.newValue) && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: 1,
                  alignItems: "center",
                }}
              >
                <Typography>{history.oldValue ?? "-"}</Typography>

                <Typography>→</Typography>

                <Typography>{history.newValue ?? "-"}</Typography>
              </Box>
            )}
          </Paper>
        ))
      )}

      {ticketHistory.length > 0 && (
        <Button
          variant="outlined"
          onClick={() => router.push(`/tickets/${ticketId}/history`)}
        >
          View all history
        </Button>
      )}
    </Paper>
  );
}
