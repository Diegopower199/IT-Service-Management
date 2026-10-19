package com.example.back_end.dtos.ticketHistory;

import java.time.LocalDateTime;

import com.example.back_end.dtos.user.UserSummaryResponse;
import com.example.back_end.enums.TicketHistoryAction;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketHistoryResponse {

    private Long idHistory;

    private Long ticketId;

    private UserSummaryResponse user;

    private TicketHistoryAction action;

    private String fieldName;

    private String oldValue;

    private String newValue;

    private LocalDateTime createdAt;
}
