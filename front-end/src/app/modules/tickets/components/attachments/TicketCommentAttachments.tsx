"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import { useTranslations } from "next-intl";

import type { TicketCommentAttachmentResponse } from "@/types/ticketCommentAttachmentTypes";

import {
  getTicketCommentAttachments,
  downloadTicketCommentAttachment,
  previewTicketCommentAttachment,
} from "@/app/modules/tickets/services/ticketCommentAttachmentService";

interface TicketCommentAttachmentsProps {
  ticketId: number;
  commentId: number;
}

interface AttachmentPreview {
  url: string;
  fileName: string;
  contentType: string;
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

  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const [attachments, setAttachments] = useState<
    TicketCommentAttachmentResponse[]
  >([]);

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

      setAttachments(response);
      setLoaded(true);
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
    const shouldExpand = !expanded;

    setExpanded(shouldExpand);

    if (shouldExpand && !loaded) {
      await loadAttachments();
    }
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

  return (
    <Box sx={{ mt: 1 }}>
      <Button
        size="small"
        variant="text"
        startIcon={<AttachFileOutlinedIcon />}
        onClick={handleToggle}
        disabled={loading}
      >
        {expanded ? t("hideAttachments") : t("showAttachments")}
      </Button>

      {expanded && (
        <Stack spacing={1} sx={{ mt: 1 }}>
          {loading && <CircularProgress size={20} />}

          {!loading && loaded && attachments.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              {t("noAttachments")}
            </Typography>
          )}

          {!loading &&
            attachments.map((attachment) => (
              <Stack
                key={attachment.idAttachment}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  px: 1.5,
                  py: 1,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                    {attachment.fileName}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {(attachment.fileSize / 1024).toFixed(1)} KB
                  </Typography>
                </Box>

                <Stack direction="row" spacing={0.5}>
                  {isPreviewable(attachment.contentType) && (
                    <Tooltip title={t("preview")}>
                      <IconButton
                        size="small"
                        aria-label={t("preview")}
                        onClick={() => handlePreview(attachment)}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title={t("download")}>
                    <IconButton
                      size="small"
                      aria-label={t("download")}
                      onClick={() => handleDownload(attachment)}
                    >
                      <DownloadOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            ))}
        </Stack>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      <Dialog
        open={preview !== null}
        onClose={() => setPreview(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{preview?.fileName}</DialogTitle>

        <DialogContent sx={{ height: "70vh" }}>
          {preview?.contentType === "application/pdf" ? (
            <Box
              component="iframe"
              src={preview.url}
              title={preview.fileName}
              sx={{
                width: "100%",
                height: "100%",
                border: 0,
              }}
            />
          ) : preview ? (
            <Box
              component="img"
              src={preview.url}
              alt={preview.fileName}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
