"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useTranslations } from "next-intl";

import {
  Alert,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  LinearProgress,
  Paper,
  TextField,
} from "@mui/material";

import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";

import CustomPagination from "@/components/ui/CustomPagination";

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

import AttachmentPicker from "../attachments/AttachmentPicker";
import TicketCommentAttachments from "../attachments/TicketCommentAttachments";
import TicketActivityHeader from "../shared/TicketActivityHeader";
import TicketDate from "../shared/TicketDate";
import sharedStyles from "../../styles/tickets.module.css";
import detailStyles from "../../styles/ticketDetails.module.css";
import styles from "../../styles/ticketActivity.module.css";

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
  const tCommentDialog = useTranslations("Tickets.AddCommentDialog");
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

  const [loading, setLoading] = useState(true);
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
    <div className={sharedStyles.page}>
      <TicketActivityHeader
        ticketId={ticketId}
        title={t("title")}
        reference={t("ticket", { ticketId })}
        icon={<ChatBubbleOutlineRounded />}
      />

      <div className={styles.commentLayout}>
        <section className={styles.commentFeed} aria-labelledby="ticket-activity-title">
          {loadErrorMessage && <Alert severity="error">{loadErrorMessage}</Alert>}

          {loading ? (
            <div className={styles.commentsLoading} role="status">
              <span>{t("loading")}</span>
              <LinearProgress aria-hidden="true" />
            </div>
          ) : ticketComments.length === 0 ? (
            !loadErrorMessage && <p className={detailStyles.emptyState}>{t("empty")}</p>
          ) : (
            <>
              {ticketComments.map((ticketComment) => (
                <article className={styles.commentCard} key={ticketComment.idComment}>
                  <header className={styles.commentHeader}>
                    <span className={styles.authorIcon} aria-hidden="true">
                      {ticketComment.user.username.slice(0, 1).toUpperCase()}
                    </span>
                    <div className={styles.commentByline}>
                      <h2>{ticketComment.user.username}</h2>
                      <TicketDate value={ticketComment.createdAt} />
                    </div>
                    {ticketComment.internal && (
                      <Chip
                        label={t("internal")}
                        size="small"
                        color="warning"
                        className={sharedStyles.ticketBadge}
                      />
                    )}
                  </header>

                  <p className={styles.commentText}>{ticketComment.comment}</p>

                  <TicketCommentAttachments ticketId={ticketId} commentId={ticketComment.idComment} />
                </article>
              ))}

              <CustomPagination
                page={paginationModel.page}
                pageSize={paginationModel.pageSize}
                totalElements={totalElements}
                onPageChange={handlePageChange}
                resultsLabel={t("results", { count: totalElements })}
                navigationLabel={t("pagination")}
                getItemAriaLabel={(type, page) =>
                  t("paginationItem", { type, page: page ?? 0 })
                }
              />
            </>
          )}
        </section>

        <Paper
          component="form"
          variant="outlined"
          className={styles.composer}
          aria-labelledby="ticket-comment-form-title"
          onSubmit={handleSubmit}
        >
          <h2 id="ticket-comment-form-title" className={detailStyles.panelTitle}>
            <ChatBubbleOutlineRounded aria-hidden="true" />
            {t("addComment")}
          </h2>

          <TextField
            name="comment"
            label={tCommentDialog("comment")}
            multiline
            minRows={4}
            fullWidth
            value={formData.comment}
            onChange={handleFormChange}
            error={Boolean(requiredFieldsIncomplete.comment)}
            helperText={requiredFieldsIncomplete.comment}
            disabled={savingComment}
          />

          {canCreateInternalComment && (
            <FormControlLabel
              className={styles.internalOption}
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

          <AttachmentPicker
            label={t("attachFile")}
            file={selectedFile}
            onChange={handleFileChange}
            onRemove={() => setSelectedFile(null)}
            disabled={savingComment}
            busy={savingComment && selectedFile !== null}
          />

          {attachmentError && <Alert severity="error">{attachmentError}</Alert>}

          {attachmentWarning && (
            <Alert severity="warning">{attachmentWarning}</Alert>
          )}

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <div className={styles.composerActions}>
            <Button
              type="submit"
              variant="contained"
              disableElevation
              disabled={savingComment}
              className={sharedStyles.primaryButton}
            >
              {savingComment ? t("adding") : t("submit")}
            </Button>
          </div>
        </Paper>
      </div>
    </div>
  );
}
