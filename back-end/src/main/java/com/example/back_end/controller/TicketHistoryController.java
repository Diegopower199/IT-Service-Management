package com.example.back_end.controller;

import java.util.List;

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
    public ResponseEntity<List<TicketHistoryResponse>> getAllHistory() {

        List<TicketHistoryResponse> history = ticketHistoryService.getAllHistory();

        if (history.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<TicketHistoryResponse> getHistoryById(
            @PathVariable Long id) {

        TicketHistoryResponse history = ticketHistoryService.getHistoryById(id);

        return ResponseEntity.ok(history);
    }
}