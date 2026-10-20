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
import com.example.back_end.dtos.status.StatusRequest;
import com.example.back_end.dtos.status.StatusResponse;
import com.example.back_end.security.JwtAuthenticationFilter;
import com.example.back_end.security.JwtService;
import com.example.back_end.service.StatusService;

@WebMvcTest(StatusController.class)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class
})
class StatusControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StatusService statusService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    // =========================================================
    // GET ALL STATUSES
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnAllStatuses() throws Exception {

        List<StatusResponse> statuses = List.of(
                new StatusResponse(1L, "OPEN", true),
                new StatusResponse(2L, "IN_PROGRESS", true));

        when(statusService.getAllStatuses())
                .thenReturn(statuses);

        mockMvc.perform(get("/statuses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].idStatus").value(1))
                .andExpect(jsonPath("$[0].name").value("OPEN"))
                .andExpect(jsonPath("$[0].active").value(true))
                .andExpect(jsonPath("$[1].idStatus").value(2))
                .andExpect(jsonPath("$[1].name").value("IN_PROGRESS"))
                .andExpect(jsonPath("$[1].active").value(true));

        verify(statusService).getAllStatuses();
    }

    // =========================================================
    // GET ACTIVE STATUSES
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnActiveStatuses() throws Exception {

        List<StatusResponse> statuses = List.of(
                new StatusResponse(1L, "OPEN", true),
                new StatusResponse(2L, "IN_PROGRESS", true));

        when(statusService.getActiveStatuses())
                .thenReturn(statuses);

        mockMvc.perform(get("/statuses/actives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("OPEN"))
                .andExpect(jsonPath("$[0].active").value(true))
                .andExpect(jsonPath("$[1].name").value("IN_PROGRESS"))
                .andExpect(jsonPath("$[1].active").value(true));

        verify(statusService).getActiveStatuses();
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnEmptyListWhenNoActiveStatusesExist() throws Exception {

        when(statusService.getActiveStatuses())
                .thenReturn(List.of());

        mockMvc.perform(get("/statuses/actives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(statusService).getActiveStatuses();
    }

    // =========================================================
    // GET STATUS BY ID
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnStatusById() throws Exception {

        StatusResponse statusResponse = new StatusResponse(1L, "OPEN", true);

        when(statusService.getStatusById(1L))
                .thenReturn(statusResponse);

        mockMvc.perform(get("/statuses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idStatus").value(1))
                .andExpect(jsonPath("$.name").value("OPEN"))
                .andExpect(jsonPath("$.active").value(true));

        verify(statusService).getStatusById(1L);
    }

    // =========================================================
    // CREATE STATUS
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToCreateStatus() throws Exception {

        StatusResponse response = new StatusResponse(1L, "OPEN", true);

        when(statusService.createStatus(
                any(StatusRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                post("/statuses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "OPEN"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idStatus").value(1))
                .andExpect(jsonPath("$.name").value("OPEN"))
                .andExpect(jsonPath("$.active").value(true));

        verify(statusService)
                .createStatus(any(StatusRequest.class));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromCreatingStatus() throws Exception {

        mockMvc.perform(
                post("/statuses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "OPEN"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(statusService, never())
                .createStatus(any(StatusRequest.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromCreatingStatus() throws Exception {

        mockMvc.perform(
                post("/statuses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "OPEN"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(statusService, never())
                .createStatus(any(StatusRequest.class));
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToUpdateStatus() throws Exception {

        StatusResponse response = new StatusResponse(1L, "IN_PROGRESS", true);

        when(statusService.updateStatus(
                any(StatusRequest.class),
                eq(1L)))
                .thenReturn(response);

        mockMvc.perform(
                put("/statuses/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "IN_PROGRESS"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idStatus").value(1))
                .andExpect(jsonPath("$.name").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.active").value(true));

        verify(statusService)
                .updateStatus(
                        any(StatusRequest.class),
                        eq(1L));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromUpdatingStatus() throws Exception {

        mockMvc.perform(
                put("/statuses/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "IN_PROGRESS"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(statusService, never())
                .updateStatus(
                        any(StatusRequest.class),
                        any(Long.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromUpdatingStatus() throws Exception {

        mockMvc.perform(
                put("/statuses/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "IN_PROGRESS"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(statusService, never())
                .updateStatus(
                        any(StatusRequest.class),
                        any(Long.class));
    }

    // =========================================================
    // DEACTIVATE STATUS
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToDeactivateStatus() throws Exception {

        mockMvc.perform(
                patch("/statuses/1/deactivate"))
                .andExpect(status().isNoContent());

        verify(statusService)
                .deactivateStatus(1L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromDeactivatingStatus() throws Exception {

        mockMvc.perform(
                patch("/statuses/1/deactivate"))
                .andExpect(status().isForbidden());

        verify(statusService, never())
                .deactivateStatus(1L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromDeactivatingStatus() throws Exception {

        mockMvc.perform(
                patch("/statuses/1/deactivate"))
                .andExpect(status().isForbidden());

        verify(statusService, never())
                .deactivateStatus(1L);
    }

    // =========================================================
    // ACTIVATE STATUS
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToActivateStatus() throws Exception {

        mockMvc.perform(
                patch("/statuses/1/activate"))
                .andExpect(status().isNoContent());

        verify(statusService)
                .activateStatus(1L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromActivatingStatus() throws Exception {

        mockMvc.perform(
                patch("/statuses/1/activate"))
                .andExpect(status().isForbidden());

        verify(statusService, never())
                .activateStatus(1L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromActivatingStatus() throws Exception {

        mockMvc.perform(
                patch("/statuses/1/activate"))
                .andExpect(status().isForbidden());

        verify(statusService, never())
                .activateStatus(1L);
    }
}
