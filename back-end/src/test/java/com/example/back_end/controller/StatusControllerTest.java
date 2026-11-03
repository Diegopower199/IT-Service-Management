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

import com.example.back_end.dtos.status.StatusRequest;
import com.example.back_end.dtos.status.StatusResponse;
import com.example.back_end.service.StatusService;

@ExtendWith(MockitoExtension.class)
class StatusControllerTest {

    @Mock
    private StatusService statusService;

    @Mock
    private StatusRequest statusRequest;

    @Mock
    private StatusResponse statusResponse;

    @InjectMocks
    private StatusController statusController;

    @Test
    void getAllStatusesShouldReturnAllStatuses() {

        List<StatusResponse> statuses = List.of(statusResponse);

        when(statusService.getAllStatuses())
                .thenReturn(statuses);

        ResponseEntity<List<StatusResponse>> response = statusController.getAllStatuses();

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(statuses);

        verify(statusService).getAllStatuses();
    }

    @Test
    void getActiveStatusesShouldReturnActiveStatuses() {

        List<StatusResponse> statuses = List.of(statusResponse);

        when(statusService.getActiveStatuses())
                .thenReturn(statuses);

        ResponseEntity<List<StatusResponse>> response = statusController.getActiveStatuses();

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(statuses);

        verify(statusService).getActiveStatuses();
    }

    @Test
    void getStatusByIdShouldReturnStatus() {

        Long statusId = 1L;

        when(statusService.getStatusById(statusId))
                .thenReturn(statusResponse);

        ResponseEntity<StatusResponse> response = statusController.getStatusById(statusId);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(statusResponse);

        verify(statusService).getStatusById(statusId);
    }

    @Test
    void createStatusShouldReturnCreatedStatus() {

        when(statusService.createStatus(statusRequest))
                .thenReturn(statusResponse);

        ResponseEntity<StatusResponse> response = statusController.createStatus(statusRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.CREATED);

        assertThat(response.getBody())
                .isSameAs(statusResponse);

        verify(statusService).createStatus(statusRequest);
    }

    @Test
    void updateStatusShouldReturnUpdatedStatus() {

        Long statusId = 1L;

        when(statusService.updateStatus(
                statusRequest,
                statusId))
                .thenReturn(statusResponse);

        ResponseEntity<StatusResponse> response = statusController.updateStatus(
                statusId,
                statusRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(statusResponse);

        verify(statusService).updateStatus(
                statusRequest,
                statusId);
    }

    @Test
    void deactivateStatusShouldReturnNoContent() {

        Long statusId = 1L;

        ResponseEntity<Void> response = statusController.deactivateStatus(statusId);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.NO_CONTENT);

        assertThat(response.getBody())
                .isNull();

        verify(statusService).deactivateStatus(statusId);
    }

    @Test
    void activateStatusShouldReturnNoContent() {

        Long statusId = 1L;

        ResponseEntity<Void> response = statusController.activateStatus(statusId);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.NO_CONTENT);

        assertThat(response.getBody())
                .isNull();

        verify(statusService).activateStatus(statusId);
    }
}