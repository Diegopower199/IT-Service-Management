"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

import type { TicketCommentResponse } from "@/types/ticketCommentTypes";

import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_TICKET_COMMENTS_SORT,
} from "@/utils/constans";

import { getAllTicketsCommentsById } from "../services/ticketCommentsService";

interface TicketCommentsContentProps {
  ticketId: number;
}

export default function TicketCommentsContent({
  ticketId,
}: TicketCommentsContentProps) {
  const [ticketComments, setTicketComments] = useState<TicketCommentResponse[]>(
    [],
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTicketComments = async () => {
      try {
        setLoading(true);

        const response = await getAllTicketsCommentsById(
          ticketId,
          0,
          DEFAULT_PAGE_SIZE,
          DEFAULT_TICKET_COMMENTS_SORT,
        );

        setTicketComments(response.content);
      } catch (error) {
        console.error("Error loading ticket comments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTicketComments();
  }, [ticketId]);

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Ticket Comments
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ticket #{ticketId}
      </Typography>

      {loading ? (
        <Typography color="text.secondary">Loading comments...</Typography>
      ) : ticketComments.length === 0 ? (
        <Typography color="text.secondary">
          No comments have been added yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {ticketComments.map((ticketComment) => (
            <Paper
              key={ticketComment.idComment}
              variant="outlined"
              sx={{
                p: 2,
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="subtitle1">
                    {ticketComment.user.username}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {dayjs(ticketComment.createdAt).format("DD/MM/YYYY HH:mm")}
                  </Typography>
                </Box>

                {ticketComment.internal && (
                  <Chip label="INTERNAL" size="small" variant="outlined" />
                )}
              </Stack>

              <Typography sx={{ mt: 2 }}>{ticketComment.comment}</Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
