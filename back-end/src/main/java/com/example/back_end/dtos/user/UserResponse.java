package com.example.back_end.dtos.user;

import com.example.back_end.dtos.department.DepartmentResponse;
import com.example.back_end.dtos.role.RoleResponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long idUser;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private boolean enabled;
    private RoleResponse role;
    private DepartmentResponse department;
}
