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
import { FORM_MODES, type FormMode } from "@/utils/constans";
import type { CategoryResponse } from "@/types/categoryTypes";
import type { PriorityResponse } from "@/types/priorityTypes";
import type { UserSummaryResponse } from "@/types/userTypes";

import { getAllPriorities } from "../../priorities/services/priorityService";
import { getAllCategories } from "../../categories/services/categoryService";
import { getUserOptions } from "../../users/services/userService";
import { createTicket, updateTicket } from "../services/ticketService";

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
  if (formMode === FORM_MODES.EDIT && selectedTicket) {
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

  const [categoriesOptions, setCategoriesOptions] = useState<
    CategoryResponse[]
  >([]);

  const [prioritiesOptions, setPrioritiesOptions] = useState<
    PriorityResponse[]
  >([]);

  const [usersOptions, setUsersOptions] = useState<UserSummaryResponse[]>([]);

  const [loading, setLoading] = useState(false);

  const [requiredFieldsIncomplete, setRequiredFieldsIncomplete] = useState<
    Partial<Record<keyof TicketFormData, string>>
  >({});

  const [errorMessage, setErrorMessage] = useState("");

  const fetchCategoriesOptions = async (): Promise<boolean> => {
    try {
      const categoriesResponse = await getAllCategories();

      setCategoriesOptions(categoriesResponse);

      return true;
    } catch (error) {
      console.error("Error loading categories:", error);
      setErrorMessage("Error loading categories.");

      return false;
    }
  };

  const fetchPrioritiesOptions = async (): Promise<boolean> => {
    try {
      const prioritiesResponse = await getAllPriorities();

      setPrioritiesOptions(prioritiesResponse);

      return true;
    } catch (error) {
      console.error("Error loading priorities:", error);
      setErrorMessage("Error loading priorities.");

      return false;
    }
  };

  const fetchUsersOptions = async (): Promise<boolean> => {
    try {
      const usersResponse = await getUserOptions();

      setUsersOptions(usersResponse);

      return true;
    } catch (error) {
      console.error("Error loading users:", error);
      setErrorMessage("Error loading users.");

      return false;
    }
  };

  useEffect(() => {
    const fetchFormOptions = async () => {
      const categoriesLoaded = await fetchCategoriesOptions();

      if (!categoriesLoaded) {
        return;
      }

      if (formMode === FORM_MODES.CREATE) {
        const prioritiesLoaded = await fetchPrioritiesOptions();

        if (!prioritiesLoaded) {
          return;
        }

        const usersLoaded = await fetchUsersOptions();

        if (!usersLoaded) {
          return;
        }
      }
    };

    fetchFormOptions();
  }, [formMode]);

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

    setRequiredFieldsIncomplete((previousErrors) => ({
      ...previousErrors,
      [name]: undefined,
    }));
  };

  const validateRequiredFields = () => {
    const errorMissingFields: Partial<Record<keyof TicketFormData, string>> =
      {};

    if (!formData.title.trim()) {
      errorMissingFields.title = "Please enter a title.";
    }

    if (!formData.description.trim()) {
      errorMissingFields.description = "Please enter a description.";
    }

    if (!formData.categoryId) {
      errorMissingFields.categoryId = "Please select a category.";
    }

    if (formMode === FORM_MODES.CREATE) {
      if (!formData.requestedForId) {
        errorMissingFields.requestedForId = "Please select a requested user.";
      }

      if (!formData.priorityId) {
        errorMissingFields.priorityId = "Please select a priority.";
      }
    }

    setRequiredFieldsIncomplete(errorMissingFields);

    return Object.keys(errorMissingFields).length !== 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredFieldsError = validateRequiredFields();

    if (requiredFieldsError) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      if (formMode === FORM_MODES.CREATE) {
        await createTicket({
          title: formData.title,
          description: formData.description,
          requestedForId: formData.requestedForId,
          categoryId: formData.categoryId,
          priorityId: formData.priorityId,
        });
      }

      if (formMode === FORM_MODES.EDIT && selectedTicket) {
        await updateTicket(selectedTicket.idTicket, {
          title: formData.title,
          description: formData.description,
          categoryId: formData.categoryId,
        });
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

    return "Edit Ticket";
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
          error={Boolean(requiredFieldsIncomplete.title)}
          helperText={requiredFieldsIncomplete.title}
          fullWidth
        />

        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.description)}
          helperText={requiredFieldsIncomplete.description}
          multiline
          minRows={4}
          fullWidth
        />

        {formMode === FORM_MODES.CREATE && (
          <TextField
            select
            label="Requested For"
            name="requestedForId"
            value={
              usersOptions.some(
                (user) => user.idUser === formData.requestedForId,
              )
                ? formData.requestedForId
                : 0
            }
            onChange={handleFormChange}
            error={Boolean(requiredFieldsIncomplete.requestedForId)}
            helperText={requiredFieldsIncomplete.requestedForId}
            fullWidth
          >
            <MenuItem value={0} disabled>
              Select a user
            </MenuItem>

            {usersOptions.length === 0 ? (
              <MenuItem disabled>No users available</MenuItem>
            ) : (
              usersOptions.map((user) => (
                <MenuItem key={user.idUser} value={user.idUser}>
                  {user.username}
                </MenuItem>
              ))
            )}
          </TextField>
        )}

        <TextField
          select
          label="Category"
          name="categoryId"
          value={
            categoriesOptions.some(
              (category) => category.idCategory === formData.categoryId,
            )
              ? formData.categoryId
              : 0
          }
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.categoryId)}
          helperText={requiredFieldsIncomplete.categoryId}
          fullWidth
        >
          <MenuItem value={0} disabled>
            Select a category
          </MenuItem>

          {categoriesOptions.length === 0 ? (
            <MenuItem disabled>No categories available</MenuItem>
          ) : (
            categoriesOptions.map((category) => (
              <MenuItem key={category.idCategory} value={category.idCategory}>
                {category.name}
              </MenuItem>
            ))
          )}
        </TextField>

        {formMode === FORM_MODES.CREATE && (
          <TextField
            select
            label="Priority"
            name="priorityId"
            value={
              prioritiesOptions.some(
                (priority) => priority.idPriority === formData.priorityId,
              )
                ? formData.priorityId
                : 0
            }
            onChange={handleFormChange}
            error={Boolean(requiredFieldsIncomplete.priorityId)}
            helperText={requiredFieldsIncomplete.priorityId}
            fullWidth
          >
            <MenuItem value={0} disabled>
              Select a priority
            </MenuItem>

            {prioritiesOptions.length === 0 ? (
              <MenuItem disabled>No priorities available</MenuItem>
            ) : (
              prioritiesOptions.map((priority) => (
                <MenuItem key={priority.idPriority} value={priority.idPriority}>
                  {priority.name}
                </MenuItem>
              ))
            )}
          </TextField>
        )}

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Stack spacing={3} direction="row">
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button type="submit" variant="contained" disabled={loading}>
            {loading
              ? "Saving..."
              : formMode === FORM_MODES.CREATE
                ? "Create Ticket"
                : "Save Changes"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
