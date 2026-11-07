import api from "@/config/axios";

import type { TicketCommentAttachmentResponse } from "@/types/ticketCommentAttachmentTypes";

const getBaseUrl = (ticketId: number, commentId: number): string =>
  `/tickets/${ticketId}/comments/${commentId}/attachments`;

export const getTicketCommentAttachments = async (
  ticketId: number,
  commentId: number,
): Promise<TicketCommentAttachmentResponse[]> => {
  const response = await api.get<TicketCommentAttachmentResponse[]>(
    getBaseUrl(ticketId, commentId),
  );

  return response.data;
};

export const uploadTicketCommentAttachment = async (
  ticketId: number,
  commentId: number,
  file: File,
): Promise<TicketCommentAttachmentResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<TicketCommentAttachmentResponse>(
    getBaseUrl(ticketId, commentId),
    formData,
  );

  return response.data;
};

export const downloadTicketCommentAttachment = async (
  ticketId: number,
  commentId: number,
  attachmentId: number,
): Promise<Blob> => {
  const response = await api.get<Blob>(
    `${getBaseUrl(ticketId, commentId)}/${attachmentId}/download`,
    { responseType: "blob" },
  );

  return response.data;
};

export const previewTicketCommentAttachment = async (
  ticketId: number,
  commentId: number,
  attachmentId: number,
): Promise<Blob> => {
  const response = await api.get<Blob>(
    `${getBaseUrl(ticketId, commentId)}/${attachmentId}/preview`,
    { responseType: "blob" },
  );

  return response.data;
};
