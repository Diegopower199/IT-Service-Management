import type { UserSummaryResponse } from "./userTypes";

export interface TicketAttachmentResponse {
  idAttachment: number;
  ticketId: number;
  uploadedBy: UserSummaryResponse;
  fileName: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}
