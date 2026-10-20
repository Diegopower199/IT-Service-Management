package com.example.back_end.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.back_end.config.SecurityConfig;
import com.example.back_end.dtos.category.CategoryResponse;
import com.example.back_end.dtos.priority.PriorityResponse;
import com.example.back_end.dtos.status.StatusResponse;
import com.example.back_end.dtos.ticket.AssignTicketRequest;
import com.example.back_end.dtos.ticket.ChangePriorityRequest;
import com.example.back_end.dtos.ticket.ChangeStatusRequest;
import com.example.back_end.dtos.ticket.CreateTicketRequest;
import com.example.back_end.dtos.ticket.TicketResponse;
import com.example.back_end.dtos.ticket.UpdateTicketRequest;
import com.example.back_end.dtos.user.UserSummaryResponse;
import com.example.back_end.security.JwtAuthenticationFilter;
import com.example.back_end.security.JwtService;
import com.example.back_end.service.TicketService;

@WebMvcTest(TicketController.class)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class
})
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TicketService ticketService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    // =========================================================
    // GET ALL TICKETS
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToGetAllTickets()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketResponse ticket = new TicketResponse(
                1L,
                "Laptop broken",
                "Laptop does not start",
                now,
                now,
                new UserSummaryResponse(
                        1L,
                        "ana"),
                new UserSummaryResponse(
                        2L,
                        "carlos"),
                null,
                new CategoryResponse(
                        1L,
                        "Hardware",
                        true),
                new PriorityResponse(
                        2L,
                        "MEDIUM",
                        true),
                new StatusResponse(
                        1L,
                        "OPEN",
                        true));

        Page<TicketResponse> page = new PageImpl<>(List.of(ticket));

        when(ticketService.getAllTickets(
                any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(
                get("/tickets")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.content.length()")
                                .value(1))
                .andExpect(
                        jsonPath("$.content[0].idTicket")
                                .value(1))
                .andExpect(
                        jsonPath("$.content[0].title")
                                .value("Laptop broken"))
                .andExpect(
                        jsonPath("$.content[0].createdBy.username")
                                .value("ana"))
                .andExpect(
                        jsonPath("$.content[0].requestedFor.username")
                                .value("carlos"))
                .andExpect(
                        jsonPath("$.content[0].category.name")
                                .value("Hardware"))
                .andExpect(
                        jsonPath("$.content[0].priority.name")
                                .value("MEDIUM"))
                .andExpect(
                        jsonPath("$.content[0].status.name")
                                .value("OPEN"))
                .andExpect(
                        jsonPath("$.totalElements")
                                .value(1));

        verify(ticketService)
                .getAllTickets(any(Pageable.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldAllowTechnicianToGetAllTickets()
            throws Exception {

        when(ticketService.getAllTickets(
                any(Pageable.class)))
                .thenReturn(Page.empty());

        mockMvc.perform(
                get("/tickets")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.content.length()")
                                .value(0))
                .andExpect(
                        jsonPath("$.empty")
                                .value(true))
                .andExpect(
                        jsonPath("$.totalElements")
                                .value(0));

        verify(ticketService)
                .getAllTickets(any(Pageable.class));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromGettingAllTickets()
            throws Exception {

        mockMvc.perform(
                get("/tickets"))
                .andExpect(
                        status().isForbidden());

        verify(ticketService, never())
                .getAllTickets(any(Pageable.class));
    }

    // =========================================================
    // GET TICKET BY ID
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldAllowUserToGetTicketById()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketResponse ticket = new TicketResponse(
                1L,
                "Laptop broken",
                "Laptop does not start",
                now,
                now,
                new UserSummaryResponse(
                        1L,
                        "ana"),
                new UserSummaryResponse(
                        1L,
                        "ana"),
                null,
                new CategoryResponse(
                        1L,
                        "Hardware",
                        true),
                new PriorityResponse(
                        2L,
                        "MEDIUM",
                        true),
                new StatusResponse(
                        1L,
                        "OPEN",
                        true));

        when(ticketService.getTicketById(1L))
                .thenReturn(ticket);

        mockMvc.perform(
                get("/tickets/1"))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.idTicket")
                                .value(1))
                .andExpect(
                        jsonPath("$.title")
                                .value("Laptop broken"))
                .andExpect(
                        jsonPath("$.category.name")
                                .value("Hardware"));

        verify(ticketService)
                .getTicketById(1L);
    }

    // =========================================================
    // GET MY TICKETS
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnMyTickets()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketResponse ticket = new TicketResponse(
                1L,
                "Laptop broken",
                "Laptop does not start",
                now,
                now,
                new UserSummaryResponse(
                        1L,
                        "ana"),
                new UserSummaryResponse(
                        1L,
                        "ana"),
                null,
                new CategoryResponse(
                        1L,
                        "Hardware",
                        true),
                new PriorityResponse(
                        2L,
                        "MEDIUM",
                        true),
                new StatusResponse(
                        1L,
                        "OPEN",
                        true));

        Page<TicketResponse> page = new PageImpl<>(List.of(ticket));

        when(ticketService.getMyTickets(
                any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(
                get("/tickets/my")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.content.length()")
                                .value(1))
                .andExpect(
                        jsonPath("$.content[0].title")
                                .value("Laptop broken"))
                .andExpect(
                        jsonPath("$.totalElements")
                                .value(1));

        verify(ticketService)
                .getMyTickets(any(Pageable.class));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnEmptyPageWhenUserHasNoTickets()
            throws Exception {

        when(ticketService.getMyTickets(
                any(Pageable.class)))
                .thenReturn(Page.empty());

        mockMvc.perform(
                get("/tickets/my")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.content.length()")
                                .value(0))
                .andExpect(
                        jsonPath("$.empty")
                                .value(true))
                .andExpect(
                        jsonPath("$.totalElements")
                                .value(0));

        verify(ticketService)
                .getMyTickets(any(Pageable.class));
    }

    // =========================================================
    // CREATE TICKET
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldAllowUserToCreateTicket()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketResponse response = new TicketResponse(
                1L,
                "Laptop broken",
                "Laptop does not start",
                now,
                now,
                new UserSummaryResponse(
                        1L,
                        "ana"),
                new UserSummaryResponse(
                        2L,
                        "carlos"),
                null,
                new CategoryResponse(
                        1L,
                        "Hardware",
                        true),
                new PriorityResponse(
                        2L,
                        "MEDIUM",
                        true),
                new StatusResponse(
                        1L,
                        "OPEN",
                        true));

        when(ticketService.createTicket(
                any(CreateTicketRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                post("/tickets")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "Laptop broken",
                                    "description": "Laptop does not start",
                                    "requestedForId": 2,
                                    "categoryId": 1,
                                    "priorityId": 2
                                }
                                """))
                .andExpect(
                        status().isCreated())
                .andExpect(
                        jsonPath("$.idTicket")
                                .value(1))
                .andExpect(
                        jsonPath("$.title")
                                .value("Laptop broken"))
                .andExpect(
                        jsonPath("$.createdBy.username")
                                .value("ana"))
                .andExpect(
                        jsonPath("$.requestedFor.username")
                                .value("carlos"))
                .andExpect(
                        jsonPath("$.status.name")
                                .value("OPEN"));

        verify(ticketService)
                .createTicket(
                        any(CreateTicketRequest.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldAllowTechnicianToCreateTicket()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketResponse response = new TicketResponse(
                1L,
                "VPN problem",
                "Cannot connect",
                now,
                now,
                null,
                null,
                null,
                null,
                null,
                null);

        when(ticketService.createTicket(
                any(CreateTicketRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                post("/tickets")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "VPN problem",
                                    "description": "Cannot connect",
                                    "requestedForId": 2,
                                    "categoryId": 3,
                                    "priorityId": 2
                                }
                                """))
                .andExpect(
                        status().isCreated());

        verify(ticketService)
                .createTicket(
                        any(CreateTicketRequest.class));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToCreateTicket()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketResponse response = new TicketResponse(
                1L,
                "Security issue",
                "Suspicious login",
                now,
                now,
                null,
                null,
                null,
                null,
                null,
                null);

        when(ticketService.createTicket(
                any(CreateTicketRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                post("/tickets")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "Security issue",
                                    "description": "Suspicious login",
                                    "requestedForId": 2,
                                    "categoryId": 5,
                                    "priorityId": 3
                                }
                                """))
                .andExpect(
                        status().isCreated());

        verify(ticketService)
                .createTicket(
                        any(CreateTicketRequest.class));
    }

    // =========================================================
    // UPDATE TICKET
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldAllowUserToUpdateTicket()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketResponse response = new TicketResponse(
                1L,
                "Updated title",
                "Updated description",
                now,
                now,
                null,
                null,
                null,
                new CategoryResponse(
                        1L,
                        "Hardware",
                        true),
                null,
                null);

        when(ticketService.updateTicket(
                eq(1L),
                any(UpdateTicketRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                patch("/tickets/1")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "Updated title",
                                    "description": "Updated description",
                                    "categoryId": 1
                                }
                                """))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.title")
                                .value("Updated title"))
                .andExpect(
                        jsonPath("$.description")
                                .value("Updated description"))
                .andExpect(
                        jsonPath("$.category.name")
                                .value("Hardware"));

        verify(ticketService)
                .updateTicket(
                        eq(1L),
                        any(UpdateTicketRequest.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldAllowTechnicianToUpdateTicket()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketResponse response = new TicketResponse(
                1L,
                "Fixed issue",
                "Issue has been fixed",
                now,
                now,
                null,
                null,
                null,
                new CategoryResponse(
                        1L,
                        "Hardware",
                        true),
                null,
                null);

        when(ticketService.updateTicket(
                eq(1L),
                any(UpdateTicketRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                patch("/tickets/1")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "Fixed issue",
                                    "description": "Issue has been fixed",
                                    "categoryId": 1
                                }
                                """))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.title")
                                .value("Fixed issue"));

        verify(ticketService)
                .updateTicket(
                        eq(1L),
                        any(UpdateTicketRequest.class));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToUpdateTicket()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketResponse response = new TicketResponse(
                1L,
                "Admin update",
                "Updated by admin",
                now,
                now,
                null,
                null,
                null,
                null,
                null,
                null);

        when(ticketService.updateTicket(
                eq(1L),
                any(UpdateTicketRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                patch("/tickets/1")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "Admin update",
                                    "description": "Updated by admin"
                                }
                                """))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.title")
                                .value("Admin update"));

        verify(ticketService)
                .updateTicket(
                        eq(1L),
                        any(UpdateTicketRequest.class));
    }

    // =========================================================
    // ASSIGN TICKET
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToAssignTicket()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketResponse response = new TicketResponse(
                1L,
                "Laptop broken",
                "Laptop does not start",
                now,
                now,
                null,
                null,
                new UserSummaryResponse(
                        2L,
                        "tech"),
                null,
                null,
                null);

        when(ticketService.assignTicket(
                eq(1L),
                any(AssignTicketRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                patch("/tickets/1/assign")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "assignedToId": 2
                                }
                                """))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.assignedTo.username")
                                .value("tech"));

        verify(ticketService)
                .assignTicket(
                        eq(1L),
                        any(AssignTicketRequest.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldAllowTechnicianToAssignTicket()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketResponse response = new TicketResponse(
                1L,
                "Laptop broken",
                null,
                now,
                now,
                null,
                null,
                new UserSummaryResponse(
                        2L,
                        "tech"),
                null,
                null,
                null);

        when(ticketService.assignTicket(
                eq(1L),
                any(AssignTicketRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                patch("/tickets/1/assign")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "assignedToId": 2
                                }
                                """))
                .andExpect(
                        status().isOk());

        verify(ticketService)
                .assignTicket(
                        eq(1L),
                        any(AssignTicketRequest.class));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromAssigningTicket()
            throws Exception {

        mockMvc.perform(
                patch("/tickets/1/assign")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "assignedToId": 2
                                }
                                """))
                .andExpect(
                        status().isForbidden());

        verify(ticketService, never())
                .assignTicket(
                        any(Long.class),
                        any(AssignTicketRequest.class));
    }

    // =========================================================
    // CHANGE PRIORITY
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToChangePriority()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketResponse response = new TicketResponse(
                1L,
                "Laptop broken",
                null,
                now,
                now,
                null,
                null,
                null,
                null,
                new PriorityResponse(
                        3L,
                        "HIGH",
                        true),
                null);

        when(ticketService.changePriority(
                eq(1L),
                any(ChangePriorityRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                patch("/tickets/1/priority")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "priorityId": 3
                                }
                                """))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.priority.name")
                                .value("HIGH"));

        verify(ticketService)
                .changePriority(
                        eq(1L),
                        any(ChangePriorityRequest.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldAllowTechnicianToChangePriority()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketResponse response = new TicketResponse(
                1L,
                "Laptop broken",
                null,
                now,
                now,
                null,
                null,
                null,
                null,
                new PriorityResponse(
                        3L,
                        "HIGH",
                        true),
                null);

        when(ticketService.changePriority(
                eq(1L),
                any(ChangePriorityRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                patch("/tickets/1/priority")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "priorityId": 3
                                }
                                """))
                .andExpect(
                        status().isOk());

        verify(ticketService)
                .changePriority(
                        eq(1L),
                        any(ChangePriorityRequest.class));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromChangingPriority()
            throws Exception {

        mockMvc.perform(
                patch("/tickets/1/priority")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "priorityId": 3
                                }
                                """))
                .andExpect(
                        status().isForbidden());

        verify(ticketService, never())
                .changePriority(
                        any(Long.class),
                        any(ChangePriorityRequest.class));
    }

    // =========================================================
    // CHANGE STATUS
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToChangeStatus()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketResponse response = new TicketResponse(
                1L,
                "Laptop broken",
                null,
                now,
                now,
                null,
                null,
                null,
                null,
                null,
                new StatusResponse(
                        2L,
                        "IN_PROGRESS",
                        true));

        when(ticketService.changeStatus(
                eq(1L),
                any(ChangeStatusRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                patch("/tickets/1/status")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "statusId": 2
                                }
                                """))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.status.name")
                                .value("IN_PROGRESS"));

        verify(ticketService)
                .changeStatus(
                        eq(1L),
                        any(ChangeStatusRequest.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldAllowTechnicianToChangeStatus()
            throws Exception {

        LocalDateTime now = LocalDateTime.now();

        TicketResponse response = new TicketResponse(
                1L,
                "Laptop broken",
                null,
                now,
                now,
                null,
                null,
                null,
                null,
                null,
                new StatusResponse(
                        2L,
                        "IN_PROGRESS",
                        true));

        when(ticketService.changeStatus(
                eq(1L),
                any(ChangeStatusRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                patch("/tickets/1/status")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "statusId": 2
                                }
                                """))
                .andExpect(
                        status().isOk());

        verify(ticketService)
                .changeStatus(
                        eq(1L),
                        any(ChangeStatusRequest.class));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromChangingStatus()
            throws Exception {

        mockMvc.perform(
                patch("/tickets/1/status")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "statusId": 2
                                }
                                """))
                .andExpect(
                        status().isForbidden());

        verify(ticketService, never())
                .changeStatus(
                        any(Long.class),
                        any(ChangeStatusRequest.class));
    }
}