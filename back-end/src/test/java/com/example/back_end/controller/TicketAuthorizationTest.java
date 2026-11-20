package com.example.back_end.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.back_end.enums.RoleName;
import com.example.back_end.exception.GlobalExceptionHandler;
import com.example.back_end.model.RoleModel;
import com.example.back_end.model.TicketCommentModel;
import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.CategoryRepository;
import com.example.back_end.repository.PriorityRepository;
import com.example.back_end.repository.StatusRepository;
import com.example.back_end.repository.TicketAttachmentRepository;
import com.example.back_end.repository.TicketCommentAttachmentRepository;
import com.example.back_end.repository.TicketCommentRepository;
import com.example.back_end.repository.TicketHistoryRepository;
import com.example.back_end.repository.TicketRepository;
import com.example.back_end.repository.UserRepository;
import com.example.back_end.service.MongoFileStorageService;
import com.example.back_end.service.TicketAttachmentService;
import com.example.back_end.service.TicketCommentAttachmentService;
import com.example.back_end.service.TicketCommentService;
import com.example.back_end.service.TicketHistoryService;
import com.example.back_end.service.TicketService;

class TicketAuthorizationTest {

    private final TicketRepository tickets = mock(TicketRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final TicketCommentRepository comments = mock(TicketCommentRepository.class);
    private final TicketHistoryRepository historyEntries = mock(TicketHistoryRepository.class);
    private final TicketAttachmentRepository ticketFiles = mock(TicketAttachmentRepository.class);
    private final TicketCommentAttachmentRepository commentFiles = mock(TicketCommentAttachmentRepository.class);
    private final MongoFileStorageService storage = mock(MongoFileStorageService.class);
    private final UserModel technician = user(1L, "technician", RoleName.TECHNICIAN);
    private final UserModel otherTechnician = user(2L, "other-technician", RoleName.TECHNICIAN);
    private final UserModel reporter = user(3L, "reporter", RoleName.USER);
    private final TicketModel ticket = new TicketModel();
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        ticket.setIdTicket(12L);
        ticket.setTitle("Private ticket title");
        ticket.setCreatedBy(reporter);
        ticket.setRequestedFor(reporter);
        ticket.setAssignedTo(otherTechnician);
        when(tickets.findById(12L)).thenReturn(Optional.of(ticket));
        signIn(technician);

        TicketHistoryService history = new TicketHistoryService(historyEntries, tickets, users);
        TicketService ticketService = new TicketService(tickets, users, mock(CategoryRepository.class),
                mock(PriorityRepository.class), mock(StatusRepository.class), history);
        mvc = MockMvcBuilders.standaloneSetup(
                new TicketController(ticketService),
                new TicketCommentController(new TicketCommentService(comments, tickets, users)),
                new TicketHistoryController(history),
                new TicketAttachmentController(new TicketAttachmentService(ticketFiles, tickets, users, storage)),
                new TicketCommentAttachmentController(new TicketCommentAttachmentService(
                        commentFiles, comments, tickets, users, storage)))
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @ParameterizedTest
    @ValueSource(strings = { "/tickets/12", "/ticket-comments/ticket/12", "/ticket-history/ticket/12",
            "/tickets/12/attachments", "/tickets/12/attachments/30/preview", "/tickets/12/attachments/30/download",
            "/tickets/12/comments/25/attachments", "/tickets/12/comments/25/attachments/30/preview",
            "/tickets/12/comments/25/attachments/30/download" })
    void technicianCannotReadAnotherTechniciansTicketResources(String uri) throws Exception {
        mvc.perform(get(uri)).andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"))
                .andExpect(jsonPath("$.title").doesNotExist());

        verifyNoInteractions(comments, historyEntries, ticketFiles, commentFiles, storage);
    }

    @Test
    void unrelatedUserCannotReadTicketOrRelatedResources() throws Exception {
        signIn(user(4L, "unrelated", RoleName.USER));

        for (String uri : List.of("/tickets/12", "/ticket-comments/ticket/12", "/ticket-history/ticket/12",
                "/tickets/12/attachments", "/tickets/12/comments/25/attachments")) {
            mvc.perform(get(uri)).andExpect(status().isForbidden());
        }
        verifyNoInteractions(comments, historyEntries, ticketFiles, commentFiles, storage);
    }

    @Test
    void technicianCannotWriteToAnotherTechniciansTicket() throws Exception {
        mvc.perform(patch("/tickets/12").contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Changed\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/tickets/12/assign").contentType(MediaType.APPLICATION_JSON).content("{\"assignedToId\":1}"))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/tickets/12/priority").contentType(MediaType.APPLICATION_JSON).content("{\"priorityId\":1}"))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/tickets/12/status").contentType(MediaType.APPLICATION_JSON).content("{\"statusId\":1}"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/ticket-comments/ticket/12").contentType(MediaType.APPLICATION_JSON)
                .content("{\"comment\":\"Attempted write\",\"internal\":true}"))
                .andExpect(status().isForbidden());
        mvc.perform(multipart("/tickets/12/attachments").file(pdf())).andExpect(status().isForbidden());
        mvc.perform(multipart("/tickets/12/comments/25/attachments").file(pdf())).andExpect(status().isForbidden());

        verify(tickets, never()).save(any());
        verifyNoInteractions(comments, historyEntries, ticketFiles, commentFiles, storage);
    }

    @ParameterizedTest
    @ValueSource(booleans = { true, false })
    void technicianCanReadAssignedAndUnassignedTicketResources(boolean assigned) throws Exception {
        ticket.setAssignedTo(assigned ? technician : null);
        when(comments.findByTicket(eq(ticket), any())).thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));
        when(historyEntries.findByTicket(eq(ticket), any())).thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));
        when(comments.findById(25L)).thenReturn(Optional.of(comment(false)));

        for (String uri : List.of("/tickets/12", "/ticket-comments/ticket/12", "/ticket-history/ticket/12",
                "/tickets/12/attachments", "/tickets/12/comments/25/attachments")) {
            mvc.perform(get(uri)).andExpect(status().isOk());
        }
    }

    @Test
    void technicianCannotUploadDirectAttachmentsToUnassignedTickets() throws Exception {
        ticket.setAssignedTo(null);

        mvc.perform(multipart("/tickets/12/attachments").file(pdf())).andExpect(status().isForbidden());
        verifyNoInteractions(ticketFiles, storage);
    }

    @Test
    void reporterCanReadTicketButCannotReachInternalCommentsOrTheirAttachments() throws Exception {
        signIn(reporter);
        when(comments.findByTicketAndInternalFalse(eq(ticket), any()))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));
        when(comments.findById(25L)).thenReturn(Optional.of(comment(true)));

        mvc.perform(get("/tickets/12")).andExpect(status().isOk());
        mvc.perform(get("/ticket-comments/ticket/12")).andExpect(status().isOk());
        mvc.perform(get("/tickets/12/comments/25/attachments")).andExpect(status().isNotFound());
        mvc.perform(get("/tickets/12/comments/25/attachments/30/download")).andExpect(status().isNotFound());
        verify(comments, never()).findByTicket(any(), any());
        verifyNoInteractions(commentFiles, storage);
    }

    @Test
    void adminCanReadAnotherTechniciansTicketAndInternalCommentAttachments() throws Exception {
        signIn(user(4L, "administrator", RoleName.ADMIN));
        when(comments.findById(25L)).thenReturn(Optional.of(comment(true)));

        mvc.perform(get("/tickets/12")).andExpect(status().isOk());
        mvc.perform(get("/tickets/12/comments/25/attachments")).andExpect(status().isOk());
        verify(commentFiles).findByCommentId(25L);
    }

    private void signIn(UserModel user) {
        when(users.findByUsername(user.getUsername())).thenReturn(Optional.of(user));
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(user.getUsername(), null, List.of()));
    }

    private TicketCommentModel comment(boolean internal) {
        TicketCommentModel comment = new TicketCommentModel();
        comment.setIdComment(25L);
        comment.setTicket(ticket);
        comment.setUser(reporter);
        comment.setInternal(internal);
        return comment;
    }

    private static UserModel user(Long id, String username, RoleName role) {
        UserModel user = new UserModel();
        user.setIdUser(id);
        user.setUsername(username);
        user.setRole(new RoleModel(null, role.name()));
        return user;
    }

    private static MockMultipartFile pdf() {
        return new MockMultipartFile("file", "report.pdf", "application/pdf", new byte[] { 1 });
    }
}
