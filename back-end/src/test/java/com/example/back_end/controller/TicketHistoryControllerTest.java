package com.example.back_end.controller;

import static org.mockito.ArgumentMatchers.any;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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

        Page<TicketHistoryResponse> page = new PageImpl<>(List.of(history));

        when(ticketHistoryService
                .getAllHistory(any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(
                get("/ticket-history")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sort", "createdAt,desc"))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.content.length()")
                                .value(1))
                .andExpect(
                        jsonPath("$.content[0].idHistory")
                                .value(1))
                .andExpect(
                        jsonPath("$.content[0].ticketId")
                                .value(10))
                .andExpect(
                        jsonPath("$.content[0].user.username")
                                .value("admin"))
                .andExpect(
                        jsonPath("$.content[0].action")
                                .value("STATUS_CHANGED"))
                .andExpect(
                        jsonPath("$.content[0].fieldName")
                                .value("status"))
                .andExpect(
                        jsonPath("$.content[0].oldValue")
                                .value("OPEN"))
                .andExpect(
                        jsonPath("$.content[0].newValue")
                                .value("IN_PROGRESS"))
                .andExpect(
                        jsonPath("$.totalElements")
                                .value(1));

        verify(ticketHistoryService)
                .getAllHistory(any(Pageable.class));
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
                .getAllHistory(any(Pageable.class));
    }
}
