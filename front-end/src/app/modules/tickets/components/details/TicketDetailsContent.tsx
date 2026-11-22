"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Alert } from "@mui/material";

import PageLoading from "@/components/ui/PageLoading";
import { useAuth } from "@/hooks/useAuth";
import type { TicketResponse } from "@/types/ticketTypes";
import { getApiError } from "@/utils/apiErrorUtils";
import { FORM_MODES } from "@/utils/constans";
import { logger } from "@/utils/logger";

import { getTicketById } from "../../services/ticketService";
import TicketForm from "../form/TicketForm";
import TicketRouteError, { getTicketAccessError } from "../shared/TicketRouteError";
import { restoreTicketListHref } from "../shared/ticketNavigation";
import TicketDetails from "./TicketDetails";

interface TicketDetailsContentProps {
  ticketId: number;
}

export default function TicketDetailsContent({ ticketId }: TicketDetailsContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations("Tickets.Details");
  const tContent = useTranslations("Tickets.Content");
  const [ticket, setTicket] = useState<TicketResponse | null>(null);
  const [loadError, setLoadError] = useState("");
  const [accessError, setAccessError] = useState<ReturnType<typeof getTicketAccessError>>(null);
  const [refreshError, setRefreshError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const loadTicket = async () => {
      try {
        const response = await getTicketById(ticketId);
        if (active) {
          setTicket(response);
          setLoadError("");
          setAccessError(null);
        }
      } catch (error) {
        if (active) {
          logger.error("Failed to load ticket details", error, {
            component: "TicketDetailsContent",
            ticketId,
          });
          const kind = getTicketAccessError(error);
          setTicket(null);
          setAccessError(kind);
          setLoadError(kind ? "" : getApiError(error)?.message ?? t("loadError"));
        }
      }
    };

    void loadTicket();

    return () => {
      active = false;
    };
  }, [ticketId, t, user]);

  const handleClose = () => {
    router.replace(user ? restoreTicketListHref(user, ticketId) : "/tickets");
  };

  const handleTicketUpdated = async () => {
    try {
      setRefreshError("");
      setTicket(await getTicketById(ticketId));
    } catch (error) {
      logger.error("Failed to refresh ticket details", error, {
        component: "TicketDetailsContent",
        ticketId,
      });
      const kind = getTicketAccessError(error);
      if (kind) {
        setTicket(null);
        setAccessError(kind);
      } else {
        setRefreshError(getApiError(error)?.message ?? tContent("detailsUpdateError"));
      }
    }
  };

  if (accessError || loadError) {
    return <TicketRouteError kind={accessError ?? undefined} message={loadError} ticketId={ticketId} />;
  }

  if (!ticket || !user) {
    return <PageLoading />;
  }

  if (editing) {
    return (
      <TicketForm
        formMode={FORM_MODES.EDIT}
        selectedTicket={ticket}
        onClose={handleClose}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <>
      {refreshError && <Alert severity="error" sx={{ mb: 2 }}>{refreshError}</Alert>}
      <TicketDetails
        ticket={ticket}
        userRole={user.role}
        onClose={handleClose}
        onEdit={() => {
          setRefreshError("");
          setEditing(true);
        }}
        onTicketUpdated={handleTicketUpdated}
      />
    </>
  );
}
