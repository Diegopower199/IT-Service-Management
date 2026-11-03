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

import com.example.back_end.dtos.ticketComment.TicketCommentRequest;
import com.example.back_end.dtos.ticketComment.TicketCommentResponse;
import com.example.back_end.service.TicketCommentService;

@ExtendWith(MockitoExtension.class)
class TicketCommentControllerTest {

    @Mock
    private TicketCommentService ticketCommentService;

    @Mock
    private TicketCommentRequest ticketCommentRequest;

    @Mock
    private TicketCommentResponse ticketCommentResponse;

    @Mock
    private Page<TicketCommentResponse> ticketCommentsPage;

    @Mock
    private Pageable pageable;

    @InjectMocks
    private TicketCommentController ticketCommentController;

    @Test
    void getCommentsByTicketIdShouldReturnCommentsPage() {

        Long ticketId = 1L;

        when(ticketCommentService.getCommentsByTicketId(
                ticketId,
                pageable))
                .thenReturn(ticketCommentsPage);

        ResponseEntity<Page<TicketCommentResponse>> response = ticketCommentController.getCommentsByTicketId(
                ticketId,
                pageable);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(ticketCommentsPage);

        verify(ticketCommentService).getCommentsByTicketId(
                ticketId,
                pageable);
    }

    @Test
    void createCommentForTicketShouldReturnCreatedComment() {

        Long ticketId = 1L;

        when(ticketCommentService.createCommentForTicket(
                ticketId,
                ticketCommentRequest))
                .thenReturn(ticketCommentResponse);

        ResponseEntity<TicketCommentResponse> response = ticketCommentController.createCommentForTicket(
                ticketId,
                ticketCommentRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.CREATED);

        assertThat(response.getBody())
                .isSameAs(ticketCommentResponse);

        verify(ticketCommentService).createCommentForTicket(
                ticketId,
                ticketCommentRequest);
    }
}