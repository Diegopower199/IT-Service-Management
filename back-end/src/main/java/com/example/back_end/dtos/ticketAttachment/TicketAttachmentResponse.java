package com.example.back_end.dtos.ticketAttachment;

import java.time.LocalDateTime;

import com.example.back_end.dtos.user.UserSummaryResponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketAttachmentResponse {

    private Long idAttachment;
    private Long ticketId;
    private UserSummaryResponse uploadedBy;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private LocalDateTime createdAt;
}
