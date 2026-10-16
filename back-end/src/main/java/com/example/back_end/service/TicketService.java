package com.example.back_end.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.back_end.dtos.category.CategoryResponse;
import com.example.back_end.dtos.priority.PriorityResponse;
import com.example.back_end.dtos.status.StatusResponse;
import com.example.back_end.dtos.ticket.AssignTicketRequest;
import com.example.back_end.dtos.ticket.ChangePriorityRequest;
import com.example.back_end.dtos.ticket.ChangeStatusRequest;
import com.example.back_end.dtos.ticket.CreateTicketRequest;
import com.example.back_end.dtos.ticket.TicketResponse;
import com.example.back_end.dtos.ticket.UpdateTicketRequest;
import com.example.back_end.dtos.user.UserSummaryResponse;
import com.example.back_end.exception.AccessDeniedException;
import com.example.back_end.exception.InvalidRoleException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.CategoryModel;
import com.example.back_end.model.PriorityModel;
import com.example.back_end.model.StatusModel;
import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.CategoryRepository;
import com.example.back_end.repository.PriorityRepository;
import com.example.back_end.repository.StatusRepository;
import com.example.back_end.repository.TicketRepository;
import com.example.back_end.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PriorityRepository priorityRepository;
    private final StatusRepository statusRepository;

    public List<TicketResponse> getAllTickets() {

        List<TicketModel> tickets = ticketRepository.findAll();
        List<TicketResponse> result = new ArrayList<>();

        for (TicketModel ticket : tickets) {
            result.add(convertToResponse(ticket));
        }

        return result;
    }

    public TicketResponse getTicketById(Long ticketId) {

        TicketModel ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        UserModel currentUser = getAuthenticatedUser();

        String role = currentUser.getRol().getName();

        if (role.equalsIgnoreCase("USER")) {

            boolean isCreatedByUser = ticket.getCreatedBy().getIdUser().equals(currentUser.getIdUser());

            boolean isRequestedForUser = ticket.getRequestedFor().getIdUser().equals(currentUser.getIdUser());

            if (!isCreatedByUser && !isRequestedForUser) {
                throw new AccessDeniedException(
                        "You do not have permission to access this ticket");
            }
        }

        return convertToResponse(ticket);
    }

    public List<TicketResponse> getMyTickets() {

        UserModel currentUser = getAuthenticatedUser();

        List<TicketModel> tickets = ticketRepository.findByCreatedByOrRequestedFor(
                currentUser,
                currentUser);

        List<TicketResponse> result = new ArrayList<>();

        for (TicketModel ticket : tickets) {
            result.add(convertToResponse(ticket));
        }

        return result;
    }

    public TicketResponse createTicket(CreateTicketRequest request) {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        String username = authentication.getName();

        UserModel createdBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        UserModel requestedFor = userRepository.findById(request.getRequestedForId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Requested user not found"));

        CategoryModel category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found"));

        PriorityModel priority = priorityRepository.findById(request.getPriorityId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Priority not found"));

        StatusModel status = statusRepository.findByName("OPEN")
                .orElseThrow(() -> new ResourceNotFoundException(
                        "OPEN status not found"));

        TicketModel ticket = new TicketModel();

        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());

        LocalDateTime now = LocalDateTime.now();
        ticket.setCreatedAt(now);
        ticket.setLastUpdated(now);

        ticket.setCreatedBy(createdBy);
        ticket.setRequestedFor(requestedFor);

        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setStatus(status);

        TicketModel savedTicket = ticketRepository.save(ticket);

        return convertToResponse(savedTicket);
    }

    public TicketResponse updateTicket(
            Long ticketId,
            UpdateTicketRequest request) {

        TicketModel ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        UserModel currentUser = getAuthenticatedUser();

        String role = currentUser.getRol().getName();

        if (role.equalsIgnoreCase("USER")) {

            boolean isCreatedByUser = ticket.getCreatedBy().getIdUser().equals(currentUser.getIdUser());

            boolean isRequestedForUser = ticket.getRequestedFor().getIdUser().equals(currentUser.getIdUser());

            if (!isCreatedByUser && !isRequestedForUser) {
                throw new AccessDeniedException(
                        "You do not have permission to access this ticket");
            }
        }

        if (role.equalsIgnoreCase("TECHNICIAN")) {

            if (ticket.getAssignedTo() == null
                    || !ticket.getAssignedTo()
                            .getIdUser()
                            .equals(currentUser.getIdUser())) {

                throw new AccessDeniedException(
                        "You can only update tickets assigned to you");
            }
        }

        if (request.getTitle() != null) {
            ticket.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            ticket.setDescription(request.getDescription());
        }

        if (request.getCategoryId() != null) {

            CategoryModel category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category with id " + request.getCategoryId() + " not found"));

            ticket.setCategory(category);
        }

        ticket.setLastUpdated(LocalDateTime.now());

        TicketModel updatedTicket = ticketRepository.save(ticket);

        return convertToResponse(updatedTicket);
    }

    public TicketResponse assignTicket(
            Long ticketId,
            AssignTicketRequest request) {

        TicketModel ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        UserModel assignedTo = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User with id " + request.getAssignedToId() + " not found"));

        if (!assignedTo.getRol().getName().equalsIgnoreCase("TECHNICIAN")) {
            throw new InvalidRoleException(
                    "Assigned user must have the TECHNICIAN role");
        }

        ticket.setAssignedTo(assignedTo);
        ticket.setLastUpdated(LocalDateTime.now());

        TicketModel updatedTicket = ticketRepository.save(ticket);

        return convertToResponse(updatedTicket);
    }

    public TicketResponse changePriority(
            Long ticketId,
            ChangePriorityRequest request) {

        TicketModel ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        PriorityModel priority = priorityRepository
                .findById(request.getPriorityId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Priority with id " + request.getPriorityId() + " not found"));

        ticket.setPriority(priority);
        ticket.setLastUpdated(LocalDateTime.now());

        TicketModel updatedTicket = ticketRepository.save(ticket);

        return convertToResponse(updatedTicket);
    }

    public TicketResponse changeStatus(
            Long ticketId,
            ChangeStatusRequest request) {

        TicketModel ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        StatusModel status = statusRepository
                .findById(request.getStatusId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Status with id " + request.getStatusId() + " not found"));

        ticket.setStatus(status);
        ticket.setLastUpdated(LocalDateTime.now());

        TicketModel updatedTicket = ticketRepository.save(ticket);

        return convertToResponse(updatedTicket);
    }

    private UserModel getAuthenticatedUser() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user not found"));
    }

    private TicketResponse convertToResponse(TicketModel ticket) {

        UserSummaryResponse createdByResponse = null;

        if (ticket.getCreatedBy() != null) {
            createdByResponse = new UserSummaryResponse(
                    ticket.getCreatedBy().getIdUser(),
                    ticket.getCreatedBy().getUsername());
        }

        UserSummaryResponse requestedForResponse = null;

        if (ticket.getRequestedFor() != null) {
            requestedForResponse = new UserSummaryResponse(
                    ticket.getRequestedFor().getIdUser(),
                    ticket.getRequestedFor().getUsername());
        }

        UserSummaryResponse assignedToResponse = null;

        if (ticket.getAssignedTo() != null) {
            assignedToResponse = new UserSummaryResponse(
                    ticket.getAssignedTo().getIdUser(),
                    ticket.getAssignedTo().getUsername());
        }

        CategoryResponse categoryResponse = null;

        if (ticket.getCategory() != null) {
            categoryResponse = new CategoryResponse(
                    ticket.getCategory().getIdCategory(),
                    ticket.getCategory().getName(),
                    ticket.getCategory().isActive());
        }

        PriorityResponse priorityResponse = null;

        if (ticket.getPriority() != null) {
            priorityResponse = new PriorityResponse(
                    ticket.getPriority().getIdPriority(),
                    ticket.getPriority().getName(),
                    ticket.getPriority().isActive());
        }

        StatusResponse statusResponse = null;

        if (ticket.getStatus() != null) {
            statusResponse = new StatusResponse(
                    ticket.getStatus().getIdStatus(),
                    ticket.getStatus().getName(),
                    ticket.getStatus().isActive());
        }

        return new TicketResponse(
                ticket.getIdTicket(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getCreatedAt(),
                ticket.getLastUpdated(),
                createdByResponse,
                requestedForResponse,
                assignedToResponse,
                categoryResponse,
                priorityResponse,
                statusResponse);
    }
}