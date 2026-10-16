package com.example.back_end.dtos.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "The 'username' field is required")
    private String username;

    @NotBlank(message = "The 'email' field is required")
    @Email(message = "The 'email' field must contain a valid email address")
    private String email;

    @NotBlank(message = "The 'password' field is required")
    private String password;

    @NotBlank(message = "The 'firstName' field is required")
    private String firstName;

    @NotBlank(message = "The 'lastName' field is required")
    private String lastName;

    @NotNull(message = "The 'rol' field is required")
    private Long rol;

    @NotNull(message = "The 'department' field is required")
    private Long department;
}
