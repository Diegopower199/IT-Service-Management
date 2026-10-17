package com.example.back_end.dtos.ticketComment;

import java.time.LocalDateTime;

import com.example.back_end.dtos.user.UserSummaryResponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketCommentResponse {

    private Long idComment;

    private Long ticketId;

    private UserSummaryResponse user;

    private String comment;

    private boolean internal;

    private LocalDateTime createdAt;
}
