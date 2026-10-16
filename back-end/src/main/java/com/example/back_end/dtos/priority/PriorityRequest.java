package com.example.back_end.dtos.priority;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriorityRequest {

    @NotBlank(message = "The 'name' field is required")
    private String name;
}