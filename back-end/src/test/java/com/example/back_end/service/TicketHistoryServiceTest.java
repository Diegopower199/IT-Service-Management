package com.example.back_end.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.example.back_end.dtos.ticketHistory.TicketHistoryResponse;
import com.example.back_end.enums.TicketHistoryAction;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.DepartmentModel;
import com.example.back_end.model.RolModel;
import com.example.back_end.model.TicketHistoryModel;
import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.TicketHistoryRepository;

@ExtendWith(MockitoExtension.class)
class TicketHistoryServiceTest {

    @Mock
    private TicketHistoryRepository ticketHistoryRepository;

    @InjectMocks
    private TicketHistoryService ticketHistoryService;

    // =========================================================
    // GET ALL HISTORY
    // =========================================================
    // =========================================================
    // GET ALL HISTORY
    // =========================================================

    @Test
    void shouldReturnAllHistory() {

        RolModel adminRole = new RolModel(
                1L,
                "ADMIN",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel user = new UserModel(
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

        LocalDateTime now = LocalDateTime.now();

        TicketHistoryModel history1 = new TicketHistoryModel();
        history1.setIdHistory(1L);
        history1.setTicket(ticket);
        history1.setUser(user);
        history1.setAction(TicketHistoryAction.TICKET_CREATED);
        history1.setFieldName(null);
        history1.setOldValue(null);
        history1.setNewValue(null);
        history1.setCreatedAt(now);

        TicketHistoryModel history2 = new TicketHistoryModel();
        history2.setIdHistory(2L);
        history2.setTicket(ticket);
        history2.setUser(user);
        history2.setAction(TicketHistoryAction.STATUS_CHANGED);
        history2.setFieldName("status");
        history2.setOldValue("OPEN");
        history2.setNewValue("IN_PROGRESS");
        history2.setCreatedAt(now);

        Pageable pageable = PageRequest.of(0, 10);

        Page<TicketHistoryModel> historyPage = new PageImpl<>(
                List.of(
                        history1,
                        history2),
                pageable,
                2);

        when(ticketHistoryRepository.findAll(pageable))
                .thenReturn(historyPage);

        Page<TicketHistoryResponse> response = ticketHistoryService.getAllHistory(pageable);

        assertEquals(
                2,
                response.getTotalElements());

        assertEquals(
                2,
                response.getContent().size());

        assertEquals(
                1L,
                response.getContent()
                        .get(0)
                        .getIdHistory());

        assertEquals(
                1L,
                response.getContent()
                        .get(0)
                        .getTicketId());

        assertEquals(
                "admin",
                response.getContent()
                        .get(0)
                        .getUser()
                        .getUsername());

        assertEquals(
                TicketHistoryAction.TICKET_CREATED,
                response.getContent()
                        .get(0)
                        .getAction());

        assertNull(
                response.getContent()
                        .get(0)
                        .getFieldName());

        assertEquals(
                TicketHistoryAction.STATUS_CHANGED,
                response.getContent()
                        .get(1)
                        .getAction());

        assertEquals(
                "status",
                response.getContent()
                        .get(1)
                        .getFieldName());

        assertEquals(
                "OPEN",
                response.getContent()
                        .get(1)
                        .getOldValue());

        assertEquals(
                "IN_PROGRESS",
                response.getContent()
                        .get(1)
                        .getNewValue());

        verify(ticketHistoryRepository)
                .findAll(pageable);
    }

    @Test
    void shouldReturnEmptyPageWhenNoHistoryExists() {

        Pageable pageable = PageRequest.of(0, 10);

        when(ticketHistoryRepository.findAll(pageable))
                .thenReturn(Page.empty(pageable));

        Page<TicketHistoryResponse> response = ticketHistoryService.getAllHistory(pageable);

        assertTrue(response.isEmpty());

        assertEquals(
                0,
                response.getTotalElements());

        verify(ticketHistoryRepository)
                .findAll(pageable);
    }

    // =========================================================
    // GET HISTORY BY ID
    // =========================================================
    @Test
    void shouldReturnHistoryById() {

        RolModel technicianRole = new RolModel(
                2L,
                "TECHNICIAN",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel technician = new UserModel(
                2L,
                "tech",
                "tech@example.com",
                "encodedPassword",
                "Technical",
                "User",
                true,
                technicianRole,
                department);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(10L);

        LocalDateTime now = LocalDateTime.now();

        TicketHistoryModel history = new TicketHistoryModel();

        history.setIdHistory(1L);
        history.setTicket(ticket);
        history.setUser(technician);
        history.setAction(
                TicketHistoryAction.PRIORITY_CHANGED);
        history.setFieldName("priority");
        history.setOldValue("MEDIUM");
        history.setNewValue("HIGH");
        history.setCreatedAt(now);

        when(ticketHistoryRepository.findById(1L))
                .thenReturn(Optional.of(history));

        TicketHistoryResponse response = ticketHistoryService
                .getHistoryById(1L);

        assertEquals(
                1L,
                response.getIdHistory());

        assertEquals(
                10L,
                response.getTicketId());

        assertEquals(
                "tech",
                response.getUser()
                        .getUsername());

        assertEquals(
                TicketHistoryAction.PRIORITY_CHANGED,
                response.getAction());

        assertEquals(
                "priority",
                response.getFieldName());

        assertEquals(
                "MEDIUM",
                response.getOldValue());

        assertEquals(
                "HIGH",
                response.getNewValue());

        verify(ticketHistoryRepository)
                .findById(1L);
    }

    @Test
    void shouldThrowExceptionWhenHistoryDoesNotExist() {

        when(ticketHistoryRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> ticketHistoryService
                        .getHistoryById(99L));

        verify(ticketHistoryRepository)
                .findById(99L);
    }

    // =========================================================
    // CREATE HISTORY
    // =========================================================
    @Test
    void shouldCreateHistorySuccessfully() {

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

        when(ticketHistoryRepository
                .save(any(TicketHistoryModel.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ticketHistoryService.createHistory(
                ticket,
                admin,
                TicketHistoryAction.STATUS_CHANGED,
                "status",
                "OPEN",
                "IN_PROGRESS");

        ArgumentCaptor<TicketHistoryModel> captor = ArgumentCaptor.forClass(
                TicketHistoryModel.class);

        verify(ticketHistoryRepository)
                .save(captor.capture());

        TicketHistoryModel savedHistory = captor.getValue();

        assertEquals(
                ticket,
                savedHistory.getTicket());

        assertEquals(
                admin,
                savedHistory.getUser());

        assertEquals(
                TicketHistoryAction.STATUS_CHANGED,
                savedHistory.getAction());

        assertEquals(
                "status",
                savedHistory.getFieldName());

        assertEquals(
                "OPEN",
                savedHistory.getOldValue());

        assertEquals(
                "IN_PROGRESS",
                savedHistory.getNewValue());

        assertTrue(
                savedHistory.getCreatedAt() != null);
    }

    @Test
    void shouldCreateTicketCreatedHistory() {

        RolModel userRole = new RolModel(
                3L,
                "USER",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel user = new UserModel(
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

        ticketHistoryService.createHistory(
                ticket,
                user,
                TicketHistoryAction.TICKET_CREATED,
                null,
                null,
                null);

        ArgumentCaptor<TicketHistoryModel> captor = ArgumentCaptor.forClass(
                TicketHistoryModel.class);

        verify(ticketHistoryRepository)
                .save(captor.capture());

        TicketHistoryModel savedHistory = captor.getValue();

        assertEquals(
                TicketHistoryAction.TICKET_CREATED,
                savedHistory.getAction());

        assertNull(
                savedHistory.getFieldName());

        assertNull(
                savedHistory.getOldValue());

        assertNull(
                savedHistory.getNewValue());

        assertTrue(
                savedHistory.getCreatedAt() != null);
    }
}