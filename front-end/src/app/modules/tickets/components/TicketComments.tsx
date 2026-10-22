"use client";

import PageLoading from "@/components/ui/PageLoading";
import { useAuth } from "@/hooks/useAuth";
import type { TicketCommentResponse } from "@/types/ticketCommentTypes";
import { Divider, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getAllTicketsCommentsById } from "../services/ticketCommentsService";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_TICKET_COMMENTS_SORT,
} from "@/utils/constans";
import dayjs from "dayjs";

interface TicketCommentsProps {
  ticketId: number;
}

export default function TicketComments({ ticketId }: TicketCommentsProps) {
  const { user, isAuthReady } = useAuth();

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

  if (!isAuthReady || !user) {
    return <PageLoading />;
  }
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

      {loading ? (
        <PageLoading />
      ) : ticketComments.length === 0 ? (
        <Typography color="text.secondary">
          No comments have been added yet.
        </Typography>
      ) : (
        ticketComments.map((ticketComment) => (
          <Paper
            key={ticketComment.idComment}
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
            }}
          >
            <Typography variant="subtitle1">
              {ticketComment.user.username}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {dayjs(ticketComment.createdAt).format("DD/MM/YYYY HH:mm")}
            </Typography>

            <Typography sx={{ mt: 1 }}>{ticketComment.comment}</Typography>
          </Paper>
        ))
      )}
    </Paper>
  );
}
