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

import type { StatusResponse } from "@/types/statusTypes";
import { USER_ROLES } from "@/types/roleTypes";

import { useAuth } from "@/hooks/useAuth";

import { getAllActiveStatuses } from "@/app/modules/statuses/services/statusService";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";
import { getStatusColor } from "@/utils/ticketUiUtils";

import { changeTicketStatus } from "../../services/ticketService";

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

  const getStatusDisplayName = (statusName: string) => {
    if (tStatuses.has(statusName)) {
      return tStatuses(statusName);
    }

    return statusName;
  };

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
              {t("currentStatus")}
            </Typography>

            <Chip
              label={getStatusDisplayName(currentStatus.name)}
              color={getStatusColor(currentStatus.name)}
              sx={{
                fontWeight: 600,
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                mb: 1,
              }}
            >
              {t("selectNewStatus")}
            </Typography>

            <FormControl fullWidth error={Boolean(statusError)}>
              <InputLabel>{t("status")}</InputLabel>

              <Select
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
                sx={{
                  borderRadius: 2,
                }}
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
                      <Chip
                        size="small"
                        color={getStatusColor(status.name)}
                        sx={{
                          width: 10,
                          height: 10,
                          "& .MuiChip-label": {
                            display: "none",
                          },
                        }}
                      />

                      <Typography variant="body2">
                        {getStatusDisplayName(status.name)}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>

              {statusError && <FormHelperText>{statusError}</FormHelperText>}
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
            !selectedStatusId ||
            Number(selectedStatusId) === currentStatus.idStatus ||
            saving
          }
          sx={{
            px: 3,
            borderRadius: 2,
          }}
        >
          {saving ? t("updating") : t("updateStatus")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
