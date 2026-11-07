import type { UserSummaryResponse } from "./userTypes";

export interface TicketCommentAttachmentResponse {
  idAttachment: number;
  commentId: number;
  uploadedBy: UserSummaryResponse;
  fileName: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}
