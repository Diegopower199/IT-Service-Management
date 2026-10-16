package com.example.back_end.dtos.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Long rol;
    private Long department;
    private boolean enabled;
}
