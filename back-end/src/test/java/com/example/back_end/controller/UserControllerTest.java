package com.example.back_end.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.back_end.config.SecurityConfig;
import com.example.back_end.dtos.department.DepartmentResponse;
import com.example.back_end.dtos.rol.RolResponse;
import com.example.back_end.dtos.user.CreateUserRequest;
import com.example.back_end.dtos.user.UpdateUserRequest;
import com.example.back_end.dtos.user.UserResponse;
import com.example.back_end.security.JwtAuthenticationFilter;
import com.example.back_end.security.JwtService;
import com.example.back_end.service.UserService;

@WebMvcTest(UserController.class)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class
})
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    // =========================================================
    // GET ALL USERS
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldReturnAllUsers() throws Exception {

        List<UserResponse> users = List.of(
                createUserResponse(
                        1L,
                        "admin",
                        "admin@example.com"),
                createUserResponse(
                        2L,
                        "ana",
                        "ana@example.com"));

        Page<UserResponse> page = new PageImpl<>(users);

        when(userService.getAllUsers(
                any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(
                get("/users")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].idUser").value(1))
                .andExpect(jsonPath("$.content[0].username").value("admin"))
                .andExpect(jsonPath("$.content[0].email").value("admin@example.com"))
                .andExpect(jsonPath("$.content[1].idUser").value(2))
                .andExpect(jsonPath("$.content[1].username").value("ana"))
                .andExpect(jsonPath("$.totalElements").value(2));

        verify(userService)
                .getAllUsers(any(Pageable.class));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromGettingAllUsers() throws Exception {

        mockMvc.perform(get("/users"))
                .andExpect(status().isForbidden());

        verify(userService, never())
                .getAllUsers(any(Pageable.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromGettingAllUsers() throws Exception {

        mockMvc.perform(get("/users"))
                .andExpect(status().isForbidden());

        verify(userService, never())
                .getAllUsers(any(Pageable.class));
    }

    // =========================================================
    // GET USER BY ID
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldReturnUserById() throws Exception {

        UserResponse response = createUserResponse(
                1L,
                "admin",
                "admin@example.com");

        when(userService.getUserById(1L))
                .thenReturn(response);

        mockMvc.perform(get("/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idUser").value(1))
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.email").value("admin@example.com"))
                .andExpect(jsonPath("$.enabled").value(true))
                .andExpect(jsonPath("$.rol.name").value("ADMIN"))
                .andExpect(jsonPath("$.department.name").value("IT"));

        verify(userService)
                .getUserById(1L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromGettingUserById() throws Exception {

        mockMvc.perform(get("/users/1"))
                .andExpect(status().isForbidden());

        verify(userService, never())
                .getUserById(1L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromGettingUserById() throws Exception {

        mockMvc.perform(get("/users/1"))
                .andExpect(status().isForbidden());

        verify(userService, never())
                .getUserById(1L);
    }

    // =========================================================
    // CREATE USER
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToCreateUser() throws Exception {

        UserResponse response = createUserResponse(
                5L,
                "ana",
                "ana@example.com");

        when(userService.createUser(
                any(CreateUserRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "username": "ana",
                                    "password": "password123",
                                    "email": "ana@example.com",
                                    "firstName": "Ana",
                                    "lastName": "Garcia",
                                    "enabled": true,
                                    "rol": 3,
                                    "department": 2
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idUser").value(5))
                .andExpect(jsonPath("$.username").value("ana"))
                .andExpect(jsonPath("$.email").value("ana@example.com"));

        verify(userService)
                .createUser(any(CreateUserRequest.class));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromCreatingUser() throws Exception {

        mockMvc.perform(
                post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validUserJson()))
                .andExpect(status().isForbidden());

        verify(userService, never())
                .createUser(any(CreateUserRequest.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromCreatingUser() throws Exception {

        mockMvc.perform(
                post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validUserJson()))
                .andExpect(status().isForbidden());

        verify(userService, never())
                .createUser(any(CreateUserRequest.class));
    }

    // =========================================================
    // UPDATE USER
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToUpdateUser() throws Exception {

        UserResponse response = createUserResponse(
                5L,
                "ana",
                "ana@example.com");

        when(userService.updateUser(
                any(UpdateUserRequest.class),
                eq(5L)))
                .thenReturn(response);

        mockMvc.perform(
                put("/users/5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validUserJson()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idUser").value(5))
                .andExpect(jsonPath("$.username").value("ana"))
                .andExpect(jsonPath("$.email").value("ana@example.com"));

        verify(userService)
                .updateUser(
                        any(UpdateUserRequest.class),
                        eq(5L));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromUpdatingUser() throws Exception {

        mockMvc.perform(
                put("/users/5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validUserJson()))
                .andExpect(status().isForbidden());

        verify(userService, never())
                .updateUser(
                        any(UpdateUserRequest.class),
                        any(Long.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromUpdatingUser() throws Exception {

        mockMvc.perform(
                put("/users/5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validUserJson()))
                .andExpect(status().isForbidden());

        verify(userService, never())
                .updateUser(
                        any(UpdateUserRequest.class),
                        any(Long.class));
    }

    // =========================================================
    // HELPERS
    // =========================================================
    private UserResponse createUserResponse(
            Long id,
            String username,
            String email) {

        RolResponse rol = new RolResponse(
                1L,
                "ADMIN",
                true);

        DepartmentResponse department = new DepartmentResponse(
                1L,
                "IT",
                true);

        return new UserResponse(
                id,
                username,
                email,
                "Test",
                "User",
                true,
                rol,
                department);
    }

    private String validUserJson() {

        return """
                {
                    "username": "ana",
                    "password": "password123",
                    "email": "ana@example.com",
                    "firstName": "Ana",
                    "lastName": "Garcia",
                    "enabled": true,
                    "rol": 3,
                    "department": 2
                }
                """;
    }
}