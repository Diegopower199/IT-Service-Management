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
import FlagOutlined from "@mui/icons-material/FlagOutlined";

import type { PriorityResponse } from "@/types/priorityTypes";
import { USER_ROLES } from "@/types/roleTypes";

import { useAuth } from "@/hooks/useAuth";

import { getAllActivePriorities } from "@/app/modules/priorities/services/priorityService";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";
import TicketClassificationChip from "@/components/ui/TicketClassificationChip";
import { getClassificationLabel } from "@/utils/ticketUiUtils";

import { changeTicketPriority } from "../../services/ticketService";

import TicketDialog from "../shared/TicketDialog";
import sharedStyles from "../../styles/tickets.module.css";
import styles from "../../styles/ticketDetails.module.css";

interface ChangeTicketPriorityDialogProps {
  open: boolean;
  ticketId: number;
  currentPriority: PriorityResponse;
  onClose: () => void;
  onTicketUpdated: () => void;
}

export default function ChangeTicketPriorityDialog({
  open,
  ticketId,
  currentPriority,
  onClose,
  onTicketUpdated,
}: ChangeTicketPriorityDialogProps) {
  const { user } = useAuth();

  const t = useTranslations("Tickets.ChangePriorityDialog");
  const selectId = useId();
  const tPriorities = useTranslations("Common.Priorities");

  const [priorities, setPriorities] = useState<PriorityResponse[]>([]);

  const [selectedPriorityId, setSelectedPriorityId] = useState("");

  const [saving, setSaving] = useState(false);

  const [priorityError, setPriorityError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchPriorities = useCallback(async (): Promise<boolean> => {
    try {
      const response = await getAllActivePriorities();

      setPriorities(response);

      return true;
    } catch (error) {
      logger.error("Failed to load priorities", error, {
        component: "ChangeTicketPriorityDialog",
        action: "fetchPriorities",
        ticketId,
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("loadError"));

      return false;
    }
  }, [ticketId, t]);

  useEffect(() => {
    const loadPriorities = async () => {
      if (!user) {
        return;
      }

      if (user.role === USER_ROLES.USER) {
        return;
      }

      if (!open) {
        return;
      }

      const prioritiesLoaded = await fetchPriorities();

      if (!prioritiesLoaded) {
        return;
      }
    };

    loadPriorities();
  }, [fetchPriorities, user, open]);

  const handlePriorityChange = (event: SelectChangeEvent) => {
    setSelectedPriorityId(event.target.value);

    setPriorityError("");
    setErrorMessage("");
  };

  const handleClose = () => {
    setSelectedPriorityId("");

    setPriorityError("");
    setErrorMessage("");

    onClose();
  };

  const handleConfirm = async () => {
    if (
      !selectedPriorityId ||
      Number(selectedPriorityId) === currentPriority.idPriority
    ) {
      return;
    }

    try {
      setSaving(true);

      setPriorityError("");
      setErrorMessage("");

      await changeTicketPriority(ticketId, {
        priorityId: Number(selectedPriorityId),
      });

      onTicketUpdated();

      handleClose();
    } catch (error) {
      const apiError = getApiError(error);

      if (apiError?.errors?.priorityId) {
        setPriorityError(apiError.errors.priorityId);

        return;
      }

      logger.error("Failed to change ticket priority", error, {
        component: "ChangeTicketPriorityDialog",
        action: "handleConfirm",
        ticketId,
        priorityId: Number(selectedPriorityId),
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
      icon={<FlagOutlined />}
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
              !selectedPriorityId ||
              Number(selectedPriorityId) === currentPriority.idPriority ||
              saving
            }
          >
            {saving ? t("updating") : t("updatePriority")}
          </Button>
        </>
      }
    >
      <div className={styles.dialogFields}>
        <div className={styles.currentValue}>
          <span className={styles.fieldLabel}>
            {t("currentPriority")}
          </span>

          <TicketClassificationChip kind="priority" name={currentPriority.name} className={sharedStyles.ticketBadge} />
        </div>

        <div>
          <p className={styles.selectHeading}>
            {t("selectNewPriority")}
          </p>

          <FormControl fullWidth error={Boolean(priorityError)}>
            <InputLabel id={selectId}>{t("priority")}</InputLabel>

            <Select
              labelId={selectId}
              value={
                selectedPriorityId ||
                (priorities.some(
                  (priority) =>
                    priority.idPriority === currentPriority.idPriority,
                )
                  ? String(currentPriority.idPriority)
                  : "")
              }
              label={t("priority")}
              onChange={handlePriorityChange}
              disabled={saving}
            >
              {priorities.map((priority) => (
                <MenuItem
                  key={priority.idPriority}
                  value={String(priority.idPriority)}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: "center",
                    }}
                  >
                    <TicketClassificationChip kind="priority" name={priority.name} dot />

                    <Typography variant="body2">
                      {getClassificationLabel(priority.name, tPriorities)}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>

            {priorityError && (
              <FormHelperText>{priorityError}</FormHelperText>
            )}
          </FormControl>
        </div>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      </div>
    </TicketDialog>
  );
}
