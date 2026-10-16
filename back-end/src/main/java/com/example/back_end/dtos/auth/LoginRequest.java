package com.example.back_end.dtos.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "The 'username' field is required")
    private String username;

    @NotBlank(message = "The 'password' field is required")
    private String password;
}
