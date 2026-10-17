package com.example.back_end.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.back_end.dtos.status.StatusRequest;
import com.example.back_end.dtos.status.StatusResponse;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.StatusModel;
import com.example.back_end.repository.StatusRepository;

@ExtendWith(MockitoExtension.class)
public class StatusServiceTest {

    @Mock
    private StatusRepository statusRepository;

    @InjectMocks
    private StatusService statusService;

    // =========================================================
    // GET ALL STATUSES
    // =========================================================
    @Test
    void shouldReturnAllStatuses() {

        StatusModel status1 = new StatusModel(1L, "OPEN", true);

        StatusModel status2 = new StatusModel(2L, "IN_PROGRESS", true);

        List<StatusModel> statuses = List.of(status1, status2);

        when(statusRepository.findAllOrderedById())
                .thenReturn(statuses);

        List<StatusResponse> response = statusService.getAllStatuses();

        assertEquals(2, response.size());
        assertEquals("OPEN", response.get(0).getName());
        assertEquals("IN_PROGRESS", response.get(1).getName());
    }

    @Test
    void shouldReturnEmptyListWhenNoStatusesExist() {

        when(statusRepository.findAllOrderedById())
                .thenReturn(List.of());

        List<StatusResponse> response = statusService.getAllStatuses();

        assertTrue(response.isEmpty());
    }

    // =========================================================
    // GET ACTIVE STATUSES
    // =========================================================
    @Test
    void shouldReturnActiveStatuses() {

        StatusModel status1 = new StatusModel(1L, "OPEN", true);

        StatusModel status2 = new StatusModel(2L, "IN_PROGRESS", true);

        List<StatusModel> statuses = List.of(status1, status2);

        when(statusRepository.findByActiveTrueOrderByIdStatusAsc())
                .thenReturn(statuses);

        List<StatusResponse> response = statusService.getActiveStatuses();

        assertEquals(2, response.size());

        assertEquals("OPEN", response.get(0).getName());
        assertEquals("IN_PROGRESS", response.get(1).getName());

        assertTrue(response.get(0).isActive());
        assertTrue(response.get(1).isActive());
    }

    @Test
    void shouldReturnEmptyListWhenNoActiveStatusesExist() {

        when(statusRepository.findByActiveTrueOrderByIdStatusAsc())
                .thenReturn(List.of());

        List<StatusResponse> response = statusService.getActiveStatuses();

        assertTrue(response.isEmpty());
    }

    // =========================================================
    // GET STATUS BY ID
    // =========================================================
    @Test
    void shouldReturnStatusById() {

        StatusModel status = new StatusModel(1L, "OPEN", true);

        when(statusRepository.findById(1L))
                .thenReturn(Optional.of(status));

        StatusResponse response = statusService.getStatusById(1L);

        assertEquals(1L, response.getIdStatus());
        assertEquals("OPEN", response.getName());
        assertTrue(response.isActive());
    }

    @Test
    void shouldThrowExceptionWhenStatusByIdDoesNotExist() {

        when(statusRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> statusService.getStatusById(99L));
    }

    // =========================================================
    // CREATE STATUS
    // =========================================================
    @Test
    void shouldCreateStatusSuccessfully() {

        StatusRequest request = new StatusRequest("OPEN");

        StatusModel savedStatus = new StatusModel(1L, "OPEN", true);

        when(statusRepository.existsByName("OPEN"))
                .thenReturn(false);

        when(statusRepository.save(any(StatusModel.class)))
                .thenReturn(savedStatus);

        StatusResponse response = statusService.createStatus(request);

        assertEquals(1L, response.getIdStatus());
        assertEquals("OPEN", response.getName());
        assertTrue(response.isActive());

        verify(statusRepository)
                .existsByName("OPEN");

        verify(statusRepository)
                .save(any(StatusModel.class));
    }

    @Test
    void shouldThrowExceptionWhenStatusAlreadyExists() {

        StatusRequest request = new StatusRequest("OPEN");

        when(statusRepository.existsByName("OPEN"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> statusService.createStatus(request));

        verify(statusRepository)
                .existsByName("OPEN");

        verify(statusRepository, never())
                .save(any(StatusModel.class));
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================
    @Test
    void shouldUpdateStatusSuccessfully() {

        StatusRequest request = new StatusRequest("IN_PROGRESS");

        StatusModel existingStatus = new StatusModel(1L, "OPEN", true);

        StatusModel updatedStatus = new StatusModel(1L, "IN_PROGRESS", true);

        when(statusRepository.findById(1L))
                .thenReturn(Optional.of(existingStatus));

        when(statusRepository.existsByName("IN_PROGRESS"))
                .thenReturn(false);

        when(statusRepository.save(any(StatusModel.class)))
                .thenReturn(updatedStatus);

        StatusResponse response = statusService.updateStatus(request, 1L);

        assertEquals(1L, response.getIdStatus());
        assertEquals("IN_PROGRESS", response.getName());
        assertTrue(response.isActive());

        verify(statusRepository)
                .findById(1L);

        verify(statusRepository)
                .existsByName("IN_PROGRESS");

        verify(statusRepository)
                .save(any(StatusModel.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistingStatus() {

        StatusRequest request = new StatusRequest("IN_PROGRESS");

        when(statusRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> statusService.updateStatus(request, 99L));

        verify(statusRepository)
                .findById(99L);

        verify(statusRepository, never())
                .save(any(StatusModel.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingStatusWithExistingName() {

        StatusRequest request = new StatusRequest("IN_PROGRESS");

        StatusModel existingStatus = new StatusModel(1L, "OPEN", true);

        when(statusRepository.findById(1L))
                .thenReturn(Optional.of(existingStatus));

        when(statusRepository.existsByName("IN_PROGRESS"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> statusService.updateStatus(request, 1L));

        verify(statusRepository)
                .findById(1L);

        verify(statusRepository)
                .existsByName("IN_PROGRESS");

        verify(statusRepository, never())
                .save(any(StatusModel.class));
    }

    // =========================================================
    // DEACTIVATE STATUS
    // =========================================================
    @Test
    void shouldDeactivateStatusSuccessfully() {

        StatusModel status = new StatusModel(1L, "OPEN", true);

        when(statusRepository.findById(1L))
                .thenReturn(Optional.of(status));

        when(statusRepository.save(any(StatusModel.class)))
                .thenReturn(status);

        statusService.deactivateStatus(1L);

        assertFalse(status.isActive());

        verify(statusRepository)
                .findById(1L);

        verify(statusRepository)
                .save(status);
    }

    @Test
    void shouldThrowExceptionWhenDeactivatingNonExistingStatus() {

        when(statusRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> statusService.deactivateStatus(99L));

        verify(statusRepository)
                .findById(99L);

        verify(statusRepository, never())
                .save(any(StatusModel.class));
    }

    // =========================================================
    // ACTIVATE STATUS
    // =========================================================
    @Test
    void shouldActivateStatusSuccessfully() {

        StatusModel status = new StatusModel(1L, "OPEN", false);

        when(statusRepository.findById(1L))
                .thenReturn(Optional.of(status));

        when(statusRepository.save(any(StatusModel.class)))
                .thenReturn(status);

        statusService.activateStatus(1L);

        assertTrue(status.isActive());

        verify(statusRepository)
                .findById(1L);

        verify(statusRepository)
                .save(status);
    }

    @Test
    void shouldThrowExceptionWhenActivatingNonExistingStatus() {

        when(statusRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> statusService.activateStatus(99L));

        verify(statusRepository)
                .findById(99L);

        verify(statusRepository, never())
                .save(any(StatusModel.class));
    }
}
