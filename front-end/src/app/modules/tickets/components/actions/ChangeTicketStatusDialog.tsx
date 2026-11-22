"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";

import {
  Alert,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import SwapHorizRounded from "@mui/icons-material/SwapHorizRounded";

import type { StatusResponse } from "@/types/statusTypes";
import { USER_ROLES } from "@/types/roleTypes";

import { useAuth } from "@/hooks/useAuth";

import { getAllActiveStatuses } from "@/app/modules/statuses/services/statusService";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";
import TicketClassificationChip from "@/components/ui/TicketClassificationChip";
import { getClassificationLabel } from "@/utils/ticketUiUtils";

import { changeTicketStatus } from "../../services/ticketService";

import TicketDialog from "../shared/TicketDialog";
import sharedStyles from "../../styles/tickets.module.css";
import styles from "../../styles/ticketDetails.module.css";

interface ChangeTicketStatusDialogProps {
  open: boolean;
  ticketId: number;
  currentStatus: StatusResponse;
  onClose: () => void;
  onTicketUpdated: () => void;
}

export default function ChangeTicketStatusDialog({
  open,
  ticketId,
  currentStatus,
  onClose,
  onTicketUpdated,
}: ChangeTicketStatusDialogProps) {
  const { user } = useAuth();

  const t = useTranslations("Tickets.ChangeStatusDialog");
  const selectId = useId();
  const tStatuses = useTranslations("Common.Statuses");

  const [statuses, setStatuses] = useState<StatusResponse[]>([]);

  const [selectedStatusId, setSelectedStatusId] = useState("");

  const [saving, setSaving] = useState(false);

  const [statusError, setStatusError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchStatuses = useCallback(async (): Promise<boolean> => {
    try {
      const response = await getAllActiveStatuses();

      setStatuses(response);

      return true;
    } catch (error) {
      logger.error("Failed to load statuses", error, {
        component: "ChangeTicketStatusDialog",
        action: "fetchStatuses",
        ticketId,
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("loadError"));

      return false;
    }
  }, [ticketId, t]);

  useEffect(() => {
    const loadStatuses = async () => {
      if (!user) {
        return;
      }

      if (user.role === USER_ROLES.USER) {
        return;
      }

      if (!open) {
        return;
      }

      const statusesLoaded = await fetchStatuses();

      if (!statusesLoaded) {
        return;
      }
    };

    loadStatuses();
  }, [fetchStatuses, user, open]);

  const handleStatusChange = (event: SelectChangeEvent) => {
    setSelectedStatusId(event.target.value);

    setStatusError("");
    setErrorMessage("");
  };

  const handleClose = () => {
    setSelectedStatusId("");

    setStatusError("");
    setErrorMessage("");

    onClose();
  };

  const handleConfirm = async () => {
    if (
      !selectedStatusId ||
      Number(selectedStatusId) === currentStatus.idStatus
    ) {
      return;
    }

    try {
      setSaving(true);

      setStatusError("");
      setErrorMessage("");

      await changeTicketStatus(ticketId, {
        statusId: Number(selectedStatusId),
      });

      onTicketUpdated();

      handleClose();
    } catch (error) {
      const apiError = getApiError(error);

      if (apiError?.errors?.statusId) {
        setStatusError(apiError.errors.statusId);

        return;
      }

      logger.error("Failed to change ticket status", error, {
        component: "ChangeTicketStatusDialog",
        action: "handleConfirm",
        ticketId,
        statusId: Number(selectedStatusId),
      });

      setErrorMessage(apiError?.message ?? t("updateError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <TicketDialog
      open={open}
      onClose={handleClose}
      title={t("title")}
      description={t("subtitle", { ticketId })}
      icon={<SwapHorizRounded />}
      actions={
        <>
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={saving}
            className={sharedStyles.secondaryButton}
          >
            {t("cancel")}
          </Button>

          <Button
            variant="contained"
            disableElevation
            className={sharedStyles.primaryButton}
            onClick={handleConfirm}
            disabled={
              !selectedStatusId ||
              Number(selectedStatusId) === currentStatus.idStatus ||
              saving
            }
          >
            {saving ? t("updating") : t("updateStatus")}
          </Button>
        </>
      }
    >
      <div className={styles.dialogFields}>
        <div className={styles.currentValue}>
          <span className={styles.fieldLabel}>
            {t("currentStatus")}
          </span>

          <TicketClassificationChip kind="status" name={currentStatus.name} className={sharedStyles.ticketBadge} />
        </div>

        <div>
          <p className={styles.selectHeading}>
            {t("selectNewStatus")}
          </p>

          <FormControl fullWidth error={Boolean(statusError)}>
            <InputLabel id={selectId}>{t("status")}</InputLabel>

            <Select
              labelId={selectId}
              value={
                selectedStatusId ||
                (statuses.some(
                  (status) => status.idStatus === currentStatus.idStatus,
                )
                  ? String(currentStatus.idStatus)
                  : "")
              }
              label={t("status")}
              onChange={handleStatusChange}
              disabled={saving}
            >
              {statuses.map((status) => (
                <MenuItem
                  key={status.idStatus}
                  value={String(status.idStatus)}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: "center",
                    }}
                  >
                    <TicketClassificationChip kind="status" name={status.name} dot />

                    <Typography variant="body2">
                      {getClassificationLabel(status.name, tStatuses)}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>

            {statusError && <FormHelperText>{statusError}</FormHelperText>}
          </FormControl>
        </div>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      </div>
    </TicketDialog>
  );
}
