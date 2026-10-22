package com.example.back_end.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.dtos.ticketHistory.TicketHistoryResponse;
import com.example.back_end.service.TicketHistoryService;
import com.example.back_end.utils.GlobalConstants;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = GlobalConstants.FRONTEND_URL, methods = { RequestMethod.GET })
@RestController
@RequestMapping("/ticket-history")
@RequiredArgsConstructor
public class TicketHistoryController {

    private final TicketHistoryService ticketHistoryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<Page<TicketHistoryResponse>> getAllHistory(
            Pageable pageable) {

        Page<TicketHistoryResponse> history = ticketHistoryService.getAllHistory(pageable);

        return ResponseEntity.ok(history);
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<Page<TicketHistoryResponse>> getHistoryByTicketId(
            @PathVariable Long ticketId,
            Pageable pageable) {

        Page<TicketHistoryResponse> history = ticketHistoryService.getHistoryByTicketId(
                ticketId,
                pageable);

        return ResponseEntity.ok(history);
    }
}