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
import com.example.back_end.dtos.priority.PriorityRequest;
import com.example.back_end.dtos.priority.PriorityResponse;
import com.example.back_end.security.JwtAuthenticationFilter;
import com.example.back_end.security.JwtService;
import com.example.back_end.service.PriorityService;

@WebMvcTest(PriorityController.class)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class
})
class PriorityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PriorityService priorityService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    // =========================================================
    // GET ALL PRIORITIES
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnAllPriorities() throws Exception {

        List<PriorityResponse> priorities = List.of(
                new PriorityResponse(1L, "LOW", true),
                new PriorityResponse(2L, "MEDIUM", true));

        when(priorityService.getAllPriorities())
                .thenReturn(priorities);

        mockMvc.perform(get("/priorities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].idPriority").value(1))
                .andExpect(jsonPath("$[0].name").value("LOW"))
                .andExpect(jsonPath("$[0].active").value(true))
                .andExpect(jsonPath("$[1].idPriority").value(2))
                .andExpect(jsonPath("$[1].name").value("MEDIUM"))
                .andExpect(jsonPath("$[1].active").value(true));

        verify(priorityService).getAllPriorities();
    }

    // =========================================================
    // GET ACTIVE PRIORITIES
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnActivePriorities() throws Exception {

        List<PriorityResponse> priorities = List.of(
                new PriorityResponse(1L, "LOW", true),
                new PriorityResponse(2L, "MEDIUM", true));

        when(priorityService.getActivePriorities())
                .thenReturn(priorities);

        mockMvc.perform(get("/priorities/actives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("LOW"))
                .andExpect(jsonPath("$[0].active").value(true))
                .andExpect(jsonPath("$[1].name").value("MEDIUM"))
                .andExpect(jsonPath("$[1].active").value(true));

        verify(priorityService).getActivePriorities();
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnEmptyListWhenNoActivePrioritiesExist() throws Exception {

        when(priorityService.getActivePriorities())
                .thenReturn(List.of());

        mockMvc.perform(get("/priorities/actives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(priorityService).getActivePriorities();
    }

    // =========================================================
    // GET PRIORITY BY ID
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnPriorityById() throws Exception {

        PriorityResponse priority = new PriorityResponse(1L, "LOW", true);

        when(priorityService.getPriorityById(1L))
                .thenReturn(priority);

        mockMvc.perform(get("/priorities/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idPriority").value(1))
                .andExpect(jsonPath("$.name").value("LOW"))
                .andExpect(jsonPath("$.active").value(true));

        verify(priorityService).getPriorityById(1L);
    }

    // =========================================================
    // CREATE PRIORITY
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToCreatePriority() throws Exception {

        PriorityResponse response = new PriorityResponse(1L, "LOW", true);

        when(priorityService.createPriority(
                any(PriorityRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                post("/priorities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "LOW"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idPriority").value(1))
                .andExpect(jsonPath("$.name").value("LOW"))
                .andExpect(jsonPath("$.active").value(true));

        verify(priorityService)
                .createPriority(any(PriorityRequest.class));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromCreatingPriority() throws Exception {

        mockMvc.perform(
                post("/priorities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "LOW"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(priorityService, never())
                .createPriority(any(PriorityRequest.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromCreatingPriority() throws Exception {

        mockMvc.perform(
                post("/priorities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "LOW"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(priorityService, never())
                .createPriority(any(PriorityRequest.class));
    }

    // =========================================================
    // UPDATE PRIORITY
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToUpdatePriority() throws Exception {

        PriorityResponse response = new PriorityResponse(1L, "MEDIUM", true);

        when(priorityService.updatePriority(
                any(PriorityRequest.class),
                eq(1L)))
                .thenReturn(response);

        mockMvc.perform(
                put("/priorities/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "MEDIUM"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idPriority").value(1))
                .andExpect(jsonPath("$.name").value("MEDIUM"))
                .andExpect(jsonPath("$.active").value(true));

        verify(priorityService)
                .updatePriority(
                        any(PriorityRequest.class),
                        eq(1L));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromUpdatingPriority() throws Exception {

        mockMvc.perform(
                put("/priorities/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "MEDIUM"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(priorityService, never())
                .updatePriority(
                        any(PriorityRequest.class),
                        any(Long.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromUpdatingPriority() throws Exception {

        mockMvc.perform(
                put("/priorities/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "MEDIUM"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(priorityService, never())
                .updatePriority(
                        any(PriorityRequest.class),
                        any(Long.class));
    }

    // =========================================================
    // DEACTIVATE PRIORITY
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToDeactivatePriority() throws Exception {

        mockMvc.perform(
                patch("/priorities/1/deactivate"))
                .andExpect(status().isNoContent());

        verify(priorityService)
                .deactivatePriority(1L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromDeactivatingPriority() throws Exception {

        mockMvc.perform(
                patch("/priorities/1/deactivate"))
                .andExpect(status().isForbidden());

        verify(priorityService, never())
                .deactivatePriority(1L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromDeactivatingPriority() throws Exception {

        mockMvc.perform(
                patch("/priorities/1/deactivate"))
                .andExpect(status().isForbidden());

        verify(priorityService, never())
                .deactivatePriority(1L);
    }

    // =========================================================
    // ACTIVATE PRIORITY
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToActivatePriority() throws Exception {

        mockMvc.perform(
                patch("/priorities/1/activate"))
                .andExpect(status().isNoContent());

        verify(priorityService)
                .activatePriority(1L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromActivatingPriority() throws Exception {

        mockMvc.perform(
                patch("/priorities/1/activate"))
                .andExpect(status().isForbidden());

        verify(priorityService, never())
                .activatePriority(1L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromActivatingPriority() throws Exception {

        mockMvc.perform(
                patch("/priorities/1/activate"))
                .andExpect(status().isForbidden());

        verify(priorityService, never())
                .activatePriority(1L);
    }
}
