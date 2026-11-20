import { Box, Button } from "@mui/material";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { useTranslations } from "next-intl";

import TicketDialog from "../shared/TicketDialog";
import sharedStyles from "../../styles/tickets.module.css";
import styles from "../../styles/ticketAttachments.module.css";

export interface AttachmentPreview {
  url: string;
  fileName: string;
  contentType: string;
}

interface AttachmentPreviewDialogProps {
  preview: AttachmentPreview | null;
  onClose: () => void;
}

export default function AttachmentPreviewDialog({ preview, onClose }: AttachmentPreviewDialogProps) {
  const t = useTranslations("Tickets.Attachments");

  return (
    <TicketDialog
      open={preview !== null}
      onClose={onClose}
      maxWidth="lg"
      title={preview?.fileName ?? ""}
      icon={<VisibilityOutlined />}
      actions={
        <Button variant="outlined" onClick={onClose} className={sharedStyles.secondaryButton}>
          {t("close")}
        </Button>
      }
    >
      <div className={styles.previewViewport}>
        {preview?.contentType.startsWith("image/") && (
          <Box component="img" src={preview.url} alt={preview.fileName} className={styles.previewImage} />
        )}
        {preview?.contentType === "application/pdf" && (
          <Box component="iframe" src={preview.url} title={preview.fileName} className={styles.previewDocument} />
        )}
      </div>
    </TicketDialog>
  );
}
