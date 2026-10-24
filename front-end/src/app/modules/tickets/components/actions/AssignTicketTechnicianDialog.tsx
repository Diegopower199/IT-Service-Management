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

import type { UserSummaryResponse } from "@/types/userTypes";
import { assignTicketTechnician } from "../../services/ticketService";
import { getAllTechnicians } from "@/app/modules/users/services/userService";

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
  const [technicians, setTechnicians] = useState<UserSummaryResponse[]>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const response = await getAllTechnicians();

        setTechnicians(response);
      } catch (error) {
        console.error("Error loading technicians:", error);
        setErrorMessage("Error loading technicians.");
      }
    };

    loadTechnicians();
  }, []);

  const handleTechnicianChange = (event: SelectChangeEvent) => {
    setSelectedTechnicianId(event.target.value);
    setErrorMessage("");
  };

  const handleClose = () => {
    setSelectedTechnicianId("");
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
      setErrorMessage("");

      await assignTicketTechnician(ticketId, {
        assignedToId: Number(selectedTechnicianId),
      });

      onTicketUpdated();
      handleClose();
    } catch (error) {
      console.error("Error assigning technician:", error);

      setErrorMessage("Error assigning technician.");
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
          Assign Technician
        </Typography>

        <Typography
          variant="body2"
          component="p"
          color="text.secondary"
          sx={{ mt: 0.5, mb: 0 }}
        >
          Assign a technician to ticket #{ticketId}.
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
              Current technician
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
                No technician assigned
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
              Select technician
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Technician</InputLabel>

              <Select
                value={
                  selectedTechnicianId ||
                  (currentTechnician ? String(currentTechnician.idUser) : "")
                }
                label="Technician"
                onChange={handleTechnicianChange}
                sx={{
                  borderRadius: 2,
                }}
              >
                {technicians.map((technician) => (
                  <MenuItem key={technician.idUser} value={technician.idUser}>
                    {technician.username}
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
            ? "Assigning..."
            : currentTechnician
              ? "Reassign Technician"
              : "Assign Technician"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
