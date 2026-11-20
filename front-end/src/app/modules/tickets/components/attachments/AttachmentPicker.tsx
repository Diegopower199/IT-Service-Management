import { useId, useRef, type ChangeEventHandler } from "react";
import { Button, CircularProgress, IconButton } from "@mui/material";
import CloseRounded from "@mui/icons-material/CloseRounded";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import { useTranslations } from "next-intl";

import { AttachmentFile } from "./AttachmentFile";
import sharedStyles from "../../styles/tickets.module.css";
import styles from "../../styles/ticketAttachments.module.css";

interface AttachmentPickerProps {
  label: string;
  file: File | null;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onRemove?: () => void;
  disabled: boolean;
  busy?: boolean;
  primary?: boolean;
}

export default function AttachmentPicker({
  label,
  file,
  onChange,
  onRemove,
  disabled,
  busy,
  primary = false,
}: AttachmentPickerProps) {
  const t = useTranslations("Tickets.Attachments");
  const inputRef = useRef<HTMLInputElement>(null);
  const helpId = useId();

  return (
    <div className={primary ? styles.ticketPicker : styles.commentPicker}>
      <div className={styles.pickerControls}>
        <Button
          type="button"
          variant={primary ? "contained" : "outlined"}
          size="small"
          disableElevation
          startIcon={busy ? <CircularProgress size={16} color="inherit" aria-hidden="true" /> : <UploadFileOutlined />}
          disabled={disabled}
          aria-describedby={helpId}
          onClick={() => inputRef.current?.click()}
          className={primary ? sharedStyles.primaryButton : sharedStyles.secondaryButton}
        >
          {label}
        </Button>
        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={onChange}
          disabled={disabled}
        />
        <p id={helpId} className={styles.helpText}>{t("allowedFormats")}</p>
      </div>

      <div aria-live="polite" className={styles.selectionStatus}>
        {file && (
          <div className={styles.selectedFile}>
            <span className={styles.helpText}>{t("fileSelected")}</span>
            <AttachmentFile name={file.name} contentType={file.type} size={file.size} />
            {onRemove && (
              <IconButton
                type="button"
                size="small"
                onClick={onRemove}
                aria-label={t("removeFile", { name: file.name })}
                title={t("removeFile", { name: file.name })}
              >
                <CloseRounded fontSize="small" />
              </IconButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
