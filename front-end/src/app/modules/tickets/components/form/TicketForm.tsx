"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

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
import type { CategoryResponse } from "@/types/categoryTypes";
import type { PriorityResponse } from "@/types/priorityTypes";
import type { UserSummaryResponse } from "@/types/userTypes";

import { USER_ROLES } from "@/types/roleTypes";

import { FORM_MODES, type FormMode } from "@/utils/constans";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import { useAuth } from "@/hooks/useAuth";

import { getAllPriorities } from "../../../priorities/services/priorityService";
import { getAllCategories } from "../../../categories/services/categoryService";
import { createTicket, updateTicket } from "../../services/ticketService";
import { getUserOptions } from "../../../users/services/userService";

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
  const t = useTranslations("Tickets.Form");
  const tPriorities = useTranslations("Common.Priorities");

  const { user } = useAuth();

  const isUser = user?.role === USER_ROLES.USER;

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

  const fetchCategoriesOptions = useCallback(async (): Promise<boolean> => {
    try {
      const categoriesResponse = await getAllCategories();

      setCategoriesOptions(categoriesResponse);

      return true;
    } catch (error) {
      logger.error("Failed to load ticket categories", error, {
        component: "TicketForm",
        action: "fetchCategoriesOptions",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("categoriesLoadError"));

      return false;
    }
  }, [t]);

  const fetchPrioritiesOptions = useCallback(async (): Promise<boolean> => {
    try {
      const prioritiesResponse = await getAllPriorities();

      setPrioritiesOptions(prioritiesResponse);

      return true;
    } catch (error) {
      logger.error("Failed to load ticket priorities", error, {
        component: "TicketForm",
        action: "fetchPrioritiesOptions",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("prioritiesLoadError"));

      return false;
    }
  }, [t]);

  const fetchUsersOptions = useCallback(async (): Promise<boolean> => {
    try {
      const usersResponse = await getUserOptions();

      setUsersOptions(usersResponse);

      return true;
    } catch (error) {
      logger.error("Failed to load ticket user options", error, {
        component: "TicketForm",
        action: "fetchUsersOptions",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("usersLoadError"));

      return false;
    }
  }, [t]);

  useEffect(() => {
    const fetchFormOptions = async () => {
      if (!user) {
        return;
      }

      const categoriesLoaded = await fetchCategoriesOptions();

      if (!categoriesLoaded) {
        return;
      }

      if (formMode === FORM_MODES.CREATE) {
        const prioritiesLoaded = await fetchPrioritiesOptions();

        if (!prioritiesLoaded) {
          return;
        }

        if (!isUser) {
          const usersLoaded = await fetchUsersOptions();

          if (!usersLoaded) {
            return;
          }
        }
      }
    };

    fetchFormOptions();
  }, [
    formMode,
    user,
    isUser,
    fetchCategoriesOptions,
    fetchPrioritiesOptions,
    fetchUsersOptions,
  ]);

  const getPriorityDisplayName = (priorityName: string) => {
    if (tPriorities.has(priorityName)) {
      return tPriorities(priorityName);
    }

    return priorityName;
  };

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

    setErrorMessage("");
  };

  const validateRequiredFields = () => {
    const errorMissingFields: Partial<Record<keyof TicketFormData, string>> =
      {};

    if (!formData.title.trim()) {
      errorMissingFields.title = t("titleRequired");
    }

    if (!formData.description.trim()) {
      errorMissingFields.description = t("descriptionRequired");
    }

    if (!formData.categoryId) {
      errorMissingFields.categoryId = t("categoryRequired");
    }

    if (formMode === FORM_MODES.CREATE) {
      if (!isUser && !formData.requestedForId) {
        errorMissingFields.requestedForId = t("requestedForRequired");
      }

      if (!formData.priorityId) {
        errorMissingFields.priorityId = t("priorityRequired");
      }
    }

    setRequiredFieldsIncomplete(errorMissingFields);

    return Object.keys(errorMissingFields).length !== 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    const requiredFieldsError = validateRequiredFields();

    if (requiredFieldsError) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setRequiredFieldsIncomplete({});

      if (formMode === FORM_MODES.CREATE) {
        const requestedForId = isUser ? user.userId : formData.requestedForId;

        await createTicket({
          title: formData.title,
          description: formData.description,
          requestedForId,
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
      const apiError = getApiError(error);

      if (apiError?.errors) {
        setRequiredFieldsIncomplete({
          title: apiError.errors.title,
          description: apiError.errors.description,
          requestedForId: apiError.errors.requestedForId,
          categoryId: apiError.errors.categoryId,
          priorityId: apiError.errors.priorityId,
        });

        return;
      }

      logger.error(
        formMode === FORM_MODES.CREATE
          ? "Failed to create ticket"
          : "Failed to update ticket",
        error,
        {
          component: "TicketForm",
          action: "handleSubmit",
          formMode,
          ...(selectedTicket && {
            ticketId: selectedTicket.idTicket,
          }),
        },
      );

      setErrorMessage(
        apiError?.message ??
          (formMode === FORM_MODES.CREATE
            ? t("createError")
            : t("updateError")),
      );
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (formMode === FORM_MODES.CREATE) {
      return t("createTitle");
    }

    return t("editTitle");
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4" component="h1" gutterBottom>
        {getTitle()}
      </Typography>

      <Stack spacing={3}>
        <TextField
          label={t("title")}
          name="title"
          value={formData.title}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.title)}
          helperText={requiredFieldsIncomplete.title}
          disabled={loading}
          fullWidth
        />

        <TextField
          label={t("description")}
          name="description"
          value={formData.description}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.description)}
          helperText={requiredFieldsIncomplete.description}
          disabled={loading}
          multiline
          minRows={4}
          fullWidth
        />

        {user && formMode === FORM_MODES.CREATE && !isUser && (
          <TextField
            select
            label={t("requestedFor")}
            name="requestedForId"
            value={
              usersOptions.some(
                (userOption) => userOption.idUser === formData.requestedForId,
              )
                ? formData.requestedForId
                : 0
            }
            onChange={handleFormChange}
            error={Boolean(requiredFieldsIncomplete.requestedForId)}
            helperText={requiredFieldsIncomplete.requestedForId}
            disabled={loading}
            fullWidth
          >
            <MenuItem value={0} disabled>
              {t("selectUser")}
            </MenuItem>

            {usersOptions.length === 0 ? (
              <MenuItem disabled>{t("noUsersAvailable")}</MenuItem>
            ) : (
              usersOptions.map((userOption) => (
                <MenuItem key={userOption.idUser} value={userOption.idUser}>
                  {userOption.username}
                </MenuItem>
              ))
            )}
          </TextField>
        )}

        <TextField
          select
          label={t("category")}
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
          disabled={loading}
          fullWidth
        >
          <MenuItem value={0} disabled>
            {t("selectCategory")}
          </MenuItem>

          {categoriesOptions.length === 0 ? (
            <MenuItem disabled>{t("noCategoriesAvailable")}</MenuItem>
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
            label={t("priority")}
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
            disabled={loading}
            fullWidth
          >
            <MenuItem value={0} disabled>
              {t("selectPriority")}
            </MenuItem>

            {prioritiesOptions.length === 0 ? (
              <MenuItem disabled>{t("noPrioritiesAvailable")}</MenuItem>
            ) : (
              prioritiesOptions.map((priority) => (
                <MenuItem key={priority.idPriority} value={priority.idPriority}>
                  {getPriorityDisplayName(priority.name)}
                </MenuItem>
              ))
            )}
          </TextField>
        )}

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Stack spacing={3} direction="row">
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            {t("cancel")}
          </Button>

          <Button type="submit" variant="contained" disabled={loading}>
            {loading
              ? t("saving")
              : formMode === FORM_MODES.CREATE
                ? t("createTicket")
                : t("saveChanges")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
