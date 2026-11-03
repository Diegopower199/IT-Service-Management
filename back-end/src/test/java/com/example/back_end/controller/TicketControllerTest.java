package com.example.back_end.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.back_end.dtos.ticket.AssignTicketRequest;
import com.example.back_end.dtos.ticket.ChangePriorityRequest;
import com.example.back_end.dtos.ticket.ChangeStatusRequest;
import com.example.back_end.dtos.ticket.CreateTicketRequest;
import com.example.back_end.dtos.ticket.TicketResponse;
import com.example.back_end.dtos.ticket.TicketStatisticsResponse;
import com.example.back_end.dtos.ticket.UpdateTicketRequest;
import com.example.back_end.service.TicketService;

@ExtendWith(MockitoExtension.class)
class TicketControllerTest {

    @Mock
    private TicketService ticketService;

    @Mock
    private TicketResponse ticketResponse;

    @Mock
    private TicketStatisticsResponse ticketStatisticsResponse;

    @Mock
    private CreateTicketRequest createTicketRequest;

    @Mock
    private UpdateTicketRequest updateTicketRequest;

    @Mock
    private AssignTicketRequest assignTicketRequest;

    @Mock
    private ChangePriorityRequest changePriorityRequest;

    @Mock
    private ChangeStatusRequest changeStatusRequest;

    @Mock
    private Page<TicketResponse> ticketPage;

    @Mock
    private Pageable pageable;

    @InjectMocks
    private TicketController ticketController;

    @Test
    void getAllTicketsShouldReturnTicketsPage() {

        String title = "Printer";
        String status = "OPEN";
        String priority = "HIGH";
        String category = "HARDWARE";

        when(ticketService.getAllTickets(
                title,
                status,
                priority,
                category,
                pageable))
                .thenReturn(ticketPage);

        ResponseEntity<Page<TicketResponse>> response = ticketController.getAllTickets(
                title,
                status,
                priority,
                category,
                pageable);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(ticketPage);

        verify(ticketService).getAllTickets(
                title,
                status,
                priority,
                category,
                pageable);
    }

    @Test
    void getTicketByIdShouldReturnTicket() {

        Long ticketId = 1L;

        when(ticketService.getTicketById(ticketId))
                .thenReturn(ticketResponse);

        ResponseEntity<TicketResponse> response = ticketController.getTicketById(ticketId);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(ticketResponse);

        verify(ticketService).getTicketById(ticketId);
    }

    @Test
    void getMyTicketsShouldReturnTicketsPage() {

        String title = "Printer";
        String status = "OPEN";
        String priority = "HIGH";
        String category = "HARDWARE";

        when(ticketService.getMyTickets(
                title,
                status,
                priority,
                category,
                pageable))
                .thenReturn(ticketPage);

        ResponseEntity<Page<TicketResponse>> response = ticketController.getMyTickets(
                title,
                status,
                priority,
                category,
                pageable);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(ticketPage);

        verify(ticketService).getMyTickets(
                title,
                status,
                priority,
                category,
                pageable);
    }

    @Test
    void getAssignedTicketsShouldReturnTicketsPage() {

        String title = "Printer";
        String status = "OPEN";
        String priority = "HIGH";
        String category = "HARDWARE";

        when(ticketService.getAssignedTickets(
                title,
                status,
                priority,
                category,
                pageable))
                .thenReturn(ticketPage);

        ResponseEntity<Page<TicketResponse>> response = ticketController.getAssignedTickets(
                title,
                status,
                priority,
                category,
                pageable);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(ticketPage);

        verify(ticketService).getAssignedTickets(
                title,
                status,
                priority,
                category,
                pageable);
    }

    @Test
    void createTicketShouldReturnCreatedTicket() {

        when(ticketService.createTicket(createTicketRequest))
                .thenReturn(ticketResponse);

        ResponseEntity<TicketResponse> response = ticketController.createTicket(createTicketRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.CREATED);

        assertThat(response.getBody())
                .isSameAs(ticketResponse);

        verify(ticketService).createTicket(createTicketRequest);
    }

    @Test
    void updateTicketShouldReturnUpdatedTicket() {

        Long ticketId = 1L;

        when(ticketService.updateTicket(
                ticketId,
                updateTicketRequest))
                .thenReturn(ticketResponse);

        ResponseEntity<TicketResponse> response = ticketController.updateTicket(
                ticketId,
                updateTicketRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(ticketResponse);

        verify(ticketService).updateTicket(
                ticketId,
                updateTicketRequest);
    }

    @Test
    void assignTicketShouldReturnAssignedTicket() {

        Long ticketId = 1L;

        when(ticketService.assignTicket(
                ticketId,
                assignTicketRequest))
                .thenReturn(ticketResponse);

        ResponseEntity<TicketResponse> response = ticketController.assignTicket(
                ticketId,
                assignTicketRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(ticketResponse);

        verify(ticketService).assignTicket(
                ticketId,
                assignTicketRequest);
    }

    @Test
    void changePriorityShouldReturnUpdatedTicket() {

        Long ticketId = 1L;

        when(ticketService.changePriority(
                ticketId,
                changePriorityRequest))
                .thenReturn(ticketResponse);

        ResponseEntity<TicketResponse> response = ticketController.changePriority(
                ticketId,
                changePriorityRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(ticketResponse);

        verify(ticketService).changePriority(
                ticketId,
                changePriorityRequest);
    }

    @Test
    void changeStatusShouldReturnUpdatedTicket() {

        Long ticketId = 1L;

        when(ticketService.changeStatus(
                ticketId,
                changeStatusRequest))
                .thenReturn(ticketResponse);

        ResponseEntity<TicketResponse> response = ticketController.changeStatus(
                ticketId,
                changeStatusRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(ticketResponse);

        verify(ticketService).changeStatus(
                ticketId,
                changeStatusRequest);
    }

    @Test
    void getTicketStatisticsShouldReturnStatistics() {

        when(ticketService.getTicketStatistics())
                .thenReturn(ticketStatisticsResponse);

        ResponseEntity<TicketStatisticsResponse> response = ticketController.getTicketStatistics();

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(ticketStatisticsResponse);

        verify(ticketService).getTicketStatistics();
    }
}