package com.example.back_end.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
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
import com.example.back_end.dtos.ticketComment.TicketCommentRequest;
import com.example.back_end.dtos.ticketComment.TicketCommentResponse;
import com.example.back_end.dtos.user.UserSummaryResponse;
import com.example.back_end.security.JwtAuthenticationFilter;
import com.example.back_end.security.JwtService;
import com.example.back_end.service.TicketCommentService;

@WebMvcTest(TicketCommentController.class)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class
})
class TicketCommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TicketCommentService ticketCommentService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    // =========================================================
    // GET COMMENTS BY TICKET ID
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnCommentsByTicketId()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketCommentResponse comment = new TicketCommentResponse(
                1L,
                1L,
                new UserSummaryResponse(
                        1L,
                        "ana"),
                "Public comment",
                false,
                now);

        when(ticketCommentService
                .getCommentsByTicketId(1L))
                .thenReturn(List.of(comment));

        mockMvc.perform(
                get("/ticket-comments/1"))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.length()")
                                .value(1))
                .andExpect(
                        jsonPath("$[0].idComment")
                                .value(1))
                .andExpect(
                        jsonPath("$[0].ticketId")
                                .value(1))
                .andExpect(
                        jsonPath("$[0].user.username")
                                .value("ana"))
                .andExpect(
                        jsonPath("$[0].comment")
                                .value("Public comment"))
                .andExpect(
                        jsonPath("$[0].internal")
                                .value(false));

        verify(ticketCommentService)
                .getCommentsByTicketId(1L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldAllowTechnicianToGetComments()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketCommentResponse comment = new TicketCommentResponse(
                1L,
                1L,
                new UserSummaryResponse(
                        2L,
                        "technician"),
                "Internal comment",
                true,
                now);

        when(ticketCommentService
                .getCommentsByTicketId(1L))
                .thenReturn(List.of(comment));

        mockMvc.perform(
                get("/ticket-comments/1"))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$[0].internal")
                                .value(true));

        verify(ticketCommentService)
                .getCommentsByTicketId(1L);
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToGetComments()
            throws Exception {

        when(ticketCommentService
                .getCommentsByTicketId(1L))
                .thenReturn(List.of());

        mockMvc.perform(
                get("/ticket-comments/1"))
                .andExpect(
                        status().isNoContent());

        verify(ticketCommentService)
                .getCommentsByTicketId(1L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnNoContentWhenTicketHasNoComments()
            throws Exception {

        when(ticketCommentService
                .getCommentsByTicketId(1L))
                .thenReturn(List.of());

        mockMvc.perform(
                get("/ticket-comments/1"))
                .andExpect(
                        status().isNoContent());

        verify(ticketCommentService)
                .getCommentsByTicketId(1L);
    }

    // =========================================================
    // CREATE COMMENT
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldCreatePublicComment()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketCommentResponse response = new TicketCommentResponse(
                1L,
                1L,
                new UserSummaryResponse(
                        1L,
                        "ana"),
                "My comment",
                false,
                now);

        when(ticketCommentService
                .createCommentForTicket(
                        eq(1L),
                        any(TicketCommentRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                post("/ticket-comments/1")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "comment": "My comment",
                                    "internal": false
                                }
                                """))
                .andExpect(
                        status().isCreated())
                .andExpect(
                        jsonPath("$.idComment")
                                .value(1))
                .andExpect(
                        jsonPath("$.ticketId")
                                .value(1))
                .andExpect(
                        jsonPath("$.user.username")
                                .value("ana"))
                .andExpect(
                        jsonPath("$.comment")
                                .value("My comment"))
                .andExpect(
                        jsonPath("$.internal")
                                .value(false));

        verify(ticketCommentService)
                .createCommentForTicket(
                        eq(1L),
                        any(TicketCommentRequest.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldAllowTechnicianToCreateInternalComment()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketCommentResponse response = new TicketCommentResponse(
                1L,
                1L,
                new UserSummaryResponse(
                        2L,
                        "technician"),
                "Internal technical note",
                true,
                now);

        when(ticketCommentService
                .createCommentForTicket(
                        eq(1L),
                        any(TicketCommentRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                post("/ticket-comments/1")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "comment": "Internal technical note",
                                    "internal": true
                                }
                                """))
                .andExpect(
                        status().isCreated())
                .andExpect(
                        jsonPath("$.internal")
                                .value(true))
                .andExpect(
                        jsonPath("$.comment")
                                .value("Internal technical note"));

        verify(ticketCommentService)
                .createCommentForTicket(
                        eq(1L),
                        any(TicketCommentRequest.class));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToCreateInternalComment()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketCommentResponse response = new TicketCommentResponse(
                1L,
                1L,
                new UserSummaryResponse(
                        1L,
                        "admin"),
                "Admin internal note",
                true,
                now);

        when(ticketCommentService
                .createCommentForTicket(
                        eq(1L),
                        any(TicketCommentRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                post("/ticket-comments/1")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "comment": "Admin internal note",
                                    "internal": true
                                }
                                """))
                .andExpect(
                        status().isCreated())
                .andExpect(
                        jsonPath("$.internal")
                                .value(true));

        verify(ticketCommentService)
                .createCommentForTicket(
                        eq(1L),
                        any(TicketCommentRequest.class));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnBadRequestWhenCommentIsBlank()
            throws Exception {

        mockMvc.perform(
                post("/ticket-comments/1")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "comment": "",
                                    "internal": false
                                }
                                """))
                .andExpect(
                        status().isBadRequest());

        verify(ticketCommentService, never())
                .createCommentForTicket(
                        any(Long.class),
                        any(TicketCommentRequest.class));
    }
}
