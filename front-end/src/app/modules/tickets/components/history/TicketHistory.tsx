"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Alert, Button, Paper } from "@mui/material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";

import PageLoading from "@/components/ui/PageLoading";

import type { TicketHistoryResponse } from "@/types/ticketHistoryTypes";

import { DEFAULT_TICKET_HISTORY_SORT } from "@/utils/constans";
import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import { getAllTicketHistoryById } from "../../services/ticketHistoryService";

import TicketDate from "../shared/TicketDate";
import { ticketActivityHref } from "../shared/ticketNavigation";
import sharedStyles from "../../styles/tickets.module.css";
import styles from "../../styles/ticketDetails.module.css";

interface TicketHistoryProps {
  ticketId: number;
  historyUpdated: boolean;
}

export default function TicketHistory({
  ticketId,
  historyUpdated,
}: TicketHistoryProps) {
  const t = useTranslations("Tickets.HistoryPanel");

  const [ticketHistory, setTicketHistory] = useState<TicketHistoryResponse[]>(
    [],
  );

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const fetchTicketHistory = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAllTicketHistoryById(ticketId, {
        page: 0,
        size: 5,
        sort: DEFAULT_TICKET_HISTORY_SORT,
      });

      setTicketHistory(response.content);
      setErrorMessage("");
    } catch (error) {
      logger.error("Failed to load ticket history", error, {
        component: "TicketHistory",
        action: "fetchTicketHistory",
        ticketId,
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [ticketId, t]);

  useEffect(() => {
    const loadTicketHistory = async () => {
      await fetchTicketHistory();
    };

    loadTicketHistory();
  }, [fetchTicketHistory, historyUpdated]);

  return (
    <Paper component="section" variant="outlined" className={styles.panel}>
      <h2 className={styles.panelTitle}>
        <HistoryRounded aria-hidden="true" />
        {t("title")}
      </h2>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {loading ? (
        <div className={styles.panelLoading}>
          <PageLoading />
        </div>
      ) : ticketHistory.length === 0 ? (
        <p className={styles.emptyState}>{t("empty")}</p>
      ) : (
        <div className={styles.activityList}>
          {ticketHistory.map((history) => (
            <article className={styles.activityItem} key={history.idHistory}>
              <div className={styles.activityMeta}>
                <h3>{history.action}</h3>
                <span>
                  {history.user.username} · <TicketDate value={history.createdAt} />
                </span>
              </div>

              {history.fieldName && (
                <p className={styles.activityText}>
                  {t("field")}: {history.fieldName}
                </p>
              )}

              {(history.oldValue || history.newValue) && (
                <div className={styles.historyValues}>
                  <span>{history.oldValue ?? "-"}</span>
                  <span aria-hidden="true">→</span>
                  <span>{history.newValue ?? "-"}</span>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {ticketHistory.length > 0 && (
        <Button
          component={Link}
          href={ticketActivityHref(ticketId, "history")}
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
