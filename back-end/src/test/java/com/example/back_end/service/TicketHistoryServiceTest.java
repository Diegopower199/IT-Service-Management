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

import com.example.back_end.dtos.ticketHistory.TicketHistoryResponse;
import com.example.back_end.dtos.user.UserSummaryResponse;
import com.example.back_end.enums.TicketHistoryAction;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.RoleModel;
import com.example.back_end.model.TicketHistoryModel;
import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.TicketHistoryRepository;
import com.example.back_end.repository.TicketRepository;
import com.example.back_end.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class TicketHistoryServiceTest {

    @Mock
    private TicketHistoryRepository ticketHistoryRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Pageable pageable;

    @Mock
    private Authentication authentication;

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
    private TicketHistoryService ticketHistoryService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getAllHistoryShouldReturnHistoryPage() {

        TicketHistoryModel history = createHistory(
                1L,
                TicketHistoryAction.STATUS_CHANGED,
                "status",
                "OPEN",
                "IN_PROGRESS");

        Page<TicketHistoryModel> historyPage = new PageImpl<>(List.of(history));

        when(ticketHistoryRepository.findAll(pageable))
                .thenReturn(historyPage);

        Page<TicketHistoryResponse> result = ticketHistoryService.getAllHistory(pageable);

        assertThat(result.getContent())
                .hasSize(1);

        TicketHistoryResponse expected = new TicketHistoryResponse(
                1L,
                10L,
                new UserSummaryResponse(
                        1L,
                        "john"),
                TicketHistoryAction.STATUS_CHANGED,
                "status",
                "OPEN",
                "IN_PROGRESS",
                history.getCreatedAt());

        assertThat(result.getContent().get(0))
                .usingRecursiveComparison()
                .isEqualTo(expected);

        verify(ticketHistoryRepository)
                .findAll(pageable);
    }

    @Test
    void getHistoryByTicketIdShouldReturnHistoryForUserWhoCreatedTicket() {

        Long ticketId = 10L;

        configureAuthenticatedUser(
                "john",
                "USER");

        when(currentUser.getIdUser())
                .thenReturn(1L);

        configureTicketAccess(
                1L,
                2L);

        TicketHistoryModel history = createHistory(
                1L,
                TicketHistoryAction.STATUS_CHANGED,
                "status",
                "OPEN",
                "IN_PROGRESS");

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(ticketHistoryRepository.findByTicket(
                ticket,
                pageable))
                .thenReturn(
                        new PageImpl<>(
                                List.of(history)));

        Page<TicketHistoryResponse> result = ticketHistoryService.getHistoryByTicketId(
                ticketId,
                pageable);

        assertThat(result.getContent())
                .hasSize(1);

        verify(ticketHistoryRepository)
                .findByTicket(
                        ticket,
                        pageable);
    }

    @Test
    void getHistoryByTicketIdShouldReturnHistoryForRequestedUser() {

        Long ticketId = 10L;

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

        when(ticketHistoryRepository.findByTicket(
                ticket,
                pageable))
                .thenReturn(Page.empty());

        Page<TicketHistoryResponse> result = ticketHistoryService.getHistoryByTicketId(
                ticketId,
                pageable);

        assertThat(result)
                .isEmpty();

        verify(ticketHistoryRepository)
                .findByTicket(
                        ticket,
                        pageable);
    }

    @Test
    void getHistoryByTicketIdShouldThrowAccessDeniedWhenUserCannotAccessTicket() {

        Long ticketId = 10L;

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
                () -> ticketHistoryService.getHistoryByTicketId(
                        ticketId,
                        pageable))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage(
                        "You do not have permission to view the history of this ticket");

        verify(ticketHistoryRepository, never())
                .findByTicket(
                        any(),
                        any());
    }

    @Test
    void getHistoryByTicketIdShouldReturnHistoryForTechnician() {

        Long ticketId = 10L;

        configureAuthenticatedUser(
                "technician",
                "TECHNICIAN");

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(ticketHistoryRepository.findByTicket(
                ticket,
                pageable))
                .thenReturn(Page.empty());

        Page<TicketHistoryResponse> result = ticketHistoryService.getHistoryByTicketId(
                ticketId,
                pageable);

        assertThat(result)
                .isEmpty();

        verify(ticketHistoryRepository)
                .findByTicket(
                        ticket,
                        pageable);
    }

    @Test
    void getHistoryByTicketIdShouldThrowExceptionWhenTicketDoesNotExist() {

        Long ticketId = 10L;

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> ticketHistoryService.getHistoryByTicketId(
                        ticketId,
                        pageable))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Ticket with id " + ticketId + " not found");

        verify(userRepository, never())
                .findByUsername(any());
    }

    @Test
    void getHistoryByTicketIdShouldThrowExceptionWhenAuthenticatedUserDoesNotExist() {

        Long ticketId = 10L;

        configureAuthentication("unknown");

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("unknown"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> ticketHistoryService.getHistoryByTicketId(
                        ticketId,
                        pageable))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "User with username 'unknown' not found");

        verify(ticketHistoryRepository, never())
                .findByTicket(
                        any(),
                        any());
    }

    @Test
    void createHistoryShouldCreateAndSaveHistory() {

        TicketHistoryAction action = TicketHistoryAction.STATUS_CHANGED;

        String fieldName = "status";
        String oldValue = "OPEN";
        String newValue = "IN_PROGRESS";

        LocalDateTime beforeCreation = LocalDateTime.now();

        ticketHistoryService.createHistory(
                ticket,
                currentUser,
                action,
                fieldName,
                oldValue,
                newValue);

        LocalDateTime afterCreation = LocalDateTime.now();

        ArgumentCaptor<TicketHistoryModel> historyCaptor = ArgumentCaptor.forClass(
                TicketHistoryModel.class);

        verify(ticketHistoryRepository)
                .save(historyCaptor.capture());

        TicketHistoryModel savedHistory = historyCaptor.getValue();

        assertThat(savedHistory.getTicket())
                .isSameAs(ticket);

        assertThat(savedHistory.getUser())
                .isSameAs(currentUser);

        assertThat(savedHistory.getAction())
                .isEqualTo(action);

        assertThat(savedHistory.getFieldName())
                .isEqualTo(fieldName);

        assertThat(savedHistory.getOldValue())
                .isEqualTo(oldValue);

        assertThat(savedHistory.getNewValue())
                .isEqualTo(newValue);

        assertThat(savedHistory.getCreatedAt())
                .isBetween(
                        beforeCreation,
                        afterCreation);
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

    private TicketHistoryModel createHistory(
            Long historyId,
            TicketHistoryAction action,
            String fieldName,
            String oldValue,
            String newValue) {

        UserModel historyUser = new UserModel();
        historyUser.setIdUser(1L);
        historyUser.setUsername("john");

        TicketModel historyTicket = new TicketModel();
        historyTicket.setIdTicket(10L);

        TicketHistoryModel history = new TicketHistoryModel();

        history.setIdHistory(historyId);
        history.setTicket(historyTicket);
        history.setUser(historyUser);
        history.setAction(action);
        history.setFieldName(fieldName);
        history.setOldValue(oldValue);
        history.setNewValue(newValue);
        history.setCreatedAt(
                LocalDateTime.now());

        return history;
    }
}