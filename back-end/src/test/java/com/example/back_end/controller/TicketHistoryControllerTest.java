package com.example.back_end.controller;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
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
import com.example.back_end.dtos.ticketHistory.TicketHistoryResponse;
import com.example.back_end.dtos.user.UserSummaryResponse;
import com.example.back_end.enums.TicketHistoryAction;
import com.example.back_end.security.JwtAuthenticationFilter;
import com.example.back_end.security.JwtService;
import com.example.back_end.service.TicketHistoryService;

@WebMvcTest(TicketHistoryController.class)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class
})
class TicketHistoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TicketHistoryService ticketHistoryService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    // =========================================================
    // GET ALL HISTORY
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToGetAllHistory()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketHistoryResponse history = new TicketHistoryResponse(
                1L,
                10L,
                new UserSummaryResponse(
                        1L,
                        "admin"),
                TicketHistoryAction.STATUS_CHANGED,
                "status",
                "OPEN",
                "IN_PROGRESS",
                now);

        when(ticketHistoryService
                .getAllHistory())
                .thenReturn(List.of(history));

        mockMvc.perform(
                get("/ticket-history"))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.length()")
                                .value(1))
                .andExpect(
                        jsonPath("$[0].idHistory")
                                .value(1))
                .andExpect(
                        jsonPath("$[0].ticketId")
                                .value(10))
                .andExpect(
                        jsonPath("$[0].user.username")
                                .value("admin"))
                .andExpect(
                        jsonPath("$[0].action")
                                .value("STATUS_CHANGED"))
                .andExpect(
                        jsonPath("$[0].fieldName")
                                .value("status"))
                .andExpect(
                        jsonPath("$[0].oldValue")
                                .value("OPEN"))
                .andExpect(
                        jsonPath("$[0].newValue")
                                .value("IN_PROGRESS"));

        verify(ticketHistoryService)
                .getAllHistory();
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldAllowTechnicianToGetAllHistory()
            throws Exception {

        when(ticketHistoryService
                .getAllHistory())
                .thenReturn(List.of());

        mockMvc.perform(
                get("/ticket-history"))
                .andExpect(
                        status().isNoContent());

        verify(ticketHistoryService)
                .getAllHistory();
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromGettingAllHistory()
            throws Exception {

        mockMvc.perform(
                get("/ticket-history"))
                .andExpect(
                        status().isForbidden());

        verify(ticketHistoryService, never())
                .getAllHistory();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldReturnNoContentWhenHistoryIsEmpty()
            throws Exception {

        when(ticketHistoryService
                .getAllHistory())
                .thenReturn(List.of());

        mockMvc.perform(
                get("/ticket-history"))
                .andExpect(
                        status().isNoContent());

        verify(ticketHistoryService)
                .getAllHistory();
    }

    // =========================================================
    // GET HISTORY BY ID
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToGetHistoryById()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketHistoryResponse history = new TicketHistoryResponse(
                1L,
                10L,
                new UserSummaryResponse(
                        1L,
                        "admin"),
                TicketHistoryAction.PRIORITY_CHANGED,
                "priority",
                "MEDIUM",
                "HIGH",
                now);

        when(ticketHistoryService
                .getHistoryById(1L))
                .thenReturn(history);

        mockMvc.perform(
                get("/ticket-history/1"))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.idHistory")
                                .value(1))
                .andExpect(
                        jsonPath("$.ticketId")
                                .value(10))
                .andExpect(
                        jsonPath("$.user.username")
                                .value("admin"))
                .andExpect(
                        jsonPath("$.action")
                                .value("PRIORITY_CHANGED"))
                .andExpect(
                        jsonPath("$.fieldName")
                                .value("priority"))
                .andExpect(
                        jsonPath("$.oldValue")
                                .value("MEDIUM"))
                .andExpect(
                        jsonPath("$.newValue")
                                .value("HIGH"));

        verify(ticketHistoryService)
                .getHistoryById(1L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldAllowTechnicianToGetHistoryById()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketHistoryResponse history = new TicketHistoryResponse(
                1L,
                10L,
                new UserSummaryResponse(
                        2L,
                        "technician"),
                TicketHistoryAction.ASSIGNED,
                "assignedTo",
                null,
                "technician",
                now);

        when(ticketHistoryService
                .getHistoryById(1L))
                .thenReturn(history);

        mockMvc.perform(
                get("/ticket-history/1"))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.action")
                                .value("ASSIGNED"))
                .andExpect(
                        jsonPath("$.newValue")
                                .value("technician"));

        verify(ticketHistoryService)
                .getHistoryById(1L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromGettingHistoryById()
            throws Exception {

        mockMvc.perform(
                get("/ticket-history/1"))
                .andExpect(
                        status().isForbidden());

        verify(ticketHistoryService, never())
                .getHistoryById(1L);
    }
}
