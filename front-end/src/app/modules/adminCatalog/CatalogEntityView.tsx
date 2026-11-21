"use client";

import { useId, type ChangeEventHandler, type FormEventHandler, type ReactNode } from "react";
import { Alert, Box, Button, Chip, TextField } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import RemoveCircleOutlineRounded from "@mui/icons-material/RemoveCircleOutlineRounded";
import ToggleOffOutlined from "@mui/icons-material/ToggleOffOutlined";
import ToggleOnOutlined from "@mui/icons-material/ToggleOnOutlined";

import TicketDialog from "@/app/modules/tickets/components/shared/TicketDialog";
import sharedStyles from "@/app/modules/tickets/styles/tickets.module.css";
import detailStyles from "@/app/modules/tickets/styles/ticketDetails.module.css";
import usersStyles from "@/app/modules/users/styles/users.module.css";
import styles from "./catalog.module.css";

export function CatalogStatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <Chip
      label={label}
      size="small"
      color={active ? "success" : "default"}
      icon={active ? <CheckCircleOutlineRounded /> : <RemoveCircleOutlineRounded />}
      className={`${sharedStyles.ticketBadge} ${usersStyles.statusBadge}`}
    />
  );
}

interface CatalogEntityDetailsProps {
  title: string;
  icon: ReactNode;
  name: string;
  active: boolean;
  statusLabel: string;
  backLabel: string;
  onClose: () => void;
}

export function CatalogEntityDetails({ title, icon, name, active, statusLabel, backLabel, onClose }: CatalogEntityDetailsProps) {
  return (
    <div className={`${sharedStyles.page} ${styles.compact}`}>
      <div>
        <Button
          variant="outlined"
          startIcon={<ArrowBackRounded />}
          onClick={onClose}
          className={sharedStyles.secondaryButton}
        >
          {backLabel}
        </Button>
      </div>
      <header className={detailStyles.hero}>
        <span className={sharedStyles.headingIcon} aria-hidden="true">{icon}</span>
        <div className={detailStyles.heroBody}>
          <h1>
            <span className={detailStyles.ticketReference}>{title}</span>{" "}{name}
          </h1>
          <div className={detailStyles.badges}>
            <CatalogStatusBadge active={active} label={statusLabel} />
          </div>
        </div>
      </header>
    </div>
  );
}

interface CatalogNameFormProps {
  title: string;
  icon: ReactNode;
  name: string;
  nameLabel: string;
  nameError?: string;
  errorMessage: string;
  loading: boolean;
  cancelLabel: string;
  submitLabel: string;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onClose: () => void;
}

export function CatalogNameForm({
  title, icon, name, nameLabel, nameError, errorMessage, loading, cancelLabel, submitLabel,
  onChange, onSubmit, onClose,
}: CatalogNameFormProps) {
  const headingId = useId();

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      aria-labelledby={headingId}
      aria-busy={loading}
      className={`${sharedStyles.formPanel} ${styles.compact}`}
    >
      <header className={sharedStyles.formHeader}>
        <div className={sharedStyles.heading}>
          <span className={sharedStyles.headingIcon} aria-hidden="true">{icon}</span>
          <h1 id={headingId}>{title}</h1>
        </div>
      </header>

      <div className={sharedStyles.formFields}>
        <TextField
          className={sharedStyles.fullWidth}
          label={nameLabel}
          name="name"
          value={name}
          onChange={onChange}
          error={Boolean(nameError)}
          helperText={nameError}
          disabled={loading}
          fullWidth
        />
      </div>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <div className={sharedStyles.formActions}>
        <Button
          type="button"
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          className={sharedStyles.secondaryButton}
        >
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          variant="contained"
          disableElevation
          disabled={loading}
          className={sharedStyles.primaryButton}
        >
          {submitLabel}
        </Button>
      </div>
    </Box>
  );
}

interface CatalogStatusDialogProps {
  open: boolean;
  active: boolean;
  title: string;
  message?: string;
  errorMessage: string;
  saving: boolean;
  cancelLabel: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function CatalogStatusDialog({
  open, active, title, message, errorMessage, saving, cancelLabel, confirmLabel, onClose, onConfirm,
}: CatalogStatusDialogProps) {
  return (
    <TicketDialog
      open={open}
      onClose={onClose}
      title={title}
      icon={active ? <ToggleOffOutlined /> : <ToggleOnOutlined />}
      actions={(
        <>
          <Button
            type="button"
            variant="outlined"
            disabled={saving}
            onClick={onClose}
            className={sharedStyles.secondaryButton}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="contained"
            disableElevation
            disabled={saving}
            onClick={onConfirm}
            className={sharedStyles.primaryButton}
          >
            {confirmLabel}
          </Button>
        </>
      )}
    >
      <div className={styles.confirmation}>
        {message && <p>{message}</p>}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      </div>
    </TicketDialog>
  );
}
