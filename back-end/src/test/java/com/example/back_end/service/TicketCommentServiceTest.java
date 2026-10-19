package com.example.back_end.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.example.back_end.dtos.ticketComment.TicketCommentRequest;
import com.example.back_end.dtos.ticketComment.TicketCommentResponse;
import com.example.back_end.exception.AccessDeniedException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.DepartmentModel;
import com.example.back_end.model.RolModel;
import com.example.back_end.model.TicketCommentModel;
import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.TicketCommentRepository;
import com.example.back_end.repository.TicketRepository;
import com.example.back_end.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class TicketCommentServiceTest {

    @Mock
    private TicketCommentRepository ticketCommentRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TicketCommentService ticketCommentService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    // =========================================================
    // GET COMMENTS BY TICKET ID
    // =========================================================
    @Test
    void shouldReturnPublicCommentsWhenUserIsRelatedToTicket() {

        RolModel userRole = new RolModel(
                3L,
                "USER",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel currentUser = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRole,
                department);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);
        ticket.setCreatedBy(currentUser);
        ticket.setRequestedFor(currentUser);

        LocalDateTime now = LocalDateTime.now();

        TicketCommentModel comment = new TicketCommentModel();
        comment.setIdComment(1L);
        comment.setTicket(ticket);
        comment.setUser(currentUser);
        comment.setComment("Public comment");
        comment.setInternal(false);
        comment.setCreatedAt(now);

        authenticate("ana");

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(currentUser));

        when(ticketCommentRepository
                .findByTicketAndInternalFalseOrderByCreatedAtAsc(ticket))
                .thenReturn(List.of(comment));

        List<TicketCommentResponse> response = ticketCommentService.getCommentsByTicketId(1L);

        assertEquals(1, response.size());

        assertEquals(
                1L,
                response.get(0).getIdComment());

        assertEquals(
                1L,
                response.get(0).getTicketId());

        assertEquals(
                "ana",
                response.get(0).getUser().getUsername());

        assertEquals(
                "Public comment",
                response.get(0).getComment());

        assertFalse(
                response.get(0).isInternal());

        verify(ticketCommentRepository)
                .findByTicketAndInternalFalseOrderByCreatedAtAsc(ticket);

        verify(ticketCommentRepository, never())
                .findByTicketOrderByCreatedAtAsc(ticket);
    }

    @Test
    void shouldReturnEmptyListWhenRelatedUserTicketHasNoPublicComments() {

        RolModel userRole = new RolModel(
                3L,
                "USER",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel currentUser = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRole,
                department);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);
        ticket.setCreatedBy(currentUser);
        ticket.setRequestedFor(currentUser);

        authenticate("ana");

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(currentUser));

        when(ticketCommentRepository
                .findByTicketAndInternalFalseOrderByCreatedAtAsc(ticket))
                .thenReturn(List.of());

        List<TicketCommentResponse> response = ticketCommentService.getCommentsByTicketId(1L);

        assertTrue(response.isEmpty());
    }

    @Test
    void shouldThrowAccessDeniedWhenUserIsNotRelatedToTicket() {

        RolModel userRole = new RolModel(
                3L,
                "USER",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel currentUser = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRole,
                department);

        UserModel otherUser = new UserModel(
                2L,
                "carlos",
                "carlos@example.com",
                "encodedPassword",
                "Carlos",
                "Lopez",
                true,
                userRole,
                department);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);
        ticket.setCreatedBy(otherUser);
        ticket.setRequestedFor(otherUser);

        authenticate("ana");

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(currentUser));

        assertThrows(
                AccessDeniedException.class,
                () -> ticketCommentService
                        .getCommentsByTicketId(1L));

        verify(ticketCommentRepository, never())
                .findByTicketAndInternalFalseOrderByCreatedAtAsc(any());

        verify(ticketCommentRepository, never())
                .findByTicketOrderByCreatedAtAsc(any());
    }

    @Test
    void shouldReturnAllCommentsWhenUserIsTechnician() {

        RolModel technicianRole = new RolModel(
                2L,
                "TECHNICIAN",
                true);

        RolModel userRole = new RolModel(
                3L,
                "USER",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel technician = new UserModel(
                1L,
                "tech",
                "tech@example.com",
                "encodedPassword",
                "Technical",
                "User",
                true,
                technicianRole,
                department);

        UserModel owner = new UserModel(
                2L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRole,
                department);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);
        ticket.setCreatedBy(owner);
        ticket.setRequestedFor(owner);

        TicketCommentModel publicComment = new TicketCommentModel();
        publicComment.setIdComment(1L);
        publicComment.setTicket(ticket);
        publicComment.setUser(technician);
        publicComment.setComment("Public comment");
        publicComment.setInternal(false);
        publicComment.setCreatedAt(LocalDateTime.now());

        TicketCommentModel internalComment = new TicketCommentModel();
        internalComment.setIdComment(2L);
        internalComment.setTicket(ticket);
        internalComment.setUser(technician);
        internalComment.setComment("Internal comment");
        internalComment.setInternal(true);
        internalComment.setCreatedAt(LocalDateTime.now());

        authenticate("tech");

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("tech"))
                .thenReturn(Optional.of(technician));

        when(ticketCommentRepository
                .findByTicketOrderByCreatedAtAsc(ticket))
                .thenReturn(List.of(
                        publicComment,
                        internalComment));

        List<TicketCommentResponse> response = ticketCommentService.getCommentsByTicketId(1L);

        assertEquals(2, response.size());

        assertFalse(
                response.get(0).isInternal());

        assertTrue(
                response.get(1).isInternal());

        verify(ticketCommentRepository)
                .findByTicketOrderByCreatedAtAsc(ticket);

        verify(ticketCommentRepository, never())
                .findByTicketAndInternalFalseOrderByCreatedAtAsc(ticket);
    }

    @Test
    void shouldReturnAllCommentsWhenUserIsAdmin() {

        RolModel adminRole = new RolModel(
                1L,
                "ADMIN",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel admin = new UserModel(
                1L,
                "admin",
                "admin@example.com",
                "encodedPassword",
                "Admin",
                "User",
                true,
                adminRole,
                department);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);

        TicketCommentModel comment = new TicketCommentModel();
        comment.setIdComment(1L);
        comment.setTicket(ticket);
        comment.setUser(admin);
        comment.setComment("Internal comment");
        comment.setInternal(true);
        comment.setCreatedAt(LocalDateTime.now());

        authenticate("admin");

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("admin"))
                .thenReturn(Optional.of(admin));

        when(ticketCommentRepository
                .findByTicketOrderByCreatedAtAsc(ticket))
                .thenReturn(List.of(comment));

        List<TicketCommentResponse> response = ticketCommentService.getCommentsByTicketId(1L);

        assertEquals(1, response.size());

        assertTrue(
                response.get(0).isInternal());

        verify(ticketCommentRepository)
                .findByTicketOrderByCreatedAtAsc(ticket);
    }

    @Test
    void shouldThrowExceptionWhenTicketDoesNotExistOnGetComments() {

        when(ticketRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> ticketCommentService
                        .getCommentsByTicketId(99L));

        verify(userRepository, never())
                .findByUsername(any());

        verify(ticketCommentRepository, never())
                .findByTicketOrderByCreatedAtAsc(any());
    }

    @Test
    void shouldThrowExceptionWhenAuthenticatedUserDoesNotExistOnGetComments() {

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);

        authenticate("unknown");

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("unknown"))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> ticketCommentService
                        .getCommentsByTicketId(1L));

        verify(ticketCommentRepository, never())
                .findByTicketOrderByCreatedAtAsc(any());
    }

    // =========================================================
    // CREATE COMMENT
    // =========================================================
    @Test
    void shouldAllowRelatedUserToCreatePublicComment() {

        TicketCommentRequest request = org.mockito.Mockito.mock(
                TicketCommentRequest.class);

        when(request.getComment())
                .thenReturn("My comment");

        when(request.isInternal())
                .thenReturn(false);

        RolModel userRole = new RolModel(
                3L,
                "USER",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel currentUser = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRole,
                department);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);
        ticket.setCreatedBy(currentUser);
        ticket.setRequestedFor(currentUser);

        authenticate("ana");

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(currentUser));

        when(ticketCommentRepository
                .save(any(TicketCommentModel.class)))
                .thenAnswer(invocation -> {

                    TicketCommentModel comment = invocation.getArgument(0);

                    comment.setIdComment(1L);

                    return comment;
                });

        TicketCommentResponse response = ticketCommentService.createCommentForTicket(
                1L,
                request);

        assertEquals(
                1L,
                response.getIdComment());

        assertEquals(
                1L,
                response.getTicketId());

        assertEquals(
                "ana",
                response.getUser().getUsername());

        assertEquals(
                "My comment",
                response.getComment());

        assertFalse(
                response.isInternal());

        verify(ticketCommentRepository)
                .save(any(TicketCommentModel.class));
    }

    @Test
    void shouldThrowAccessDeniedWhenUserCreatesCommentOnUnrelatedTicket() {

        TicketCommentRequest request = org.mockito.Mockito.mock(
                TicketCommentRequest.class);

        RolModel userRole = new RolModel(
                3L,
                "USER",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel currentUser = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRole,
                department);

        UserModel otherUser = new UserModel(
                2L,
                "carlos",
                "carlos@example.com",
                "encodedPassword",
                "Carlos",
                "Lopez",
                true,
                userRole,
                department);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);
        ticket.setCreatedBy(otherUser);
        ticket.setRequestedFor(otherUser);

        authenticate("ana");

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(currentUser));

        assertThrows(
                AccessDeniedException.class,
                () -> ticketCommentService
                        .createCommentForTicket(
                                1L,
                                request));

        verify(ticketCommentRepository, never())
                .save(any(TicketCommentModel.class));
    }

    @Test
    void shouldThrowAccessDeniedWhenUserCreatesInternalComment() {

        TicketCommentRequest request = org.mockito.Mockito.mock(
                TicketCommentRequest.class);

        when(request.isInternal())
                .thenReturn(true);

        RolModel userRole = new RolModel(
                3L,
                "USER",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel currentUser = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRole,
                department);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);
        ticket.setCreatedBy(currentUser);
        ticket.setRequestedFor(currentUser);

        authenticate("ana");

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(currentUser));

        assertThrows(
                AccessDeniedException.class,
                () -> ticketCommentService
                        .createCommentForTicket(
                                1L,
                                request));

        verify(ticketCommentRepository, never())
                .save(any(TicketCommentModel.class));
    }

    @Test
    void shouldAllowTechnicianToCreateInternalComment() {

        TicketCommentRequest request = org.mockito.Mockito.mock(
                TicketCommentRequest.class);

        when(request.getComment())
                .thenReturn("Internal technical note");

        when(request.isInternal())
                .thenReturn(true);

        RolModel technicianRole = new RolModel(
                2L,
                "TECHNICIAN",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel technician = new UserModel(
                1L,
                "tech",
                "tech@example.com",
                "encodedPassword",
                "Technical",
                "User",
                true,
                technicianRole,
                department);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);

        authenticate("tech");

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("tech"))
                .thenReturn(Optional.of(technician));

        when(ticketCommentRepository
                .save(any(TicketCommentModel.class)))
                .thenAnswer(invocation -> {

                    TicketCommentModel comment = invocation.getArgument(0);

                    comment.setIdComment(1L);

                    return comment;
                });

        TicketCommentResponse response = ticketCommentService.createCommentForTicket(
                1L,
                request);

        assertEquals(
                "Internal technical note",
                response.getComment());

        assertTrue(
                response.isInternal());

        assertEquals(
                "tech",
                response.getUser().getUsername());

        verify(ticketCommentRepository)
                .save(any(TicketCommentModel.class));
    }

    @Test
    void shouldAllowAdminToCreateInternalComment() {

        TicketCommentRequest request = org.mockito.Mockito.mock(
                TicketCommentRequest.class);

        when(request.getComment())
                .thenReturn("Admin internal note");

        when(request.isInternal())
                .thenReturn(true);

        RolModel adminRole = new RolModel(
                1L,
                "ADMIN",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel admin = new UserModel(
                1L,
                "admin",
                "admin@example.com",
                "encodedPassword",
                "Admin",
                "User",
                true,
                adminRole,
                department);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);

        authenticate("admin");

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("admin"))
                .thenReturn(Optional.of(admin));

        when(ticketCommentRepository
                .save(any(TicketCommentModel.class)))
                .thenAnswer(invocation -> {

                    TicketCommentModel comment = invocation.getArgument(0);

                    comment.setIdComment(1L);

                    return comment;
                });

        TicketCommentResponse response = ticketCommentService.createCommentForTicket(
                1L,
                request);

        assertEquals(
                "Admin internal note",
                response.getComment());

        assertTrue(
                response.isInternal());

        verify(ticketCommentRepository)
                .save(any(TicketCommentModel.class));
    }

    @Test
    void shouldThrowExceptionWhenTicketDoesNotExistOnCreateComment() {

        TicketCommentRequest request = org.mockito.Mockito.mock(
                TicketCommentRequest.class);

        when(ticketRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> ticketCommentService
                        .createCommentForTicket(
                                99L,
                                request));

        verify(userRepository, never())
                .findByUsername(any());

        verify(ticketCommentRepository, never())
                .save(any(TicketCommentModel.class));
    }

    // =========================================================
    // SECURITY CONTEXT
    // =========================================================

    private void authenticate(String username) {

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                username,
                                null));
    }
}
