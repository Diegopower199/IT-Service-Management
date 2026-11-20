"use client";

import { useEffect, useId, useRef, useState } from "react";

import {
  Alert,
  Button,
  CircularProgress,
  Collapse,
} from "@mui/material";

import AttachFileOutlined from "@mui/icons-material/AttachFileOutlined";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";

import { useTranslations } from "next-intl";

import type { TicketCommentAttachmentResponse } from "@/types/ticketCommentAttachmentTypes";

import {
  getTicketCommentAttachments,
  downloadTicketCommentAttachment,
  previewTicketCommentAttachment,
} from "@/app/modules/tickets/services/ticketCommentAttachmentService";

import { AttachmentRow } from "./AttachmentFile";
import AttachmentPreviewDialog, { type AttachmentPreview } from "./AttachmentPreviewDialog";
import styles from "../../styles/ticketAttachments.module.css";

interface TicketCommentAttachmentsProps {
  ticketId: number;
  commentId: number;
}

/**
 * Displays attachments associated with a ticket comment.
 *
 * Attachments are loaded on demand to avoid unnecessary
 * API requests when rendering multiple comments.
 */
export default function TicketCommentAttachments({
  ticketId,
  commentId,
}: TicketCommentAttachmentsProps) {
  const t = useTranslations("Tickets.CommentAttachments");
  const resultsId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const focusEmptyResult = useRef(false);

  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const [attachments, setAttachments] = useState<
    TicketCommentAttachmentResponse[] | null
  >(null);

  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<AttachmentPreview | null>(null);

  /**
   * Releases the temporary preview URL when the preview
   * changes or the component is unmounted.
   */
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  /**
   * Loads attachments from the backend.
   */
  const loadAttachments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getTicketCommentAttachments(ticketId, commentId);

      focusEmptyResult.current = response.length === 0 && document.activeElement === toggleRef.current;
      setAttachments(response);
      setExpanded(response.length > 0);
    } catch {
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Expands or collapses the attachment list.
   */
  const handleToggle = async () => {
    if (loading) {
      return;
    }

    if (attachments === null) {
      await loadAttachments();
      return;
    }

    setExpanded((previous) => !previous);
  };

  /**
   * Downloads an attachment using a temporary Blob URL.
   */
  const handleDownload = async (
    attachment: TicketCommentAttachmentResponse,
  ) => {
    try {
      setError(null);

      const blob = await downloadTicketCommentAttachment(
        ticketId,
        commentId,
        attachment.idAttachment,
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError(t("downloadError"));
    }
  };

  /**
   * Retrieves an attachment and opens its inline preview.
   */
  const handlePreview = async (attachment: TicketCommentAttachmentResponse) => {
    try {
      setError(null);

      const blob = await previewTicketCommentAttachment(
        ticketId,
        commentId,
        attachment.idAttachment,
      );

      setPreview({
        url: URL.createObjectURL(blob),
        fileName: attachment.fileName,
        contentType: attachment.contentType,
      });
    } catch {
      setError(t("previewError"));
    }
  };

  const isPreviewable = (contentType: string): boolean =>
    ["image/jpeg", "image/png", "application/pdf"].includes(contentType);

  const count = attachments?.length ?? 0;
  const toggleLabel = expanded ? t("hideAttachments") : t("showAttachments");
  const toggleIcon = loading
    ? <CircularProgress size={16} color="inherit" aria-hidden="true" />
    : <AttachFileOutlined />;

  return (
    <div className={styles.commentFiles}>
      {(attachments === null || count > 0) && (
        <Button
          ref={toggleRef}
          type="button"
          size="small"
          variant="text"
          className={styles.toggle}
          startIcon={toggleIcon}
          endIcon={count > 0 && <ExpandMoreRounded className={expanded ? styles.expandedIcon : undefined} />}
          onClick={handleToggle}
          aria-disabled={loading || undefined}
          aria-expanded={count > 0 ? expanded : undefined}
          aria-controls={count > 0 ? resultsId : undefined}
          aria-label={count > 0 ? t("toggleWithCount", { label: toggleLabel, count }) : undefined}
        >
          {loading ? t("loading") : attachments === null ? t("checkAttachments") : toggleLabel}
          {count > 0 && <span className={styles.fileCount} aria-hidden="true">{count}</span>}
        </Button>
      )}

      {attachments?.length === 0 && (
        <p
          ref={(node) => {
            if (node && focusEmptyResult.current) {
              focusEmptyResult.current = false;
              node.focus({ preventScroll: true });
            }
          }}
          tabIndex={-1}
          role="status"
          className={styles.helpText}
        >
          {t("noAttachments")}
        </p>
      )}

      {attachments && count > 0 && (
        <div id={resultsId} className={styles.commentResults}>
          <Collapse in={expanded} timeout={150} unmountOnExit>
            <ul className={styles.list}>
              {attachments.map((attachment) => (
                <AttachmentRow
                  key={attachment.idAttachment}
                  name={attachment.fileName}
                  contentType={attachment.contentType}
                  size={attachment.fileSize}
                  onPreview={isPreviewable(attachment.contentType) ? () => void handlePreview(attachment) : undefined}
                  onDownload={() => void handleDownload(attachment)}
                />
              ))}
            </ul>
          </Collapse>
        </div>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <AttachmentPreviewDialog preview={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
