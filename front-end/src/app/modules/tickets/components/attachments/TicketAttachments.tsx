"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";

import { useTranslations } from "next-intl";

import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
} from "@mui/material";

import AttachFileRounded from "@mui/icons-material/AttachFileRounded";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";

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

import TicketDate from "../shared/TicketDate";
import TicketDialog from "../shared/TicketDialog";
import sharedStyles from "../../styles/tickets.module.css";
import styles from "../../styles/ticketDetails.module.css";

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
      <Paper component="section" variant="outlined" className={styles.panel}>
        <div className={styles.attachmentHeader}>
          <h2 className={styles.panelTitle}>
            <AttachFileRounded aria-hidden="true" />
            {t("title")}
          </h2>

          <Button
            component="label"
            variant="contained"
            disableElevation
            startIcon={<UploadFileOutlined />}
            disabled={uploading}
            className={sharedStyles.primaryButton}
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
        </div>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        {loading ? (
          <div className={styles.panelLoading}>
            <PageLoading />
          </div>
        ) : attachments.length === 0 ? (
          <p className={styles.emptyState}>{t("empty")}</p>
        ) : (
          <ul className={styles.attachmentList}>
            {attachments.map((attachment) => (
              <li key={attachment.idAttachment} className={styles.attachmentRow}>
                <span className={styles.fileIcon} aria-hidden="true">
                  <DescriptionOutlined />
                </span>

                <div className={styles.fileDetails}>
                  <span className={styles.fileName}>{attachment.fileName}</span>

                  <div className={styles.fileMetadata}>
                    <span className={styles.fileType}>{attachment.contentType}</span>
                    <span>{formatFileSize(attachment.fileSize)}</span>
                    <span>{attachment.uploadedBy.username}</span>
                    <TicketDate value={attachment.createdAt} />
                  </div>
                </div>

                <div className={styles.attachmentActions}>
                  <IconButton
                    onClick={() => void handlePreviewAttachment(attachment)}
                    disabled={previewingId !== null}
                    aria-label={t("preview")}
                    title={t("preview")}
                    className={styles.fileAction}
                  >
                    <VisibilityOutlined fontSize="small" />
                  </IconButton>

                  <IconButton
                    onClick={() => void handleDownloadAttachment(attachment)}
                    disabled={downloadingId !== null}
                    aria-label={t("download")}
                    title={t("download")}
                    className={styles.fileAction}
                  >
                    <DownloadOutlined fontSize="small" />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className={styles.helpText}>{t("allowedFormats")}</p>
      </Paper>

      <TicketDialog
        open={preview !== null}
        onClose={handleClosePreview}
        maxWidth="lg"
        title={preview?.fileName ?? ""}
        icon={<VisibilityOutlined />}
        actions={
          <Button
            variant="outlined"
            onClick={handleClosePreview}
            className={sharedStyles.secondaryButton}
          >
            {t("close")}
          </Button>
        }
      >
        <div className={styles.previewViewport}>
          {preview?.contentType.startsWith("image/") && (
            <Box
              component="img"
              src={preview.url}
              alt={preview.fileName}
              className={styles.previewImage}
            />
          )}

          {preview?.contentType === "application/pdf" && (
            <Box
              component="iframe"
              src={preview.url}
              title={preview.fileName}
              className={styles.previewDocument}
            />
          )}
        </div>
      </TicketDialog>
    </>
  );
}
