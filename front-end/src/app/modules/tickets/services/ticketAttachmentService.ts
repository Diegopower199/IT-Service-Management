import api from "@/config/axios";

import type { TicketAttachmentResponse } from "@/types/ticketAttachmentTypes";

export const getTicketAttachments = async (
  ticketId: number,
): Promise<TicketAttachmentResponse[]> => {
  const response = await api.get<TicketAttachmentResponse[]>(
    `/tickets/${ticketId}/attachments`,
  );

  return response.data;
};

export const uploadTicketAttachment = async (
  ticketId: number,
  file: File,
): Promise<TicketAttachmentResponse> => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post<TicketAttachmentResponse>(
    `/tickets/${ticketId}/attachments`,
    formData,
  );

  return response.data;
};

export const previewTicketAttachment = async (
  ticketId: number,
  attachmentId: number,
): Promise<Blob> => {
  const response = await api.get<Blob>(
    `/tickets/${ticketId}/attachments/${attachmentId}/preview`,
    {
      responseType: "blob",
    },
  );

  return response.data;
};

export const downloadTicketAttachment = async (
  ticketId: number,
  attachmentId: number,
): Promise<Blob> => {
  const response = await api.get<Blob>(
    `/tickets/${ticketId}/attachments/${attachmentId}/download`,
    {
      responseType: "blob",
    },
  );

  return response.data;
};
