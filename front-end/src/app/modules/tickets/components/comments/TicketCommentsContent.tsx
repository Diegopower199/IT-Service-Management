"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";

import {
  Alert,
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CustomPagination from "@/components/ui/CustomPagination";
import Button from "@/components/ui/Button";

import { useAuth } from "@/hooks/useAuth";

import { USER_ROLES } from "@/types/roleTypes";
import type { TicketCommentResponse } from "@/types/ticketCommentTypes";

import { DEFAULT_TICKET_COMMENTS_SORT } from "@/utils/constans";
import { getApiError } from "@/utils/apiErrorUtils";

import {
  createTicketComment,
  getAllTicketsCommentsById,
} from "../../services/ticketCommentsService";

interface TicketCommentsContentProps {
  ticketId: number;
}

interface CommentForm {
  comment: string;
  internal: boolean;
}

export default function TicketCommentsContent({
  ticketId,
}: TicketCommentsContentProps) {
  const { user } = useAuth();

  const [ticketComments, setTicketComments] = useState<TicketCommentResponse[]>(
    [],
  );

  const [formData, setFormData] = useState<CommentForm>({
    comment: "",
    internal: false,
  });

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);
  const [savingComment, setSavingComment] = useState(false);

  const [requiredFieldsIncomplete, setRequiredFieldsIncomplete] = useState<
    Partial<Record<keyof CommentForm, string>>
  >({});

  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const canCreateInternalComment =
    user?.rol === USER_ROLES.ADMIN || user?.rol === USER_ROLES.TECHNICIAN;

  useEffect(() => {
    const loadTicketComments = async () => {
      try {
        setLoading(true);
        setLoadErrorMessage("");

        const response = await getAllTicketsCommentsById(
          ticketId,
          paginationModel.page,
          paginationModel.pageSize,
          DEFAULT_TICKET_COMMENTS_SORT,
        );

        setTicketComments(response.content);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error("Error loading ticket comments:", error);

        const apiError = getApiError(error);

        setLoadErrorMessage(
          apiError?.message ?? "Error loading ticket comments.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadTicketComments();
  }, [ticketId, paginationModel]);

  const handlePageChange = (newPage: number) => {
    setPaginationModel({
      page: newPage,
      pageSize: paginationModel.pageSize,
    });
  };

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
        internal: canCreateInternalComment ? formData.internal : false,
      });

      setFormData({
        comment: "",
        internal: false,
      });

      setRequiredFieldsIncomplete({});

      /*
       * Comments are sorted by createdAt ASC:
       * oldest comments first and newest comments last.
       *
       * Therefore, after creating a new comment,
       * we calculate the last page so the new comment is visible.
       */
      const newTotalElements = totalElements + 1;

      const lastPage =
        Math.ceil(newTotalElements / paginationModel.pageSize) - 1;

      if (paginationModel.page !== lastPage) {
        setPaginationModel({
          page: lastPage,
          pageSize: paginationModel.pageSize,
        });
      } else {
        /*
         * If we are already on the last page,
         * paginationModel does not change.
         *
         * Therefore, reload the current page manually.
         */
        try {
          const response = await getAllTicketsCommentsById(
            ticketId,
            lastPage,
            paginationModel.pageSize,
            DEFAULT_TICKET_COMMENTS_SORT,
          );

          setTicketComments(response.content);
          setTotalElements(response.totalElements);
        } catch (error) {
          console.error("Error reloading ticket comments:", error);

          const apiError = getApiError(error);

          setLoadErrorMessage(
            apiError?.message ?? "Error reloading ticket comments.",
          );
        }
      }
    } catch (error) {
      console.error("Error creating ticket comment:", error);

      const apiError = getApiError(error);

      if (apiError?.errors?.comment) {
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
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Ticket Comments
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ticket #{ticketId}
      </Typography>

      {loadErrorMessage && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
        >
          {loadErrorMessage}
        </Alert>
      )}

      {loading ? (
        <Typography color="text.secondary">Loading comments...</Typography>
      ) : ticketComments.length === 0 ? (
        <Typography color="text.secondary">
          No comments have been added yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {ticketComments.map((ticketComment) => (
            <Paper
              key={ticketComment.idComment}
              variant="outlined"
              sx={{
                p: 2,
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="subtitle1">
                    {ticketComment.user.username}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {dayjs(ticketComment.createdAt).format("DD/MM/YYYY HH:mm")}
                  </Typography>
                </Box>

                {ticketComment.internal && (
                  <Chip label="INTERNAL" size="small" variant="outlined" />
                )}
              </Stack>

              <Typography sx={{ mt: 2 }}>{ticketComment.comment}</Typography>
            </Paper>
          ))}

          <CustomPagination
            page={paginationModel.page}
            pageSize={paginationModel.pageSize}
            totalElements={totalElements}
            onPageChange={handlePageChange}
          />
        </Stack>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Stack spacing={2}>
          <TextField
            name="comment"
            label="Add comment"
            multiline
            minRows={3}
            fullWidth
            value={formData.comment}
            onChange={handleFormChange}
            error={Boolean(requiredFieldsIncomplete.comment)}
            helperText={requiredFieldsIncomplete.comment}
            disabled={savingComment}
          />

          {canCreateInternalComment && (
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

          <Button type="submit" variant="primary" disabled={savingComment}>
            {savingComment ? "Adding..." : "Add Comment"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
