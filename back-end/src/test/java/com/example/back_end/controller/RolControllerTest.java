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
import com.example.back_end.dtos.rol.RolRequest;
import com.example.back_end.dtos.rol.RolResponse;
import com.example.back_end.security.JwtAuthenticationFilter;
import com.example.back_end.security.JwtService;
import com.example.back_end.service.RolService;

@WebMvcTest(RolController.class)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class
})
class RolControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RolService rolService;

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

        List<RolResponse> roles = List.of(
                new RolResponse(1L, "ADMIN", true),
                new RolResponse(2L, "TECHNICIAN", true));

        when(rolService.getAllRoles())
                .thenReturn(roles);

        mockMvc.perform(get("/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].idRol").value(1))
                .andExpect(jsonPath("$[0].name").value("ADMIN"))
                .andExpect(jsonPath("$[0].active").value(true))
                .andExpect(jsonPath("$[1].idRol").value(2))
                .andExpect(jsonPath("$[1].name").value("TECHNICIAN"))
                .andExpect(jsonPath("$[1].active").value(true));

        verify(rolService).getAllRoles();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldReturnNoContentWhenNoRolesExist() throws Exception {

        when(rolService.getAllRoles())
                .thenReturn(List.of());

        mockMvc.perform(get("/roles"))
                .andExpect(status().isNoContent());

        verify(rolService).getAllRoles();
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromGettingAllRoles() throws Exception {

        mockMvc.perform(get("/roles"))
                .andExpect(status().isForbidden());

        verify(rolService, never())
                .getAllRoles();
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromGettingAllRoles() throws Exception {

        mockMvc.perform(get("/roles"))
                .andExpect(status().isForbidden());

        verify(rolService, never())
                .getAllRoles();
    }

    // =========================================================
    // GET ACTIVE ROLES
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldReturnActiveRoles() throws Exception {

        List<RolResponse> roles = List.of(
                new RolResponse(1L, "ADMIN", true),
                new RolResponse(2L, "TECHNICIAN", true));

        when(rolService.getActiveRoles())
                .thenReturn(roles);

        mockMvc.perform(get("/roles/actives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("ADMIN"))
                .andExpect(jsonPath("$[0].active").value(true))
                .andExpect(jsonPath("$[1].name").value("TECHNICIAN"))
                .andExpect(jsonPath("$[1].active").value(true));

        verify(rolService).getActiveRoles();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldReturnEmptyListWhenNoActiveRolesExist() throws Exception {

        when(rolService.getActiveRoles())
                .thenReturn(List.of());

        mockMvc.perform(get("/roles/actives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(rolService).getActiveRoles();
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromGettingActiveRoles() throws Exception {

        mockMvc.perform(get("/roles/actives"))
                .andExpect(status().isForbidden());

        verify(rolService, never())
                .getActiveRoles();
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromGettingActiveRoles() throws Exception {

        mockMvc.perform(get("/roles/actives"))
                .andExpect(status().isForbidden());

        verify(rolService, never())
                .getActiveRoles();
    }

    // =========================================================
    // GET ROL BY ID
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldReturnRolById() throws Exception {

        RolResponse rol = new RolResponse(1L, "ADMIN", true);

        when(rolService.getRolById(1L))
                .thenReturn(rol);

        mockMvc.perform(get("/roles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idRol").value(1))
                .andExpect(jsonPath("$.name").value("ADMIN"))
                .andExpect(jsonPath("$.active").value(true));

        verify(rolService).getRolById(1L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromGettingRolById() throws Exception {

        mockMvc.perform(get("/roles/1"))
                .andExpect(status().isForbidden());

        verify(rolService, never())
                .getRolById(1L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromGettingRolById() throws Exception {

        mockMvc.perform(get("/roles/1"))
                .andExpect(status().isForbidden());

        verify(rolService, never())
                .getRolById(1L);
    }

    // =========================================================
    // CREATE ROL
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToCreateRol() throws Exception {

        RolResponse response = new RolResponse(4L, "MANAGER", true);

        when(rolService.createRol(any(RolRequest.class)))
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
                .andExpect(jsonPath("$.idRol").value(4))
                .andExpect(jsonPath("$.name").value("MANAGER"))
                .andExpect(jsonPath("$.active").value(true));

        verify(rolService)
                .createRol(any(RolRequest.class));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromCreatingRol() throws Exception {

        mockMvc.perform(
                post("/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "MANAGER"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(rolService, never())
                .createRol(any(RolRequest.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromCreatingRol() throws Exception {

        mockMvc.perform(
                post("/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "MANAGER"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(rolService, never())
                .createRol(any(RolRequest.class));
    }

    // =========================================================
    // UPDATE ROL
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToUpdateRol() throws Exception {

        RolResponse response = new RolResponse(4L, "MANAGER", true);

        when(rolService.updateRol(
                any(RolRequest.class),
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
                .andExpect(jsonPath("$.idRol").value(4))
                .andExpect(jsonPath("$.name").value("MANAGER"))
                .andExpect(jsonPath("$.active").value(true));

        verify(rolService)
                .updateRol(
                        any(RolRequest.class),
                        eq(4L));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromUpdatingRol() throws Exception {

        mockMvc.perform(
                put("/roles/4")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "MANAGER"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(rolService, never())
                .updateRol(
                        any(RolRequest.class),
                        any(Long.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromUpdatingRol() throws Exception {

        mockMvc.perform(
                put("/roles/4")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "MANAGER"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(rolService, never())
                .updateRol(
                        any(RolRequest.class),
                        any(Long.class));
    }

    // =========================================================
    // DEACTIVATE ROL
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToDeactivateRol() throws Exception {

        mockMvc.perform(
                patch("/roles/4/deactivate"))
                .andExpect(status().isNoContent());

        verify(rolService)
                .deactivateRol(4L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromDeactivatingRol() throws Exception {

        mockMvc.perform(
                patch("/roles/4/deactivate"))
                .andExpect(status().isForbidden());

        verify(rolService, never())
                .deactivateRol(4L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromDeactivatingRol() throws Exception {

        mockMvc.perform(
                patch("/roles/4/deactivate"))
                .andExpect(status().isForbidden());

        verify(rolService, never())
                .deactivateRol(4L);
    }

    // =========================================================
    // ACTIVATE ROL
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToActivateRol() throws Exception {

        mockMvc.perform(
                patch("/roles/4/activate"))
                .andExpect(status().isNoContent());

        verify(rolService)
                .activateRol(4L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromActivatingRol() throws Exception {

        mockMvc.perform(
                patch("/roles/4/activate"))
                .andExpect(status().isForbidden());

        verify(rolService, never())
                .activateRol(4L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromActivatingRol() throws Exception {

        mockMvc.perform(
                patch("/roles/4/activate"))
                .andExpect(status().isForbidden());

        verify(rolService, never())
                .activateRol(4L);
    }
}