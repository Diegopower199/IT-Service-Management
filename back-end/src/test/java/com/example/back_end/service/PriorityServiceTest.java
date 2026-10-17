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

import com.example.back_end.dtos.priority.PriorityRequest;
import com.example.back_end.dtos.priority.PriorityResponse;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.PriorityModel;
import com.example.back_end.repository.PriorityRepository;

@ExtendWith(MockitoExtension.class)
public class PriorityServiceTest {

    @Mock
    private PriorityRepository priorityRepository;

    @InjectMocks
    private PriorityService priorityService;

    // =========================================================
    // GET ALL PRIORITIES
    // =========================================================
    @Test
    void shouldReturnAllPriorities() {

        PriorityModel priority1 = new PriorityModel(1L, "LOW", true);

        PriorityModel priority2 = new PriorityModel(2L, "MEDIUM", true);

        List<PriorityModel> priorities = List.of(priority1, priority2);

        when(priorityRepository.findAllOrderedById())
                .thenReturn(priorities);

        List<PriorityResponse> response = priorityService.getAllPriorities();

        assertEquals(2, response.size());
        assertEquals("LOW", response.get(0).getName());
        assertEquals("MEDIUM", response.get(1).getName());
    }

    @Test
    void shouldReturnEmptyListWhenNoPrioritiesExist() {

        when(priorityRepository.findAllOrderedById())
                .thenReturn(List.of());

        List<PriorityResponse> response = priorityService.getAllPriorities();

        assertTrue(response.isEmpty());
    }

    // =========================================================
    // GET ACTIVE PRIORITIES
    // =========================================================
    @Test
    void shouldReturnActivePriorities() {

        PriorityModel priority1 = new PriorityModel(1L, "LOW", true);

        PriorityModel priority2 = new PriorityModel(2L, "MEDIUM", true);

        List<PriorityModel> priorities = List.of(priority1, priority2);

        when(priorityRepository.findByActiveTrueOrderByIdPriorityAsc())
                .thenReturn(priorities);

        List<PriorityResponse> response = priorityService.getActivePriorities();

        assertEquals(2, response.size());

        assertEquals("LOW", response.get(0).getName());
        assertEquals("MEDIUM", response.get(1).getName());

        assertTrue(response.get(0).isActive());
        assertTrue(response.get(1).isActive());
    }

    @Test
    void shouldReturnEmptyListWhenNoActivePrioritiesExist() {

        when(priorityRepository.findByActiveTrueOrderByIdPriorityAsc())
                .thenReturn(List.of());

        List<PriorityResponse> response = priorityService.getActivePriorities();

        assertTrue(response.isEmpty());
    }

    // =========================================================
    // GET PRIORITY BY ID
    // =========================================================
    @Test
    void shouldReturnPriorityById() {

        PriorityModel priority = new PriorityModel(1L, "LOW", true);

        when(priorityRepository.findById(1L))
                .thenReturn(Optional.of(priority));

        PriorityResponse response = priorityService.getPriorityById(1L);

        assertEquals(1L, response.getIdPriority());
        assertEquals("LOW", response.getName());
        assertTrue(response.isActive());
    }

    @Test
    void shouldThrowExceptionWhenPriorityByIdDoesNotExist() {

        when(priorityRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> priorityService.getPriorityById(99L));
    }

    // =========================================================
    // CREATE PRIORITY
    // =========================================================
    @Test
    void shouldCreatePrioritySuccessfully() {

        PriorityRequest request = new PriorityRequest("LOW");

        PriorityModel savedPriority = new PriorityModel(1L, "LOW", true);

        when(priorityRepository.existsByName("LOW"))
                .thenReturn(false);

        when(priorityRepository.save(any(PriorityModel.class)))
                .thenReturn(savedPriority);

        PriorityResponse response = priorityService.createPriority(request);

        assertEquals(1L, response.getIdPriority());
        assertEquals("LOW", response.getName());
        assertTrue(response.isActive());

        verify(priorityRepository)
                .existsByName("LOW");

        verify(priorityRepository)
                .save(any(PriorityModel.class));
    }

    @Test
    void shouldThrowExceptionWhenPriorityAlreadyExists() {

        PriorityRequest request = new PriorityRequest("LOW");

        when(priorityRepository.existsByName("LOW"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> priorityService.createPriority(request));

        verify(priorityRepository)
                .existsByName("LOW");

        verify(priorityRepository, never())
                .save(any(PriorityModel.class));
    }

    // =========================================================
    // UPDATE PRIORITY
    // =========================================================
    @Test
    void shouldUpdatePrioritySuccessfully() {

        PriorityRequest request = new PriorityRequest("MEDIUM");

        PriorityModel existingPriority = new PriorityModel(1L, "LOW", true);

        PriorityModel updatedPriority = new PriorityModel(1L, "MEDIUM", true);

        when(priorityRepository.findById(1L))
                .thenReturn(Optional.of(existingPriority));

        when(priorityRepository.existsByName("MEDIUM"))
                .thenReturn(false);

        when(priorityRepository.save(any(PriorityModel.class)))
                .thenReturn(updatedPriority);

        PriorityResponse response = priorityService.updatePriority(request, 1L);

        assertEquals(1L, response.getIdPriority());
        assertEquals("MEDIUM", response.getName());
        assertTrue(response.isActive());

        verify(priorityRepository)
                .findById(1L);

        verify(priorityRepository)
                .existsByName("MEDIUM");

        verify(priorityRepository)
                .save(any(PriorityModel.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistingPriority() {

        PriorityRequest request = new PriorityRequest("MEDIUM");

        when(priorityRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> priorityService.updatePriority(request, 99L));

        verify(priorityRepository)
                .findById(99L);

        verify(priorityRepository, never())
                .save(any(PriorityModel.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingPriorityWithExistingName() {

        PriorityRequest request = new PriorityRequest("MEDIUM");

        PriorityModel existingPriority = new PriorityModel(1L, "LOW", true);

        when(priorityRepository.findById(1L))
                .thenReturn(Optional.of(existingPriority));

        when(priorityRepository.existsByName("MEDIUM"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> priorityService.updatePriority(request, 1L));

        verify(priorityRepository)
                .findById(1L);

        verify(priorityRepository)
                .existsByName("MEDIUM");

        verify(priorityRepository, never())
                .save(any(PriorityModel.class));
    }

    // =========================================================
    // DEACTIVATE PRIORITY
    // =========================================================
    @Test
    void shouldDeactivatePrioritySuccessfully() {

        PriorityModel priority = new PriorityModel(1L, "LOW", true);

        when(priorityRepository.findById(1L))
                .thenReturn(Optional.of(priority));

        when(priorityRepository.save(any(PriorityModel.class)))
                .thenReturn(priority);

        priorityService.deactivatePriority(1L);

        assertFalse(priority.isActive());

        verify(priorityRepository)
                .findById(1L);

        verify(priorityRepository)
                .save(priority);
    }

    @Test
    void shouldThrowExceptionWhenDeactivatingNonExistingPriority() {

        when(priorityRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> priorityService.deactivatePriority(99L));

        verify(priorityRepository)
                .findById(99L);

        verify(priorityRepository, never())
                .save(any(PriorityModel.class));
    }

    // =========================================================
    // ACTIVATE PRIORITY
    // =========================================================
    @Test
    void shouldActivatePrioritySuccessfully() {

        PriorityModel priority = new PriorityModel(1L, "LOW", false);

        when(priorityRepository.findById(1L))
                .thenReturn(Optional.of(priority));

        when(priorityRepository.save(any(PriorityModel.class)))
                .thenReturn(priority);

        priorityService.activatePriority(1L);

        assertTrue(priority.isActive());

        verify(priorityRepository)
                .findById(1L);

        verify(priorityRepository)
                .save(priority);
    }

    @Test
    void shouldThrowExceptionWhenActivatingNonExistingPriority() {

        when(priorityRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> priorityService.activatePriority(99L));

        verify(priorityRepository)
                .findById(99L);

        verify(priorityRepository, never())
                .save(any(PriorityModel.class));
    }
}
