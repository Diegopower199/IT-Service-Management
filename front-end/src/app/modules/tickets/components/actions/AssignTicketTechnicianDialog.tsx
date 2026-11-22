"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";

import {
  Alert,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import AssignmentIndOutlined from "@mui/icons-material/AssignmentIndOutlined";

import type { UserSummaryResponse } from "@/types/userTypes";
import { USER_ROLES } from "@/types/roleTypes";

import { useAuth } from "@/hooks/useAuth";

import { getAllTechnicians } from "@/app/modules/users/services/userService";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import { assignTicketTechnician } from "../../services/ticketService";

import TicketDialog from "../shared/TicketDialog";
import sharedStyles from "../../styles/tickets.module.css";
import styles from "../../styles/ticketDetails.module.css";

interface AssignTicketTechnicianDialogProps {
  open: boolean;
  ticketId: number;
  currentTechnician: UserSummaryResponse | null;
  onClose: () => void;
  onTicketUpdated: () => void;
}

export default function AssignTicketTechnicianDialog({
  open,
  ticketId,
  currentTechnician,
  onClose,
  onTicketUpdated,
}: AssignTicketTechnicianDialogProps) {
  const { user } = useAuth();

  const t = useTranslations("Tickets.AssignTechnicianDialog");
  const selectId = useId();

  const [technicians, setTechnicians] = useState<UserSummaryResponse[]>([]);

  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");

  const [saving, setSaving] = useState(false);

  const [technicianError, setTechnicianError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchTechnicians = useCallback(async (): Promise<boolean> => {
    try {
      const response = await getAllTechnicians();

      setTechnicians(response);

      return true;
    } catch (error) {
      logger.error("Failed to load technicians", error, {
        component: "AssignTicketTechnicianDialog",
        action: "fetchTechnicians",
        ticketId,
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("loadError"));

      return false;
    }
  }, [ticketId, t]);

  useEffect(() => {
    const loadTechnicians = async () => {
      if (!user) {
        return;
      }

      if (user.role === USER_ROLES.USER) {
        return;
      }

      if (!open) {
        return;
      }

      const techniciansLoaded = await fetchTechnicians();

      if (!techniciansLoaded) {
        return;
      }
    };

    loadTechnicians();
  }, [fetchTechnicians, user, open]);

  const handleTechnicianChange = (event: SelectChangeEvent) => {
    setSelectedTechnicianId(event.target.value);

    setTechnicianError("");
    setErrorMessage("");
  };

  const handleClose = () => {
    setSelectedTechnicianId("");

    setTechnicianError("");
    setErrorMessage("");

    onClose();
  };

  const handleConfirm = async () => {
    if (
      !selectedTechnicianId ||
      Number(selectedTechnicianId) === currentTechnician?.idUser
    ) {
      return;
    }

    try {
      setSaving(true);

      setTechnicianError("");
      setErrorMessage("");

      await assignTicketTechnician(ticketId, {
        assignedToId: Number(selectedTechnicianId),
      });

      onTicketUpdated();

      handleClose();
    } catch (error) {
      const apiError = getApiError(error);

      if (apiError?.errors?.assignedToId) {
        setTechnicianError(apiError.errors.assignedToId);

        return;
      }

      logger.error("Failed to assign technician", error, {
        component: "AssignTicketTechnicianDialog",
        action: "handleConfirm",
        ticketId,
        technicianId: Number(selectedTechnicianId),
      });

      setErrorMessage(apiError?.message ?? t("assignError"));
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
      icon={<AssignmentIndOutlined />}
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
              !selectedTechnicianId ||
              Number(selectedTechnicianId) === currentTechnician?.idUser ||
              saving
            }
          >
            {saving
              ? t("assigning")
              : currentTechnician
                ? t("reassignTechnician")
                : t("assignTechnician")}
          </Button>
        </>
      }
    >
      <div className={styles.dialogFields}>
        <div className={styles.currentValue}>
          <span className={styles.fieldLabel}>
            {t("currentTechnician")}
          </span>

          {currentTechnician ? (
            <Chip
              label={currentTechnician.username}
              color="primary"
              size="small"
              className={sharedStyles.ticketBadge}
            />
          ) : (
            <span className={styles.mutedText}>{t("noTechnicianAssigned")}</span>
          )}
        </div>

        <div>
          <p className={styles.selectHeading}>
            {t("selectTechnician")}
          </p>

          <FormControl fullWidth error={Boolean(technicianError)}>
            <InputLabel id={selectId}>{t("technician")}</InputLabel>

            <Select
              labelId={selectId}
              value={
                selectedTechnicianId ||
                (currentTechnician &&
                technicians.some(
                  (technician) =>
                    technician.idUser === currentTechnician.idUser,
                )
                  ? String(currentTechnician.idUser)
                  : "")
              }
              label={t("technician")}
              onChange={handleTechnicianChange}
              disabled={saving}
            >
              {technicians.map((technician) => (
                <MenuItem
                  key={technician.idUser}
                  value={String(technician.idUser)}
                >
                  {technician.username}
                </MenuItem>
              ))}
            </Select>

            {technicianError && (
              <FormHelperText>{technicianError}</FormHelperText>
            )}
          </FormControl>
        </div>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      </div>
    </TicketDialog>
  );
}
