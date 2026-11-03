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

import com.example.back_end.dtos.ticketHistory.TicketHistoryResponse;
import com.example.back_end.service.TicketHistoryService;

@ExtendWith(MockitoExtension.class)
class TicketHistoryControllerTest {

    @Mock
    private TicketHistoryService ticketHistoryService;

    @Mock
    private Page<TicketHistoryResponse> ticketHistoryPage;

    @Mock
    private Pageable pageable;

    @InjectMocks
    private TicketHistoryController ticketHistoryController;

    @Test
    void getAllHistoryShouldReturnHistoryPage() {

        when(ticketHistoryService.getAllHistory(pageable))
                .thenReturn(ticketHistoryPage);

        ResponseEntity<Page<TicketHistoryResponse>> response = ticketHistoryController.getAllHistory(pageable);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(ticketHistoryPage);

        verify(ticketHistoryService).getAllHistory(pageable);
    }

    @Test
    void getHistoryByTicketIdShouldReturnHistoryPage() {

        Long ticketId = 1L;

        when(ticketHistoryService.getHistoryByTicketId(
                ticketId,
                pageable))
                .thenReturn(ticketHistoryPage);

        ResponseEntity<Page<TicketHistoryResponse>> response = ticketHistoryController.getHistoryByTicketId(
                ticketId,
                pageable);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(ticketHistoryPage);

        verify(ticketHistoryService).getHistoryByTicketId(
                ticketId,
                pageable);
    }
}