"use client";

import { useState } from "react";

import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useAuth } from "@/hooks/useAuth";

import { USER_ROLES } from "@/types/roleTypes";

import { createTicketComment } from "../../services/ticketCommentsService";

import { getApiError } from "@/utils/apiErrorUtils";

interface AddTicketCommentDialogProps {
  open: boolean;
  ticketId: number;
  onClose: () => void;
  onCommentsUpdated: () => void;
}

interface CommentForm {
  comment: string;
  internal: boolean;
}

export default function AddTicketCommentDialog({
  open,
  ticketId,
  onClose,
  onCommentsUpdated,
}: AddTicketCommentDialogProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState<CommentForm>({
    comment: "",
    internal: false,
  });

  const [savingComment, setSavingComment] = useState(false);

  const [requiredFieldsIncomplete, setRequiredFieldsIncomplete] = useState<
    Partial<Record<keyof CommentForm, string>>
  >({});

  const [errorMessage, setErrorMessage] = useState("");

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;

    const checked =
      event.target instanceof HTMLInputElement ? event.target.checked : false;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));

    setRequiredFieldsIncomplete((previousErrors) => ({
      ...previousErrors,
      [name]: undefined,
    }));
  };

  const validateRequiredFields = () => {
    const errorMissingFields: Partial<Record<keyof CommentForm, string>> = {};

    if (!formData.comment.trim()) {
      errorMissingFields.comment = "Please enter a comment.";
    }

    setRequiredFieldsIncomplete(errorMissingFields);

    return Object.keys(errorMissingFields).length !== 0;
  };

  const handleClose = () => {
    setFormData({
      comment: "",
      internal: false,
    });

    setRequiredFieldsIncomplete({});
    setErrorMessage("");

    onClose();
  };

  const handleConfirm = async () => {
    const requiredFieldsError = validateRequiredFields();

    if (requiredFieldsError) {
      return;
    }

    try {
      setSavingComment(true);
      setErrorMessage("");
      setRequiredFieldsIncomplete({});

      await createTicketComment(ticketId, {
        comment: formData.comment,
        internal:
          user?.rol === USER_ROLES.ADMIN || user?.rol === USER_ROLES.TECHNICIAN
            ? formData.internal
            : false,
      });

      onCommentsUpdated();

      handleClose();
    } catch (error) {
      console.error("Error creating ticket comment:", error);

      const apiError = getApiError(error);

      if (apiError?.errors) {
        setRequiredFieldsIncomplete({
          comment: apiError.errors.comment,
        });

        return;
      }

      setErrorMessage(apiError?.message ?? "Error creating comment.");
    } finally {
      setSavingComment(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          px: 3,
          pt: 3,
          pb: 2,
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 600,
          }}
        >
          Add Comment
        </Typography>

        <Typography
          variant="body2"
          component="p"
          color="text.secondary"
          sx={{
            mt: 0.5,
            mb: 0,
          }}
        >
          Add a comment to ticket #{ticketId}.
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            name="comment"
            label="Comment"
            multiline
            minRows={4}
            fullWidth
            value={formData.comment}
            onChange={handleFormChange}
            error={Boolean(requiredFieldsIncomplete.comment)}
            helperText={requiredFieldsIncomplete.comment}
            disabled={savingComment}
          />

          {(user?.rol === USER_ROLES.ADMIN ||
            user?.rol === USER_ROLES.TECHNICIAN) && (
            <FormControlLabel
              control={
                <Checkbox
                  name="internal"
                  checked={formData.internal}
                  onChange={handleFormChange}
                  disabled={savingComment}
                />
              }
              label="Internal comment"
            />
          )}

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          bgcolor: "action.hover",
        }}
      >
        <Button onClick={handleClose} disabled={savingComment} color="inherit">
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={savingComment}
          sx={{
            px: 3,
            borderRadius: 2,
          }}
        >
          {savingComment ? "Adding..." : "Add Comment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
