"use client";

import { useId, type ReactNode } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

import theme from "@/styles/tokens.module.css";

import styles from "./PanelDialog.module.css";

interface PanelDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
  actions: ReactNode;
  maxWidth?: "sm" | "lg";
  className?: string;
}

export default function PanelDialog({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  actions,
  maxWidth = "sm",
  className,
}: PanelDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={`${theme.tokens} ${styles.dialog}${className ? ` ${className}` : ""}`}
      slotProps={{ paper: { className: styles.dialogPaper } }}
    >
      <DialogTitle component="div" className={styles.dialogHeader}>
        <span className={styles.headingIcon} aria-hidden="true">
          {icon}
        </span>
        <div>
          <h2 id={titleId}>{title}</h2>
          {description && <p id={descriptionId}>{description}</p>}
        </div>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>{children}</DialogContent>

      <DialogActions className={styles.dialogFooter} disableSpacing>
        {actions}
      </DialogActions>
    </Dialog>
  );
}
