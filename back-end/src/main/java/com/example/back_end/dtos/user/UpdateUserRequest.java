package com.example.back_end.dtos.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    @NotBlank(message = "The 'username' field is required")
    private String username;

    @NotBlank(message = "The 'email' field is required")
    @Email(message = "The 'email' field must contain a valid email address")
    private String email;

    @NotBlank(message = "The 'firstName' field is required")
    private String firstName;

    @NotBlank(message = "The 'lastName' field is required")
    private String lastName;

    @NotNull(message = "The 'rolId' field is required")
    private Long rolId;

    @NotNull(message = "The 'departmentId' field is required")
    private Long departmentId;

    private boolean enabled;
}