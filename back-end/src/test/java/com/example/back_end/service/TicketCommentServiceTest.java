package com.example.back_end.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.example.back_end.dtos.ticketComment.TicketCommentRequest;
import com.example.back_end.dtos.ticketComment.TicketCommentResponse;
import com.example.back_end.dtos.user.UserSummaryResponse;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.RoleModel;
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

    @Mock
    private Pageable pageable;

    @Mock
    private Authentication authentication;

    @Mock
    private TicketCommentRequest ticketCommentRequest;

    @Mock
    private TicketModel ticket;

    @Mock
    private UserModel currentUser;

    @Mock
    private UserModel createdBy;

    @Mock
    private UserModel requestedFor;

    @Mock
    private RoleModel role;

    @InjectMocks
    private TicketCommentService ticketCommentService;

    @AfterEach
    void tearDown() {

        SecurityContextHolder.clearContext();
    }

    @Test
    void getCommentsByTicketIdShouldReturnPublicCommentsForUserWhoCreatedTicket() {

        Long ticketId = 1L;

        configureAuthenticatedUser(
                "john",
                "USER");

        when(currentUser.getIdUser())
                .thenReturn(1L);

        when(currentUser.getUsername())
                .thenReturn("john");

        configureTicketAccess(
                1L,
                2L);

        when(ticket.getIdTicket())
                .thenReturn(ticketId);

        TicketCommentModel comment = createComment(
                10L,
                "Public comment",
                false);

        Page<TicketCommentModel> comments = new PageImpl<>(List.of(comment));

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(ticketCommentRepository.findByTicketAndInternalFalse(
                ticket,
                pageable))
                .thenReturn(comments);

        Page<TicketCommentResponse> result = ticketCommentService.getCommentsByTicketId(
                ticketId,
                pageable);

        assertThat(result.getContent())
                .hasSize(1);

        TicketCommentResponse expected = new TicketCommentResponse(
                10L,
                ticketId,
                new UserSummaryResponse(
                        1L,
                        "john"),
                "Public comment",
                false,
                comment.getCreatedAt());

        assertThat(result.getContent().get(0))
                .usingRecursiveComparison()
                .isEqualTo(expected);

        verify(ticketCommentRepository)
                .findByTicketAndInternalFalse(
                        ticket,
                        pageable);

        verify(ticketCommentRepository, never())
                .findByTicket(
                        ticket,
                        pageable);
    }

    @Test
    void getCommentsByTicketIdShouldReturnPublicCommentsForRequestedUser() {

        Long ticketId = 1L;

        configureAuthenticatedUser(
                "john",
                "USER");

        when(currentUser.getIdUser())
                .thenReturn(2L);

        configureTicketAccess(
                1L,
                2L);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(ticketCommentRepository.findByTicketAndInternalFalse(
                ticket,
                pageable))
                .thenReturn(Page.empty());

        Page<TicketCommentResponse> result = ticketCommentService.getCommentsByTicketId(
                ticketId,
                pageable);

        assertThat(result)
                .isEmpty();

        verify(ticketCommentRepository)
                .findByTicketAndInternalFalse(
                        ticket,
                        pageable);
    }

    @Test
    void getCommentsByTicketIdShouldThrowAccessDeniedWhenUserCannotAccessTicket() {

        Long ticketId = 1L;

        configureAuthenticatedUser(
                "john",
                "USER");

        when(currentUser.getIdUser())
                .thenReturn(3L);

        configureTicketAccess(
                1L,
                2L);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        assertThatThrownBy(
                () -> ticketCommentService.getCommentsByTicketId(
                        ticketId,
                        pageable))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage(
                        "You are not allowed to view comments on this ticket");

        verify(ticketCommentRepository, never())
                .findByTicketAndInternalFalse(
                        any(),
                        any());

        verify(ticketCommentRepository, never())
                .findByTicket(
                        any(),
                        any());
    }

    @Test
    void getCommentsByTicketIdShouldReturnAllCommentsForTechnician() {

        Long ticketId = 1L;

        configureAuthenticatedUser(
                "technician",
                "TECHNICIAN");

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(ticketCommentRepository.findByTicket(
                ticket,
                pageable))
                .thenReturn(Page.empty());

        Page<TicketCommentResponse> result = ticketCommentService.getCommentsByTicketId(
                ticketId,
                pageable);

        assertThat(result)
                .isEmpty();

        verify(ticketCommentRepository)
                .findByTicket(
                        ticket,
                        pageable);

        verify(ticketCommentRepository, never())
                .findByTicketAndInternalFalse(
                        any(),
                        any());
    }

    @Test
    void getCommentsByTicketIdShouldThrowExceptionWhenTicketDoesNotExist() {

        Long ticketId = 1L;

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> ticketCommentService.getCommentsByTicketId(
                        ticketId,
                        pageable))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Ticket with id " + ticketId + " not found");

        verify(userRepository, never())
                .findByUsername(any());
    }

    @Test
    void getCommentsByTicketIdShouldThrowExceptionWhenAuthenticatedUserDoesNotExist() {

        Long ticketId = 1L;

        configureAuthentication("unknown");

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("unknown"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> ticketCommentService.getCommentsByTicketId(
                        ticketId,
                        pageable))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "User with username unknown not found");
    }

    @Test
    void createCommentForTicketShouldCreatePublicCommentForUser() {

        Long ticketId = 1L;

        configureAuthenticatedUser(
                "john",
                "USER");

        when(currentUser.getIdUser())
                .thenReturn(1L);

        when(currentUser.getUsername())
                .thenReturn("john");

        configureTicketAccess(
                1L,
                2L);

        when(ticket.getIdTicket())
                .thenReturn(ticketId);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(ticketCommentRequest.getComment())
                .thenReturn("New comment");

        when(ticketCommentRequest.isInternal())
                .thenReturn(false);

        when(ticketCommentRepository.save(
                any(TicketCommentModel.class)))
                .thenAnswer(invocation -> {

                    TicketCommentModel comment = invocation.getArgument(0);

                    comment.setIdComment(10L);

                    return comment;
                });

        LocalDateTime beforeCreation = LocalDateTime.now();

        TicketCommentResponse result = ticketCommentService.createCommentForTicket(
                ticketId,
                ticketCommentRequest);

        LocalDateTime afterCreation = LocalDateTime.now();

        ArgumentCaptor<TicketCommentModel> commentCaptor = ArgumentCaptor.forClass(
                TicketCommentModel.class);

        verify(ticketCommentRepository)
                .save(commentCaptor.capture());

        TicketCommentModel savedComment = commentCaptor.getValue();

        assertThat(savedComment.getTicket())
                .isSameAs(ticket);

        assertThat(savedComment.getUser())
                .isSameAs(currentUser);

        assertThat(savedComment.getComment())
                .isEqualTo("New comment");

        assertThat(savedComment.isInternal())
                .isFalse();

        assertThat(savedComment.getCreatedAt())
                .isBetween(
                        beforeCreation,
                        afterCreation);

        TicketCommentResponse expected = new TicketCommentResponse(
                10L,
                ticketId,
                new UserSummaryResponse(
                        1L,
                        "john"),
                "New comment",
                false,
                savedComment.getCreatedAt());

        assertThat(result)
                .usingRecursiveComparison()
                .isEqualTo(expected);
    }

    @Test
    void createCommentForTicketShouldThrowAccessDeniedWhenUserCannotAccessTicket() {

        Long ticketId = 1L;

        configureAuthenticatedUser(
                "john",
                "USER");

        when(currentUser.getIdUser())
                .thenReturn(3L);

        configureTicketAccess(
                1L,
                2L);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        assertThatThrownBy(
                () -> ticketCommentService.createCommentForTicket(
                        ticketId,
                        ticketCommentRequest))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage(
                        "You are not allowed to comment on this ticket");

        verify(ticketCommentRepository, never())
                .save(any(TicketCommentModel.class));
    }

    @Test
    void createCommentForTicketShouldThrowAccessDeniedWhenUserCreatesInternalComment() {

        Long ticketId = 1L;

        configureAuthenticatedUser(
                "john",
                "USER");

        when(currentUser.getIdUser())
                .thenReturn(1L);

        configureTicketAccess(
                1L,
                2L);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(ticketCommentRequest.isInternal())
                .thenReturn(true);

        assertThatThrownBy(
                () -> ticketCommentService.createCommentForTicket(
                        ticketId,
                        ticketCommentRequest))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage(
                        "Users are not allowed to create internal comments");

        verify(ticketCommentRepository, never())
                .save(any(TicketCommentModel.class));
    }

    @Test
    void createCommentForTicketShouldAllowTechnicianToCreateInternalComment() {

        Long ticketId = 1L;

        configureAuthenticatedUser(
                "technician",
                "TECHNICIAN");

        when(currentUser.getIdUser())
                .thenReturn(3L);

        when(currentUser.getUsername())
                .thenReturn("technician");

        when(ticket.getIdTicket())
                .thenReturn(ticketId);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(ticketCommentRequest.getComment())
                .thenReturn("Internal comment");

        when(ticketCommentRequest.isInternal())
                .thenReturn(true);

        when(ticketCommentRepository.save(
                any(TicketCommentModel.class)))
                .thenAnswer(invocation -> {

                    TicketCommentModel comment = invocation.getArgument(0);

                    comment.setIdComment(10L);

                    return comment;
                });

        TicketCommentResponse result = ticketCommentService.createCommentForTicket(
                ticketId,
                ticketCommentRequest);

        assertThat(result)
                .isNotNull();

        ArgumentCaptor<TicketCommentModel> commentCaptor = ArgumentCaptor.forClass(
                TicketCommentModel.class);

        verify(ticketCommentRepository)
                .save(commentCaptor.capture());

        TicketCommentModel savedComment = commentCaptor.getValue();

        assertThat(savedComment.isInternal())
                .isTrue();

        assertThat(savedComment.getComment())
                .isEqualTo("Internal comment");

        assertThat(savedComment.getUser())
                .isSameAs(currentUser);

        assertThat(savedComment.getTicket())
                .isSameAs(ticket);
    }

    @Test
    void createCommentForTicketShouldThrowExceptionWhenTicketDoesNotExist() {

        Long ticketId = 1L;

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> ticketCommentService.createCommentForTicket(
                        ticketId,
                        ticketCommentRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Ticket with id " + ticketId + " not found");

        verify(ticketCommentRepository, never())
                .save(any(TicketCommentModel.class));
    }

    private void configureAuthentication(
            String username) {

        SecurityContext context = SecurityContextHolder.createEmptyContext();

        when(authentication.getName())
                .thenReturn(username);

        context.setAuthentication(authentication);

        SecurityContextHolder.setContext(context);
    }

    private void configureAuthenticatedUser(
            String username,
            String roleName) {

        configureAuthentication(username);

        when(userRepository.findByUsername(username))
                .thenReturn(Optional.of(currentUser));

        when(currentUser.getRole())
                .thenReturn(role);

        when(role.getName())
                .thenReturn(roleName);
    }

    private void configureTicketAccess(
            Long createdById,
            Long requestedForId) {

        when(ticket.getCreatedBy())
                .thenReturn(createdBy);

        when(ticket.getRequestedFor())
                .thenReturn(requestedFor);

        when(createdBy.getIdUser())
                .thenReturn(createdById);

        when(requestedFor.getIdUser())
                .thenReturn(requestedForId);
    }

    private TicketCommentModel createComment(
            Long id,
            String comment,
            boolean internal) {

        TicketCommentModel ticketComment = new TicketCommentModel();

        ticketComment.setIdComment(id);
        ticketComment.setTicket(ticket);
        ticketComment.setUser(currentUser);
        ticketComment.setComment(comment);
        ticketComment.setInternal(internal);
        ticketComment.setCreatedAt(
                LocalDateTime.now());

        return ticketComment;
    }
}