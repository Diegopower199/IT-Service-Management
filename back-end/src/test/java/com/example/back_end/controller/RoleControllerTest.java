package com.example.back_end.controller;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.back_end.config.SecurityConfig;
import com.example.back_end.dtos.role.RoleResponse;
import com.example.back_end.security.JwtAuthenticationFilter;
import com.example.back_end.security.JwtService;
import com.example.back_end.service.RoleService;

@WebMvcTest(RoleController.class)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class
})
class RoleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RoleService roleService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    // =========================================================
    // GET ALL ROLES
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldReturnAllRoles() throws Exception {

        List<RoleResponse> roles = List.of(
                new RoleResponse(1L, "ADMIN"),
                new RoleResponse(2L, "TECHNICIAN"));

        when(roleService.getAllRoles())
                .thenReturn(roles);

        mockMvc.perform(get("/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].idRole").value(1))
                .andExpect(jsonPath("$[0].name").value("ADMIN"))
                .andExpect(jsonPath("$[1].idRole").value(2))
                .andExpect(jsonPath("$[1].name").value("TECHNICIAN"));

        verify(roleService).getAllRoles();
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromGettingAllRoles() throws Exception {

        mockMvc.perform(get("/roles"))
                .andExpect(status().isForbidden());

        verify(roleService, never())
                .getAllRoles();
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromGettingAllRoles() throws Exception {

        mockMvc.perform(get("/roles"))
                .andExpect(status().isForbidden());

        verify(roleService, never())
                .getAllRoles();
    }

    // =========================================================
    // GET ROLE BY ID
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldReturnRoleById() throws Exception {

        RoleResponse role = new RoleResponse(1L, "ADMIN");

        when(roleService.getRoleById(1L))
                .thenReturn(role);

        mockMvc.perform(get("/roles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idRole").value(1))
                .andExpect(jsonPath("$.name").value("ADMIN"));

        verify(roleService).getRoleById(1L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromGettingRoleById() throws Exception {

        mockMvc.perform(get("/roles/1"))
                .andExpect(status().isForbidden());

        verify(roleService, never())
                .getRoleById(1L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromGettingRoleById() throws Exception {

        mockMvc.perform(get("/roles/1"))
                .andExpect(status().isForbidden());

        verify(roleService, never())
                .getRoleById(1L);
    }

}