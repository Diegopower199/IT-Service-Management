package com.example.back_end.dtos.ticket;

import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangePriorityRequest {

    @NotNull(message = "The 'priorityId' field is required")
    private Long priorityId;
}
