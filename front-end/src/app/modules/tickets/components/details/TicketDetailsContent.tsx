"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Alert, Button } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";

import PageLoading from "@/components/ui/PageLoading";
import type { TicketResponse } from "@/types/ticketTypes";
import type { UserRole } from "@/types/roleTypes";
import { getApiError } from "@/utils/apiErrorUtils";
import { FORM_MODES } from "@/utils/constans";
import { logger } from "@/utils/logger";

import { getTicketById } from "../../services/ticketService";
import TicketForm from "../form/TicketForm";
import TicketDetails from "./TicketDetails";
import styles from "../../styles/tickets.module.css";

interface TicketDetailsContentProps {
  ticketId: number;
  userRole: UserRole;
  onClose: () => void;
  onUpdated: () => void;
}

export default function TicketDetailsContent({
  ticketId,
  userRole,
  onClose,
  onUpdated,
}: TicketDetailsContentProps) {
  const t = useTranslations("Tickets.Details");
  const tContent = useTranslations("Tickets.Content");
  const [ticket, setTicket] = useState<TicketResponse | null>(null);
  const [loadError, setLoadError] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let active = true;

    const loadTicket = async () => {
      try {
        const response = await getTicketById(ticketId);
        if (active) {
          setTicket(response);
          setLoadError("");
        }
      } catch (error) {
        if (active) {
          logger.error("Failed to load ticket details", error, {
            component: "TicketDetailsContent",
            ticketId,
          });
          setLoadError(getApiError(error)?.message ?? t("loadError"));
        }
      }
    };

    void loadTicket();

    return () => {
      active = false;
    };
  }, [ticketId, t]);

  const handleTicketUpdated = async () => {
    try {
      setRefreshError("");
      setTicket(await getTicketById(ticketId));
      onUpdated();
    } catch (error) {
      logger.error("Failed to refresh ticket details", error, {
        component: "TicketDetailsContent",
        ticketId,
      });
      setRefreshError(getApiError(error)?.message ?? tContent("detailsUpdateError"));
    }
  };

  if (loadError) {
    return (
      <div className={styles.page}>
        <div>
          <Button
            variant="outlined"
            startIcon={<ArrowBackRounded />}
            className={styles.secondaryButton}
            onClick={onClose}
          >
            {t("backToTickets")}
          </Button>
        </div>
        <Alert severity="error">{loadError}</Alert>
      </div>
    );
  }

  if (!ticket) {
    return <PageLoading />;
  }

  if (editing) {
    return (
      <TicketForm
        formMode={FORM_MODES.EDIT}
        selectedTicket={ticket}
        onClose={onClose}
        onCancel={() => setEditing(false)}
        onSubmitSuccess={onUpdated}
      />
    );
  }

  return (
    <>
      {refreshError && <Alert severity="error" sx={{ mb: 2 }}>{refreshError}</Alert>}
      <TicketDetails
        ticket={ticket}
        userRole={userRole}
        onClose={onClose}
        onEdit={() => {
          setRefreshError("");
          setEditing(true);
        }}
        onTicketUpdated={handleTicketUpdated}
      />
    </>
  );
}
