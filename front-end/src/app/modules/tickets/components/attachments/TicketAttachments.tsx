"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";

import dayjs from "dayjs";
import { useTranslations } from "next-intl";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";

import PageLoading from "@/components/ui/PageLoading";

import type { TicketAttachmentResponse } from "@/types/ticketAttachmentTypes";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import {
  getTicketAttachments,
  uploadTicketAttachment,
  downloadTicketAttachment,
  previewTicketAttachment,
} from "../../services/ticketAttachmentService";

interface TicketAttachmentsProps {
  ticketId: number;
}

interface AttachmentPreview {
  url: string;
  fileName: string;
  contentType: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function TicketAttachments({
  ticketId,
}: TicketAttachmentsProps) {
  const t = useTranslations("Tickets.Attachments");

  const [attachments, setAttachments] = useState<TicketAttachmentResponse[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [previewingId, setPreviewingId] = useState<number | null>(null);

  const [preview, setPreview] = useState<AttachmentPreview | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /**
   * Loads the attachments associated with the selected ticket.
   */
  const fetchAttachments = useCallback(async () => {
    try {
      const response = await getTicketAttachments(ticketId);

      setAttachments(response);
      setErrorMessage("");
    } catch (error) {
      logger.error("Failed to load ticket attachments", error, {
        component: "TicketAttachments",
        action: "fetchAttachments",
        ticketId,
      });

      const apiError = getApiError(error);

      setAttachments([]);
      setErrorMessage(apiError?.message ?? t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [ticketId, t]);

  useEffect(() => {
    const loadTicketAttachments = async () => {
      await fetchAttachments();
    };

    void loadTicketAttachments();
  }, [fetchAttachments]);

  /**
   * Releases the preview URL when the dialog closes,
   * the file changes or the component unmounts.
   */
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  /**
   * Uploads the file selected by the user.
   */
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSuccessMessage("");
      setErrorMessage(t("fileTooLarge"));
      return;
    }

    try {
      setUploading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const uploadedAttachment = await uploadTicketAttachment(ticketId, file);

      setAttachments((previous) => [uploadedAttachment, ...previous]);

      setSuccessMessage(t("uploadSuccess"));
    } catch (error) {
      logger.error("Failed to upload ticket attachment", error, {
        component: "TicketAttachments",
        action: "handleFileChange",
        ticketId,
      });

      const apiError = getApiError(error);
      setErrorMessage(apiError?.message ?? t("uploadError"));
    } finally {
      setUploading(false);
    }
  };

  /**
   * Downloads the selected attachment.
   */
  const handleDownloadAttachment = async (
    attachment: TicketAttachmentResponse,
  ) => {
    try {
      setDownloadingId(attachment.idAttachment);
      setErrorMessage("");

      const blob = await downloadTicketAttachment(
        ticketId,
        attachment.idAttachment,
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      logger.error("Failed to download ticket attachment", error, {
        component: "TicketAttachments",
        action: "handleDownloadAttachment",
        ticketId,
        attachmentId: attachment.idAttachment,
      });

      const apiError = getApiError(error);
      setErrorMessage(apiError?.message ?? t("downloadError"));
    } finally {
      setDownloadingId(null);
    }
  };

  /**
   * Retrieves an attachment and opens its preview dialog.
   */
  const handlePreviewAttachment = async (
    attachment: TicketAttachmentResponse,
  ) => {
    try {
      setPreviewingId(attachment.idAttachment);
      setErrorMessage("");

      const blob = await previewTicketAttachment(
        ticketId,
        attachment.idAttachment,
      );

      const url = URL.createObjectURL(blob);

      setPreview({
        url,
        fileName: attachment.fileName,
        contentType: attachment.contentType,
      });
    } catch (error) {
      logger.error("Failed to preview ticket attachment", error, {
        component: "TicketAttachments",
        action: "handlePreviewAttachment",
        ticketId,
        attachmentId: attachment.idAttachment,
      });

      const apiError = getApiError(error);
      setErrorMessage(apiError?.message ?? t("previewError"));
    } finally {
      setPreviewingId(null);
    }
  };

  /**
   * Closes the preview dialog.
   */
  const handleClosePreview = () => {
    setPreview(null);
  };

  return (
    <>
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">{t("title")}</Typography>

          <Button
            component="label"
            variant="contained"
            startIcon={<UploadFileIcon />}
            disabled={uploading}
          >
            {uploading ? t("uploading") : t("upload")}

            <input
              type="file"
              hidden
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {loading ? (
          <PageLoading />
        ) : attachments.length === 0 ? (
          <Typography color="text.secondary">{t("empty")}</Typography>
        ) : (
          <Stack spacing={2}>
            {attachments.map((attachment) => (
              <Paper
                key={attachment.idAttachment}
                variant="outlined"
                sx={{ p: 2 }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <AttachFileIcon color="action" />

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{ overflowWrap: "anywhere", fontWeight: 500 }}
                    >
                      {attachment.fileName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {formatFileSize(attachment.fileSize)}
                      {" · "}
                      {attachment.uploadedBy.username}
                      {" · "}
                      {dayjs(attachment.createdAt).format("DD/MM/YYYY HH:mm")}
                    </Typography>
                  </Box>

                  <IconButton
                    onClick={() => void handlePreviewAttachment(attachment)}
                    disabled={previewingId !== null}
                    aria-label={t("preview")}
                    title={t("preview")}
                  >
                    <VisibilityIcon />
                  </IconButton>

                  <IconButton
                    onClick={() => void handleDownloadAttachment(attachment)}
                    disabled={downloadingId !== null}
                    aria-label={t("download")}
                    title={t("download")}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2 }}
        >
          {t("allowedFormats")}
        </Typography>
      </Paper>

      <Dialog
        open={preview !== null}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{preview?.fileName}</DialogTitle>

        <DialogContent
          dividers
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 300,
          }}
        >
          {preview?.contentType.startsWith("image/") && (
            <Box
              component="img"
              src={preview.url}
              alt={preview.fileName}
              sx={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
            />
          )}

          {preview?.contentType === "application/pdf" && (
            <Box
              component="iframe"
              src={preview.url}
              title={preview.fileName}
              sx={{
                width: "100%",
                height: "70vh",
                border: 0,
              }}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClosePreview}>{t("close")}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
