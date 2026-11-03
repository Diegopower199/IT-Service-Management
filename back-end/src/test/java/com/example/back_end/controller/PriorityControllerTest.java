package com.example.back_end.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.back_end.dtos.priority.PriorityRequest;
import com.example.back_end.dtos.priority.PriorityResponse;
import com.example.back_end.service.PriorityService;

@ExtendWith(MockitoExtension.class)
class PriorityControllerTest {

    @Mock
    private PriorityService priorityService;

    @Mock
    private PriorityRequest priorityRequest;

    @Mock
    private PriorityResponse priorityResponse;

    @InjectMocks
    private PriorityController priorityController;

    @Test
    void getAllPrioritiesShouldReturnAllPriorities() {

        List<PriorityResponse> priorities = List.of(priorityResponse);

        when(priorityService.getAllPriorities())
                .thenReturn(priorities);

        ResponseEntity<List<PriorityResponse>> response = priorityController.getAllPriorities();

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(priorities);

        verify(priorityService).getAllPriorities();
    }

    @Test
    void getActivePrioritiesShouldReturnActivePriorities() {

        List<PriorityResponse> priorities = List.of(priorityResponse);

        when(priorityService.getActivePriorities())
                .thenReturn(priorities);

        ResponseEntity<List<PriorityResponse>> response = priorityController.getActivePriorities();

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(priorities);

        verify(priorityService).getActivePriorities();
    }

    @Test
    void getPriorityByIdShouldReturnPriority() {

        Long priorityId = 1L;

        when(priorityService.getPriorityById(priorityId))
                .thenReturn(priorityResponse);

        ResponseEntity<PriorityResponse> response = priorityController.getPriorityById(priorityId);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(priorityResponse);

        verify(priorityService).getPriorityById(priorityId);
    }

    @Test
    void createPriorityShouldReturnCreatedPriority() {

        when(priorityService.createPriority(priorityRequest))
                .thenReturn(priorityResponse);

        ResponseEntity<PriorityResponse> response = priorityController.createPriority(priorityRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.CREATED);

        assertThat(response.getBody())
                .isSameAs(priorityResponse);

        verify(priorityService).createPriority(priorityRequest);
    }

    @Test
    void updatePriorityShouldReturnUpdatedPriority() {

        Long priorityId = 1L;

        when(priorityService.updatePriority(
                priorityRequest,
                priorityId))
                .thenReturn(priorityResponse);

        ResponseEntity<PriorityResponse> response = priorityController.updatePriority(
                priorityId,
                priorityRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(priorityResponse);

        verify(priorityService).updatePriority(
                priorityRequest,
                priorityId);
    }

    @Test
    void deactivatePriorityShouldReturnNoContent() {

        Long priorityId = 1L;

        ResponseEntity<Void> response = priorityController.deactivatePriority(priorityId);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.NO_CONTENT);

        assertThat(response.getBody())
                .isNull();

        verify(priorityService).deactivatePriority(priorityId);
    }

    @Test
    void activatePriorityShouldReturnNoContent() {

        Long priorityId = 1L;

        ResponseEntity<Void> response = priorityController.activatePriority(priorityId);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.NO_CONTENT);

        assertThat(response.getBody())
                .isNull();

        verify(priorityService).activatePriority(priorityId);
    }
}