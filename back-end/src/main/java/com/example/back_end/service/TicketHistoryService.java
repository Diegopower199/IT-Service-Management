package com.example.back_end.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.back_end.dtos.ticketHistory.TicketHistoryResponse;
import com.example.back_end.dtos.user.UserSummaryResponse;
import com.example.back_end.enums.RoleName;
import com.example.back_end.enums.TicketHistoryAction;
import com.example.back_end.exception.AccessDeniedException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.TicketHistoryModel;
import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.TicketHistoryRepository;
import com.example.back_end.repository.TicketRepository;
import com.example.back_end.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketHistoryService {

    private final TicketHistoryRepository ticketHistoryRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public Page<TicketHistoryResponse> getAllHistory(
            Pageable pageable) {

        Page<TicketHistoryModel> history = ticketHistoryRepository.findAll(pageable);

        return history.map(this::convertToResponse);
    }

    public Page<TicketHistoryResponse> getHistoryByTicketId(
            Long ticketId,
            Pageable pageable) {

        TicketModel ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        UserModel currentUser = getAuthenticatedUser();

        String role = currentUser.getRol().getName();

        if (role.equalsIgnoreCase(RoleName.USER.name())) {

            boolean isCreatedByUser = ticket.getCreatedBy()
                    .getIdUser()
                    .equals(currentUser.getIdUser());

            boolean isRequestedForUser = ticket.getRequestedFor()
                    .getIdUser()
                    .equals(currentUser.getIdUser());

            if (!isCreatedByUser && !isRequestedForUser) {
                throw new AccessDeniedException(
                        "You do not have permission to view the history of this ticket");
            }
        }

        Page<TicketHistoryModel> history = ticketHistoryRepository.findByTicket(
                ticket,
                pageable);

        return history.map(this::convertToResponse);
    }

    public void createHistory(
            TicketModel ticket,
            UserModel user,
            TicketHistoryAction action,
            String fieldName,
            String oldValue,
            String newValue) {

        TicketHistoryModel history = new TicketHistoryModel();
        history.setTicket(ticket);
        history.setUser(user);
        history.setAction(action);
        history.setFieldName(fieldName);
        history.setOldValue(oldValue);
        history.setNewValue(newValue);
        history.setCreatedAt(LocalDateTime.now());

        ticketHistoryRepository.save(history);
    }

    private UserModel getAuthenticatedUser() {

        Authentication authentication = SecurityContextHolder.getContext()
                .getAuthentication();

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User with username '" + username + "' not found"));
    }

    private TicketHistoryResponse convertToResponse(
            TicketHistoryModel history) {

        UserModel user = history.getUser();

        UserSummaryResponse userResponse = new UserSummaryResponse(
                user.getIdUser(),
                user.getUsername());

        return new TicketHistoryResponse(
                history.getIdHistory(),
                history.getTicket().getIdTicket(),
                userResponse,
                history.getAction(),
                history.getFieldName(),
                history.getOldValue(),
                history.getNewValue(),
                history.getCreatedAt());
    }
}