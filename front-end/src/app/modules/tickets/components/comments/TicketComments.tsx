"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Alert, Button, Paper } from "@mui/material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";

import PageLoading from "@/components/ui/PageLoading";

import type { TicketCommentResponse } from "@/types/ticketCommentTypes";

import { DEFAULT_TICKET_COMMENTS_SORT } from "@/utils/constans";
import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import { getAllTicketsCommentsById } from "../../services/ticketCommentsService";

import TicketCommentAttachments from "../attachments/TicketCommentAttachments";
import TicketDate from "../shared/TicketDate";
import { ticketActivityHref } from "../shared/ticketNavigation";
import sharedStyles from "../../styles/tickets.module.css";
import styles from "../../styles/ticketDetails.module.css";

interface TicketCommentsProps {
  ticketId: number;
  commentsUpdated: boolean;
}

export default function TicketComments({
  ticketId,
  commentsUpdated,
}: TicketCommentsProps) {
  const t = useTranslations("Tickets.CommentsPanel");

  const [ticketComments, setTicketComments] = useState<TicketCommentResponse[]>(
    [],
  );

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const fetchTicketComments = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getAllTicketsCommentsById(ticketId, {
        page: 0,
        size: 5,
        sort: DEFAULT_TICKET_COMMENTS_SORT,
      });

      setTicketComments(response.content);
    } catch (error) {
      logger.error("Failed to load ticket comments", error, {
        component: "TicketComments",
        action: "fetchTicketComments",
        ticketId,
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [ticketId, t]);

  useEffect(() => {
    const loadTicketComments = async () => {
      await fetchTicketComments();
    };

    loadTicketComments();
  }, [fetchTicketComments, commentsUpdated]);

  return (
    <Paper component="section" variant="outlined" className={styles.panel}>
      <h2 className={styles.panelTitle}>
        <ChatBubbleOutlineRounded aria-hidden="true" />
        {t("title")}
      </h2>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {loading ? (
        <div className={styles.panelLoading}>
          <PageLoading />
        </div>
      ) : ticketComments.length === 0 ? (
        <p className={styles.emptyState}>{t("empty")}</p>
      ) : (
        <div className={styles.activityList}>
          {ticketComments.map((ticketComment) => (
            <article className={styles.activityItem} key={ticketComment.idComment}>
              <div className={styles.activityMeta}>
                <h3>{ticketComment.user.username}</h3>
                <TicketDate value={ticketComment.createdAt} />
              </div>
              <p className={styles.activityText}>{ticketComment.comment}</p>
              <TicketCommentAttachments ticketId={ticketId} commentId={ticketComment.idComment} />
            </article>
          ))}
        </div>
      )}

      {ticketComments.length > 0 && (
        <Button
          component={Link}
          href={ticketActivityHref(ticketId, "comments")}
          variant="outlined"
          endIcon={<ArrowForwardRounded />}
          className={sharedStyles.secondaryButton}
        >
          {t("viewAll")}
        </Button>
      )}
    </Paper>
  );
}
