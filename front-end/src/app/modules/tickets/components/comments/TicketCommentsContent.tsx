"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import dayjs from "dayjs";

import {
  Alert,
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CustomPagination from "@/components/ui/CustomPagination";
import Button from "@/components/ui/Button";

import { useAuth } from "@/hooks/useAuth";

import { USER_ROLES } from "@/types/roleTypes";
import type { TicketCommentResponse } from "@/types/ticketCommentTypes";

import { DEFAULT_TICKET_COMMENTS_SORT } from "@/utils/constans";
import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import {
  createTicketComment,
  getAllTicketsCommentsById,
} from "../../services/ticketCommentsService";

interface TicketCommentsContentProps {
  ticketId: number;
}

interface CommentForm {
  comment: string;
  internal: boolean;
}

export default function TicketCommentsContent({
  ticketId,
}: TicketCommentsContentProps) {
  const { user } = useAuth();

  const t = useTranslations("Tickets.Comments");

  const [ticketComments, setTicketComments] = useState<TicketCommentResponse[]>(
    [],
  );

  const [formData, setFormData] = useState<CommentForm>({
    comment: "",
    internal: false,
  });

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);
  const [savingComment, setSavingComment] = useState(false);

  const [requiredFieldsIncomplete, setRequiredFieldsIncomplete] = useState<
    Partial<Record<keyof CommentForm, string>>
  >({});

  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const canCreateInternalComment =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.TECHNICIAN;

  useEffect(() => {
    const loadTicketComments = async () => {
      try {
        setLoading(true);
        setLoadErrorMessage("");

        const response = await getAllTicketsCommentsById(ticketId, {
          page: paginationModel.page,
          size: paginationModel.pageSize,
          sort: DEFAULT_TICKET_COMMENTS_SORT,
        });

        setTicketComments(response.content);
        setTotalElements(response.totalElements);
      } catch (error) {
        logger.error("Failed to load ticket comments", error, {
          component: "TicketCommentsContent",
          action: "loadTicketComments",
          ticketId,
        });

        const apiError = getApiError(error);

        setLoadErrorMessage(apiError?.message ?? t("loadError"));
      } finally {
        setLoading(false);
      }
    };

    loadTicketComments();
  }, [ticketId, paginationModel, t]);

  const handlePageChange = (newPage: number) => {
    setPaginationModel({
      page: newPage,
      pageSize: paginationModel.pageSize,
    });
  };

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;

    const checked =
      event.target instanceof HTMLInputElement ? event.target.checked : false;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));

    setRequiredFieldsIncomplete((previousErrors) => ({
      ...previousErrors,
      [name]: undefined,
    }));
  };

  const validateRequiredFields = () => {
    const errorMissingFields: Partial<Record<keyof CommentForm, string>> = {};

    if (!formData.comment.trim()) {
      errorMissingFields.comment = t("commentRequired");
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
      setSavingComment(true);
      setErrorMessage("");
      setRequiredFieldsIncomplete({});

      await createTicketComment(ticketId, {
        comment: formData.comment,
        internal: canCreateInternalComment ? formData.internal : false,
      });

      setFormData({
        comment: "",
        internal: false,
      });

      setRequiredFieldsIncomplete({});

      const newTotalElements = totalElements + 1;

      const lastPage =
        Math.ceil(newTotalElements / paginationModel.pageSize) - 1;

      if (paginationModel.page !== lastPage) {
        setPaginationModel({
          page: lastPage,
          pageSize: paginationModel.pageSize,
        });
      } else {
        try {
          const response = await getAllTicketsCommentsById(ticketId, {
            page: lastPage,
            size: paginationModel.pageSize,
            sort: DEFAULT_TICKET_COMMENTS_SORT,
          });

          setTicketComments(response.content);
          setTotalElements(response.totalElements);
        } catch (error) {
          logger.error("Failed to reload ticket comments", error, {
            component: "TicketCommentsContent",
            action: "reloadTicketComments",
            ticketId,
          });

          const apiError = getApiError(error);

          setLoadErrorMessage(apiError?.message ?? t("reloadError"));
        }
      }
    } catch (error) {
      const apiError = getApiError(error);

      if (apiError?.errors?.comment) {
        setRequiredFieldsIncomplete({
          comment: apiError.errors.comment,
        });

        return;
      }

      logger.error("Failed to create ticket comment", error, {
        component: "TicketCommentsContent",
        action: "handleSubmit",
        ticketId,
      });

      setErrorMessage(apiError?.message ?? t("createError"));
    } finally {
      setSavingComment(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {t("title")}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("ticket", { ticketId })}
      </Typography>

      {loadErrorMessage && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
        >
          {loadErrorMessage}
        </Alert>
      )}

      {loading ? (
        <Typography color="text.secondary">{t("loading")}</Typography>
      ) : ticketComments.length === 0 ? (
        <Typography color="text.secondary">{t("empty")}</Typography>
      ) : (
        <Stack spacing={2}>
          {ticketComments.map((ticketComment) => (
            <Paper
              key={ticketComment.idComment}
              variant="outlined"
              sx={{
                p: 2,
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="subtitle1">
                    {ticketComment.user.username}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {dayjs(ticketComment.createdAt).format("DD/MM/YYYY HH:mm")}
                  </Typography>
                </Box>

                {ticketComment.internal && (
                  <Chip label={t("internal")} size="small" variant="outlined" />
                )}
              </Stack>

              <Typography sx={{ mt: 2 }}>{ticketComment.comment}</Typography>
            </Paper>
          ))}

          <CustomPagination
            page={paginationModel.page}
            pageSize={paginationModel.pageSize}
            totalElements={totalElements}
            onPageChange={handlePageChange}
          />
        </Stack>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Stack spacing={2}>
          <TextField
            name="comment"
            label={t("addComment")}
            multiline
            minRows={3}
            fullWidth
            value={formData.comment}
            onChange={handleFormChange}
            error={Boolean(requiredFieldsIncomplete.comment)}
            helperText={requiredFieldsIncomplete.comment}
            disabled={savingComment}
          />

          {canCreateInternalComment && (
            <FormControlLabel
              control={
                <Checkbox
                  name="internal"
                  checked={formData.internal}
                  onChange={handleFormChange}
                  disabled={savingComment}
                />
              }
              label={t("internalComment")}
            />
          )}

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <Button type="submit" variant="primary" disabled={savingComment}>
            {savingComment ? t("adding") : t("submit")}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
