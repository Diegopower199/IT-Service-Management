package com.example.back_end.dtos.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTicketRequest {

    @NotBlank(message = "The 'title' field is required")
    private String title;

    private String description;

    @NotNull(message = "The 'requestedForId' field is required")
    private Long requestedForId;

    @NotNull(message = "The 'categoryId' field is required")
    private Long categoryId;

    @NotNull(message = "The 'priorityId' field is required")
    private Long priorityId;
}
