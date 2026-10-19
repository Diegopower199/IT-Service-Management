package com.example.back_end.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.dtos.ticketComment.TicketCommentRequest;
import com.example.back_end.dtos.ticketComment.TicketCommentResponse;
import com.example.back_end.service.TicketCommentService;
import com.example.back_end.utils.GlobalConstants;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = GlobalConstants.FRONTEND_URL, methods = { RequestMethod.GET, RequestMethod.POST })
@RestController
@RequestMapping("/ticket-comments")
@RequiredArgsConstructor
public class TicketCommentController {

    private final TicketCommentService ticketCommentService;

    @GetMapping("/{id}")
    public ResponseEntity<List<TicketCommentResponse>> getCommentsByTicketId(@PathVariable Long id) {
        List<TicketCommentResponse> comments = ticketCommentService.getCommentsByTicketId(id);

        if (comments.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(comments);
    }

    @PostMapping("/{id}")
    public ResponseEntity<TicketCommentResponse> createCommentForTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketCommentRequest request) {

        TicketCommentResponse savedTicketComment = ticketCommentService.createCommentForTicket(id, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedTicketComment);
    }
}
