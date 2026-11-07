"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useTranslations } from "next-intl";

import dayjs from "dayjs";

import {
  Alert,
  Box,
  Button as MuiButton,
  Checkbox,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";

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

import { uploadTicketCommentAttachment } from "../../services/ticketCommentAttachmentService";

import TicketCommentAttachments from "../attachments/TicketCommentAttachments";

interface TicketCommentsContentProps {
  ticketId: number;
}

interface CommentForm {
  comment: string;
  internal: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export default function TicketCommentsContent({
  ticketId,
}: TicketCommentsContentProps) {
  const { user } = useAuth();

  const t = useTranslations("Tickets.Comments");
  const tAttachments = useTranslations("Tickets.Attachments");

  const [ticketComments, setTicketComments] = useState<TicketCommentResponse[]>(
    [],
  );

  const [formData, setFormData] = useState<CommentForm>({
    comment: "",
    internal: false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const [attachmentError, setAttachmentError] = useState("");
  const [attachmentWarning, setAttachmentWarning] = useState("");

  const canCreateInternalComment =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.TECHNICIAN;

  const fetchTicketComments = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await getAllTicketsCommentsById(ticketId, {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort: DEFAULT_TICKET_COMMENTS_SORT,
      });

      setTicketComments(response.content);
      setTotalElements(response.totalElements);
      setLoadErrorMessage("");

      return true;
    } catch (error) {
      logger.error("Failed to load ticket comments", error, {
        component: "TicketCommentsContent",
        action: "fetchTicketComments",
        ticketId,
      });

      const apiError = getApiError(error);

      setLoadErrorMessage(apiError?.message ?? t("loadError"));

      return false;
    } finally {
      setLoading(false);
    }
  }, [ticketId, paginationModel.page, paginationModel.pageSize, t]);

  useEffect(() => {
    const loadTicketComments = async () => {
      const commentsLoaded = await fetchTicketComments();

      if (!commentsLoaded) {
        return;
      }
    };

    loadTicketComments();
  }, [fetchTicketComments]);

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

  /**
   * Validates and stores the selected attachment.
   *
   * The file will be uploaded only after the comment is created.
   */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setAttachmentError(tAttachments("fileTooLarge"));
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setSelectedFile(null);
      setAttachmentError(t("invalidAttachmentType"));
      return;
    }

    setSelectedFile(file);
    setAttachmentError("");
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
      setAttachmentError("");
      setAttachmentWarning("");
      setRequiredFieldsIncomplete({});

      // Create the comment first to obtain its identifier.
      const createdComment = await createTicketComment(ticketId, {
        comment: formData.comment,
        internal: canCreateInternalComment ? formData.internal : false,
      });

      // Clear the form because the comment has been created.
      setFormData({
        comment: "",
        internal: false,
      });

      setSelectedFile(null);
      setRequiredFieldsIncomplete({});

      // Upload the selected file to the newly created comment.
      if (selectedFile) {
        try {
          await uploadTicketCommentAttachment(
            ticketId,
            createdComment.idComment,
            selectedFile,
          );
        } catch (uploadError) {
          logger.error(
            "Failed to upload ticket comment attachment",
            uploadError,
            {
              component: "TicketCommentsContent",
              action: "handleSubmit",
              ticketId,
              commentId: createdComment.idComment,
            },
          );

          setAttachmentWarning(t("attachmentUploadFailed"));
        }
      }

      // Refresh the comments list.
      const newTotalElements = totalElements + 1;

      const lastPage =
        Math.ceil(newTotalElements / paginationModel.pageSize) - 1;

      if (paginationModel.page !== lastPage) {
        setPaginationModel({
          page: lastPage,
          pageSize: paginationModel.pageSize,
        });
      } else {
        await fetchTicketComments();
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
        <Alert severity="error" sx={{ mb: 2 }}>
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
              sx={{ p: 2 }}
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

              <TicketCommentAttachments
                ticketId={ticketId}
                commentId={ticketComment.idComment}
              />
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

          <MuiButton
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            disabled={savingComment}
            sx={{ alignSelf: "flex-start" }}
          >
            {t("attachFile")}

            <input
              type="file"
              hidden
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={savingComment}
            />
          </MuiButton>

          {selectedFile && (
            <Chip
              label={selectedFile.name}
              onDelete={() => setSelectedFile(null)}
              sx={{ alignSelf: "flex-start" }}
            />
          )}

          <Typography variant="caption" color="text.secondary">
            {tAttachments("allowedFormats")}
          </Typography>

          {attachmentError && <Alert severity="error">{attachmentError}</Alert>}

          {attachmentWarning && (
            <Alert severity="warning">{attachmentWarning}</Alert>
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
