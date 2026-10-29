package com.example.back_end.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.dtos.ticket.AssignTicketRequest;
import com.example.back_end.dtos.ticket.ChangePriorityRequest;
import com.example.back_end.dtos.ticket.ChangeStatusRequest;
import com.example.back_end.dtos.ticket.CreateTicketRequest;
import com.example.back_end.dtos.ticket.TicketResponse;
import com.example.back_end.dtos.ticket.TicketStatisticsResponse;
import com.example.back_end.dtos.ticket.UpdateTicketRequest;
import com.example.back_end.service.TicketService;
import com.example.back_end.utils.GlobalConstants;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = GlobalConstants.FRONTEND_URL, methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PATCH,
})
@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<Page<TicketResponse>> getAllTickets(@RequestParam(required = false) String status,
            @RequestParam(required = false) String priority, Pageable pageable) {
        Page<TicketResponse> tickets = ticketService.getAllTickets(status,
                priority, pageable);

        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(
            @PathVariable Long id) {

        TicketResponse ticket = ticketService.getTicketById(id);

        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/my")
    public ResponseEntity<Page<TicketResponse>> getMyTickets(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            Pageable pageable) {

        Page<TicketResponse> tickets = ticketService.getMyTickets(
                title,
                status,
                priority,
                category,
                pageable);

        return ResponseEntity.ok(tickets);
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request) {

        TicketResponse savedTicket = ticketService.createTicket(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedTicket);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long id,
            @RequestBody UpdateTicketRequest request) {

        TicketResponse updatedTicket = ticketService.updateTicket(id, request);

        return ResponseEntity.ok(updatedTicket);
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody AssignTicketRequest request) {

        TicketResponse assignTicket = ticketService.assignTicket(id, request);

        return ResponseEntity.ok(assignTicket);
    }

    @PatchMapping("/{id}/priority")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<TicketResponse> changePriority(
            @PathVariable Long id,
            @Valid @RequestBody ChangePriorityRequest request) {

        TicketResponse updatedPriority = ticketService.changePriority(id, request);

        return ResponseEntity.ok(updatedPriority);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<TicketResponse> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody ChangeStatusRequest request) {

        TicketResponse updatedStatus = ticketService.changeStatus(id, request);

        return ResponseEntity.ok(updatedStatus);
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'USER')")
    public ResponseEntity<TicketStatisticsResponse> getTicketStatistics() {

        TicketStatisticsResponse statistics = ticketService.getTicketStatistics();

        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<Page<TicketResponse>> getAssignedTickets(
            Pageable pageable) {

        Page<TicketResponse> tickets = ticketService.getAssignedTickets(pageable);

        return ResponseEntity.ok(tickets);
    }
}
