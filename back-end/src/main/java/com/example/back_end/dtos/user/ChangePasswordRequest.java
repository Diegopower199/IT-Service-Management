package com.example.back_end.dtos.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {

    @NotBlank(message = "The 'currentPassword' field is required")
    private String currentPassword;

    @NotBlank(message = "The 'newPassword' field is required")
    @Size(min = 8, message = "The 'newPassword' field must contain at least 8 characters")
    private String newPassword;
}