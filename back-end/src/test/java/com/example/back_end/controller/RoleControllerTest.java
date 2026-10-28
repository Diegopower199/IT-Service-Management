package com.example.back_end.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.back_end.config.SecurityConfig;
import com.example.back_end.dtos.role.RoleRequest;
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
                new RoleResponse(1L, "ADMIN", true),
                new RoleResponse(2L, "TECHNICIAN", true));

        when(roleService.getAllRoles())
                .thenReturn(roles);

        mockMvc.perform(get("/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].idRole").value(1))
                .andExpect(jsonPath("$[0].name").value("ADMIN"))
                .andExpect(jsonPath("$[0].active").value(true))
                .andExpect(jsonPath("$[1].idRole").value(2))
                .andExpect(jsonPath("$[1].name").value("TECHNICIAN"))
                .andExpect(jsonPath("$[1].active").value(true));

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
    // GET ACTIVE ROLES
    // =========================================================

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldReturnActiveRoles() throws Exception {

        List<RoleResponse> roles = List.of(
                new RoleResponse(1L, "ADMIN", true),
                new RoleResponse(2L, "TECHNICIAN", true));

        when(roleService.getActiveRoles())
                .thenReturn(roles);

        mockMvc.perform(get("/roles/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("ADMIN"))
                .andExpect(jsonPath("$[0].active").value(true))
                .andExpect(jsonPath("$[1].name").value("TECHNICIAN"))
                .andExpect(jsonPath("$[1].active").value(true));

        verify(roleService).getActiveRoles();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldReturnEmptyListWhenNoActiveRolesExist() throws Exception {

        when(roleService.getActiveRoles())
                .thenReturn(List.of());

        mockMvc.perform(get("/roles/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(roleService).getActiveRoles();
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromGettingActiveRoles() throws Exception {

        mockMvc.perform(get("/roles/active"))
                .andExpect(status().isForbidden());

        verify(roleService, never())
                .getActiveRoles();
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromGettingActiveRoles() throws Exception {

        mockMvc.perform(get("/roles/active"))
                .andExpect(status().isForbidden());

        verify(roleService, never())
                .getActiveRoles();
    }

    // =========================================================
    // GET ROLE BY ID
    // =========================================================

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldReturnRoleById() throws Exception {

        RoleResponse role = new RoleResponse(1L, "ADMIN", true);

        when(roleService.getRoleById(1L))
                .thenReturn(role);

        mockMvc.perform(get("/roles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idRole").value(1))
                .andExpect(jsonPath("$.name").value("ADMIN"))
                .andExpect(jsonPath("$.active").value(true));

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

    // =========================================================
    // CREATE ROLE
    // =========================================================

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToCreateRole() throws Exception {

        RoleResponse response = new RoleResponse(4L, "MANAGER", true);

        when(roleService.createRole(any(RoleRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                post("/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "MANAGER"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idRole").value(4))
                .andExpect(jsonPath("$.name").value("MANAGER"))
                .andExpect(jsonPath("$.active").value(true));

        verify(roleService)
                .createRole(any(RoleRequest.class));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromCreatingRole() throws Exception {

        mockMvc.perform(
                post("/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "MANAGER"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(roleService, never())
                .createRole(any(RoleRequest.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromCreatingRole() throws Exception {

        mockMvc.perform(
                post("/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "MANAGER"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(roleService, never())
                .createRole(any(RoleRequest.class));
    }

    // =========================================================
    // UPDATE ROLE
    // =========================================================

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToUpdateRole() throws Exception {

        RoleResponse response = new RoleResponse(4L, "MANAGER", true);

        when(roleService.updateRole(
                any(RoleRequest.class),
                eq(4L)))
                .thenReturn(response);

        mockMvc.perform(
                put("/roles/4")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "MANAGER"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idRole").value(4))
                .andExpect(jsonPath("$.name").value("MANAGER"))
                .andExpect(jsonPath("$.active").value(true));

        verify(roleService)
                .updateRole(
                        any(RoleRequest.class),
                        eq(4L));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromUpdatingRole() throws Exception {

        mockMvc.perform(
                put("/roles/4")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "MANAGER"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(roleService, never())
                .updateRole(
                        any(RoleRequest.class),
                        any(Long.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromUpdatingRole() throws Exception {

        mockMvc.perform(
                put("/roles/4")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "MANAGER"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(roleService, never())
                .updateRole(
                        any(RoleRequest.class),
                        any(Long.class));
    }

    // =========================================================
    // DEACTIVATE ROLE
    // =========================================================

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToDeactivateRole() throws Exception {

        mockMvc.perform(
                patch("/roles/4/deactivate"))
                .andExpect(status().isNoContent());

        verify(roleService)
                .deactivateRole(4L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromDeactivatingRole() throws Exception {

        mockMvc.perform(
                patch("/roles/4/deactivate"))
                .andExpect(status().isForbidden());

        verify(roleService, never())
                .deactivateRole(4L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromDeactivatingRole() throws Exception {

        mockMvc.perform(
                patch("/roles/4/deactivate"))
                .andExpect(status().isForbidden());

        verify(roleService, never())
                .deactivateRole(4L);
    }

    // =========================================================
    // ACTIVATE ROLE
    // =========================================================

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToActivateRole() throws Exception {

        mockMvc.perform(
                patch("/roles/4/activate"))
                .andExpect(status().isNoContent());

        verify(roleService)
                .activateRole(4L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromActivatingRole() throws Exception {

        mockMvc.perform(
                patch("/roles/4/activate"))
                .andExpect(status().isForbidden());

        verify(roleService, never())
                .activateRole(4L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromActivatingRole() throws Exception {

        mockMvc.perform(
                patch("/roles/4/activate"))
                .andExpect(status().isForbidden());

        verify(roleService, never())
                .activateRole(4L);
    }
}