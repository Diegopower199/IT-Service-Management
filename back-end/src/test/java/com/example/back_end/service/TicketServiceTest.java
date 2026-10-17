package com.example.back_end.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.example.back_end.dtos.ticket.AssignTicketRequest;
import com.example.back_end.dtos.ticket.ChangePriorityRequest;
import com.example.back_end.dtos.ticket.ChangeStatusRequest;
import com.example.back_end.dtos.ticket.CreateTicketRequest;
import com.example.back_end.dtos.ticket.TicketResponse;
import com.example.back_end.dtos.ticket.UpdateTicketRequest;
import com.example.back_end.exception.AccessDeniedException;
import com.example.back_end.exception.InvalidRoleException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.CategoryModel;
import com.example.back_end.model.DepartmentModel;
import com.example.back_end.model.PriorityModel;
import com.example.back_end.model.RolModel;
import com.example.back_end.model.StatusModel;
import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.CategoryRepository;
import com.example.back_end.repository.PriorityRepository;
import com.example.back_end.repository.StatusRepository;
import com.example.back_end.repository.TicketRepository;
import com.example.back_end.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private PriorityRepository priorityRepository;

    @Mock
    private StatusRepository statusRepository;

    @InjectMocks
    private TicketService ticketService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    // =========================================================
    // GET ALL TICKETS
    // =========================================================
    @Test
    void shouldReturnAllTickets() {

        RolModel userRol = new RolModel(3L, "USER", true);

        DepartmentModel department = new DepartmentModel(1L, "IT", true);

        UserModel user = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRol,
                department);

        CategoryModel category = new CategoryModel(1L, "Hardware", true);

        PriorityModel priority = new PriorityModel(2L, "MEDIUM", true);

        StatusModel status = new StatusModel(1L, "OPEN", true);

        LocalDateTime now = LocalDateTime.now();

        TicketModel ticket1 = new TicketModel();
        ticket1.setIdTicket(1L);
        ticket1.setTitle("Laptop broken");
        ticket1.setDescription("Laptop does not start");
        ticket1.setCreatedAt(now);
        ticket1.setLastUpdated(now);
        ticket1.setCreatedBy(user);
        ticket1.setRequestedFor(user);
        ticket1.setCategory(category);
        ticket1.setPriority(priority);
        ticket1.setStatus(status);

        TicketModel ticket2 = new TicketModel();
        ticket2.setIdTicket(2L);
        ticket2.setTitle("VPN problem");
        ticket2.setDescription("Unable to connect");
        ticket2.setCreatedAt(now);
        ticket2.setLastUpdated(now);
        ticket2.setCreatedBy(user);
        ticket2.setRequestedFor(user);
        ticket2.setCategory(category);
        ticket2.setPriority(priority);
        ticket2.setStatus(status);

        when(ticketRepository.findAll())
                .thenReturn(List.of(ticket1, ticket2));

        List<TicketResponse> response = ticketService.getAllTickets();

        assertEquals(2, response.size());

        assertEquals(
                "Laptop broken",
                response.get(0).getTitle());

        assertEquals(
                "VPN problem",
                response.get(1).getTitle());

        assertEquals(
                "ana",
                response.get(0).getCreatedBy().getUsername());

        assertEquals("Hardware", response.get(0).getCategory().getName());

        assertEquals(
                "MEDIUM",
                response.get(0).getPriority().getName());

        assertEquals(
                "OPEN",
                response.get(0).getStatus().getName());
    }

    @Test
    void shouldReturnEmptyListWhenNoTicketsExist() {

        when(ticketRepository.findAll())
                .thenReturn(List.of());

        List<TicketResponse> response = ticketService.getAllTickets();

        assertTrue(response.isEmpty());
    }

    // =========================================================
    // GET TICKET BY ID
    // =========================================================
    @Test
    void shouldReturnTicketByIdWhenUserIsRelatedToTicket() {

        RolModel userRol = new RolModel(3L, "USER", true);

        DepartmentModel department = new DepartmentModel(1L, "IT", true);

        UserModel currentUser = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRol,
                department);

        CategoryModel category = new CategoryModel(1L, "Hardware", true);

        PriorityModel priority = new PriorityModel(2L, "MEDIUM", true);

        StatusModel status = new StatusModel(1L, "OPEN", true);

        LocalDateTime now = LocalDateTime.now();

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);
        ticket.setTitle("Laptop broken");
        ticket.setDescription("Laptop does not start");
        ticket.setCreatedAt(now);
        ticket.setLastUpdated(now);
        ticket.setCreatedBy(currentUser);
        ticket.setRequestedFor(currentUser);
        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setStatus(status);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "ana",
                                null));

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(currentUser));

        TicketResponse response = ticketService.getTicketById(1L);

        assertEquals(
                1L,
                response.getIdTicket());

        assertEquals(
                "Laptop broken",
                response.getTitle());
    }

    @Test
    void shouldThrowExceptionWhenTicketByIdDoesNotExist() {

        when(ticketRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> ticketService.getTicketById(99L));

        verify(userRepository, never())
                .findByUsername(any());
    }

    @Test
    void shouldThrowAccessDeniedWhenUserIsNotRelatedToTicket() {

        RolModel userRol = new RolModel(3L, "USER", true);

        DepartmentModel department = new DepartmentModel(1L, "IT", true);

        UserModel currentUser = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRol,
                department);

        UserModel otherUser = new UserModel(
                2L,
                "carlos",
                "carlos@example.com",
                "encodedPassword",
                "Carlos",
                "Lopez",
                true,
                userRol,
                department);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);
        ticket.setCreatedBy(otherUser);
        ticket.setRequestedFor(otherUser);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "ana",
                                null));

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(currentUser));

        assertThrows(
                AccessDeniedException.class,
                () -> ticketService.getTicketById(1L));
    }

    @Test
    void shouldAllowAdminToGetAnyTicket() {

        RolModel adminRol = new RolModel(1L, "ADMIN", true);

        RolModel userRol = new RolModel(3L, "USER", true);

        DepartmentModel department = new DepartmentModel(1L, "IT", true);

        UserModel admin = new UserModel(
                1L,
                "admin",
                "admin@example.com",
                "encodedPassword",
                "Admin",
                "User",
                true,
                adminRol,
                department);

        UserModel owner = new UserModel(
                2L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRol,
                department);

        CategoryModel category = new CategoryModel(1L, "Hardware", true);

        PriorityModel priority = new PriorityModel(2L, "MEDIUM", true);

        StatusModel status = new StatusModel(1L, "OPEN", true);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);
        ticket.setTitle("Laptop broken");
        ticket.setCreatedBy(owner);
        ticket.setRequestedFor(owner);
        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setStatus(status);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "admin",
                                null));

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("admin"))
                .thenReturn(Optional.of(admin));

        TicketResponse response = ticketService.getTicketById(1L);

        assertEquals(
                1L,
                response.getIdTicket());
    }

    // =========================================================
    // GET MY TICKETS
    // =========================================================
    @Test
    void shouldReturnMyTickets() {

        RolModel userRol = new RolModel(3L, "USER", true);

        DepartmentModel department = new DepartmentModel(1L, "IT", true);

        UserModel currentUser = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRol,
                department);

        CategoryModel category = new CategoryModel(1L, "Hardware", true);

        PriorityModel priority = new PriorityModel(2L, "MEDIUM", true);

        StatusModel status = new StatusModel(1L, "OPEN", true);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);
        ticket.setTitle("Laptop broken");
        ticket.setCreatedBy(currentUser);
        ticket.setRequestedFor(currentUser);
        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setStatus(status);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "ana",
                                null));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(currentUser));

        when(ticketRepository.findByCreatedByOrRequestedFor(
                currentUser,
                currentUser))
                .thenReturn(List.of(ticket));

        List<TicketResponse> response = ticketService.getMyTickets();

        assertEquals(
                1,
                response.size());

        assertEquals(
                "Laptop broken",
                response.get(0).getTitle());

        verify(ticketRepository)
                .findByCreatedByOrRequestedFor(
                        currentUser,
                        currentUser);
    }

    @Test
    void shouldReturnEmptyListWhenUserHasNoTickets() {

        RolModel userRol = new RolModel(3L, "USER", true);

        DepartmentModel department = new DepartmentModel(1L, "IT", true);

        UserModel currentUser = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRol,
                department);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "ana",
                                null));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(currentUser));

        when(ticketRepository.findByCreatedByOrRequestedFor(
                currentUser,
                currentUser))
                .thenReturn(List.of());

        List<TicketResponse> response = ticketService.getMyTickets();

        assertTrue(response.isEmpty());
    }

    // =========================================================
    // CREATE TICKET
    // =========================================================
    @Test
    void shouldCreateTicketSuccessfully() {

        CreateTicketRequest request = org.mockito.Mockito.mock(
                CreateTicketRequest.class);

        when(request.getTitle())
                .thenReturn("Laptop broken");

        when(request.getDescription())
                .thenReturn("Laptop does not start");

        when(request.getRequestedForId())
                .thenReturn(2L);

        when(request.getCategoryId())
                .thenReturn(1L);

        when(request.getPriorityId())
                .thenReturn(2L);

        RolModel userRol = new RolModel(3L, "USER", true);

        DepartmentModel department = new DepartmentModel(1L, "IT", true);

        UserModel createdBy = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRol,
                department);

        UserModel requestedFor = new UserModel(
                2L,
                "carlos",
                "carlos@example.com",
                "encodedPassword",
                "Carlos",
                "Lopez",
                true,
                userRol,
                department);

        CategoryModel category = new CategoryModel(
                1L,
                "Hardware",
                true);

        PriorityModel priority = new PriorityModel(
                2L,
                "MEDIUM",
                true);

        StatusModel status = new StatusModel(
                1L,
                "OPEN",
                true);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "ana",
                                null));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(createdBy));

        when(userRepository.findById(2L))
                .thenReturn(Optional.of(requestedFor));

        when(categoryRepository
                .findByIdCategoryAndActiveTrue(1L))
                .thenReturn(Optional.of(category));

        when(priorityRepository
                .findByIdPriorityAndActiveTrue(2L))
                .thenReturn(Optional.of(priority));

        when(statusRepository
                .findByNameAndActiveTrue("OPEN"))
                .thenReturn(Optional.of(status));

        when(ticketRepository.save(
                any(TicketModel.class)))
                .thenAnswer(invocation -> {

                    TicketModel ticket = invocation.getArgument(0);

                    ticket.setIdTicket(1L);

                    return ticket;
                });

        TicketResponse response = ticketService.createTicket(request);

        assertEquals(
                1L,
                response.getIdTicket());

        assertEquals(
                "Laptop broken",
                response.getTitle());

        assertEquals(
                "ana",
                response.getCreatedBy().getUsername());

        assertEquals(
                "carlos",
                response.getRequestedFor().getUsername());

        assertEquals(
                "Hardware",
                response.getCategory().getName());

        assertEquals(
                "MEDIUM",
                response.getPriority().getName());

        assertEquals(
                "OPEN",
                response.getStatus().getName());

        assertNull(
                response.getAssignedTo());

        verify(ticketRepository)
                .save(any(TicketModel.class));
    }

    @Test
    void shouldThrowExceptionWhenRequestedUserDoesNotExistOnCreate() {

        CreateTicketRequest request = org.mockito.Mockito.mock(
                CreateTicketRequest.class);

        when(request.getRequestedForId())
                .thenReturn(99L);

        RolModel userRol = new RolModel(3L, "USER", true);

        DepartmentModel department = new DepartmentModel(1L, "IT", true);

        UserModel createdBy = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRol,
                department);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "ana",
                                null));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(createdBy));

        when(userRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> ticketService.createTicket(request));

        verify(ticketRepository, never())
                .save(any(TicketModel.class));
    }

    @Test
    void shouldThrowExceptionWhenCategoryIsNotActiveOnCreate() {

        CreateTicketRequest request = org.mockito.Mockito.mock(
                CreateTicketRequest.class);

        when(request.getRequestedForId())
                .thenReturn(2L);

        when(request.getCategoryId())
                .thenReturn(99L);

        RolModel userRol = new RolModel(3L, "USER", true);

        DepartmentModel department = new DepartmentModel(1L, "IT", true);

        UserModel createdBy = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRol,
                department);

        UserModel requestedFor = new UserModel(
                2L,
                "carlos",
                "carlos@example.com",
                "encodedPassword",
                "Carlos",
                "Lopez",
                true,
                userRol,
                department);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "ana",
                                null));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(createdBy));

        when(userRepository.findById(2L))
                .thenReturn(Optional.of(requestedFor));

        when(categoryRepository
                .findByIdCategoryAndActiveTrue(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> ticketService.createTicket(request));

        verify(ticketRepository, never())
                .save(any(TicketModel.class));
    }

    @Test
    void shouldThrowExceptionWhenPriorityIsNotActiveOnCreate() {

        CreateTicketRequest request = org.mockito.Mockito.mock(
                CreateTicketRequest.class);

        when(request.getRequestedForId())
                .thenReturn(2L);

        when(request.getCategoryId())
                .thenReturn(1L);

        when(request.getPriorityId())
                .thenReturn(99L);

        RolModel userRol = new RolModel(3L, "USER", true);

        DepartmentModel department = new DepartmentModel(1L, "IT", true);

        UserModel createdBy = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRol,
                department);

        UserModel requestedFor = new UserModel(
                2L,
                "carlos",
                "carlos@example.com",
                "encodedPassword",
                "Carlos",
                "Lopez",
                true,
                userRol,
                department);

        CategoryModel category = new CategoryModel(
                1L,
                "Hardware",
                true);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "ana",
                                null));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(createdBy));

        when(userRepository.findById(2L))
                .thenReturn(Optional.of(requestedFor));

        when(categoryRepository
                .findByIdCategoryAndActiveTrue(1L))
                .thenReturn(Optional.of(category));

        when(priorityRepository
                .findByIdPriorityAndActiveTrue(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> ticketService.createTicket(request));

        verify(ticketRepository, never())
                .save(any(TicketModel.class));
    }

    @Test
    void shouldThrowExceptionWhenOpenStatusIsNotActiveOnCreate() {

        CreateTicketRequest request = org.mockito.Mockito.mock(
                CreateTicketRequest.class);

        when(request.getRequestedForId())
                .thenReturn(2L);

        when(request.getCategoryId())
                .thenReturn(1L);

        when(request.getPriorityId())
                .thenReturn(2L);

        RolModel userRol = new RolModel(3L, "USER", true);

        DepartmentModel department = new DepartmentModel(1L, "IT", true);

        UserModel createdBy = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRol,
                department);

        UserModel requestedFor = new UserModel(
                2L,
                "carlos",
                "carlos@example.com",
                "encodedPassword",
                "Carlos",
                "Lopez",
                true,
                userRol,
                department);

        CategoryModel category = new CategoryModel(
                1L,
                "Hardware",
                true);

        PriorityModel priority = new PriorityModel(
                2L,
                "MEDIUM",
                true);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "ana",
                                null));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(createdBy));

        when(userRepository.findById(2L))
                .thenReturn(Optional.of(requestedFor));

        when(categoryRepository
                .findByIdCategoryAndActiveTrue(1L))
                .thenReturn(Optional.of(category));

        when(priorityRepository
                .findByIdPriorityAndActiveTrue(2L))
                .thenReturn(Optional.of(priority));

        when(statusRepository
                .findByNameAndActiveTrue("OPEN"))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> ticketService.createTicket(request));

        verify(ticketRepository, never())
                .save(any(TicketModel.class));
    }

    // =========================================================
    // UPDATE TICKET
    // =========================================================
    @Test
    void shouldAllowRelatedUserToUpdateTicket() {

        UpdateTicketRequest request = org.mockito.Mockito.mock(
                UpdateTicketRequest.class);

        when(request.getTitle())
                .thenReturn("Updated title");

        when(request.getDescription())
                .thenReturn("Updated description");

        when(request.getCategoryId())
                .thenReturn(1L);

        RolModel userRol = new RolModel(
                3L,
                "USER",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel currentUser = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRol,
                department);

        CategoryModel category = new CategoryModel(
                1L,
                "Hardware",
                true);

        PriorityModel priority = new PriorityModel(
                2L,
                "MEDIUM",
                true);

        StatusModel status = new StatusModel(
                1L,
                "OPEN",
                true);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);
        ticket.setTitle("Old title");
        ticket.setDescription("Old description");
        ticket.setCreatedBy(currentUser);
        ticket.setRequestedFor(currentUser);
        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setStatus(status);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "ana",
                                null));

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(currentUser));

        when(categoryRepository
                .findByIdCategoryAndActiveTrue(1L))
                .thenReturn(Optional.of(category));

        when(ticketRepository.save(ticket))
                .thenReturn(ticket);

        TicketResponse response = ticketService.updateTicket(
                1L,
                request);

        assertEquals(
                "Updated title",
                response.getTitle());

        assertEquals(
                "Updated description",
                response.getDescription());

        assertEquals(
                "Hardware",
                response.getCategory().getName());

        verify(categoryRepository)
                .findByIdCategoryAndActiveTrue(1L);

        verify(ticketRepository)
                .save(ticket);
    }

    @Test
    void shouldThrowAccessDeniedWhenUserUpdatesUnrelatedTicket() {

        UpdateTicketRequest request = org.mockito.Mockito.mock(
                UpdateTicketRequest.class);

        RolModel userRol = new RolModel(
                3L,
                "USER",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel currentUser = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRol,
                department);

        UserModel otherUser = new UserModel(
                2L,
                "carlos",
                "carlos@example.com",
                "encodedPassword",
                "Carlos",
                "Lopez",
                true,
                userRol,
                department);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);
        ticket.setCreatedBy(otherUser);
        ticket.setRequestedFor(otherUser);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "ana",
                                null));

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(currentUser));

        assertThrows(
                AccessDeniedException.class,
                () -> ticketService.updateTicket(
                        1L,
                        request));

        verify(ticketRepository, never())
                .save(any(TicketModel.class));
    }

    @Test
    void shouldAllowAssignedTechnicianToUpdateTicket() {

        UpdateTicketRequest request = org.mockito.Mockito.mock(
                UpdateTicketRequest.class);

        when(request.getTitle())
                .thenReturn("Fixed issue");

        when(request.getDescription())
                .thenReturn("Issue has been fixed");

        when(request.getCategoryId())
                .thenReturn(1L);

        RolModel technicianRol = new RolModel(
                2L,
                "TECHNICIAN",
                true);

        RolModel userRol = new RolModel(
                3L,
                "USER",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel technician = new UserModel(
                1L,
                "tech",
                "tech@example.com",
                "encodedPassword",
                "Technical",
                "User",
                true,
                technicianRol,
                department);

        UserModel user = new UserModel(
                2L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRol,
                department);

        CategoryModel category = new CategoryModel(
                1L,
                "Hardware",
                true);

        PriorityModel priority = new PriorityModel(
                2L,
                "MEDIUM",
                true);

        StatusModel status = new StatusModel(
                1L,
                "OPEN",
                true);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);
        ticket.setTitle("Old title");
        ticket.setDescription("Old description");
        ticket.setCreatedBy(user);
        ticket.setRequestedFor(user);
        ticket.setAssignedTo(technician);
        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setStatus(status);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "tech",
                                null));

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("tech"))
                .thenReturn(Optional.of(technician));

        when(categoryRepository
                .findByIdCategoryAndActiveTrue(1L))
                .thenReturn(Optional.of(category));

        when(ticketRepository.save(ticket))
                .thenReturn(ticket);

        TicketResponse response = ticketService.updateTicket(
                1L,
                request);

        assertEquals(
                "Fixed issue",
                response.getTitle());

        assertEquals(
                "Issue has been fixed",
                response.getDescription());

        assertEquals(
                "Hardware",
                response.getCategory().getName());

        verify(categoryRepository)
                .findByIdCategoryAndActiveTrue(1L);

        verify(ticketRepository)
                .save(ticket);
    }

    @Test
    void shouldThrowAccessDeniedWhenTechnicianIsNotAssigned() {

        UpdateTicketRequest request = org.mockito.Mockito.mock(
                UpdateTicketRequest.class);

        RolModel technicianRol = new RolModel(
                2L,
                "TECHNICIAN",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel technician = new UserModel(
                1L,
                "tech",
                "tech@example.com",
                "encodedPassword",
                "Technical",
                "User",
                true,
                technicianRol,
                department);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);
        ticket.setAssignedTo(null);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "tech",
                                null));

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findByUsername("tech"))
                .thenReturn(Optional.of(technician));

        assertThrows(
                AccessDeniedException.class,
                () -> ticketService.updateTicket(
                        1L,
                        request));

        verify(ticketRepository, never())
                .save(any(TicketModel.class));
    }

    // =========================================================
    // ASSIGN TICKET
    // =========================================================
    @Test
    void shouldAssignTicketToTechnicianSuccessfully() {

        AssignTicketRequest request = org.mockito.Mockito.mock(
                AssignTicketRequest.class);

        when(request.getAssignedToId())
                .thenReturn(2L);

        RolModel technicianRol = new RolModel(
                2L,
                "TECHNICIAN",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel technician = new UserModel(
                2L,
                "tech",
                "tech@example.com",
                "encodedPassword",
                "Technical",
                "User",
                true,
                technicianRol,
                department);

        CategoryModel category = new CategoryModel(
                1L,
                "Hardware",
                true);

        PriorityModel priority = new PriorityModel(
                2L,
                "MEDIUM",
                true);

        StatusModel status = new StatusModel(
                1L,
                "OPEN",
                true);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);
        ticket.setTitle("Laptop broken");
        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setStatus(status);

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findById(2L))
                .thenReturn(Optional.of(technician));

        when(ticketRepository.save(ticket))
                .thenReturn(ticket);

        TicketResponse response = ticketService.assignTicket(
                1L,
                request);

        assertEquals(
                "tech",
                response.getAssignedTo().getUsername());

        verify(ticketRepository)
                .save(ticket);
    }

    @Test
    void shouldThrowExceptionWhenAssignedUserDoesNotExist() {

        AssignTicketRequest request = org.mockito.Mockito.mock(
                AssignTicketRequest.class);

        when(request.getAssignedToId())
                .thenReturn(99L);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> ticketService.assignTicket(
                        1L,
                        request));

        verify(ticketRepository, never())
                .save(any(TicketModel.class));
    }

    @Test
    void shouldThrowExceptionWhenAssignedUserIsNotTechnician() {

        AssignTicketRequest request = org.mockito.Mockito.mock(
                AssignTicketRequest.class);

        when(request.getAssignedToId())
                .thenReturn(2L);

        RolModel userRol = new RolModel(
                3L,
                "USER",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel user = new UserModel(
                2L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                userRol,
                department);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findById(2L))
                .thenReturn(Optional.of(user));

        assertThrows(
                InvalidRoleException.class,
                () -> ticketService.assignTicket(
                        1L,
                        request));

        verify(ticketRepository, never())
                .save(any(TicketModel.class));
    }

    // =========================================================
    // CHANGE PRIORITY
    // =========================================================
    @Test
    void shouldChangePrioritySuccessfully() {

        ChangePriorityRequest request = org.mockito.Mockito.mock(
                ChangePriorityRequest.class);

        when(request.getPriorityId())
                .thenReturn(3L);

        PriorityModel priority = new PriorityModel(
                3L,
                "HIGH",
                true);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(priorityRepository
                .findByIdPriorityAndActiveTrue(3L))
                .thenReturn(Optional.of(priority));

        when(ticketRepository.save(ticket))
                .thenReturn(ticket);

        TicketResponse response = ticketService.changePriority(
                1L,
                request);

        assertEquals("HIGH", response.getPriority().getName());

        verify(ticketRepository)
                .save(ticket);
    }

    @Test
    void shouldThrowExceptionWhenPriorityIsNotActive() {

        ChangePriorityRequest request = org.mockito.Mockito.mock(
                ChangePriorityRequest.class);

        when(request.getPriorityId())
                .thenReturn(99L);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(priorityRepository
                .findByIdPriorityAndActiveTrue(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> ticketService.changePriority(
                        1L,
                        request));

        verify(ticketRepository, never())
                .save(any(TicketModel.class));
    }

    // =========================================================
    // CHANGE STATUS
    // =========================================================
    @Test
    void shouldChangeStatusSuccessfully() {

        ChangeStatusRequest request = org.mockito.Mockito.mock(
                ChangeStatusRequest.class);

        when(request.getStatusId())
                .thenReturn(2L);

        StatusModel status = new StatusModel(
                2L,
                "IN_PROGRESS",
                true);

        TicketModel ticket = new TicketModel();
        ticket.setIdTicket(1L);

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(statusRepository
                .findByIdStatusAndActiveTrue(2L))
                .thenReturn(Optional.of(status));

        when(ticketRepository.save(ticket))
                .thenReturn(ticket);

        TicketResponse response = ticketService.changeStatus(
                1L,
                request);

        assertEquals("IN_PROGRESS", response.getStatus().getName());

        verify(ticketRepository)
                .save(ticket);
    }

    @Test
    void shouldThrowExceptionWhenStatusIsNotActive() {

        ChangeStatusRequest request = org.mockito.Mockito.mock(
                ChangeStatusRequest.class);

        when(request.getStatusId())
                .thenReturn(99L);

        TicketModel ticket = new TicketModel();

        ticket.setIdTicket(1L);

        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        when(statusRepository
                .findByIdStatusAndActiveTrue(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> ticketService.changeStatus(
                        1L,
                        request));

        verify(ticketRepository, never())
                .save(any(TicketModel.class));
    }
}