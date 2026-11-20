"use client";

import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Alert, Button } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";

import { useAuth } from "@/hooks/useAuth";

import { restoreTicketListHref } from "./ticketNavigation";
import styles from "../../styles/tickets.module.css";

export function getTicketAccessError(error: unknown): "denied" | "notFound" | null {
  if (!isAxiosError(error)) return null;
  if (error.response?.status === 403) return "denied";
  if (error.response?.status === 404) return "notFound";
  return null;
}

interface TicketRouteErrorProps {
  kind?: "invalidId" | NonNullable<ReturnType<typeof getTicketAccessError>>;
  message?: string;
  ticketId?: number;
}

export default function TicketRouteError({ kind, message, ticketId }: TicketRouteErrorProps) {
  const t = useTranslations("Tickets.Details");
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <div>
        <Button
          variant="outlined"
          startIcon={<ArrowBackRounded />}
          className={styles.secondaryButton}
          onClick={() => router.replace(user && ticketId ? restoreTicketListHref(user, ticketId) : "/tickets")}
        >
          {t("backToTickets")}
        </Button>
      </div>
      <Alert severity="error">{kind ? t(kind) : message}</Alert>
    </div>
  );
}
