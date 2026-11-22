"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { useTranslations } from "next-intl";

import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material";

import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";

import { useAuth } from "@/hooks/useAuth";

import { USER_ROLES } from "@/types/roleTypes";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import { createTicketComment } from "../../services/ticketCommentsService";
import { uploadTicketCommentAttachment } from "../../services/ticketCommentAttachmentService";

import AttachmentPicker from "../attachments/AttachmentPicker";
import TicketDialog from "../shared/TicketDialog";
import sharedStyles from "../../styles/tickets.module.css";
import styles from "../../styles/ticketDetails.module.css";

interface AddTicketCommentDialogProps {
  open: boolean;
  ticketId: number;
  onClose: () => void;
  onCommentsUpdated: () => void;
}

interface CommentForm {
  comment: string;
  internal: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export default function AddTicketCommentDialog({
  open,
  ticketId,
  onClose,
  onCommentsUpdated,
}: AddTicketCommentDialogProps) {
  const { user } = useAuth();

  const t = useTranslations("Tickets.AddCommentDialog");
  const tAttachments = useTranslations("Tickets.Attachments");

  const [formData, setFormData] = useState<CommentForm>({
    comment: "",
    internal: false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [savingComment, setSavingComment] = useState(false);
  const [commentCreated, setCommentCreated] = useState(false);

  const [requiredFieldsIncomplete, setRequiredFieldsIncomplete] = useState<
    Partial<Record<keyof CommentForm, string>>
  >({});

  const [errorMessage, setErrorMessage] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const [attachmentWarning, setAttachmentWarning] = useState("");

  const canCreateInternalComment =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.TECHNICIAN;

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

  /**
   * Resets the comment form and attachment state.
   */
  const resetForm = () => {
    setFormData({
      comment: "",
      internal: false,
    });

    setSelectedFile(null);
    setCommentCreated(false);

    setRequiredFieldsIncomplete({});
    setErrorMessage("");
    setAttachmentError("");
    setAttachmentWarning("");
  };

  const handleClose = () => {
    if (savingComment) {
      return;
    }

    resetForm();
    onClose();
  };

  /**
   * Creates a comment and uploads its optional attachment.
   */
  const handleConfirm = async () => {
    if (savingComment || commentCreated) {
      return;
    }

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

      // Create the comment to obtain its identifier.
      const createdComment = await createTicketComment(ticketId, {
        comment: formData.comment,
        internal: canCreateInternalComment ? formData.internal : false,
      });

      setCommentCreated(true);

      // Upload the attachment only after the comment exists.
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
              component: "AddTicketCommentDialog",
              action: "handleConfirm",
              ticketId,
              commentId: createdComment.idComment,
            },
          );

          setAttachmentWarning(t("attachmentUploadFailed"));
          setSelectedFile(null);

          // The comment exists even if the attachment failed.
          onCommentsUpdated();
          return;
        }
      }

      onCommentsUpdated();

      resetForm();
      onClose();
    } catch (error) {
      const apiError = getApiError(error);

      if (apiError?.errors?.comment) {
        setRequiredFieldsIncomplete({
          comment: apiError.errors.comment,
        });

        return;
      }

      logger.error("Failed to create ticket comment", error, {
        component: "AddTicketCommentDialog",
        action: "handleConfirm",
        ticketId,
      });

      setErrorMessage(apiError?.message ?? t("createError"));
    } finally {
      setSavingComment(false);
    }
  };

  return (
    <TicketDialog
      open={open}
      onClose={handleClose}
      title={t("title")}
      description={t("subtitle", { ticketId })}
      icon={<ChatBubbleOutlineRounded />}
      actions={
        <>
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={savingComment}
            className={sharedStyles.secondaryButton}
          >
            {commentCreated ? tAttachments("close") : t("cancel")}
          </Button>

          {!commentCreated && (
            <Button
              variant="contained"
              disableElevation
              onClick={handleConfirm}
              disabled={savingComment}
              className={sharedStyles.primaryButton}
            >
              {savingComment ? t("adding") : t("addComment")}
            </Button>
          )}
        </>
      }
    >
      <div className={styles.dialogFields}>
        <TextField
          name="comment"
          label={t("comment")}
          multiline
          minRows={4}
          fullWidth
          value={formData.comment}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.comment)}
          helperText={requiredFieldsIncomplete.comment}
          disabled={savingComment || commentCreated}
        />

        {canCreateInternalComment && (
          <FormControlLabel
            className={styles.internalOption}
            control={
              <Checkbox
                name="internal"
                checked={formData.internal}
                onChange={handleFormChange}
                disabled={savingComment || commentCreated}
              />
            }
            label={t("internalComment")}
          />
        )}

        <AttachmentPicker
          label={t("attachFile")}
          file={selectedFile}
          onChange={handleFileChange}
          onRemove={savingComment || commentCreated ? undefined : () => setSelectedFile(null)}
          disabled={savingComment || commentCreated}
          busy={savingComment && selectedFile !== null}
        />

        {attachmentError && <Alert severity="error">{attachmentError}</Alert>}

        {attachmentWarning && (
          <Alert severity="warning">{attachmentWarning}</Alert>
        )}

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      </div>
    </TicketDialog>
  );
}
