"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";

import type { UserSummaryResponse } from "@/types/userTypes";
import { USER_ROLES } from "@/types/roleTypes";

import { useAuth } from "@/hooks/useAuth";

import { getAllTechnicians } from "@/app/modules/users/services/userService";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import { assignTicketTechnician } from "../../services/ticketService";

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
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          px: 3,
          pt: 3,
          pb: 2,
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 600,
          }}
        >
          {t("title")}
        </Typography>

        <Typography
          variant="body2"
          component="p"
          color="text.secondary"
          sx={{
            mt: 0.5,
            mb: 0,
          }}
        >
          {t("subtitle", { ticketId })}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "action.hover",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mb: 1,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {t("currentTechnician")}
            </Typography>

            {currentTechnician ? (
              <Chip
                label={currentTechnician.username}
                color="primary"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t("noTechnicianAssigned")}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                mb: 1,
              }}
            >
              {t("selectTechnician")}
            </Typography>

            <FormControl fullWidth error={Boolean(technicianError)}>
              <InputLabel>{t("technician")}</InputLabel>

              <Select
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
                sx={{
                  borderRadius: 2,
                }}
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
          </Box>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          bgcolor: "action.hover",
        }}
      >
        <Button onClick={handleClose} disabled={saving} color="inherit">
          {t("cancel")}
        </Button>

        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={
            !selectedTechnicianId ||
            Number(selectedTechnicianId) === currentTechnician?.idUser ||
            saving
          }
          sx={{
            px: 3,
            borderRadius: 2,
          }}
        >
          {saving
            ? t("assigning")
            : currentTechnician
              ? t("reassignTechnician")
              : t("assignTechnician")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
