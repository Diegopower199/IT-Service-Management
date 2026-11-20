import type { ReactNode } from "react";
import { Button } from "@mui/material";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import ImageOutlined from "@mui/icons-material/ImageOutlined";
import PictureAsPdfOutlined from "@mui/icons-material/PictureAsPdfOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { useFormatter, useTranslations } from "next-intl";

import styles from "../../styles/ticketAttachments.module.css";

const fileFormats: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPEG",
  "image/png": "PNG",
};

interface AttachmentFileProps {
  name: string;
  contentType?: string;
  size?: number;
  metadata?: ReactNode;
}

export function AttachmentFile({ name, contentType, size, metadata }: AttachmentFileProps) {
  const format = useFormatter();
  const fileFormat = contentType && (fileFormats[contentType] ?? contentType);
  const isPdf = fileFormat === "PDF";
  const isImage = contentType?.startsWith("image/");
  const Icon = isPdf ? PictureAsPdfOutlined : isImage ? ImageOutlined : DescriptionOutlined;
  const iconClass = isPdf ? styles.pdfIcon : isImage ? styles.imageIcon : "";

  let fileSize;
  if (typeof size === "number" && Number.isFinite(size) && size >= 0) {
    const unitIndex = size < 1024 ? 0 : size < 1024 ** 2 ? 1 : 2;
    const unit = ["B", "KB", "MB"][unitIndex];
    const value = format.number(size / 1024 ** unitIndex, { maximumFractionDigits: 1 });
    fileSize = `${value}\u00a0${unit}`;
  }

  return (
    <div className={styles.file}>
      <span className={`${styles.fileIcon} ${iconClass}`} aria-hidden="true">
        <Icon fontSize="small" />
      </span>
      <div className={styles.fileDetails}>
        <span className={styles.fileName} dir="auto">{name}</span>
        {(fileFormat || fileSize || metadata) && (
          <div className={styles.fileMetadata}>
            {fileFormat && <span className={styles.fileType}>{fileFormat}</span>}
            {fileSize && <span>{fileSize}</span>}
            {metadata}
          </div>
        )}
      </div>
    </div>
  );
}

interface AttachmentRowProps extends AttachmentFileProps {
  onPreview?: () => void;
  onDownload: () => void;
  previewDisabled?: boolean;
  downloadDisabled?: boolean;
}

export function AttachmentRow({
  onPreview,
  onDownload,
  previewDisabled,
  downloadDisabled,
  ...file
}: AttachmentRowProps) {
  const t = useTranslations("Tickets.Attachments");

  return (
    <li className={styles.fileRow}>
      <AttachmentFile {...file} />
      <div className={styles.fileActions}>
        {onPreview && (
          <Button
            type="button"
            size="small"
            variant="outlined"
            startIcon={<VisibilityOutlined />}
            onClick={onPreview}
            disabled={previewDisabled}
            aria-label={t("previewFile", { name: file.name })}
          >
            {t("preview")}
          </Button>
        )}
        <Button
          type="button"
          size="small"
          variant="outlined"
          startIcon={<DownloadOutlined />}
          onClick={onDownload}
          disabled={downloadDisabled}
          aria-label={t("downloadFile", { name: file.name })}
        >
          {t("download")}
        </Button>
      </div>
    </li>
  );
}
