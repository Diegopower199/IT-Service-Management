package com.example.back_end.dtos.ticketCommentAttachment;

import java.time.LocalDateTime;

import com.example.back_end.dtos.user.UserSummaryResponse;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response DTO containing the metadata of a file attached
 * to a ticket comment.
 *
 * File contents are stored in MongoDB GridFS, while metadata
 * and relationships are managed in MySQL.
 *
 * The internal MongoDB file identifier is intentionally
 * excluded from the API response.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TicketCommentAttachmentResponse {

    private Long idAttachment;
    private Long commentId;
    private UserSummaryResponse uploadedBy;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private LocalDateTime createdAt;
}
