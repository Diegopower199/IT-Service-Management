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

import type { PriorityResponse } from "@/types/priorityTypes";

import { getAllActivePriorities } from "@/app/modules/priorities/services/priorityService";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";
import { formatEnumName, getPriorityColor } from "@/utils/ticketUiUtils";

import { changeTicketPriority } from "../../services/ticketService";

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
  const [priorities, setPriorities] = useState<PriorityResponse[]>([]);

  const [selectedPriorityId, setSelectedPriorityId] = useState("");

  const [saving, setSaving] = useState(false);

  const [priorityError, setPriorityError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadPriorities = async () => {
      try {
        setErrorMessage("");

        const response = await getAllActivePriorities();

        setPriorities(response);
      } catch (error) {
        logger.error("Failed to load priorities", error, {
          component: "ChangeTicketPriorityDialog",
          action: "loadPriorities",
          ticketId,
        });

        const apiError = getApiError(error);

        setErrorMessage(apiError?.message ?? "Error loading priorities.");
      }
    };

    loadPriorities();
  }, []);

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

      setErrorMessage(apiError?.message ?? "Error changing ticket priority.");
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
          Change Ticket Priority
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
          Update the priority for ticket #{ticketId}.
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
              Current priority
            </Typography>

            <Chip
              label={formatEnumName(currentPriority.name)}
              color={getPriorityColor(currentPriority.name)}
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
              Select new priority
            </Typography>

            <FormControl fullWidth error={Boolean(priorityError)}>
              <InputLabel>Priority</InputLabel>

              <Select
                value={selectedPriorityId || String(currentPriority.idPriority)}
                label="Priority"
                onChange={handlePriorityChange}
                disabled={saving}
                sx={{
                  borderRadius: 2,
                }}
              >
                {priorities.map((priority) => (
                  <MenuItem
                    key={priority.idPriority}
                    value={priority.idPriority}
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
                        color={getPriorityColor(priority.name)}
                        sx={{
                          width: 10,
                          height: 10,
                          "& .MuiChip-label": {
                            display: "none",
                          },
                        }}
                      />

                      <Typography variant="body2">
                        {formatEnumName(priority.name)}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>

              {priorityError && (
                <FormHelperText>{priorityError}</FormHelperText>
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
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={
            !selectedPriorityId ||
            Number(selectedPriorityId) === currentPriority.idPriority ||
            saving
          }
          sx={{
            px: 3,
            borderRadius: 2,
          }}
        >
          {saving ? "Updating..." : "Update Priority"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
