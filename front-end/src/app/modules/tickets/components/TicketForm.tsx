"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import type { TicketResponse } from "@/types/ticketTypes";
import { FORM_MODES, FormMode } from "@/utils/constans";

//import { createTicket, updateTicket } from "../services/ticketService";

interface TicketFormProps {
  formMode: FormMode;
  selectedTicket: TicketResponse | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

interface TicketFormData {
  title: string;
  description: string;
  requestedForId: number;
  categoryId: number;
  priorityId: number;
}

const INITIAL_FORM_DATA: TicketFormData = {
  title: "",
  description: "",
  requestedForId: 0,
  categoryId: 0,
  priorityId: 0,
};

const getInitialFormData = (
  formMode: FormMode,
  selectedTicket: TicketResponse | null,
): TicketFormData => {
  if (
    (formMode === FORM_MODES.EDIT || formMode === FORM_MODES.VIEW) &&
    selectedTicket
  ) {
    return {
      title: selectedTicket.title,
      description: selectedTicket.description ?? "",
      requestedForId: selectedTicket.requestedFor.idUser,
      categoryId: selectedTicket.category.idCategory,
      priorityId: selectedTicket.priority.idPriority,
    };
  }

  return { ...INITIAL_FORM_DATA };
};

export default function TicketForm({
  formMode,
  selectedTicket,
  onClose,
  onSubmitSuccess,
}: TicketFormProps) {
  const [formData, setFormData] = useState<TicketFormData>(
    getInitialFormData(formMode, selectedTicket),
  );

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]:
        name === "requestedForId" ||
        name === "categoryId" ||
        name === "priorityId"
          ? Number(value)
          : value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setErrorMessage("Title is required.");
      return false;
    }

    if (!formData.description.trim()) {
      setErrorMessage("Description is required.");
      return false;
    }

    if (formMode === FORM_MODES.CREATE) {
      if (!formData.requestedForId) {
        setErrorMessage("Requested For is required.");
        return false;
      }

      if (!formData.categoryId) {
        setErrorMessage("Category is required.");
        return false;
      }

      if (!formData.priorityId) {
        setErrorMessage("Priority is required.");
        return false;
      }
    }

    if (formMode === FORM_MODES.EDIT && !formData.categoryId) {
      setErrorMessage("Category is required.");
      return false;
    }

    setErrorMessage("");

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      if (formMode === FORM_MODES.CREATE) {
        /*await createTicket({
          title: formData.title,
          description: formData.description,
          requestedForId: formData.requestedForId,
          categoryId: formData.categoryId,
          priorityId: formData.priorityId,
        });*/
      }

      if (formMode === FORM_MODES.EDIT && selectedTicket) {
        /*await updateTicket(ticket.idTicket, {
          title: formData.title,
          description: formData.description,
          categoryId: formData.categoryId,
        });*/
      }

      onSubmitSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving ticket:", error);

      setErrorMessage(
        formMode === FORM_MODES.CREATE
          ? "Error creating ticket."
          : "Error updating ticket.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (formMode === FORM_MODES.CREATE) {
      return "Create Ticket";
    }

    if (formMode === FORM_MODES.EDIT) {
      return "Edit Ticket";
    }

    return "Ticket Details";
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4" component="h1" gutterBottom>
        {getTitle()}
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleFormChange}
          disabled={formMode === FORM_MODES.VIEW}
          required
          fullWidth
        />

        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleFormChange}
          disabled={formMode === FORM_MODES.VIEW}
          required
          multiline
          minRows={4}
          fullWidth
        />

        {formMode === FORM_MODES.CREATE && (
          <TextField
            label="Requested For"
            name="requestedForId"
            type="number"
            value={formData.requestedForId === 0 ? "" : formData.requestedForId}
            onChange={handleFormChange}
            required
            fullWidth
          />
        )}

        <TextField
          select
          label="Category"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleFormChange}
          disabled={formMode === FORM_MODES.VIEW}
          required
          fullWidth
        >
          <MenuItem value={0} disabled>
            Select a category
          </MenuItem>

          {/* Categories will come from backend */}
        </TextField>

        {(formMode === FORM_MODES.CREATE || formMode === FORM_MODES.VIEW) && (
          <TextField
            select
            label="Priority"
            name="priorityId"
            value={formData.priorityId}
            onChange={handleFormChange}
            disabled={formMode === FORM_MODES.VIEW}
            required={formMode === FORM_MODES.CREATE}
            fullWidth
          >
            <MenuItem value={0} disabled>
              Select a priority
            </MenuItem>

            {/* Priorities will come from backend */}
          </TextField>
        )}

        {formMode === FORM_MODES.VIEW && selectedTicket && (
          <>
            <TextField
              label="Status"
              value={selectedTicket.status.name}
              disabled
              fullWidth
            />

            <TextField
              label="Created By"
              value={selectedTicket.createdBy.username}
              disabled
              fullWidth
            />

            <TextField
              label="Requested For"
              value={selectedTicket.requestedFor.username}
              disabled
              fullWidth
            />

            <TextField
              label="Assigned To"
              value={selectedTicket.assignedTo?.username ?? "Unassigned"}
              disabled
              fullWidth
            />
          </>
        )}

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Stack spacing={3} direction={"row"} >
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            {formMode === FORM_MODES.VIEW ? "Close" : "Cancel"}
          </Button>

          {formMode !== FORM_MODES.VIEW && (
            <Button type="submit" variant="contained" disabled={loading}>
              {loading
                ? "Saving..."
                : formMode === FORM_MODES.CREATE
                  ? "Create Ticket"
                  : "Save Changes"}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
