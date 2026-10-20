package com.example.back_end.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.back_end.dtos.ticketHistory.TicketHistoryResponse;
import com.example.back_end.dtos.user.UserSummaryResponse;
import com.example.back_end.enums.TicketHistoryAction;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.TicketHistoryModel;
import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.TicketHistoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketHistoryService {

    private final TicketHistoryRepository ticketHistoryRepository;

    public Page<TicketHistoryResponse> getAllHistory(
            Pageable pageable) {

        Page<TicketHistoryModel> history = ticketHistoryRepository.findAll(pageable);

        return history.map(this::convertToResponse);
    }

    public TicketHistoryResponse getHistoryById(Long idHistory) {

        TicketHistoryModel existingHistory = ticketHistoryRepository.findById(idHistory)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket history with id " + idHistory + " not found"));

        return convertToResponse(existingHistory);
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