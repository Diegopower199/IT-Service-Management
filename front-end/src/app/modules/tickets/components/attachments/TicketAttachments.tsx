"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";

import { useTranslations } from "next-intl";

import { Alert, Paper } from "@mui/material";

import AttachFileRounded from "@mui/icons-material/AttachFileRounded";

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
import { AttachmentRow } from "./AttachmentFile";
import AttachmentPicker from "./AttachmentPicker";
import AttachmentPreviewDialog, { type AttachmentPreview } from "./AttachmentPreviewDialog";
import detailStyles from "../../styles/ticketDetails.module.css";
import styles from "../../styles/ticketAttachments.module.css";

interface TicketAttachmentsProps {
  ticketId: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function TicketAttachments({
  ticketId,
}: TicketAttachmentsProps) {
  const t = useTranslations("Tickets.Attachments");

  const [attachments, setAttachments] = useState<TicketAttachmentResponse[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
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
      setUploadingFile(file);
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
      setUploadingFile(null);
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
      <Paper component="section" variant="outlined" className={`${detailStyles.panel} ${styles.panel}`}>
        <div className={styles.header}>
          <h2 className={detailStyles.panelTitle}>
            <AttachFileRounded aria-hidden="true" />
            {t("title")}
          </h2>

          <AttachmentPicker
            primary
            label={uploadingFile ? t("uploading") : t("upload")}
            file={uploadingFile}
            onChange={handleFileChange}
            disabled={uploadingFile !== null}
            busy={uploadingFile !== null}
          />
        </div>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        {loading ? (
          <div className={detailStyles.panelLoading}>
            <PageLoading />
          </div>
        ) : attachments.length === 0 ? (
          !errorMessage && <p className={detailStyles.emptyState}>{t("empty")}</p>
        ) : (
          <ul className={styles.list}>
            {attachments.map((attachment) => (
              <AttachmentRow
                key={attachment.idAttachment}
                name={attachment.fileName}
                contentType={attachment.contentType}
                size={attachment.fileSize}
                metadata={
                  <>
                    <span>{attachment.uploadedBy.username}</span>
                    <TicketDate value={attachment.createdAt} />
                  </>
                }
                onPreview={() => void handlePreviewAttachment(attachment)}
                previewDisabled={previewingId !== null}
                onDownload={() => void handleDownloadAttachment(attachment)}
                downloadDisabled={downloadingId !== null}
              />
            ))}
          </ul>
        )}
      </Paper>

      <AttachmentPreviewDialog preview={preview} onClose={handleClosePreview} />
    </>
  );
}
