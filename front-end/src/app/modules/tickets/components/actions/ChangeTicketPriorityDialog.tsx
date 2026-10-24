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
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";

import type { PriorityResponse } from "@/types/priorityTypes";
import { getAllPrioritiesActives } from "../../services/priorityService";
import { changeTicketPriority } from "../../services/ticketService";
import { formatEnumName, getPriorityColor } from "@/utils/ticketUiUtils";

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
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadPriorities = async () => {
      try {
        const response = await getAllPrioritiesActives();

        setPriorities(response);
      } catch (error) {
        console.error("Error loading priorities:", error);
      }
    };

    loadPriorities();
  }, []);

  const handlePriorityChange = (event: SelectChangeEvent) => {
    setSelectedPriorityId(event.target.value);
    setErrorMessage("");
  };

  const handleClose = () => {
    setSelectedPriorityId("");
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
      setErrorMessage("");

      await changeTicketPriority(ticketId, {
        priorityId: Number(selectedPriorityId),
      });

      onTicketUpdated();
      handleClose();
    } catch (error) {
      console.error("Error changing ticket priority:", error);

      setErrorMessage("Error changing ticket priority.");
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
      <DialogTitle component="div" sx={{ px: 3, pt: 3, pb: 2 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Change Ticket Priority
        </Typography>

        <Typography
          variant="body2"
          component="p"
          color="text.secondary"
          sx={{ mt: 0.5, mb: 0 }}
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

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>

              <Select
                value={selectedPriorityId || String(currentPriority.idPriority)}
                label="Priority"
                onChange={handlePriorityChange}
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
