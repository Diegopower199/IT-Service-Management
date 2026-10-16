package com.example.back_end.dtos.status;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusRequest {

    @NotBlank(message = "The 'name' field is required")
    private String name;
}
