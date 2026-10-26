"use client";

import { useEffect, useState } from "react";

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

import { changeTicketStatus } from "../../services/ticketService";
import { getAllActiveStatuses } from "@/app/modules/statuses/services/statusService";

import { formatEnumName, getStatusColor } from "@/utils/ticketUiUtils";

import { getApiError } from "@/utils/apiErrorUtils";

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
  const [statuses, setStatuses] = useState<StatusResponse[]>([]);

  const [selectedStatusId, setSelectedStatusId] = useState("");

  const [saving, setSaving] = useState(false);

  const [statusError, setStatusError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        setErrorMessage("");

        const response = await getAllActiveStatuses();

        setStatuses(response);
      } catch (error) {
        console.error("Error loading statuses:", error);

        const apiError = getApiError(error);

        setErrorMessage(apiError?.message ?? "Error loading statuses.");
      }
    };

    loadStatuses();
  }, []);

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
      console.error("Error changing ticket status:", error);

      const apiError = getApiError(error);

      if (apiError?.errors?.statusId) {
        setStatusError(apiError.errors.statusId);

        return;
      }

      setErrorMessage(apiError?.message ?? "Error changing ticket status.");
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
          Change Ticket Status
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
          Update the workflow status for ticket #{ticketId}.
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
              Current status
            </Typography>

            <Chip
              label={formatEnumName(currentStatus.name)}
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
              Select new status
            </Typography>

            <FormControl fullWidth error={Boolean(statusError)}>
              <InputLabel>Status</InputLabel>

              <Select
                value={selectedStatusId || String(currentStatus.idStatus)}
                label="Status"
                onChange={handleStatusChange}
                disabled={saving}
                sx={{
                  borderRadius: 2,
                }}
              >
                {statuses.map((status) => (
                  <MenuItem key={status.idStatus} value={status.idStatus}>
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
                        {formatEnumName(status.name)}
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
          Cancel
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
          {saving ? "Updating..." : "Update Status"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
