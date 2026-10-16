package com.example.back_end.dtos.ticket;

import java.time.LocalDateTime;

import com.example.back_end.dtos.category.CategoryResponse;
import com.example.back_end.dtos.priority.PriorityResponse;
import com.example.back_end.dtos.status.StatusResponse;
import com.example.back_end.dtos.user.UserSummaryResponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {

    private Long idTicket;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;

    private UserSummaryResponse createdBy;
    private UserSummaryResponse requestedFor;
    private UserSummaryResponse assignedTo;

    private CategoryResponse category;
    private PriorityResponse priority;
    private StatusResponse status;
}
