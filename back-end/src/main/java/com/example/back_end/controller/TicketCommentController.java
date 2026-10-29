package com.example.back_end.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.dtos.ticketComment.TicketCommentRequest;
import com.example.back_end.dtos.ticketComment.TicketCommentResponse;
import com.example.back_end.service.TicketCommentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/ticket-comments")
@RequiredArgsConstructor
public class TicketCommentController {

    private final TicketCommentService ticketCommentService;

    @GetMapping("/ticket/{id}")
    public ResponseEntity<Page<TicketCommentResponse>> getCommentsByTicketId(
            @PathVariable Long id,
            Pageable pageable) {

        Page<TicketCommentResponse> comments = ticketCommentService.getCommentsByTicketId(
                id,
                pageable);

        return ResponseEntity.ok(comments);
    }

    @PostMapping("/ticket/{id}")
    public ResponseEntity<TicketCommentResponse> createCommentForTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketCommentRequest request) {

        TicketCommentResponse savedTicketComment = ticketCommentService.createCommentForTicket(id, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedTicketComment);
    }
}
