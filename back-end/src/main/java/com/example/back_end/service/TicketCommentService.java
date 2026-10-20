package com.example.back_end.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.back_end.dtos.ticketComment.TicketCommentRequest;
import com.example.back_end.dtos.ticketComment.TicketCommentResponse;
import com.example.back_end.dtos.user.UserSummaryResponse;
import com.example.back_end.enums.RoleName;
import com.example.back_end.exception.AccessDeniedException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.TicketCommentModel;
import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.TicketCommentRepository;
import com.example.back_end.repository.TicketRepository;
import com.example.back_end.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketCommentService {

    private final TicketCommentRepository ticketCommentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public Page<TicketCommentResponse> getCommentsByTicketId(
            Long ticketId,
            Pageable pageable) {

        TicketModel existingTicket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        UserModel currentUser = getAuthenticatedUser();

        String role = currentUser.getRol().getName();

        Page<TicketCommentModel> ticketComments;

        if (role.equalsIgnoreCase(RoleName.USER.name())) {
            boolean isCreatedBy = existingTicket.getCreatedBy()
                    .getIdUser()
                    .equals(currentUser.getIdUser());

            boolean isRequestedFor = existingTicket.getRequestedFor()
                    .getIdUser()
                    .equals(currentUser.getIdUser());

            if (!isCreatedBy && !isRequestedFor) {
                throw new AccessDeniedException(
                        "You are not allowed to view comments on this ticket");
            }

            ticketComments = ticketCommentRepository
                    .findByTicketAndInternalFalse(
                            existingTicket,
                            pageable);

        } else {
            ticketComments = ticketCommentRepository
                    .findByTicket(
                            existingTicket,
                            pageable);
        }

        return ticketComments.map(this::convertToResponse);
    }

    public TicketCommentResponse createCommentForTicket(
            Long ticketId,
            TicketCommentRequest request) {

        TicketModel existingTicket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        UserModel currentUser = getAuthenticatedUser();

        // Validate whether the current user can comment on this ticket.
        String role = currentUser.getRol().getName();

        if (role.equalsIgnoreCase(RoleName.USER.name())) {
            boolean isCreatedBy = existingTicket.getCreatedBy().getIdUser()
                    .equals(currentUser.getIdUser());

            boolean isRequestedFor = existingTicket.getRequestedFor().getIdUser()
                    .equals(currentUser.getIdUser());

            if (!isCreatedBy && !isRequestedFor) {
                throw new AccessDeniedException(
                        "You are not allowed to comment on this ticket");
            }

            if (request.isInternal()) {
                throw new AccessDeniedException(
                        "Users are not allowed to create internal comments");
            }
        }

        TicketCommentModel ticketComment = new TicketCommentModel();
        ticketComment.setTicket(existingTicket);
        ticketComment.setUser(currentUser);
        ticketComment.setComment(request.getComment());
        ticketComment.setInternal(request.isInternal());
        LocalDateTime now = LocalDateTime.now();
        ticketComment.setCreatedAt(now);

        TicketCommentModel savedTicketComment = ticketCommentRepository.save(ticketComment);

        return convertToResponse(savedTicketComment);

    }

    private UserModel getAuthenticatedUser() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        String username = authentication.getName();

        return userRepository
                .findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User with username " + username + " not found"));
    }

    private TicketCommentResponse convertToResponse(TicketCommentModel ticketComment) {

        UserModel user = ticketComment.getUser();

        UserSummaryResponse userResponse = new UserSummaryResponse(
                user.getIdUser(),
                user.getUsername());

        return new TicketCommentResponse(
                ticketComment.getIdComment(),
                ticketComment.getTicket().getIdTicket(),
                userResponse,
                ticketComment.getComment(),
                ticketComment.isInternal(),
                ticketComment.getCreatedAt());
    }
}